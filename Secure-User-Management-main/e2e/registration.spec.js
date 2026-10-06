const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.route(/^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)\//, route => route.abort());
});

test('surfaces Spring validation feedback on the registration form', async ({ page }) => {
    await page.goto('/#register');
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    await page.getByLabel('Full Name').fill('Browser Test User');
    await page.getByLabel('Email Address').fill(`browser-${Date.now()}@example.com`);
    await page.getByLabel('Password', { exact: true }).fill('short');
    await page.getByLabel('Confirm Password').fill('short');

    const registrationResponse = page.waitForResponse(response =>
        response.url().endsWith('/api/auth/register') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Create Account' }).click();

    const response = await registrationResponse;
    expect(response.status()).toBe(400);
    await expect(page.locator('.toast-message')).toContainText(/at least 6 characters/i);
    await expect(page.locator('#global-loader')).toBeHidden();
});