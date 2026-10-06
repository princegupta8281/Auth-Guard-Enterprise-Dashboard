const { test, expect } = require('@playwright/test');

test('React login validates the generated ID and uses it for backend data', async ({ page }) => {
  const user = {
    id: 42,
    name: 'Jordan Lee',
    email: 'jordan@example.com',
    role: 'USER',
    profileImage: null,
    emailVerified: true,
  };
  const authorizedRequests = [];
  const token = 'react-frontend-test-token';

  await page.route('**/api/auth/login', async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      email: user.email,
      password: 'correct-password',
    });
    await route.fulfill({
      status: 200,
      json: { token, userId: user.id, ...user },
    });
  });

  await page.route('**/api/users/profile', async (route) => {
    authorizedRequests.push({
      path: new URL(route.request().url()).pathname,
      authorization: route.request().headers().authorization,
    });
    await route.fulfill({ json: user });
  });

  await page.route('**/api/appointments/user/42', async (route) => {
    authorizedRequests.push({
      path: new URL(route.request().url()).pathname,
      authorization: route.request().headers().authorization,
    });
    await route.fulfill({ json: [] });
  });

  await page.route('**/api/tickets', async (route) => {
    authorizedRequests.push({
      path: new URL(route.request().url()).pathname,
      authorization: route.request().headers().authorization,
    });
    await route.fulfill({ json: [] });
  });

  await page.goto('/frontend/login');
  await expect(page).toHaveTitle('SecurePro — Your workspace, in good hands');
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await page.getByLabel('Email address').fill(user.email);
  await page.getByLabel('Password').fill('correct-password');
  await page.getByLabel('Keep me signed in').uncheck();
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('heading', { name: /Good (morning|afternoon|evening), Jordan\./ })).toBeVisible();
  await expect(page.getByText('Your account is in good hands.')).toBeVisible();

  const session = await page.evaluate(() => ({
    local: localStorage.getItem('user'),
    temporary: JSON.parse(sessionStorage.getItem('user')),
  }));
  expect(session.local).toBeNull();
  expect(session.temporary.id).toBe(user.id);
  expect(session.temporary.userId).toBe(user.id);
  expect(session.temporary.token).toBe(token);
  expect(authorizedRequests.map((request) => request.path)).toEqual(expect.arrayContaining([
    '/api/users/profile',
    '/api/appointments/user/42',
    '/api/tickets',
  ]));
  expect(authorizedRequests.every((request) => request.authorization === `Bearer ${token}`)).toBe(true);
});
