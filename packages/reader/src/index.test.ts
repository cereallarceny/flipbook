import { type FrameProcessor } from './processors';
import { Reader } from './index';

const mockFrameProcessor: FrameProcessor = {
  setFrame: jest.fn(),
  getFrameData: jest.fn(),
  destroy: jest.fn(),
  processAllFrames: jest.fn(),
  read: jest.fn(),
};

describe('Reader', () => {
  describe('read', () => {
    it('should be able to create a Reader instance with default options', () => {
      const reader = new Reader();

      expect(reader).toBeInstanceOf(Reader);
    });

    it('should call the read method of the frame processor', async () => {
      const reader = new Reader({
        frameProcessor: mockFrameProcessor,
      });

      await reader.read();

      expect(mockFrameProcessor.read).toHaveBeenCalled();
    });
  });
});
