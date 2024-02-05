import jsQR, { type QRCode } from 'jsqr';
import { getLogger } from 'shared';
import type { Logger } from 'loglevel';
import { FrameProcessor } from './frame-processor';

export class CanvasProcessor extends FrameProcessor {
  protected _ctx: CanvasRenderingContext2D | null;
  protected _canvas: HTMLCanvasElement;
  protected _width: number;
  protected _height: number;
  protected log: Logger;

  constructor() {
    super();

    this.log = getLogger();

    // Create canvas element
    const canvas = document.createElement('canvas');

    // Set default width and height
    this._width = 1920;
    this._height = 1080;

    // Store the canvas temperorily
    this._canvas = canvas;

    // Store canvas context
    this._ctx = canvas.getContext('2d');
  }

  setFrame(frame: ImageBitmap): void {
    const { width, height } = frame;

    // Set width and height
    this._width = width;
    this._height = height;

    // Set width and height of the canvas
    this._canvas.width = width;
    this._canvas.height = height;

    this.log.debug('Drawing frame', frame);

    // Draw the frame to the context
    this._ctx?.drawImage(frame, 0, 0, this._width, this._height);
  }

  getFrameData(): QRCode | null {
    // Get the data from the canvas
    const results = this._ctx?.getImageData(0, 0, this._width, this._height);

    // If there is no data, return null
    if (!results) return null;

    this.log.debug('Got frame data', results);

    // Decode the results data
    const decodedData = jsQR(results.data, this._width, this._height);

    this.log.debug('Decoded frame data', decodedData);

    return decodedData;
  }

  // Destroy the temporary canvas
  destroy(): void {
    this._canvas.remove();
  }
}
