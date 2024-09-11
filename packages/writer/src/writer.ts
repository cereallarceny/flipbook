import { create, toDataURL, type QRCodeToDataURLOptions } from 'qrcode';
import { createHeadTag, createIndexTag, getLogger } from '@flipbookqr/shared';
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

/**
 * The Writer class is responsible for generating QR codes from a given string,
 * splitting long strings into multiple QR codes, and optionally composing them into a GIF.
 */
export class Writer {
  private log: Logger;
  opts: WriterProps;

  /**
   * Creates a new Writer instance with the provided options or defaults.
   *
   * @param {Partial<WriterProps>} [opts={}] - Configuration options for the writer, including logging level, QR options, GIF options, size, and split length.
   */
  constructor(opts: Partial<WriterProps> = {}) {
    // Default options
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

    // Merge default and custom options
    this.opts = { ...DEFAULT_WRITER_PROPS, ...opts };

    // Set up logger
    const logger = getLogger();
    logger.setLevel(this.opts.logLevel);
    this.log = logger;
  }

  /**
   * Splits a string into multiple segments based on the specified split length.
   * Each segment is tagged with an index and the total number of segments.
   *
   * @param {string} code - The string to be split.
   * @param {WriterProps} opts - The options specifying the split length.
   * @returns {string[]} An array of strings representing the split and tagged segments.
   */
  private split(code: string, opts: WriterProps): string[] {
    // Destructure split length from options
    const { splitLength } = opts;
    this.log.debug('Split length', splitLength);

    // Store each segment in an array and get the length of the input string
    const codes: string[] = [];
    const length = code.length;

    // Split the string into segments based on the split length
    let i = 0;
    while (i < length) {
      codes.push(code.slice(i, i + splitLength));
      this.log.debug('Creating slice', i, i + splitLength);
      i += splitLength;
    }

    // Add index and total count tags to each segment
    const indexedCodes = codes.map((v, idx) => `${createIndexTag(idx)} ${v}`);
    this.log.debug('Indexed codes', indexedCodes);

    // Add head tag to the first segment
    indexedCodes[0] = `${createHeadTag(indexedCodes.length)} ${indexedCodes[0]}`;
    this.log.debug('Indexing head', [indexedCodes[0]]);

    // Return the tagged segments
    return indexedCodes;
  }

  /**
   * Generates QR codes from the given string.
   * The string is split into multiple parts if it exceeds the split length.
   *
   * @param {string} code - The input string to encode into QR codes.
   * @returns {Promise<WriterResult[]>} A promise that resolves with an array of WriterResult objects, each containing a QR code and its corresponding image.
   */
  async write(code: string): Promise<WriterResult[]> {
    this.log.debug('Writing code', code);

    // Split the input string into multiple segments
    const codes = this.split(code, this.opts);
    this.log.debug('Split codes', codes);

    // Generate QR codes for each segment
    const allQrs = await Promise.all(
      codes.map((v) => create(v, this.opts.qrOptions))
    );
    this.log.debug('Generated QR codes', allQrs);

    // Find the highest version among all QR codes
    const highestVersion = allQrs.reduce(
      (acc, v) => (v.version > acc ? v.version : acc),
      0
    );
    this.log.debug('Highest version', highestVersion);

    // Convert QR codes to data URLs
    return Promise.all(
      codes.map(async (v) => ({
        code: v,
        image: await toDataURL(v, {
          ...this.opts.qrOptions,
          width: this.opts.size,
          version: highestVersion,
        }),
      }))
    );
  }

  /**
   * Composes multiple QR code frames into a GIF.
   *
   * @param {WriterResult[]} qrs - An array of QR code images to compose into a GIF.
   * @returns {Promise<string>} A promise that resolves to a URL pointing to the created GIF.
   */
  async compose(qrs: WriterResult[]): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Create a new GIF instance
        const gif = new GIF({
          repeat: 0,
          workers: 4,
          quality: 10,
          workerScript: URL.createObjectURL(workerBlob),
          debug:
            this.opts.logLevel === 'trace' || this.opts.logLevel === 'debug',
        });

        // Keep track of the number of loaded images
        let loadedImagesCount = 0;

        // Add each QR code frame to the GIF
        const addFrameAndCheckCompletion = (): void => {
          loadedImagesCount++;
          if (loadedImagesCount === qrs.length) {
            // When all images are loaded, resolve with the GIF
            gif.on('finished', (blob) => {
              this.log.debug('Created blob', blob);
              resolve(URL.createObjectURL(blob));
            });

            // Add each frame to the GIF
            gif.render();
          }
        };

        // Load each QR code image and add it to the GIF
        for (const qr of qrs) {
          // Create a new image element
          const img = new Image();

          // When the image is loaded, add it to the GIF
          img.onload = () => {
            gif.addFrame(img, this.opts.gifOptions);
            addFrameAndCheckCompletion();
          };

          // When an error occurs, reject the promise
          img.onerror = (error) => {
            this.log.error('Error loading image:', error);
            reject(
              new Error(
                typeof error === 'string' ? error : 'Error loading image'
              )
            );
          };

          // Set the image source to the QR code data URL
          img.src = qr.image;
        }
      } catch (e) {
        this.log.error(e);
        reject(new Error(e as string));
      }
    });
  }
}
