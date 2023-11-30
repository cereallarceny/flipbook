import log, { type LogLevelDesc } from 'loglevel';
import { create, toDataURL, type QRCodeToDataURLOptions } from 'qrcode';
import { createHeadTag, createIndexTag } from 'shared';
import GIF from 'gif.js';
import { workerBlob } from './gif-worker';

interface WriterResult {
  code: string;
  image: string;
}

interface WriterProps {
  fps: number;
  logLevel: LogLevelDesc;
  qrOptions: QRCodeToDataURLOptions;
  size: number;
  splitLength: number;
}

export class Writer {
  private log: log.Logger;
  opts: WriterProps;

  constructor(opts: Partial<WriterProps> = {}) {
    // Set up the default options
    const DEFAULT_WRITER_PROPS: WriterProps = {
      fps: 10,
      logLevel: 'silent',
      qrOptions: {
        errorCorrectionLevel: 'M',
        type: 'image/png',
      },
      size: 512,
      splitLength: 100,
    };

    // Merge the options with the defaults
    this.opts = { ...DEFAULT_WRITER_PROPS, ...opts };

    // Set up the logger
    const logger = log.getLogger('qr-writer');
    logger.setLevel(this.opts.logLevel);
    this.log = logger;
  }

  // Split an input string into multiple string of a certain length
  private split(code: string, opts: WriterProps): string[] {
    // Get the split length from the options
    const { splitLength } = opts;
    this.log.debug('split length', splitLength);

    // Store all the codes and the length of the input string
    const codes: string[] = [];
    const length = code.length;

    // Loop through the input string
    let i = 0;
    while (i < length) {
      // Get a slice and push it into the codes array and move onto the next
      codes.push(code.slice(i, i + splitLength));
      this.log.debug('creating slice', i, i + splitLength);
      i += splitLength;
    }

    // Add the index to each of the codes
    const indexedCodes = codes.map((v, idx) => `${createIndexTag(idx)} ${v}`);
    this.log.debug('indexed codes', indexedCodes);

    // Add the head tag to the first code with the number of codes
    indexedCodes[0] = `${createHeadTag(indexedCodes.length)} ${
      indexedCodes[0]
    }`;
    this.log.debug('indexing head', [indexedCodes[0]]);

    // Return the indexedCodes array
    return indexedCodes;
  }

  // Write a string of code to a series of QR code frames
  async write(code: string): Promise<WriterResult[]> {
    this.log.debug('writing code', code);

    // Split the code into multiple strings
    const codes = this.split(code, this.opts);
    this.log.debug('split codes', codes);

    // Generate all the QR codes
    const allQrs = await Promise.all(
      codes.map((v) => create(v, this.opts.qrOptions))
    );
    this.log.debug('generated QR codes', allQrs);

    // Find the highest version of all the QR codes
    const highestVersion = allQrs.reduce((acc, v) => {
      if (v.version > acc) return v.version;
      return acc;
    }, 0);
    this.log.debug('highest version', highestVersion);

    // Regenerate each frame again with the highest version
    return Promise.all(
      codes.map(async (v) => ({
        code: v,
        image: await toDataURL(v, {
          ...this.opts.qrOptions,
          version: highestVersion,
        }),
      }))
    );
  }

  // TODO: Working on this, need to get it working, and document/log it appropriately
  async newCompose(qrs: WriterResult[]): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Create a new GIF instance
        const gif = new GIF({
          repeat: 0,
          workers: 2,
          quality: 10,
          height: this.opts.size,
          width: this.opts.size,
          workerScript: URL.createObjectURL(workerBlob),
          debug:
            this.opts.logLevel === 'trace' || this.opts.logLevel === 'debug',
        });

        // Get the images from the QR codes and add them to the GIF
        for (const qr of qrs) {
          const img = new Image(this.opts.size, this.opts.size);
          img.src = qr.image;
          gif.addFrame(img);
        }

        // Resolve the promise with the data URL of the GIF
        gif.on('finished', (blob) => {
          this.log.debug('created blob', blob);
          resolve(URL.createObjectURL(blob));
        });

        // Render the GIF
        gif.render();
      } catch (e) {
        this.log.error(e);

        // Reject the promise with the error
        reject(e);
      }
    });
  }

  // Stitch together a series of QR code frames into a GIF
  async compose(qrs: WriterResult[]): Promise<string> {
    // Import the canvas-capture library on the client
    const { CanvasCapture } = await import('canvas-capture');
    this.log.debug('imported canvas-capture');

    // Return a promise that resolves to the data URL of the GIF
    return new Promise((resolve, reject) => {
      try {
        // Get the images from the QR codes
        const images = qrs.map((item) => item.image);

        // Create a container element to hold the images and canvas
        const container = document.createElement('div');
        container.id = 'qr-container';
        container.style.width = `${this.opts.size}px`;
        container.style.height = `${this.opts.size}px`;
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.zIndex = '999999';
        this.log.debug('created container', container);

        // Create a canvas to draw the frame
        const canvas = document.createElement('canvas');
        canvas.width = this.opts.size;
        canvas.height = this.opts.size;
        container.appendChild(canvas);
        this.log.debug('created canvas', canvas);

        // Get the canvas context, or throw an error
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not create canvas context');
        this.log.debug('got canvas context');

        // Initialize the canvas-capture library
        CanvasCapture.init(canvas, {
          verbose:
            this.opts.logLevel === 'trace' || this.opts.logLevel === 'debug',
        });
        this.log.debug('initialized canvas-capture');

        // Begin recording the GIF
        CanvasCapture.beginGIFRecord({
          name: 'qr',
          fps: this.opts.fps,
          onExport: (blob) => {
            this.log.debug('created blob', blob);

            // Resolve the promise with the data URL
            resolve(URL.createObjectURL(blob));
          },
        });
        this.log.debug('began recording GIF');

        // For each image, draw it to the canvas and record a frame
        images.forEach((v) => {
          // Create the image and put it in the container
          const img = new Image(this.opts.size, this.opts.size);
          img.src = v;
          img.width = this.opts.size;
          img.height = this.opts.size;
          container.appendChild(img);
          this.log.debug('created image', img);

          // Clear the canvas
          ctx.clearRect(0, 0, this.opts.size, this.opts.size);
          this.log.debug('cleared canvas');

          // Draw the image to the canvas
          ctx.drawImage(img, 0, 0, this.opts.size, this.opts.size);
          this.log.debug('drew image', v);

          // Record the frame
          CanvasCapture.recordFrame();
          this.log.debug('recorded frame');

          // Remove the image from the dom
          img.remove();
          this.log.debug('removed image');
        });

        // Stop recording the GIF
        void CanvasCapture.stopRecord();
        this.log.debug('stopped recording GIF');

        // Destroy the canvas
        canvas.remove();
        this.log.debug('destroyed canvas');

        // Destroy the container
        container.remove();
        this.log.debug('destroyed container');
      } catch (e) {
        this.log.error(e);

        // Reject the promise with the error
        reject(e);
      }
    });
  }
}
