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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const splitResult = (writer as any).split(sampleString, writer.opts);
      expect(splitResult).toHaveLength(2);
      expect(splitResult[0]).toContain(DEFAULT_HEAD_TAG);
    });

    it('should add index and head tags to the segments', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  describe('compose', () => {
    it('should throw an error if size is not set', () => {
      expect(() => writer.compose([])).toThrow(
        'Run writer.write() before writer.compose()'
      );
    });

    it('should create a GIF from multiple QR codes', () => {
      const qrs = writer.write(sampleString);
      const gifUrl = writer.compose(qrs);

      expect(gifUrl).toContain('blob:');
    });
  });
});
