import { Bench } from 'tinybench';
import { test, expect, chromium } from '@playwright/test';
import { FLIPBOOK_APP_URL } from './constants';
import { formatNumber, generateRandomString, saveBenchMark } from './helpers';

const generateTest = (charLength: number, fileName: string) => {
  const testName = `Benchmark Reader with ${formatNumber(
    charLength
  )} char string`;

  test(testName, async ({}) => {
    const bench = new Bench({});

    // Create a new Chromium browser instance and configure it for screen capture without user/client interactivity
    const browser = await chromium.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-infobars',
        '--hide-scrollbars',
        '--ignore-certificate-errors',
        '--enable-experimental-web-platform-features',
        '--allow-http-screen-capture',
        '--enable-usermedia-screen-capturing',
        '--auto-select-desktop-capture-source=Flipbook',
        '--autoplay-policy=no-user-gesture-required',
      ],
    });

    // Create a new browser context
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
    });

    // Create a new page from the browser context
    const page = await context.newPage();

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

    // Click the Read QR button
    await page.getByText(/Read QR/).click();

    // Wait for the output to be visible
    const outputLocator = await page.getByText('Reading...');
    await outputLocator.waitFor({ state: 'hidden' });

    // Add a benchmark
    bench.add(
      `Generate QrCode Gif from ${charLength} char string`,
      async () => {
        // Click the Read QR button
        await page.getByText(/Read QR/).click();

        // Wait for the output to be visible
        const outputLocator = await page.getByText('Reading...');
        await outputLocator.waitFor({ state: 'hidden' });
      }
    );

    // Run the benchmark
    await bench.run();

    // Save results of the benchmark
    saveBenchMark(`${fileName}`, bench.table());

    // Close the browser
    await browser.close();
  });
};

// Generate Test for 100 char strings
generateTest(100, 'reader-bench-hundred.json');

// Generate Test for 1,000 char strings
generateTest(1000, 'reader-bench-1k.json');

// Generate Test for 10,000 char strings
generateTest(10000, 'reader-bench-10k.json');

// Generate Test for 100,000 char strings
generateTest(100000, 'reader-bench-100k.json');
