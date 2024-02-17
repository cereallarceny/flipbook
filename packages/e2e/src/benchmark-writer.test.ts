import { Bench } from 'tinybench';
import { test } from '@playwright/test';
import { formatNumber, generateRandomString, saveBenchMark } from './helpers';
import { FLIPBOOK_APP_URL } from './constants';

const generateTest = (charLength: number, fileName: string) => {
  const testName = `Benchmark Writer with ${formatNumber(
    charLength
  )} char string`;

  test(testName, async ({ page }) => {
    const bench = new Bench();

    // Navigate to the Flipbook app
    await page.goto(FLIPBOOK_APP_URL);

    // Generate charLength string
    const text = generateRandomString(charLength);

    // Fill the textarea with the generated string
    await page.locator('#textarea').fill(text);

    // Click the Generate Flipbook button
    await page.locator('#generate').click();

    // Benchmark it
    bench.add(`Generate Flipbook with ${charLength} char string`, async () => {
      // Wait for the editor to be loaded
      await page.waitForSelector('#image');
    });

    // Run the benchmark
    await bench.run();

    // Save results of the benchmark
    saveBenchMark(`${fileName}`, bench.table());
  });
};

// run tests in parallel
test.describe.configure({ mode: 'parallel' });

// Generate Test for 100 char strings
generateTest(100, 'writer-bench-hundred.json');

// Generate Test for 1,000 char strings
generateTest(1000, 'writer-bench-1k.json');

// Generate Test for 10,000 char strings
generateTest(10000, 'writer-bench-10k.json');

// Generate Test for 100,000 char strings
generateTest(100000, 'writer-bench-100k.json');
