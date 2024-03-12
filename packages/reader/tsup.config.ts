import { defineConfig } from 'tsup';

// eslint-disable-next-line import/no-default-export -- This is what tsup expects
export default defineConfig({
  clean: true,
  dts: true,
  bundle: false,
  splitting: true,
  treeshake: true,
  target: 'node18',
  format: ['esm', 'cjs'],
  entry: ['src/**/*.ts', '!src/**/*.test.ts'],
});
