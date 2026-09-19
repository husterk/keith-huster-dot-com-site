import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'bunx astro preview --ignore-lock',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    env: { CONTACT_DRY_RUN: '1' },
  },
});
