import jsqr from 'jsqr';
import { setupJestCanvasMock } from 'jest-canvas-mock';
import { CanvasProcessor } from './canvas-processor';

jest.mock('jsqr', () => jest.fn());

class TestableCanvasProcessor extends CanvasProcessor {
  public getCtx(): CanvasRenderingContext2D | null {
    return this._ctx;
  }

  public getCanvas(): HTMLCanvasElement {
    return this._canvas;
  }
}

beforeEach(() => {
  jest.resetAllMocks();
  setupJestCanvasMock();
});

describe('CanvasProcessor', () => {
  let cp: TestableCanvasProcessor;

  beforeEach(() => {
    jest.restoreAllMocks();
    cp = new TestableCanvasProcessor();
  });

  afterEach(() => {
    cp.destroy();
  });

  describe('getFrameData', () => {
    it('should return null if failed to get data from the frame input', () => {
      const frame = new ImageBitmap();

      cp.setFrame(frame);

      const ctx = cp.getCtx();
      if (!ctx) throw new Error('Failed to get canvas context');

      jest
        .spyOn(ctx, 'getImageData')
        .mockReturnValue(undefined as unknown as ImageData);

      const data = cp.getFrameData();

      expect(data).toBeNull();
    });

    it('should decode frame data if input a valid frame', () => {
      const DECODED_DATA = 'DECODED_DATA';

      const frame = new ImageBitmap();

      cp.setFrame(frame);

      const ctx = cp.getCtx();
      if (!ctx) throw new Error('Failed to get canvas context');

      jest.spyOn(ctx, 'getImageData').mockReturnValue({} as ImageData);
      (jsqr as jest.Mock).mockReturnValueOnce(DECODED_DATA);

      const data = cp.getFrameData();

      expect(data).toBe(DECODED_DATA);
    });
  });

  describe('setFrame', () => {
    it('should set frame', () => {
      const ctx = cp.getCtx();
      if (!ctx) throw new Error('Failed to get canvas context');

      const frame = new ImageBitmap();

      cp.setFrame(frame);
    });
  });

  describe('destroy', () => {
    it('should destroy canvas', () => {
      const canvas = cp.getCanvas();

      canvas.remove = jest.fn();
      cp.destroy();

      expect(canvas.remove).toHaveBeenCalled();
    });
  });
});
