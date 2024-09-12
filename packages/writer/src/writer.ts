import { createHeadTag, createIndexTag, getLogger } from '@flipbookqr/shared';
import { Encoder, ErrorCorrectionLevel } from '@nuintun/qrcode';
import { GifWriter } from 'omggif';
import type { Logger, LogLevelDesc } from 'loglevel';

interface WriterResult {
  code: string;
  image: Encoder;
}

export interface WriterProps {
  logLevel: LogLevelDesc;
  errorCorrectionLevel: ErrorCorrectionLevel;
  encodingHint: boolean;
  version?: number;
  moduleSize: number;
  margin: number;
  delay: number;
  splitLength: number;
}

/**
 * The Writer class is responsible for generating QR codes from a given string,
 * splitting long strings into multiple QR codes, and optionally composing them into a GIF.
 */
export class Writer {
  private log: Logger;
  opts: WriterProps;
  private size?: number;

  /**
   * Creates a new Writer instance with the provided options or defaults.
   *
   * @param {Partial<WriterProps>} [opts={}] - Configuration options for the writer, including logging level, QR options, GIF options, size, and split length.
   */
  constructor(opts: Partial<WriterProps> = {}) {
    // Default options
    const DEFAULT_WRITER_PROPS: WriterProps = {
      logLevel: 'silent',
      errorCorrectionLevel: ErrorCorrectionLevel.M,
      encodingHint: true,
      version: undefined,
      moduleSize: 4,
      margin: 8,
      delay: 100,
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
   * Creates a new QR code encoder with the specified content and version.
   *
   * @param {string} content - The content to encode into a QR code.
   * @param {number} [version] - The version of the QR code to generate.
   * @returns {Encoder} A new QR code encoder instance.
   */
  private createEncoder(content: string, version?: number): Encoder {
    // Create the encoder instance
    const encoder = new Encoder();

    // Set the version, encoding hint, and error correction level
    if (version) encoder.setVersion(version);
    encoder.setEncodingHint(this.opts.encodingHint);
    encoder.setErrorCorrectionLevel(this.opts.errorCorrectionLevel);

    // Write the content and generate the QR code
    encoder.write(content);
    encoder.make();

    // Return the encoder instance
    return encoder;
  }

  /**
   * Converts raw encoder data into a 2d binary array
   *
   * @
   */
  private encoderTo2dBinaryArray(encoder: Encoder): number[][] {
    const size: number = this.size!;
    const { margin, moduleSize } = this.opts;

    function isDark(matrix: boolean[][], row: number, col: number): boolean {
      if (matrix[row] && matrix[row][col] !== null) {
        return matrix[row][col]!;
      } else {
        return false;
      }
    }

    // Get the 2d boolean matrix from the encoder
    const matrix = encoder.getMatrix();

    // Store the matrix
    const finalMatrix: number[][] = [];

    // For each row
    for (let y = 0; y < size; y++) {
      // Create an array
      const row: number[] = [];

      // For each column
      for (let x = 0; x < size; x++) {
        // Check if the value is black and within the margins, push a 0
        if (
          margin <= x &&
          x < size - margin &&
          margin <= y &&
          y < size - margin &&
          isDark(
            matrix,
            ((y - margin) / moduleSize) >> 0,
            ((x - margin) / moduleSize) >> 0
          )
        ) {
          row.push(0);
        }

        // Otherwise it's white, push a 1
        else {
          row.push(1);
        }
      }

      // Push the row on the final matrix
      finalMatrix.push(row);
    }

    // Return the final matrix
    return finalMatrix;
  }

  /**
   * Generates QR codes from the given string.
   * The string is split into multiple parts if it exceeds the split length.
   *
   * @param {string} code - The input string to encode into QR codes.
   * @returns {WriterResult[]} An array of WriterResult objects, each containing a string segment and its corresponding QR code image.
   */
  write(code: string): WriterResult[] {
    this.log.debug('Writing code', code);

    // Split the input string into multiple segments
    const codes = this.split(code, this.opts);
    this.log.debug('Split codes', codes);

    // Store all the encoders
    const encoders: Encoder[] = [];

    // Encode the first segment to determine the highest version
    const firstEncoder = this.createEncoder(codes[0]!, this.opts.version);
    const highestVersion = firstEncoder.getVersion();
    this.opts.version = highestVersion;
    encoders.push(firstEncoder);

    // Set the size of the QR code
    this.size =
      this.opts.moduleSize * firstEncoder.getMatrixSize() +
      this.opts.margin * 2;

    this.log.debug('Size set', this.size);

    // Encode the remaining segments
    for (let i = 1; i < codes.length; i++) {
      const encoder = this.createEncoder(codes[i]!, highestVersion);
      encoders.push(encoder);
    }

    this.log.debug('Encoded all qr codes', encoders);

    // Convert QR codes to data URLs
    return codes.map((code, i) => {
      // Get the encoder for the current segment
      const encoder = encoders[i]!;

      // Return the segment and its corresponding encoder
      return {
        code,
        image: encoder,
      };
    });
  }

  /**
   * Composes multiple QR code frames into a GIF.
   *
   * @param {WriterResult[]} qrs - An array of QR code images to compose into a GIF.
   * @returns {string} A URL pointing to the created GIF.
   */
  compose(qrs: WriterResult[]): string {
    // If there's no size, throw an error
    if (!this.size) {
      throw new Error('Run writer.write() before writer.compose()');
    }

    // Create a buffer big enough to contain the image
    const buf = new Uint8Array(this.size * this.size * qrs.length * 4);

    // Create the writer instance
    const writer = new GifWriter(buf, this.size, this.size, {
      palette: [0x000000, 0xffffff],
      loop: 0,
      background: 1,
    });

    this.log.debug('Created new GIF writer', writer);

    // For each qr code, add a frame to the gif
    for (let i = 0; i < qrs.length; i++) {
      // Get the QR code
      const qr = qrs[i]!;

      // Convert the matrix into a 2d binary array
      const matrix = this.encoderTo2dBinaryArray(qr.image);

      this.log.debug('Added frame to QR', matrix);

      // Add the frame to the GIF
      writer.addFrame(0, 0, this.size, this.size, matrix.flat(), {
        delay: 100 / this.opts.delay,
      });
    }

    // Create the GIF from the first frame to the last
    const qr = buf.slice(0, writer.end());

    this.log.debug('Final QR buffer', qr);

    // Return the GIF URL
    return URL.createObjectURL(new Blob([qr]));
  }
}
