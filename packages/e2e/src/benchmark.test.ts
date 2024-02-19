import { Bench } from 'tinybench';
import { test, expect, chromium } from '@playwright/test';
import {
  generateRandomString,
  saveBenchMark,
  FLIPBOOK_APP_URL,
} from './helpers';

const generateTest = (charLength: number, fileName: string) => {
  const testName = `Benchmark with ${charLength} char string`;

  test(testName, async () => {
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

    // Generate charLength string
    const text = generateRandomString(charLength);

    // Create a new benchmark instance
    const bench = new Bench();

    // Navigate to the Flipbook app
    await page.goto(FLIPBOOK_APP_URL);

    // Fill the textarea with the generated string
    await page.locator('#textarea').fill(text);

    // Click the Generate Flipbook button
    await page.locator('#generate').click();

    // Benchmark it
    bench.add(`Flipbook (writer) with ${charLength} char string`, async () => {
      // Wait for the editor to be loaded
      await page.waitForSelector('#image');
    });

    // Run the benchmark
    await bench.run();

    // Save results of the benchmark
    saveBenchMark(`writer-${fileName}`, bench.table());

    // Reset the benchmark
    bench.reset();

    console.log('Bench reset');

    // Click the Read Flipbook button
    await page.locator('#read-qr').click();

    console.log('Clicked read qr');

    // Benchmark it
    bench.add(`Flipbook (reader) with ${charLength} char string`, async () => {
      console.log('Waiting for read result');

      // Wait for the result to be loaded
      await page.waitForSelector('#read-result');

      console.log('Read result loaded');
    });

    // Run the benchmark
    await bench.run();

    // Save results of the benchmark
    saveBenchMark(`reader-${fileName}`, bench.table());

    // Assert the result
    expect(await page.locator('#read-result').innerText()).toBe(text);

    // Close the page
    page.close();

    // Close the context
    context.close();

    // Close the browser
    await browser.close();
  });
};

// Generate test for 100 char strings
generateTest(100, 'bench-hundred.json');

// Generate test for 1,000 char strings
generateTest(1000, 'bench-1k.json');

// Generate test for 10,000 char strings
generateTest(10000, 'bench-10k.json');
