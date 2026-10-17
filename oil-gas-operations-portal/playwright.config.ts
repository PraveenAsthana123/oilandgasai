import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'tests/e2e/results/results.json' }],
    ['html', { outputFolder: 'tests/e2e/results/html', open: 'never' }],
  ],
  use: {
    baseURL: 'http://localhost:8384',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8384',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
