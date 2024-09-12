import { getLogger } from '@flipbookqr/shared';
import { Decoder } from '@nuintun/qrcode';
import { FrameProcessor } from './frame-processor';

// Mock the external dependencies
jest.mock('@flipbookqr/shared', () => ({
  getLogger: jest.fn(),
}));

jest.mock('@nuintun/qrcode', () => ({
  Decoder: jest.fn().mockImplementation(() => ({
    decode: jest.fn(),
  })),
}));

// Create a concrete implementation of FrameProcessor for testing
class TestFrameProcessor extends FrameProcessor {
  async read(): Promise<string> {
    return 'test';
  }
}

describe('FrameProcessor', () => {
  let frameProcessor: TestFrameProcessor;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockLogger: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDecoder: any;

  beforeEach(() => {
    // Set up mocks
    mockLogger = { info: jest.fn(), error: jest.fn() };
    (getLogger as jest.Mock).mockReturnValue(mockLogger);

    // Initialize the FrameProcessor
    frameProcessor = new TestFrameProcessor();

    // Mock the decoder's decode method
    mockDecoder = {
      decode: jest.fn(),
    };

    // Mock the Decoder constructor to return the mockDecoder
    (Decoder as jest.Mock).mockImplementation(() => mockDecoder);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should set up logger and canvas correctly', () => {
      expect(getLogger).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((frameProcessor as any)._log).toBe(mockLogger);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((frameProcessor as any)._canvas).toBeInstanceOf(HTMLCanvasElement);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((frameProcessor as any)._width).toBe(1920);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((frameProcessor as any)._height).toBe(1080);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((frameProcessor as any)._ctx).not.toBeNull();
    });
  });

  describe('setFrame', () => {
    it('should update canvas dimensions for HTMLImageElement', () => {
      const imgElement = new Image();
      imgElement.width = 800;
      imgElement.height = 600;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (frameProcessor as any).setFrame(imgElement);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((frameProcessor as any)._width).toBe(800);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((frameProcessor as any)._height).toBe(600);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((frameProcessor as any)._canvas.width).toBe(800);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((frameProcessor as any)._canvas.height).toBe(600);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((frameProcessor as any)._ctx?.drawImage).toHaveBeenCalledWith(
        imgElement,
        0,
        0,
        800,
        600
      );
    });

    it('should update canvas dimensions for HTMLVideoElement', () => {
      const videoElement = document.createElement('video');
      Object.defineProperty(videoElement, 'videoWidth', { value: 1280 });
      Object.defineProperty(videoElement, 'videoHeight', { value: 720 });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (frameProcessor as any).setFrame(videoElement);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((frameProcessor as any)._width).toBe(1280);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((frameProcessor as any)._height).toBe(720);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((frameProcessor as any)._canvas.width).toBe(1280);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((frameProcessor as any)._canvas.height).toBe(720);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((frameProcessor as any)._ctx?.drawImage).toHaveBeenCalledWith(
        videoElement,
        0,
        0,
        1280,
        720
      );
    });

    it('should throw an error for unsupported frame type', () => {
      const invalidSource = document.createElement('div'); // Invalid frame type

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (frameProcessor as any).setFrame(invalidSource as any);
      }).toThrow('Unsupported frame type');
    });
  });

  describe('getFrameData', () => {
    it('should return null if no image data is available', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (frameProcessor as any)._ctx = {
        getImageData: jest.fn().mockReturnValue(null),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (frameProcessor as any).getFrameData();
      expect(result).toBeNull();
    });

    it('should return decoded QR code data if available', () => {
      const imageData = {
        data: new Uint8ClampedArray([255, 255, 255, 255]),
        width: 800,
        height: 600,
      };

      // Mock the canvas context with getImageData returning imageData
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (frameProcessor as any)._ctx = {
        getImageData: jest.fn().mockReturnValue(imageData),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const decodedData = { data: 'QR Code Data' };

      // Mock the decode method to return decodedData
      mockDecoder.decode.mockReturnValue(decodedData);

      // Call the method
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (frameProcessor as any).getFrameData();

      // Assert that the result is the decoded data
      expect(result).toBe(decodedData);

      // Verify that decode was called with the right parameters
      expect(mockDecoder.decode).toHaveBeenCalledWith(
        imageData.data,
        imageData.width,
        imageData.height
      );
    });
  });

  describe('read', () => {
    it('should return a string value', async () => {
      const result = await frameProcessor.read();
      expect(result).toBe('test');
    });
  });
});
