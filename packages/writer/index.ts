import { type QRCodeToDataURLOptions, toDataURL, create } from 'qrcode';
import {
  createHeadTag,
  createIndexTag,
  getHeadLength,
  getIndex,
  isHead,
} from './helpers';

// The result of writing an image to a QR code
export interface WriterResult {
  code: string;
  image: string;
  index: number;
}

// Default options for QR codes
const DEFAULT_QR_OPTIONS: QRCodeToDataURLOptions = {
  errorCorrectionLevel: 'M',
  type: 'image/png',
};

// The default length of each QR code
const DEFAULT_SPLIT_LENGTH = 100;

// Split an input string into multiple string of a certain length
const splitCode = (code: string): string[] => {
  // Store all the codes and the length of the input string
  const codes: string[] = [];
  const length = code.length;

  // Loop through the input string
  let i = 0;
  while (i < length) {
    // Get a slice and push it into the codes array and move onto the next
    codes.push(code.slice(i, i + DEFAULT_SPLIT_LENGTH));
    i += DEFAULT_SPLIT_LENGTH;
  }

  // Add the index to each of the codes
  const indexedCodes = codes.map((v, idx) => `${createIndexTag(idx)} ${v}`);

  // Add the head tag to the first code with the number of codes
  indexedCodes[0] = `${createHeadTag(indexedCodes.length)} ${indexedCodes[0]}`;

  // Return the indexedCodes array
  return indexedCodes;
};

// Receive a long string and split it into multiple QR codes
export const writer = async (
  code: string,
  options: QRCodeToDataURLOptions = {}
): Promise<WriterResult[]> => {
  // Split the code into multiple strings
  const codes = splitCode(code);

  // Define the options
  const opts: QRCodeToDataURLOptions = {
    ...DEFAULT_QR_OPTIONS,
    ...options,
  };

  // Generate all the QR codes
  const allQrs = await Promise.all(codes.map((v) => create(v, opts)));

  // Find the highest version of all the QR codes
  const highestVersion = allQrs.reduce((acc, v) => {
    if (v.version > acc) return v.version;
    return acc;
  }, 0);

  // Regenerate each frame again with the highest version
  return Promise.all(
    codes.map(async (v, i) => ({
      index: i,
      code: v,
      image: await toDataURL(v, { ...opts, version: highestVersion }),
    }))
  );
};

// Compose a series of data URL's into a single repeating GIF
export const compose = async (
  images: string[],
  canvas: HTMLCanvasElement,
  { width, height }: { width: number; height: number }
): Promise<string> => {
  // Import the canvas-capture library on the client
  const { CanvasCapture } = await import('canvas-capture');

  // Get the canvas context, or throw an error
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context');

  // Return a promise that resolves to the data URL of the GIF
  return new Promise((resolve, reject) => {
    try {
      // Initialize the canvas-capture library
      CanvasCapture.init(canvas, {
        verbose: true,
      });

      // Begin recording the GIF
      CanvasCapture.beginGIFRecord({
        name: 'qr',
        fps: 30,
        onExport: (blob) => {
          // Resolve the promise with the data URL
          resolve(URL.createObjectURL(blob));
        },
      });

      // For each image, draw it to the canvas and record a frame
      images.forEach((v) => {
        // Clear the canvas
        ctx.clearRect(0, 0, width, height);

        // Draw the image to the canvas
        const img = new Image();
        img.src = v;
        ctx.drawImage(img, 0, 0, width, height);

        // Record the frame
        CanvasCapture.recordFrame();
      });

      // Stop recording the GIF
      void CanvasCapture.stopRecord();
    } catch (e) {
      // Reject the promise with the error
      reject(e);
    }
  });
};

// Re-export the headers
export { createHeadTag, createIndexTag, getHeadLength, getIndex, isHead };
