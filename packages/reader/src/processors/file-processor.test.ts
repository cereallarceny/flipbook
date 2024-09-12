/* eslint-disable @typescript-eslint/no-explicit-any */

import { GifReader } from 'omggif';
import { FileProcessor } from './file-processor';
import {
  convertFileToBuffer,
  convertUnit8ClampedArrayToFile,
} from '@flipbookqr/shared';

// Mock dependencies
jest.mock('omggif', () => ({
  GifReader: jest.fn(),
}));

// Mock the entire @flipbookqr/shared module
jest.mock('@flipbookqr/shared', () => ({
  ...jest.requireActual('@flipbookqr/shared'),
  convertFileToBuffer: jest.fn(),
  convertUnit8ClampedArrayToFile: jest.fn(),
}));

global.URL.createObjectURL = jest.fn(
  (blob: Blob) => `blob:${blob.size}#t=${Date.now()}`
);

describe('FileProcessor', () => {
  let mockFile: File;

  beforeEach(() => {
    // Create a mock File object
    mockFile = new File(['dummy content'], 'dummy.png', {
      type: 'image/png',
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should remove canvas when destroy is called', () => {
    const processor = new FileProcessor();
    processor['_canvas'] = {
      remove: jest.fn(),
    } as unknown as HTMLCanvasElement;

    processor['destroy']();

    expect(processor['_canvas'].remove).toHaveBeenCalled();
  });

  it('should process a single frame and extract QR code data', async () => {
    const processor = new FileProcessor();
    const mockFrameData = 'mock-frame-data';

    // Mock getFrameData to return some mock frame data
    const setFrameSpy = jest

      .spyOn(processor as any, 'setFrame')
      .mockImplementation(() => {});
    const getFrameDataSpy = jest

      .spyOn(processor as any, 'getFrameData')
      .mockReturnValue({ data: mockFrameData });

    // Mock the Image constructor and simulate onload event
    const mockImage = {
      onload: jest.fn(),
      onerror: jest.fn(),
      src: '',
    };

    (global as any).Image = jest.fn(() => mockImage); // Mock the Image object

    const processSingleFramePromise = processor['processSingleFrame'](mockFile);

    // Simulate the image loading by calling the onload function
    mockImage.onload();

    const result = await processSingleFramePromise;

    expect(setFrameSpy).toHaveBeenCalled();
    expect(getFrameDataSpy).toHaveBeenCalled();
    expect(result).toBe(mockFrameData);
  });

  it('should throw an error if processing a single frame fails', async () => {
    const processor = new FileProcessor();

    const createObjectURLSpy = jest
      .spyOn(URL, 'createObjectURL')
      .mockImplementation(() => {
        throw new Error('Failed to process frame');
      });

    await expect(processor['processSingleFrame'](mockFile)).rejects.toThrow(
      'Failed to process frame'
    );

    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('should process all frames of a GIF file', async () => {
    const processor = new FileProcessor();

    // Mock the helper functions
    const mockBuffer = new ArrayBuffer(10);
    (convertFileToBuffer as jest.Mock).mockResolvedValue(mockBuffer);

    const mockGifReader = {
      numFrames: jest.fn().mockReturnValue(3),
      decodeAndBlitFrameRGBA: jest.fn(),
      width: 100,
      height: 100,
    };
    (GifReader as jest.Mock).mockImplementation(() => mockGifReader);

    // Mock single frame processing
    jest

      .spyOn(processor as any, 'processSingleFrame')
      .mockResolvedValue('QRData');

    const result = await processor['processAllFrames']();

    expect(convertFileToBuffer).toHaveBeenCalled();
    expect(GifReader).toHaveBeenCalledWith(new Uint8Array(mockBuffer));
    expect(mockGifReader.numFrames).toHaveBeenCalled();
    expect(mockGifReader.decodeAndBlitFrameRGBA).toHaveBeenCalledTimes(3);
    expect(convertUnit8ClampedArrayToFile).toHaveBeenCalledTimes(3);
    expect(result).toEqual(['QRData', 'QRData', 'QRData']);
  });

  it('should check if a file is a GIF', () => {
    const processor = new FileProcessor();

    const gifFile = new File(['dummy content'], 'dummy.gif', {
      type: 'image/gif',
    });
    const nonGifFile = new File(['dummy content'], 'dummy.png', {
      type: 'image/png',
    });

    expect(processor['isGIF'](gifFile)).toBe(true);
    expect(processor['isGIF'](nonGifFile)).toBe(false);
  });

  it('should read and process all frames for a GIF file', async () => {
    const processor = new FileProcessor();

    jest.spyOn(processor as any, 'isGIF').mockReturnValue(true);
    jest

      .spyOn(processor as any, 'processAllFrames')
      .mockResolvedValue(['QRData1', 'QRData2']);

    const result = await processor.read(mockFile);

    expect(processor['isGIF']).toHaveBeenCalledWith(mockFile);
    expect(processor['processAllFrames']).toHaveBeenCalled();
    expect(result).toBe('QRData1QRData2');
  });

  it('should read and process a single frame for a non-GIF file', async () => {
    const processor = new FileProcessor();

    jest.spyOn(processor as any, 'isGIF').mockReturnValue(false);
    jest

      .spyOn(processor as any, 'processSingleFrame')
      .mockResolvedValue('QRData');

    const result = await processor.read(mockFile);

    expect(processor['isGIF']).toHaveBeenCalledWith(mockFile);
    expect(processor['processSingleFrame']).toHaveBeenCalledWith(mockFile);
    expect(result).toBe('QRData');
  });
});
