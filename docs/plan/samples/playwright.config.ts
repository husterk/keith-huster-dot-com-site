import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'bun run preview',           // astro preview: the built Worker running locally in workerd
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    env: { CONTACT_DRY_RUN: '1' },
  },
});
