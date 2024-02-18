import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: '*src/**/*.test.ts',
  timeout: 10 * 60 * 1000, // 10 minutes
  workers: 4,
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
  },
});
