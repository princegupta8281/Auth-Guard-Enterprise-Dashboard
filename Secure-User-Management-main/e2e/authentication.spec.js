const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.route(/^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)\//, route => route.abort());
});

test('serves the SPA, reaches Spring health, and rejects unauthenticated protected requests', async ({ page, request, baseURL }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    const response = await page.goto('/');
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle(/SecureOS/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    const health = await request.get(`${baseURL}/actuator/health`);
    expect(health.status()).toBe(200);
    expect((await health.json()).status).toBe('UP');

    const script = await request.get(`${baseURL}/js/app.js`);
    expect(script.status()).toBe(200);
    expect(await script.text()).toContain('window.location.origin');

    const protectedProfile = await page.evaluate(async () => {
        const response = await fetch('/api/users/profile');
        return response.status;
    });
    expect(protectedProfile).toBe(401);

    await page.getByLabel('Email').fill('missing@example.com');
    await page.getByLabel('Password').fill('incorrect-password');
    const loginResponse = page.waitForResponse(response =>
        response.url().endsWith('/api/auth/login') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Sign In' }).click();
    expect((await loginResponse).status()).toBe(401);
    await expect(page.locator('.toast-message')).toContainText(/invalid email or password/i);
    await expect(page.locator('#global-loader')).toBeHidden();
    expect(pageErrors).toEqual([]);
});

test('supports a small-screen sign-in and registration journey without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);

    await page.getByRole('link', { name: 'Register here' }).click();
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    await expect(page.getByLabel('Full Name')).toBeVisible();
});

test('uses the generated user ID from login for authenticated user requests', async ({ page }) => {
    const loginUser = {
        userId: 42,
        name: 'Generated ID User',
        email: 'generated-id@example.com',
        role: 'USER',
        profileImage: null
    };
    const requests = [];

    await page.route('**/api/auth/login', async route => {
        expect(route.request().postDataJSON()).toEqual({
            email: loginUser.email,
            password: 'correct-password'
        });
        await route.fulfill({
            status: 200,
            json: { token: 'generated-id-test-token', ...loginUser }
        });
    });
    await page.route('**/api/users/profile', async route => {
        requests.push({
            path: new URL(route.request().url()).pathname,
            method: route.request().method(),
            authorization: route.request().headers().authorization
        });
        await route.fulfill({
            json: {
                id: loginUser.userId,
                name: loginUser.name,
                email: loginUser.email,
                role: loginUser.role,
                profileImage: null,
                emailVerified: true
            }
        });
    });
    await page.route('**/api/notifications/user/42/unread', async route => {
        requests.push({
            path: new URL(route.request().url()).pathname,
            authorization: route.request().headers().authorization
        });
        await route.fulfill({ json: [] });
    });
    await page.route('**/api/notifications/user/42', async route => {
        requests.push({
            path: new URL(route.request().url()).pathname,
            authorization: route.request().headers().authorization
        });
        await route.fulfill({ json: [] });
    });

    await page.goto('/');
    await page.getByLabel('Email').fill(loginUser.email);
    await page.getByLabel('Password').fill('correct-password');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.locator('#sidebar-username')).toHaveText(loginUser.name);
    await expect(page.locator('#page-title')).toHaveText('Dashboard');
    await expect(page.locator('#global-loader')).toBeHidden();
    await page.locator('#sidebar a[href="#notifications"]').click();
    await expect(page.getByRole('heading', { name: 'Your Notifications' })).toBeVisible();

    expect(requests.map(request => request.path)).toContain('/api/notifications/user/42/unread');
    expect(requests.map(request => request.path)).toContain('/api/notifications/user/42');
    expect(requests.every(request =>
        request.authorization === 'Bearer generated-id-test-token')).toBe(true);
});

test('uses the configured CORS origin for a Vite development frontend', async ({ request, baseURL }) => {
    const response = await request.fetch(`${baseURL}/api/auth/login`, {
        method: 'OPTIONS',
        headers: {
            Origin: 'http://localhost:5173',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type'
        }
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(response.headers()['access-control-allow-methods']).toContain('POST');
});