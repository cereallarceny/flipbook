import jsQR, { type QRCode } from 'jsqr';
import { getLogger } from '@flipbookqr/shared';
import { type Logger } from 'loglevel';
import { parseGIF, decompressFrames } from 'gifuct-js';
import { sliceFrames, sortFrames } from '../helpers';
import { FrameProcessor } from './frame-processor';

/**
 * Class for processing image or GIF files to extract QR code data.
 *
 * @extends FrameProcessor
 */
export class FileProcessor extends FrameProcessor {
  protected _ctx: CanvasRenderingContext2D | null;
  protected _canvas: HTMLCanvasElement;
  protected _width: number;
  protected _height: number;
  protected _log: Logger;
  protected _file: File;

  /**
   * Constructs a new FileProcessor instance.
   *
   * @param {File} file - The file to be processed (e.g., an image file or a GIF).
   */
  constructor(file: File) {
    // Initialize the processor
    super();

    // Set up logger
    this._log = getLogger();

    // Set the file to process
    this._file = file;

    // Create canvas element
    const canvas = document.createElement('canvas');
    this._width = 1920;
    this._height = 1080;
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
  }

  /**
   * Sets the specified frame on the canvas.
   *
   * @param {HTMLImageElement | ImageBitmap} frame - The frame to draw on the canvas.
   * @throws Will throw an error if an unsupported frame type is provided.
   */
  protected setFrame(frame: HTMLImageElement | ImageBitmap): void {
    // Store the frame dimensions
    let width, height;

    // Get the frame dimensions
    if (frame instanceof HTMLImageElement || frame instanceof ImageBitmap) {
      width = frame.width;
      height = frame.height;
    } else {
      throw new Error('Unsupported frame type');
    }

    // Update the canvas dimensions
    this._width = width;
    this._height = height;
    this._canvas.width = width;
    this._canvas.height = height;

    // Draw the frame on the canvas
    this._ctx?.drawImage(frame, 0, 0, this._width, this._height);
  }

  /**
   * Retrieves QR code data from the current canvas frame.
   *
   * @returns {QRCode | null} The decoded QR code data, or null if no data is found.
   */
  protected getFrameData(): QRCode | null {
    // Get the image data from the canvas
    const imageData = this._ctx?.getImageData(0, 0, this._width, this._height);

    // Decode the image data to extract QR code data
    let decodedData: null | QRCode = null;
    if (imageData && 'data' in imageData) {
      decodedData = jsQR(imageData.data, this._width, this._height);
    }

    // Return the decoded data
    return decodedData;
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
    const buffer = await this.convertFileToBuffer(this._file);

    // Parse the GIF file
    const parsed = parseGIF(buffer);

    // Decompress the frames
    const frames = decompressFrames(parsed, true);

    // Convert each frame to a File object
    const files: File[] = frames.map((frame) =>
      this.convertUnit8ClampedArrayToFile(
        frame.patch,
        frame.dims.width,
        frame.dims.height,
        `${Date.now()}.png`
      )
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
   * Converts a File object to an ArrayBuffer.
   *
   * @param {File} file - The file to convert.
   * @returns {Promise<ArrayBuffer>} A promise that resolves to the file's ArrayBuffer.
   */
  protected convertFileToBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      // Create a new FileReader instance
      const reader = new FileReader();

      // When the file is read, resolve the promise with the ArrayBuffer
      reader.onload = (event) => {
        const arrayBuffer = event.target?.result;
        if (arrayBuffer) {
          resolve(arrayBuffer as ArrayBuffer);
        }
      };

      // When an error occurs, reject the promise
      reader.onerror = () => reject(new Error('Failed to read file'));

      // Read the file as an ArrayBuffer
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Converts an Uint8ClampedArray to a File object.
   *
   * @param {Uint8ClampedArray} imageData - The image data array.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {string} fileName - The name of the file to create.
   * @returns {File} The created File object.
   */
  protected convertUnit8ClampedArrayToFile(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
    fileName: string
  ): File {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    // Get the 2D context
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('2D context not supported');
    }

    // Create an ImageData object and put it on the canvas
    const imageDataObj = new ImageData(imageData, width, height);
    ctx.putImageData(imageDataObj, 0, 0);

    // Convert the canvas to a data URL
    const dataURL = canvas.toDataURL();

    // Convert the data URL to a Blob object
    const blob = this.dataURLtoBlob(dataURL);

    // Create a new File object
    return new File([blob], fileName, { type: blob.type });
  }

  /**
   * Converts a data URL to a Blob object.
   *
   * @param {string} dataURL - The data URL to convert.
   * @returns {Blob} The Blob object created from the data URL.
   */
  protected dataURLtoBlob(dataURL: string): Blob {
    // Split the data URL into parts
    const parts = dataURL.split(';base64,');
    const contentType = parts[0]?.split(':')[1];
    const raw = window.atob(parts[1]!);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    // Create a Uint8Array from the raw data
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    // Return a new Blob object
    return new Blob([uInt8Array], { type: contentType });
  }

  /**
   * Reads and processes the file (either single frame or GIF) to extract QR code data.
   *
   * @returns {Promise<string>} A promise that resolves to the processed QR code data as a string.
   */
  async read(): Promise<string> {
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
