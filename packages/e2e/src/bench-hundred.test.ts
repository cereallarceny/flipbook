import { Bench } from 'tinybench';
import { test, expect } from '@playwright/test';
import { generateRandomString, saveBenchMark } from './helpers';
import { FLIPBOOK_APP_URL } from './constants';

test('Benchmark Writer with 100 char string', async ({ page }) => {
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

  // Generate 100 char string
  const text100 = generateRandomString(100);

  // Type 100 char string into the editor
  await editorHandle.type(text100);

  // Click the Generate Flipbook button
  await page.getByText('Generate Flipbook').click();

  // Wait for the editor to be hidden
  await page.waitForSelector(editorSelector, { state: 'hidden' });

  // Benchmark it
  bench.add('Generate QrCode Gif from 100 char string', async () => {
    // Click the reset button
    await page.getByRole('spinbutton').click();

    // Wait for the editor to be loaded
    const editorLoadingSelector = '[role="status"]';
    await page.waitForSelector(editorLoadingSelector, { state: 'hidden' });

    // Click the Generate Flipbook button
    await page.getByText('Generate Flipbook').click();

    // Wait for the editor to be hidden
    await page.waitForSelector(editorSelector, { state: 'hidden' });
  });

  // Run the benchmark
  await bench.run();

  // Save results of the benchmark
  saveBenchMark('bench-hundred.json', bench.table());
});
