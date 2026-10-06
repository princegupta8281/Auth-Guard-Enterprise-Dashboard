const { defineConfig, devices } = require('@playwright/test');

const port = Number(process.env.E2E_PORT || 8090);
const baseURL = process.env.E2E_BASE_URL || `http://127.0.0.1:${port}`;

module.exports = defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    workers: process.env.CI ? 2 : 1,
    reporter: 'list',
    timeout: 30_000,
    expect: {
        timeout: 5_000
    },
    use: {
        baseURL,
        browserName: 'chromium',
        headless: true,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        ...devices['Desktop Chrome']
    },
    webServer: {
        command: `mvnw.cmd -q "-Dspring-boot.run.profiles=h2" "-Dspring-boot.run.arguments=--server.port=${port}" spring-boot:run`,
        url: `${baseURL}/actuator/health`,
        reuseExistingServer: false,
        timeout: 180_000,
        env: {
            APP_PUBLIC_URL: baseURL,
            SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH: 'false'
        }
    }
});