import { create, toDataURL, type QRCodeToDataURLOptions } from 'qrcode';
import { createHeadTag, createIndexTag, getLogger } from 'shared';
import GIF, { type AddFrameOptions } from 'gif.js';
import type { Logger, LogLevelDesc } from 'loglevel';
import { workerBlob } from './gif-worker';

interface WriterResult {
  code: string;
  image: string;
}

export interface WriterProps {
  logLevel: LogLevelDesc;
  qrOptions: QRCodeToDataURLOptions;
  gifOptions: AddFrameOptions;
  size: number;
  splitLength: number;
}

export class Writer {
  private log: Logger;
  opts: WriterProps;

  constructor(opts: Partial<WriterProps> = {}) {
    // Set up the default options
    const DEFAULT_WRITER_PROPS: WriterProps = {
      logLevel: 'silent',
      qrOptions: {
        errorCorrectionLevel: 'M',
        type: 'image/png',
      },
      gifOptions: {
        delay: 300,
      },
      size: 512,
      splitLength: 100,
    };

    // Merge the options with the defaults
    this.opts = { ...DEFAULT_WRITER_PROPS, ...opts };

    // Set up the logger
    const logger = getLogger();
    logger.setLevel(this.opts.logLevel);
    this.log = logger;
  }

  // Split an input string into multiple string of a certain length
  private split(code: string, opts: WriterProps): string[] {
    // Get the split length from the options
    const { splitLength } = opts;
    this.log.debug('Split length', splitLength);

    // Store all the codes and the length of the input string
    const codes: string[] = [];
    const length = code.length;

    // Loop through the input string
    let i = 0;
    while (i < length) {
      // Get a slice and push it into the codes array and move onto the next
      codes.push(code.slice(i, i + splitLength));
      this.log.debug('Creating slice', i, i + splitLength);
      i += splitLength;
    }

    // Add the index to each of the codes
    const indexedCodes = codes.map((v, idx) => `${createIndexTag(idx)} ${v}`);
    this.log.debug('Indexed codes', indexedCodes);

    // Add the head tag to the first code with the number of codes
    indexedCodes[0] = `${createHeadTag(indexedCodes.length)} ${
      indexedCodes[0]
    }`;
    this.log.debug('Indexing head', [indexedCodes[0]]);

    // Return the indexedCodes array
    return indexedCodes;
  }

  // Write a string of code to a series of QR code frames
  async write(code: string): Promise<WriterResult[]> {
    this.log.debug('Writing code', code);

    // Split the code into multiple strings
    const codes = this.split(code, this.opts);
    this.log.debug('Split codes', codes);

    // Generate all the QR codes
    const allQrs = await Promise.all(
      codes.map((v) => create(v, this.opts.qrOptions))
    );
    this.log.debug('Generated QR codes', allQrs);

    // Find the highest version of all the QR codes
    const highestVersion = allQrs.reduce((acc, v) => {
      if (v.version > acc) return v.version;
      return acc;
    }, 0);
    this.log.debug('Highest version', highestVersion);

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

  async compose(qrs: WriterResult[]): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const gif = new GIF({
          repeat: 0,
          workers: 4,
          quality: 10,
          workerScript: URL.createObjectURL(workerBlob),
          debug:
            this.opts.logLevel === 'trace' || this.opts.logLevel === 'debug',
        });

        // Counter to keep track of the loaded images
        let loadedImagesCount = 0;

        // Function to add the frame to the GIF and resolve when all frames are loaded
        const addFrameAndCheckCompletion = (): void => {
          loadedImagesCount++;
          if (loadedImagesCount === qrs.length) {
            // All images are loaded, resolve the promise
            gif.on('finished', (blob) => {
              this.log.debug('Created blob', blob);
              resolve(URL.createObjectURL(blob));
            });

            // Render the GIF
            gif.render();
          }
        };

        // Get the images from the QR codes and add them to the GIF
        for (const qr of qrs) {
          const img = new Image();

          // Use the onload event to ensure the image is fully loaded before adding it to the GIF
          img.onload = () => {
            gif.addFrame(img, this.opts.gifOptions);
            addFrameAndCheckCompletion();
          };

          img.onerror = (error) => {
            // Handle errors loading images
            this.log.error('Error loading image:', error);
            reject(error);
          };

          img.src = qr.image;
        }
      } catch (e) {
        this.log.error(e);
        reject(e);
      }
    });
  }
}
