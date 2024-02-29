import { Bench } from 'tinybench';
import { test } from '@playwright/test';
import {
  generateRandomString,
  saveBenchMark,
  FLIPBOOK_APP_URL,
} from './helpers';

const generateTest = (charLength: number, fileName: string) => {
  const testName = `Benchmark with ${charLength} char string`;

  test(testName, async ({ page }) => {
    // Generate charLength string
    const text = generateRandomString(charLength);

    // Create a new benchmark instance
    const bench = new Bench();

    // Navigate to the Flipbook app
    await page.goto(FLIPBOOK_APP_URL);

    // Fill the textarea with the generated string
    await page.locator('#textarea').fill(text);

    // Benchmark it
    bench.add(`Flipbook (writer) with ${charLength} char string`, async () => {
      // Click the Generate Flipbook button
      await page.locator('#generate').click();

      // Wait for the editor to be loaded
      await page.waitForSelector('#image');
    });

    // Run the benchmark
    await bench.run();

    // Save results of the benchmark
    saveBenchMark(`writer-${fileName}`, bench.table());
  });
};

// Generate test for 100 char strings
generateTest(100, 'bench-hundred.json');

// Generate test for 1,000 char strings
generateTest(1000, 'bench-1k.json');

// Generate test for 10,000 char strings
generateTest(10000, 'bench-10k.json');
