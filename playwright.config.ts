import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    headless: false,
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'CRM-Bepsa',
      testDir: './tests/CRM-Bepsa',   // 👈 tu carpeta para Bepsa
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'CRM-Continental',
      testDir: './tests/CRM-Continental', // 👈 tu carpeta para Continental
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
