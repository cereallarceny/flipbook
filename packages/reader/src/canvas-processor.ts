import jsQR, { type QRCode } from 'jsqr';
import { FrameProcessor } from './frame-processor';

export class CanvasProcessor extends FrameProcessor {
  private _ctx: CanvasRenderingContext2D | null;
  private _canvas: HTMLCanvasElement;
  private _width: number;
  private _height: number;

  constructor() {
    super();

    // Create canvas element
    const canvas = document.createElement('canvas');

    // Set default width and height
    this._width = 1920;
    this._height = 1080;

    // Store the canvas temperorily
    this._canvas = canvas;

    // Store canvas context
    this._ctx = canvas.getContext('2d');

    // Make sure the context exists
    if (!this._ctx) throw new Error('Could not create canvas context');
  }

  setFrame(frame: ImageBitmap): void {
    const { width, height } = frame;

    // Set width and height
    this._width = width;
    this._height = height;

    // Set width and height of the canvas
    this._canvas.width = width;
    this._canvas.height = height;

    // Draw the frame to the context
    this._ctx?.drawImage(frame, 0, 0, this._width, this._height);
  }

  getFrameData(): QRCode | null {
    // Get the data from the canvas
    const results = this._ctx?.getImageData(0, 0, this._width, this._height);

    // If there is no data, return null
    if (!results) return null;

    // Decode the results data
    const decodedData = jsQR(results.data, this._width, this._height);

    return decodedData;
  }

  // Destroy the temporary canvas
  destroy(): void {
    this._canvas.remove();
  }
}
