import { GifReader } from 'omggif';
import {
  convertFileToBuffer,
  convertUnit8ClampedArrayToFile,
} from '@flipbookqr/shared';
import { FrameProcessor } from './frame-processor';
import { sliceFrames, sortFrames } from '../helpers';

/**
 * Class for processing image or GIF files to extract QR code data.
 *
 * @extends FrameProcessor
 */
export class FileProcessor extends FrameProcessor {
  protected _file?: File;

  /**
   * Constructs a new FileProcessor instance.
   */
  constructor() {
    // Initialize the processor
    super();
  }

  /**
   * Cleans up by removing the canvas element from the DOM.
   */
  protected destroy(): void {
    // Remove the canvas element
    this._canvas.remove();
  }

  /**
   * Processes a single image frame and extracts QR code data.
   *
   * @returns {Promise<string>} A promise that resolves to the extracted QR code data, or an empty string if no data is found.
   */
  protected processSingleFrame(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Create a new image element
        const img = new Image();

        // When the image is loaded, extract the QR code data
        img.onload = () => {
          this.setFrame(img);
          const frameData = this.getFrameData();
          resolve(frameData?.data || '');
        };

        // When an error occurs, reject the promise
        img.onerror = reject;

        // Set the image source to the file URL
        img.src = URL.createObjectURL(file);
      } catch (error) {
        reject(new Error('Failed to process frame'));
      }
    });
  }

  /**
   * Processes all frames in a GIF file and extracts QR code data from each frame.
   *
   * @returns {Promise<string[]>} A promise that resolves to an array of QR code data from each frame.
   */
  protected async processAllFrames(): Promise<string[]> {
    // Convert the GIF file to an ArrayBuffer
    const buffer = await convertFileToBuffer(this._file!);

    // Create a reader
    const reader = new GifReader(new Uint8Array(buffer));

    // Convert each frame to a File object
    const files: File[] = Array.from({ length: reader.numFrames() }).map(
      (_, i) => {
        // Decode and store the raw data of the QR code
        const data: number[] = [];
        reader.decodeAndBlitFrameRGBA(i, data);

        // Convert the data to a Uint8ClampedArray and then to a file
        return convertUnit8ClampedArrayToFile(
          new Uint8ClampedArray(data),
          reader.width,
          reader.height,
          `${Date.now()}.png`
        );
      }
    );

    // Process each frame
    const dataPromises: Promise<string>[] = files.map((file) =>
      this.processSingleFrame(file)
    );

    // Return the QR code data from each frame
    return await Promise.all(dataPromises);
  }

  /**
   * Determines whether the provided file is a GIF image.
   *
   * @param {File} file - The file to check.
   * @returns {boolean} True if the file is a GIF, false otherwise.
   */
  protected isGIF(file: File): boolean {
    // Check the file extension and MIME type
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension === 'gif' || file.type.startsWith('image/gif');
  }

  /**
   * Reads and processes the file (either single frame or GIF) to extract QR code data.
   *
   * @param {File} file - The file to process.
   * @returns {Promise<string>} A promise that resolves to the processed QR code data as a string.
   */
  async read(file: File): Promise<string> {
    // Store the file
    this._file = file;

    // If the file is a GIF, process all frames
    if (this.isGIF(this._file)) {
      const allFrames = await this.processAllFrames();
      return allFrames.sort(sortFrames).map(sliceFrames).join('');
    }

    // Otherwise, process a single frame
    else {
      return await this.processSingleFrame(this._file);
    }
  }
}
