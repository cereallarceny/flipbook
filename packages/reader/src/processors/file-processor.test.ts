import { FileProcessor } from './index';

class TestableFileProcessor extends FileProcessor {
  public constructor(file: File) {
    super(file);
  }

  public get _canvasElement(): HTMLCanvasElement {
    return this.canvasElement;
  }

  public get _canvasContext(): CanvasRenderingContext2D | null {
    return this.canvasContext;
  }

  public set _canvasContext(value: CanvasRenderingContext2D | null) {
    this._canvasContext = value;
  }

  public _isGif(file: File): boolean {
    return this.isGIF(file);
  }

  public set _setIsGif(value: unknown) {
    this.isGIF = jest.fn().mockReturnValue(value);
  }

  public set _setProcessSingleFrame(fn: () => Promise<string>) {
    this.processSingleFrame = fn;
  }

  public _processSingleFrame(): Promise<string> {
    return this.processSingleFrame();
  }

  public _convertFileToBuffer(file: File): Promise<ArrayBuffer> {
    return this.convertFileToBuffer(file);
  }

  public set _mockConvertUnit8ClampedArrayToFile(fn: () => File) {
    this.convertUnit8ClampedArrayToFile = fn;
  }

  public _convertUnit8ClampedArrayToFile(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
    fileName: string
  ): File {
    return this.convertUnit8ClampedArrayToFile(
      imageData,
      width,
      height,
      fileName
    );
  }
}

let fp: TestableFileProcessor;
describe('FileProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    fp = new TestableFileProcessor(new File([], 'test.gif'));
  });

  it('should return an instance of FileProcessor when called with a GIF file as input', () => {
    expect(new TestableFileProcessor(new File([], 'test.gif'))).toBeInstanceOf(
      FileProcessor
    );
  });

  describe('setFrame', () => {
    it('should set the frame on the canvas', () => {
      const frame = new Image();

      frame.width = 100;
      frame.height = 200;

      fp.setFrame(frame);

      expect(fp._canvasElement.width).toEqual(100);
      expect(fp._canvasElement.height).toEqual(200);
    });

    it('should throw an error if the frame is not an Image', () => {
      expect(() => {
        fp.setFrame(null as unknown as ImageBitmap);
      }).toThrow();
    });
  });

  describe('getFrameData', () => {
    it('should return null if the frame is not set', () => {
      expect(fp.getFrameData()).toBeNull();

      let _canvasContext = fp._canvasContext;
      _canvasContext = null;

      expect(fp.getFrameData()).toBeNull();
    });
  });

  describe('destroy', () => {
    it('should destroy the canvas', () => {
      const canvas = fp._canvasElement;
      canvas.remove = jest.fn();
      fp.destroy();
      expect(canvas.remove).toHaveBeenCalled();
    });
  });

  describe('read', () => {
    it('should read the file with processAllFrames if input is a GIF', async () => {
      const MOCKED_VALUE = 'XYZ';

      fp.processAllFrames = jest.fn().mockResolvedValue([MOCKED_VALUE]);
      const result = await fp.read();

      expect(result).toBe(MOCKED_VALUE);
    });

    it('should throw an error if there is no data', async () => {
      fp.processAllFrames = jest.fn().mockResolvedValue([]);
      await expect(fp.read()).rejects.toThrow();
    });

    it('should read the file with getFrameData if input is not a GIF', async () => {
      fp._setIsGif = false;
      fp._setProcessSingleFrame = jest.fn().mockResolvedValue('XYZ');

      const result = await fp.read();

      expect(result).toBe('XYZ');
    });
  });

  describe('isGif', () => {
    it('should return true if the file is a GIF', () => {
      expect(fp._isGif(new File([], 'test.gif'))).toBe(true);
    });

    it('should not return true if the file is not a GIF', () => {
      expect(fp._isGif(new File([], 'test.jpg'))).toBe(false);
    });
  });

  describe('convertFileToBuffer', () => {
    it('should convert the file to a buffer', async () => {
      const buffer = await fp._convertFileToBuffer(new File([], 'test.jpg'));
      expect(buffer).toBeInstanceOf(Buffer);
    });
  });

  describe('convertUnit8ClampedArrayToFile', () => {
    it('should convert the unit8ClampedArray to a file', () => {
      const pixelCount = 100 * 200; // Calculate total number of pixels
      const pixelData = new Uint8ClampedArray(pixelCount * 4); // Each pixel has RGBA values

      // Fill pixelData with some example RGBA values
      for (let i = 0; i < pixelCount * 4; i += 4) {
        pixelData[i] = i; // Red value
        pixelData[i + 1] = i + 1; // Green value
        pixelData[i + 2] = i + 2; // Blue value
        pixelData[i + 3] = 255; // Alpha value (fully opaque)
      }

      const file = fp._convertUnit8ClampedArrayToFile(
        pixelData,
        100,
        200,
        'test.jpg'
      );
      expect(file).toBeInstanceOf(File);
    });
  });

  describe('processAllFrames', () => {
    it('should run without errors', async () => {
      const file = new File([], 'test.jpg');

      const processor = new FileProcessor(file);

      const results = await processor.processAllFrames();

      expect(results).toBeInstanceOf(Array);
    });
  });
});
