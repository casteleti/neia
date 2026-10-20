import { defineConfig, devices } from '@playwright/test';

const reuseExistingServer = !process.env.CI || process.env.NEIA_REUSE_SERVERS === 'true';

export default defineConfig({
  testDir: './apps/web/tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: { baseURL: 'http://localhost:5173', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    { command: 'pnpm widget:build && pnpm --filter @neia/web run dev', url: 'http://localhost:5173', reuseExistingServer, timeout: 120_000 },
    { command: 'pnpm --filter @neia/api run dev', url: 'http://localhost:3001/health/ready', reuseExistingServer, timeout: 120_000 },
    { command: 'pnpm --filter @neia/web run dev:host', url: 'http://localhost:4174/demo-host.html', reuseExistingServer, timeout: 120_000 },
  ],
});
