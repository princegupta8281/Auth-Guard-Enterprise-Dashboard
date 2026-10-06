const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.route(/^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)\//, route => route.abort());
});

test('completes the non-enumerating password recovery request and handles an invalid reset token', async ({ page }) => {
    await page.goto('/#forgot-password');
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
    await page.getByLabel('Email Address').fill(`unknown-${Date.now()}@example.com`);

    const recoveryResponse = page.waitForResponse(response =>
        response.url().endsWith('/api/auth/forgot-password') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Send Reset Link' }).click();
    expect((await recoveryResponse).status()).toBe(200);
    await expect(page.locator('.toast-message')).toContainText(/reset link sent/i);

    await page.goto('/#reset-password?token=not-a-valid-token');
    await expect(page.getByRole('heading', { name: 'Set New Password' })).toBeVisible();
    await page.getByLabel('New Password').fill('new-password');
    await page.getByLabel('Confirm Password').fill('new-password');

    const resetResponse = page.waitForResponse(response =>
        response.url().includes('/api/auth/reset-password') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Reset Password' }).click();
    expect((await resetResponse).status()).toBe(400);
    await expect(page.locator('.toast-message').last()).toContainText(/invalid or expired reset token/i);
    await expect(page.locator('#global-loader')).toBeHidden();
});

test('renders an authenticated dashboard and persists profile updates through the API contract', async ({ page }) => {
    const user = {
        id: 11,
        name: 'Browser Admin',
        email: 'admin@example.com',
        role: 'USER',
        profileImage: null,
        emailVerified: true
    };

    await page.addInitScript(initialUser => {
        localStorage.setItem('token', 'browser-test-token');
        localStorage.setItem('user', JSON.stringify(initialUser));
    }, user);

    await page.route('**/api/users/profile', async route => {
        if (route.request().method() === 'PUT') {
            const body = route.request().postDataJSON();
            user.name = body.name;
            user.email = body.email;
        }
        await route.fulfill({ json: user });
    });
    await page.route('**/api/notifications/user/11/unread', route =>
        route.fulfill({ json: [] }));

    const profileLoad = page.waitForResponse(response =>
        response.url().endsWith('/api/users/profile') && response.request().method() === 'GET');
    await page.goto('/');
    expect((await profileLoad).status()).toBe(200);
    await expect(page.locator('#main-layout')).toBeVisible();
    await expect(page.locator('#view-container #dash-welcome')).toBeVisible();
    await expect(page.locator('#page-title')).toHaveText('Dashboard');
    await expect(page.locator('#sidebar-username')).toHaveText('Browser Admin');

    await page.locator('#sidebar a[href="#profile"]').click();
    await expect(page.locator('#prof-name')).toHaveValue('Browser Admin');
    await page.locator('#prof-name').fill('Updated Browser Admin');

    const profileUpdate = page.waitForRequest(request =>
        request.url().endsWith('/api/users/profile') && request.method() === 'PUT');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    expect((await profileUpdate).postDataJSON()).toEqual({
        name: 'Updated Browser Admin',
        email: 'admin@example.com'
    });

    await expect(page.locator('#profile-name-display')).toHaveText('Updated Browser Admin');
    await expect(page.locator('#sidebar-username')).toHaveText('Updated Browser Admin');
    await expect(page.locator('.toast-message').last()).toContainText('Profile updated successfully');
});