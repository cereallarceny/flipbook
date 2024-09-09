import fs from 'fs';
import path from 'path';
import { Bench } from 'tinybench';
import { test, expect } from '@playwright/test';
import {
  generateRandomString,
  saveBenchMark,
  FLIPBOOK_APP_URL,
  assetsDir,
} from './helpers';

const generateTest = (charLength: number, fileName: string) => {
  const testName = `Benchmark with ${charLength} char string`;

  test(testName, async ({ page }) => {
    // A place to store the URLs of the QR code images
    const urls: string[] = [];

    // A place to store the benchmark expected and actual results
    const expectedResults: string[] = [];
    const results: string[] = [];

    // Create the benchmark instances
    const writerBench = new Bench({
      warmupIterations: 0,
      iterations: 10,
    });
    const readerBench = new Bench({
      warmupIterations: 0,
      iterations: 10,
    });

    // If the assets directory does not exist, create it
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    // Navigate to the Flipbook app
    await page.goto(FLIPBOOK_APP_URL);

    // Initialize the counter for writer and reader
    let writeI = 0;
    let readI = 0;

    // Benchmark it
    writerBench.add(
      `Flipbook (writer) with ${charLength} char string`,
      async () => {
        // Click the Generate Flipbook button
        await page.locator('#generate').click();

        // Wait for the editor to be loaded
        await page.waitForSelector('#image');
      },
      {
        beforeEach: async function () {
          // Generate charLength string
          const text = generateRandomString(charLength);

          // Store the expected result
          expectedResults.push(text);

          // Fill the textarea with the generated string
          await page.locator('#textarea').fill(text);
        },
        afterEach: async function () {
          // Get the data of the QR code image
          const imgSrc = await page.locator('#image').getAttribute('src');
          const response = await page.goto(imgSrc || '');
          const buffer = (await response?.body()) || '';

          // Store the QR code image at the following path
          const qrFilePath = path.resolve(
            assetsDir,
            `${fileName.split('.json')[0]}-${writeI}.gif`
          );

          // Save the image to a file
          fs.writeFileSync(qrFilePath, buffer);

          // Store the URL of the QR code image
          urls.push(qrFilePath);

          // Navigate back to the benchmark page
          await page.goto(FLIPBOOK_APP_URL);

          // Increment the counter
          writeI++;
        },
      }
    );

    // Run the benchmark
    await writerBench.run();

    // Save results of the benchmark
    saveBenchMark(`writer-${fileName}`, writerBench.table());

    // Benchmark it
    readerBench.add(
      `Flipbook (reader) with ${charLength} char string`,
      async () => {
        // Click the Decode button
        await page.locator('#decode').click();

        // Wait for the decoding to be completed
        await page.locator('#decoded').waitFor({ state: 'visible' });
      },
      {
        beforeEach: async function () {
          // Upload the QR code image
          await page.locator('#upload').setInputFiles(urls[readI] || '');

          // Increment the counter
          readI++;
        },
        afterEach: async function () {
          // Get the decoded text
          const value = await page.locator('#decoded').innerHTML();

          // Store the decoded text
          results.push(value);

          // Navigate back to the benchmark page
          await page.goto(FLIPBOOK_APP_URL);
        },
      }
    );

    // Run the benchmark
    await readerBench.run();

    // Save results of the benchmark
    saveBenchMark(`reader-${fileName}`, readerBench.table());

    // Run the assertions
    for (let i = 0; i < results.length; i++) {
      expect(results[i]).toBe(expectedResults[i]);
    }

    // Destroy the assets dir and everything in it
    fs.rmdirSync(assetsDir, { recursive: true });
  });
};

// Generate test for 100 char strings
generateTest(100, 'bench-hundred.json');

// Generate test for 1,000 char strings
generateTest(1000, 'bench-1k.json');

// Generate test for 10,000 char strings
generateTest(10000, 'bench-10k.json');
