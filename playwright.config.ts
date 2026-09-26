import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: process.env.CI ? 4 : undefined,
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'bunx astro preview --ignore-lock',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});
