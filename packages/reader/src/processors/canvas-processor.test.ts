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

  public processAllFrames(): Promise<string[]> {
    return this.processAllFrames();
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

  describe('processAllFrames and read', () => {
    beforeAll(() => {
      class MediaStreamTrackMock {
        stop = jest.fn();
      }

      const mockGetDisplayMediaMock = jest.fn(async () => {
        return new Promise<{ getVideoTracks: () => MediaStreamTrackMock[] }>(
          (resolve) => {
            resolve({
              getVideoTracks: () => {
                return [new MediaStreamTrackMock()];
              },
            });
          }
        );
      });

      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: {
          getDisplayMedia: mockGetDisplayMediaMock,
        },
      });
    });

    it('should read frames', async () => {
      const mockedData = ['A', 'B', 'C'];
      const mockedDataPromise = new Promise((resolve) => {
        resolve(mockedData);
      });

      class MediaStreamTrackMock {
        stop = jest.fn();
      }

      const mockGetDisplayMediaMock = jest.fn(async () => {
        return new Promise<{ getVideoTracks: () => MediaStreamTrackMock[] }>(
          (resolve) => {
            resolve({
              getVideoTracks: () => {
                return [new MediaStreamTrackMock()];
              },
            });
          }
        );
      });

      jest
        .spyOn(global.navigator.mediaDevices, 'getDisplayMedia')
        .mockImplementation(
          (_options) =>
            mockGetDisplayMediaMock() as unknown as Promise<MediaStream>
        );

      jest
        .spyOn(cp, 'processAllFrames')
        .mockReturnValueOnce(mockedDataPromise as Promise<string[]>);

      const result = await cp.read();

      expect(result).toBe('ABC');
    });

    it('should throw an error', async () => {
      const ERROR_MESSAGE = 'Simulated error';

      try {
        const mockGetDisplayMediaMock = jest.fn(async () => {
          class MediaStreamTrackMock {
            stop = jest.fn();
          }

          return new Promise<{ getVideoTracks: () => MediaStreamTrackMock[] }>(
            (resolve) => {
              resolve({
                getVideoTracks: () => {
                  return [new MediaStreamTrackMock()];
                },
              });
            }
          );
        });

        jest
          .spyOn(global.navigator.mediaDevices, 'getDisplayMedia')
          .mockImplementation(
            (_options) =>
              mockGetDisplayMediaMock() as unknown as Promise<MediaStream>
          );

        jest.spyOn(cp, 'processAllFrames').mockRejectedValueOnce(ERROR_MESSAGE);

        await cp.read();
      } catch (error) {
        expect(error).toBe(ERROR_MESSAGE);
      }
    });
  });
});
