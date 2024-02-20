import { type QRCode } from 'jsqr';
import { FrameProcessor } from './frame-processor';

describe('FrameProcessor', () => {
  let fp: FrameProcessor;

  beforeEach(() => {
    class FrameProcessorImpl extends FrameProcessor {
      setFrame(_frame: ImageBitmap): void {
        // Do nothing
      }

      getFrameData(): QRCode | null {
        return null;
      }

      destroy(): void {
        // Do nothing
      }

      processAllFrames(): Promise<string[]> {
        return Promise.resolve(['', '']);
      }

      read(): Promise<string> {
        return Promise.resolve('');
      }
    }

    fp = new FrameProcessorImpl();
  });

  describe('setFrame', () => {
    it('should run without errors', () => {
      fp.setFrame(undefined as unknown as ImageBitmap);
    });
  });

  describe('getFrameData', () => {
    it('should return null', () => {
      expect(fp.getFrameData()).toBe(null);
    });
  });

  describe('destroy', () => {
    it('should run without errors', () => {
      fp.destroy();
    });
  });

  describe('processAllFrames', () => {
    it('should return an array of strings', async () => {
      const result = await fp.processAllFrames();
      expect(result).toEqual(['', '']);
    });
  });

  describe('read', () => {
    it('should return an empty string', async () => {
      const result = await fp.read();
      expect(result).toBe('');
    });
  });
});
