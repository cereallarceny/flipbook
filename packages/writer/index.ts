import { type QRCodeToDataURLOptions, toDataURL, create } from 'qrcode';

export interface WriterResult {
  index: number;
  code: string;
  image: string;
}

const DEFAULT_QR_OPTIONS: QRCodeToDataURLOptions = {
  errorCorrectionLevel: 'M',
  type: 'image/png',
};

const DEFAULT_SPLIT_LENGTH = 100;

// Split an input string into multiple string of a certain length
const splitCode = (code: string): string[] => {
  const codes: string[] = [];
  const length = code.length;

  let i = 0;

  while (i < length) {
    codes.push(code.slice(i, i + DEFAULT_SPLIT_LENGTH));
    i += DEFAULT_SPLIT_LENGTH;
  }

  return codes;
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
