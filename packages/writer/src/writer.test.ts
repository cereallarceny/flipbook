/* eslint-disable @typescript-eslint/no-explicit-any */

import { ErrorCorrectionLevel } from '@nuintun/qrcode';
import { DEFAULT_HEAD_TAG, DEFAULT_IDX_TAG } from '@flipbookqr/shared';
import { Writer } from './writer'; // Assuming this is the file path
import { LogLevelDesc } from 'loglevel';

global.URL.createObjectURL = jest.fn(
  (blob: Blob) => `blob:${blob.size}#t=${Date.now()}`
);

jest.mock('@nuintun/qrcode', () => ({
  Encoder: jest.fn().mockImplementation(() => ({
    setVersion: jest.fn(),
    setEncodingHint: jest.fn(),
    setErrorCorrectionLevel: jest.fn(),
    write: jest.fn(),
    make: jest.fn(),
    getMatrix: jest.fn().mockReturnValue([
      [true, false],
      [false, true],
    ]),
    getVersion: jest.fn().mockReturnValue(5),
    getMatrixSize: jest.fn().mockReturnValue(21),
  })),
  ErrorCorrectionLevel: {
    M: 'M',
    Q: 'Q',
  },
}));

const sampleString = Array.from({ length: 4 })
  .map(() => `abcdefghijklmnopqrstuvqxyz1234567890`)
  .join('');

describe('Writer', () => {
  let writer: Writer;

  beforeEach(() => {
    writer = new Writer();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      expect(writer.opts.logLevel).toBe('silent');
      expect(writer.opts.errorCorrectionLevel).toBe(ErrorCorrectionLevel.M);
      expect(writer.opts.encodingHint).toBe(true);
      expect(writer.opts.moduleSize).toBe(4);
      expect(writer.opts.margin).toBe(8);
      expect(writer.opts.splitLength).toBe(100);
    });

    it('should merge provided options with default options', () => {
      const customOpts = {
        logLevel: 'debug' as LogLevelDesc,
        splitLength: 50,
        errorCorrectionLevel: ErrorCorrectionLevel.Q,
      };
      writer = new Writer(customOpts);
      expect(writer.opts.logLevel).toBe('debug');
      expect(writer.opts.splitLength).toBe(50);
      expect(writer.opts.errorCorrectionLevel).toBe(ErrorCorrectionLevel.Q);
    });
  });

  describe('split', () => {
    it('should split the input string into segments', () => {
      const splitResult = (writer as any).split(sampleString, writer.opts);
      expect(splitResult).toHaveLength(2);
      expect(splitResult[0]).toContain(DEFAULT_HEAD_TAG);
    });

    it('should add index and head tags to the segments', () => {
      const splitResult = (writer as any).split(sampleString, {
        ...writer.opts,
        splitLength: 10,
      });
      expect(splitResult).toHaveLength(15);
      expect(splitResult[0]).toContain(DEFAULT_HEAD_TAG);
      expect(splitResult[1]).toContain(DEFAULT_IDX_TAG);
    });
  });

  describe('createEncoder', () => {
    it('should create and configure an Encoder', () => {
      const encoder = (writer as any).createEncoder('test content');
      expect(encoder.setVersion).not.toHaveBeenCalled();
      expect(encoder.setEncodingHint).toHaveBeenCalledWith(true);
      expect(encoder.setErrorCorrectionLevel).toHaveBeenCalledWith(
        ErrorCorrectionLevel.M
      );
      expect(encoder.write).toHaveBeenCalledWith('test content');
      expect(encoder.make).toHaveBeenCalled();
    });

    it('should set the QR code version if provided', () => {
      const encoder = (writer as any).createEncoder('test content', 7);
      expect(encoder.setVersion).toHaveBeenCalledWith(7);
    });
  });

  describe('write', () => {
    it('should split the code and create QR codes for each segment', () => {
      const result = writer.write(sampleString);
      expect(result).toHaveLength(2);
      expect(result[0]!.code).toContain(DEFAULT_HEAD_TAG);
      expect(result[1]!.code).toContain(DEFAULT_IDX_TAG);
    });
  });

  describe('toCanvas', () => {
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    const sampleString = 'abcdefghijklmnopqrstuvqxyz1234567890';

    beforeEach(() => {
      // Create a mock canvas and its 2D context
      canvas = document.createElement('canvas');
      ctx = canvas.getContext('2d')!;

      // Mock the canvas context's methods for testing
      jest.spyOn(ctx, 'clearRect').mockImplementation(() => {});
      jest.spyOn(ctx, 'fillRect').mockImplementation(() => {});
      jest.spyOn(ctx, 'fillStyle', 'set').mockImplementation(() => {});
    });

    it('should throw an error if write() has not been run', () => {
      expect(() => writer.toCanvas([], canvas)).toThrow(
        'Run writer.write() before running writer.toCanvas()'
      );
    });

    it('should set the canvas size based on the QR code size', () => {
      // Write some QR codes first
      const qrs = writer.write(sampleString);

      // Call the toCanvas method
      writer.toCanvas(qrs, canvas);

      // Expect canvas width and height to be set to the QR code size
      expect(canvas.width).toBe((writer as any).size);
      expect(canvas.height).toBe((writer as any).size);
    });

    it('should clear the canvas before drawing each frame', () => {
      // Write some QR codes first
      const qrs = writer.write(sampleString);

      // Call the toCanvas method
      writer.toCanvas(qrs, canvas);

      // Simulate the first frame being drawn
      requestAnimationFrame(() => {
        expect(ctx.clearRect).toHaveBeenCalledWith(
          0,
          0,
          canvas.width,
          canvas.height
        );
      });
    });

    it('should draw each pixel of the QR code with the correct color', () => {
      // Write some QR codes first
      const qrs = writer.write(sampleString);

      // Call the toCanvas method
      writer.toCanvas(qrs, canvas);

      // Simulate drawing a frame
      requestAnimationFrame(() => {
        const qrImage = qrs[0]!.image;

        // Check that the pixels are drawn correctly
        qrImage.forEach((row, y) => {
          row.forEach((pixel, x) => {
            // Expect fillStyle to be set to 'black' for 0 and 'white' for 1
            if (pixel === 0) {
              expect(ctx.fillStyle).toBe('black');
            } else {
              expect(ctx.fillStyle).toBe('white');
            }
            expect(ctx.fillRect).toHaveBeenCalledWith(x, y, 1, 1);
          });
        });
      });
    });

    it('should animate the frames according to the delay option', () => {
      jest
        .spyOn(global, 'requestAnimationFrame')
        .mockImplementation((callback) => {
          setTimeout(callback, writer.opts.delay);
          return 1; // Mock requestAnimationFrame ID
        });

      // Write some QR codes first
      const qrs = writer.write(sampleString);

      // Call the toCanvas method
      writer.toCanvas(qrs, canvas);

      // Check that the animation is advancing to the next frame after the delay
      setTimeout(() => {
        expect(ctx.clearRect).toHaveBeenCalledTimes(2); // Animation moved to the second frame
      }, writer.opts.delay * 2);
    });

    it('should loop back to the first frame after reaching the last frame', () => {
      jest
        .spyOn(global, 'requestAnimationFrame')
        .mockImplementation((callback) => {
          setTimeout(callback, writer.opts.delay);
          return 1; // Mock requestAnimationFrame ID
        });

      // Write some QR codes first
      const qrs = writer.write(sampleString);

      // Call the toCanvas method
      writer.toCanvas(qrs, canvas);

      // Simulate the animation reaching the last frame
      setTimeout(
        () => {
          // Check that after the last frame, it loops back to the first
          expect(ctx.clearRect).toHaveBeenCalledTimes(qrs.length + 1); // Number of frames + 1 loop
        },
        writer.opts.delay * (qrs.length + 1)
      );
    });
  });

  describe('toGif', () => {
    it('should throw an error if size is not set', () => {
      expect(() => writer.toGif([])).toThrow(
        'Run writer.write() before running writer.toGif()'
      );
    });

    it('should create a GIF from multiple QR codes', () => {
      const qrs = writer.write(sampleString);
      const gif = writer.toGif(qrs);

      expect(gif).toBeInstanceOf(Blob);
    });
  });
});
