import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: '*src/**/*.test.ts',
  timeout: 500 * 60 * 1000,
  workers: 4,
});
