# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: react-frontend.spec.js >> React login validates the generated ID and uses it for backend data
- Location: e2e\react-frontend.spec.js:3:1

# Error details

```
Error: locator.fill: Error: strict mode violation: getByLabel('Password') resolved to 2 elements:
    1) <input value="" required="" type="password" name="password" id="login-password" placeholder="Your password" autocomplete="current-password"/> aka getByRole('textbox', { name: 'Password' })
    2) <button type="button" aria-label="Show password" class="password-visibility">…</button> aka getByRole('button', { name: 'Show password' })

Call log:
  - waiting for getByLabel('Password')

```

# Page snapshot

```yaml
- main [ref=e4]:
  - main [ref=e5]:
    - generic [ref=e7]:
      - link "SecurePro home" [ref=e8] [cursor=pointer]:
        - /url: /frontend/
        - generic [ref=e13]: securepro
      - generic [ref=e14]:
        - generic [ref=e15]: PRIVATE WORKSPACE ACCESS
        - heading "Welcome back." [level=1] [ref=e17]
        - paragraph [ref=e18]: Your work is right where you left it. Sign in to pick up where you belong.
        - generic [ref=e19]:
          - generic [ref=e20]: Email address
          - textbox "Email address" [active] [ref=e25]:
            - /placeholder: you@company.com
            - text: jordan@example.com
          - generic [ref=e26]:
            - generic [ref=e27]: Password
            - link "Forgot password?" [ref=e28] [cursor=pointer]:
              - /url: /frontend/forgot-password
          - generic [ref=e29]:
            - textbox "Password" [ref=e34]:
              - /placeholder: Your password
            - button "Show password" [ref=e35] [cursor=pointer]
          - generic [ref=e39] [cursor=pointer]:
            - checkbox "Keep me signed in" [checked] [ref=e40]
            - generic [ref=e42]: Keep me signed in
          - button "Sign in to your workspace" [ref=e43] [cursor=pointer]
        - paragraph [ref=e46]:
          - text: New to SecurePro?
          - link "Create an account" [ref=e47] [cursor=pointer]:
            - /url: /frontend/register
      - generic [ref=e50]:
        - generic [ref=e51]: © 2026 SecurePro
        - generic [ref=e52]: Protected sign-in
    - complementary [ref=e57]:
      - generic [ref=e58]:
        - generic [ref=e59]: 01 PRIVATE BY DESIGN
        - generic [aria-hidden] [ref=e61]:
          - text: S
          - generic [ref=e62]: ·
      - generic [ref=e63]:
        - paragraph [ref=e64]: A clearer view of your work
        - heading [level=2] [ref=e65]:
          - text: Good workdeserves
          - emphasis [ref=e66]: peace of mind.
        - paragraph [ref=e67]: One thoughtful space for your people, projects, and the details that matter.
        - generic "Secure workspace preview" [ref=e68]:
          - generic [ref=e69]:
            - generic [ref=e70]: YOUR WORKSPACE
            - generic [ref=e72]: PRIVATE
          - generic [ref=e77]: A good day to get things done.
          - generic [ref=e78]:
            - generic [ref=e82]:
              - generic [ref=e83]: Identity protected
              - generic [ref=e84]: Your account is secured
            - generic [ref=e85]: ACTIVE
          - generic [ref=e86]:
            - generic [ref=e87]: ↗
            - generic [ref=e88]:
              - generic [ref=e89]: Your space, in sync
              - generic [ref=e90]: Everything in its right place
          - generic [ref=e99]:
            - generic [ref=e100]: SECURE SIGN-IN
            - generic [ref=e101]: SECUREPRO ✳
        - generic [ref=e107]:
          - strong [ref=e108]: Security that stays out of your way.
          - generic [ref=e109]: Thoughtful protection, built into every sign-in.
      - generic [ref=e110]:
        - generic [ref=e111]: BUILT FOR PEOPLE DOING THEIR BEST WORK
        - generic [ref=e112]: EST. 2024 EVERYWHERE
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test('React login validates the generated ID and uses it for backend data', async ({ page }) => {
  4  |   const user = {
  5  |     id: 42,
  6  |     name: 'Jordan Lee',
  7  |     email: 'jordan@example.com',
  8  |     role: 'USER',
  9  |     profileImage: null,
  10 |     emailVerified: true,
  11 |   };
  12 |   const authorizedRequests = [];
  13 |   const token = 'react-frontend-test-token';
  14 | 
  15 |   await page.route('**/api/auth/login', async (route) => {
  16 |     expect(route.request().postDataJSON()).toEqual({
  17 |       email: user.email,
  18 |       password: 'correct-password',
  19 |     });
  20 |     await route.fulfill({
  21 |       status: 200,
  22 |       json: { token, userId: user.id, ...user },
  23 |     });
  24 |   });
  25 | 
  26 |   await page.route('**/api/users/profile', async (route) => {
  27 |     authorizedRequests.push({
  28 |       path: new URL(route.request().url()).pathname,
  29 |       authorization: route.request().headers().authorization,
  30 |     });
  31 |     await route.fulfill({ json: user });
  32 |   });
  33 | 
  34 |   await page.route('**/api/appointments/user/42', async (route) => {
  35 |     authorizedRequests.push({
  36 |       path: new URL(route.request().url()).pathname,
  37 |       authorization: route.request().headers().authorization,
  38 |     });
  39 |     await route.fulfill({ json: [] });
  40 |   });
  41 | 
  42 |   await page.route('**/api/tickets', async (route) => {
  43 |     authorizedRequests.push({
  44 |       path: new URL(route.request().url()).pathname,
  45 |       authorization: route.request().headers().authorization,
  46 |     });
  47 |     await route.fulfill({ json: [] });
  48 |   });
  49 | 
  50 |   await page.goto('/frontend/login');
  51 |   await expect(page).toHaveTitle('SecurePro — Your workspace, in good hands');
  52 |   await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  53 |   await page.getByLabel('Email address').fill(user.email);
> 54 |   await page.getByLabel('Password').fill('correct-password');
     |                                     ^ Error: locator.fill: Error: strict mode violation: getByLabel('Password') resolved to 2 elements:
  55 |   await page.getByLabel('Keep me signed in').uncheck();
  56 |   await page.getByRole('button', { name: 'Sign in' }).click();
  57 | 
  58 |   await expect(page.getByRole('heading', { name: /Good (morning|afternoon|evening), Jordan\./ })).toBeVisible();
  59 |   await expect(page.getByText('Your account is in good hands.')).toBeVisible();
  60 | 
  61 |   const session = await page.evaluate(() => ({
  62 |     local: localStorage.getItem('user'),
  63 |     temporary: JSON.parse(sessionStorage.getItem('user')),
  64 |   }));
  65 |   expect(session.local).toBeNull();
  66 |   expect(session.temporary.id).toBe(user.id);
  67 |   expect(session.temporary.userId).toBe(user.id);
  68 |   expect(session.temporary.token).toBe(token);
  69 |   expect(authorizedRequests.map((request) => request.path)).toEqual(expect.arrayContaining([
  70 |     '/api/users/profile',
  71 |     '/api/appointments/user/42',
  72 |     '/api/tickets',
  73 |   ]));
  74 |   expect(authorizedRequests.every((request) => request.authorization === `Bearer ${token}`)).toBe(true);
  75 | });
  76 | 
```