import { getLogger } from '@flipbookqr/shared';
import jsQR, { type QRCode } from 'jsqr';
import type { Logger } from 'loglevel';

export abstract class FrameProcessor {
  protected _ctx: CanvasRenderingContext2D | null;
  protected _canvas: HTMLCanvasElement;
  protected _width: number;
  protected _height: number;
  protected _log: Logger;

  constructor() {
    // Set up logger
    this._log = getLogger();

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
   * @param {HTMLVideoElement | HTMLImageElement | ImageBitmap} source - The source to draw on the canvas.
   * @throws Will throw an error if an unsupported frame type is provided.
   */
  protected setFrame(
    source: HTMLVideoElement | HTMLImageElement | ImageBitmap
  ): void {
    // Store the source dimensions
    let width, height;

    // Get the source dimensions
    if (source instanceof HTMLImageElement || source instanceof ImageBitmap) {
      width = source.width;
      height = source.height;
    } else if (source instanceof HTMLVideoElement) {
      width = source.videoWidth;
      height = source.videoHeight;
    } else {
      throw new Error('Unsupported frame type');
    }

    // Update the canvas dimensions
    this._width = width;
    this._height = height;
    this._canvas.width = width;
    this._canvas.height = height;

    // Draw the frame on the canvas
    this._ctx?.drawImage(source, 0, 0, this._width, this._height);
  }

  /**
   * Retrieves QR code data from the current frame.
   *
   * @returns {QRCode | null} The decoded QR code data, or null if no data was found.
   */
  protected getFrameData(): QRCode | null {
    // Get the frame data from the canvas
    const results = this._ctx?.getImageData(
      0,
      0,
      this._canvas.width,
      this._canvas.height
    );

    // If no data is found, return null
    if (!results) return null;

    this._log.debug('Got frame data', results);

    // Decode the frame data using a QR code reader
    const decodedData = jsQR(
      results.data,
      this._canvas.width,
      this._canvas.height
    );

    this._log.debug('Decoded frame data', decodedData);

    // Return the decoded data
    return decodedData;
  }

  abstract read(): Promise<string>;
}
