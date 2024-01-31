import { Bench } from 'tinybench';
import { test, expect } from '@playwright/test';
import { formatNumber, generateRandomString, saveBenchMark } from './helpers';
import { FLIPBOOK_APP_URL } from './constants';

const generateTest = (charLength: number, fileName: string) => {
  const testName = `Benchmark Writer with ${formatNumber(
    charLength
  )} char string`;

  test(testName, async ({ page }) => {
    const bench = new Bench({});

    // Navigate to the Flipbook app
    await page.goto(FLIPBOOK_APP_URL);

    // Check if the title is correct
    await expect(page).toHaveTitle(/Flipbook/);

    // Wait for the editor to be loaded
    const editorLoadingSelector = '[role="status"]';
    await page.waitForSelector(editorLoadingSelector, { state: 'hidden' });

    // Wait for the Monaco editor to be present in the DOM
    const editorSelector = '.monaco-mouse-cursor-text';
    const editorHandle = await page.waitForSelector(editorSelector);

    // Click the editor
    await editorHandle.click();

    // Press Ctrl+A to select all text
    await editorHandle.press('Control+A');

    // Press Backspace to delete the selected text
    await editorHandle.press('Backspace');

    // Generate charLength string
    const text = generateRandomString(charLength);

    // Type charLength string into the editor
    await editorHandle.type(text);

    // Click the Generate Flipbook button
    await page.getByText('Generate Flipbook').click();

    // Wait for the editor to be hidden
    await page.waitForSelector(editorSelector, { state: 'hidden' });

    // Benchmark it
    bench.add(
      `Generate QrCode Gif from ${charLength} char string`,
      async () => {
        // Click the reset button
        await page.getByRole('spinbutton').click();

        // Wait for the editor to be loaded
        await page.waitForSelector(editorLoadingSelector, { state: 'hidden' });

        // Click the Generate Flipbook button
        await page.getByText('Generate Flipbook').click();

        // Wait for the editor to be hidden
        await page.waitForSelector(editorSelector, { state: 'hidden' });
      }
    );

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
