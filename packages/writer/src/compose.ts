import log from 'loglevel';
import { type WriterResult, type WriterProps } from 'shared';
import { DEFAULT_WRITER_PROPS } from './constants';

// Compose a series of data URL's into a single repeating GIF
export const compose = async (
  qrs: WriterResult[],
  opts: Partial<WriterProps> = {}
): Promise<string> => {
  // Merge the options with the default options
  const mergedOpts: WriterProps = { ...DEFAULT_WRITER_PROPS, ...opts };

  // Set up the logger
  log.setLevel(mergedOpts.logLevel);
  log.debug('logger established');
  log.debug('merged options', mergedOpts);

  // Import the canvas-capture library on the client
  const { CanvasCapture } = await import('canvas-capture');
  log.debug('imported canvas-capture');

  // Return a promise that resolves to the data URL of the GIF
  return new Promise((resolve, reject) => {
    try {
      // Get the images from the QR codes
      const images = qrs.map((item) => item.image);

      // Create a canvas to draw the frame
      const canvas = document.createElement('canvas');
      canvas.width = mergedOpts.size;
      canvas.height = mergedOpts.size;
      log.debug('created canvas', canvas);

      // Put the canvas in the DOM
      document.body.appendChild(canvas);

      // Get the canvas context, or throw an error
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create canvas context');
      log.debug('got canvas context');

      // Initialize the canvas-capture library
      CanvasCapture.init(canvas, {
        verbose:
          mergedOpts.logLevel === 'trace' || mergedOpts.logLevel === 'debug',
      });
      log.debug('initialized canvas-capture');

      // Begin recording the GIF
      CanvasCapture.beginGIFRecord({
        name: 'qr',
        fps: 10,
        onExport: (blob) => {
          log.debug('created blob', blob);

          // Resolve the promise with the data URL
          resolve(URL.createObjectURL(blob));
        },
      });
      log.debug('began recording GIF');

      // For each image, draw it to the canvas and record a frame
      images.forEach((v) => {
        // Clear the canvas
        ctx.clearRect(0, 0, mergedOpts.size, mergedOpts.size);
        log.debug('cleared canvas');

        // Draw the image to the canvas
        const img = new Image();
        img.src = v;
        ctx.drawImage(img, 0, 0, mergedOpts.size, mergedOpts.size);
        log.debug('drew image', v);

        // Record the frame
        CanvasCapture.recordFrame();
        log.debug('recorded frame');
      });

      // Stop recording the GIF
      void CanvasCapture.stopRecord();
      log.debug('stopped recording GIF');

      // Destroy the temporary canvas
      canvas.width = 0;
      canvas.height = 0;
      canvas.remove();
      log.debug('destroyed canvas');
    } catch (e) {
      log.error(e);

      // Reject the promise with the error
      reject(e);
    }
  });
};
