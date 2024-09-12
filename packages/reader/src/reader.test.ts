import { Reader } from './reader';
import { WebRTCProcessor, type FrameProcessor } from './processors';
import { getLogger } from '@flipbookqr/shared';

jest.mock('./processors', () => ({
  WebRTCProcessor: jest.fn().mockImplementation(() => ({
    read: jest.fn().mockResolvedValue('processed frame'),
  })),
}));

jest.mock('@flipbookqr/shared', () => ({
  getLogger: jest.fn().mockReturnValue({
    setLevel: jest.fn(),
    info: jest.fn(),
  }),
}));

describe('Reader', () => {
  it('should instantiate with default options', () => {
    const reader = new Reader();

    expect(reader.opts.logLevel).toBe('silent');
    expect(WebRTCProcessor).toHaveBeenCalled();
    expect(reader.opts.frameProcessor).toBeDefined();
  });

  it('should instantiate with provided options', () => {
    const customFrameProcessor = {
      read: jest.fn().mockResolvedValue('custom frame'),
    } as unknown as jest.Mocked<FrameProcessor>;
    const reader = new Reader({
      logLevel: 'info',
      frameProcessor: customFrameProcessor,
    });

    expect(reader.opts.logLevel).toBe('info');
    expect(reader.opts.frameProcessor).toBe(customFrameProcessor);
    expect(getLogger().setLevel).toHaveBeenCalledWith('info');
  });

  it('should call frameProcessor.read() in the read method', async () => {
    const reader = new Reader();

    // Spy on the frameProcessor's read method
    const readSpy = jest
      .spyOn(reader.opts.frameProcessor, 'read')
      .mockResolvedValue('processed frame');

    const frame = await reader.read();

    // Assert that the read method was called
    expect(readSpy).toHaveBeenCalled();
    expect(frame).toBe('processed frame');
  });

  it('should return the result from custom frameProcessor.read()', async () => {
    const customFrameProcessor = {
      read: jest.fn().mockResolvedValue('custom frame'),
    } as unknown as jest.Mocked<FrameProcessor>;
    const reader = new Reader({ frameProcessor: customFrameProcessor });

    const frame = await reader.read();

    expect(customFrameProcessor.read).toHaveBeenCalled();
    expect(frame).toBe('custom frame');
  });
});
