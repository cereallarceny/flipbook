import jsQR, { type QRCode } from 'jsqr';
import { getLogger } from 'shared';
import { type Logger } from 'loglevel';
import { parseGIF, decompressFrames } from 'gifuct-js';
import { sliceFrames, sortFrames } from '../helpers';
import { FrameProcessor } from './frame-processor';

/**
 * Class for processing a file, inherits from FrameProcessor.
 */
export class FileProcessor extends FrameProcessor {
  protected canvasContext: CanvasRenderingContext2D | null;
  protected canvasElement: HTMLCanvasElement;
  protected imageWidth: number;
  protected imageHeight: number;
  protected logger: Logger;
  protected file: File;

  /**
   * Constructs a new FileProcessor instance.
   * @param file - The file to be processed (could be an image file or a GIF).
   */
  constructor(file: File) {
    super();

    this.logger = getLogger();
    this.file = file; // Store the file for future processing

    // Create canvas element
    const canvas = document.createElement('canvas');

    // Set default width and height
    this.imageWidth = 1920;
    this.imageHeight = 1080;

    // Store the canvas temporarily
    this.canvasElement = canvas;

    // Store canvas context
    this.canvasContext = canvas.getContext('2d');
  }

  /**
   * Sets the frame on the canvas.
   * @param frame - The frame to be set.
   */
  setFrame(frame: HTMLImageElement | ImageBitmap): void {
    let width, height;

    // Determine width and height based on the type of frame
    if (frame instanceof HTMLImageElement || frame instanceof ImageBitmap) {
      width = frame.width;
      height = frame.height;
    } else {
      throw new Error('Unsupported frame type');
    }

    // Set width and height
    this.imageWidth = width;
    this.imageHeight = height;

    // Set width and height of the canvas
    this.canvasElement.width = width;
    this.canvasElement.height = height;

    // Draw the frame onto the canvas
    this.canvasContext?.drawImage(
      frame,
      0,
      0,
      this.imageWidth,
      this.imageHeight
    );
  }

  /**
   * Retrieves frame data from the canvas.
   * @returns The QR code data found in the frame, or null if no data is found.
   */
  getFrameData(): QRCode | null {
    // Get the data from the canvas
    const imageData = this.canvasContext?.getImageData(
      0,
      0,
      this.imageWidth,
      this.imageHeight
    );

    // If there is no data, return null
    if (!imageData) return null;

    // Decode the results data using jsQR
    const decodedData = jsQR(imageData.data, this.imageWidth, this.imageHeight);

    return decodedData; // Return the decoded data
  }

  /**
   * Destroys the temporary canvas.
   */
  destroy(): void {
    this.canvasElement.remove(); // Remove the canvas from the DOM
  }

  /**
   * Processes a single frame.
   * @returns A Promise that resolves to the processed frame data.
   */
  protected async processSingleFrame(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.onload = () => {
          this.setFrame(img);
          const frameData = this.getFrameData();
          if (frameData && 'data' in frameData) {
            resolve(frameData.data); // Resolve with frame data if available
          } else {
            resolve(''); // Otherwise, resolve with an empty string
          }
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(this.file);
      } catch (error) {
        reject(error); // Reject with error if an error occurs
      }
    });
  }

  /**
   * Processes all frames in a GIF file.
   * @returns A Promise that resolves to an array of processed frame data.
   */
  async processAllFrames(): Promise<string[]> {
    // Convert the file to a buffer
    const buffer = await this.convertFileToBuffer(this.file);
    // Parse the GIF file and decompress frames
    const parsed = parseGIF(buffer);
    const frames = decompressFrames(parsed, true);

    const files: File[] = [];
    // Convert each frame to a File object and store them in an array
    frames.forEach((frame) => {
      const frameFile = this.convertUnit8ClampedArrayToFile(
        frame.patch,
        frame.dims.width,
        frame.dims.height,
        `${Date.now()}.png`
      );
      files.push(frameFile);
    });

    const dataPromise: Promise<string>[] = [];

    // Process each frame asynchronously
    files.forEach((file: File) => {
      const promise = new Promise((resolve, reject) => {
        try {
          const img = new Image();
          img.onload = () => {
            this.setFrame(img);
            const frameData = this.getFrameData();
            if (frameData && 'data' in frameData) {
              resolve(`${frameData.data}`); // Resolve with frame data if available
            } else {
              resolve(''); // Otherwise, resolve with an empty string
            }
          };
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        } catch (error) {
          reject(error); // Reject with error if an error occurs
        }
      });

      dataPromise.push(promise as Promise<string>); // Push the promise to the array
    });

    const result: string[] = await Promise.all(dataPromise); // Wait for all promises to resolve

    return result; // Return the processed frame data
  }

  /**
   * Reads the file and processes it accordingly.
   * @returns A Promise that resolves to the processed data.
   */
  async read(): Promise<string> {
    let result: Promise<string>;
    // If the file is a GIF, process all frames
    if (this.isGIF(this.file)) {
      const allFrames = await this.processAllFrames();

      result = new Promise((resolve, reject) => {
        const data = allFrames.sort(sortFrames).map(sliceFrames).join('');

        if (data) {
          resolve(data); // Resolve with the processed data
        }

        reject(new Error('Failed to parse frame data')); // Reject with an error if failed to parse data
      });
    } else {
      result = this.processSingleFrame(); // Otherwise, process a single frame
    }

    return result; // Return the processed result
  }

  /**
   * Checks if the file is a GIF image.
   * @param file - The file to check.
   * @returns True if the file is a GIF image, false otherwise.
   */
  protected isGIF(file: File): boolean {
    // Get the file extension
    const extension = file.name.split('.').pop()?.toLowerCase();

    // Check if the extension is 'gif'
    if (extension === 'gif') {
      return true;
    }

    // Alternatively, we can check the MIME type
    // MIME types for GIF images usually start with 'image/gif'
    return file.type.startsWith('image/gif');
  }

  /**
   * Converts a File object to a buffer.
   * @param file - The File object to convert.
   * @returns A Promise that resolves to an ArrayBuffer.
   */
  protected convertFileToBuffer(file: File): Promise<ArrayBuffer> {
    const promise = new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const arrayBuffer = event.target?.result;
        if (arrayBuffer) {
          const buffer = Buffer.from(arrayBuffer as string);
          resolve(buffer);
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsArrayBuffer(file);
    });

    return promise as unknown as Promise<ArrayBuffer>;
  }

  /**
   * Converts an Uint8ClampedArray to a File object.
   * @param imageData - The Uint8ClampedArray representing image data.
   * @param width - The width of the image.
   * @param height - The height of the image.
   * @param fileName - The name of the file to create.
   * @returns The created File object.
   */
  protected convertUnit8ClampedArrayToFile(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
    fileName: string
  ): File {
    // Create a new canvas element
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    // Get the 2D context of the canvas
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('2D context not supported');
    }

    // Create an ImageData object from the Uint8ClampedArray
    const imageDataObj: ImageData = new ImageData(imageData, width, height);

    // Put the ImageData onto the canvas
    ctx.putImageData(imageDataObj, 0, 0);

    // Convert the canvas to a data URL
    const dataURL: string = canvas.toDataURL();

    // Convert data URL to Blob
    const blob = this.dataURLtoBlob(dataURL);

    // Create a File object from the Blob
    const file = new File([blob], fileName, { type: blob.type });

    return file;
  }

  /**
   * Converts a data URL to a Blob object.
   * @param dataURL - The data URL to convert.
   * @returns The Blob object created from the data URL.
   */
  protected dataURLtoBlob(dataURL: string): Blob {
    const parts = dataURL.split(';base64,');

    const contentType = parts[0]?.split(':')[1];
    const raw = window.atob(parts[1] as unknown as string);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  }
}
