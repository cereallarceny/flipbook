import { Bench } from 'tinybench';
import { test, expect } from '@playwright/test';
import { FLIPBOOK_APP_URL } from './constants';
import path from 'node:path';
import { saveBenchMark } from './helpers';

const generateTest = (
  charLength: number,
  qrFilePath: string,
  outputFileName: string
) => {
  const testName = `Benchmark Reader with ${charLength} char string`;

  test(testName, async ({ page }) => {
    const bench = new Bench({});

    await page.goto(FLIPBOOK_APP_URL);

    await expect(page).toHaveTitle(/Flipbook/);

    await page.locator('#upload').setInputFiles(qrFilePath);

    // Add a benchmark
    bench.add(`Reading Qr Gif of length ${charLength} chars`, async () => {
      await page.locator('#decode').click();

      await page.locator('#in-progress-decoding').waitFor({ state: 'hidden' });
    });

    // Run the benchmark
    await bench.run();

    // Save results of the benchmark
    await saveBenchMark(`${outputFileName}`, bench.table());
  });
};

// Generate Test for 100 char strings
generateTest(
  100,
  path.resolve(__dirname, '../assets/qr-bench-100.gif'),
  'reader-bench-hundred.json'
);

// Generate Test for 1,000 char strings
generateTest(
  1000,
  path.resolve(__dirname, '../assets/qr-bench-1k.gif'),
  'reader-bench-1k.json'
);

// Generate Test for 10,000 char strings
generateTest(
  10000,
  path.resolve(__dirname, '../assets/qr-bench-10k.gif'),
  'reader-bench-10k.json'
);

// Generate Test for 100,000 char strings
generateTest(
  100000,
  path.resolve(__dirname, '../assets/qr-bench-100k.gif'),
  'reader-bench-100k.json'
);
