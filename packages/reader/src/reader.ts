import type { Logger, LogLevelDesc } from 'loglevel';
import { getLogger } from '@flipbookqr/shared';
import { WebRTCProcessor, type FrameProcessor } from './processors';

interface ReaderProps {
  logLevel: LogLevelDesc;
  frameProcessor: FrameProcessor;
}

/**
 * Class representing a Reader.
 */
export class Reader {
  private log: Logger;
  opts: ReaderProps;

  /**
   * Creates an instance of Reader.
   *
   * @param {Partial<ReaderProps>} [opts={}] - The options for the Reader.
   */
  constructor(opts: Partial<ReaderProps> = {}) {
    // Set up the default options
    const DEFAULT_READER_PROPS: ReaderProps = {
      logLevel: 'silent',
      frameProcessor: new WebRTCProcessor(),
    };

    // Merge the options with the defaults
    this.opts = { ...DEFAULT_READER_PROPS, ...opts };

    // Set up the logger
    const logger = getLogger();
    logger.setLevel(this.opts.logLevel);
    this.log = logger;
  }

  /**
   * Reads a frame using the frame processor.
   *
   * @returns {Promise<string>} - A promise that resolves to the read frame.
   */
  async read(): Promise<string> {
    return this.opts.frameProcessor.read();
  }
}
