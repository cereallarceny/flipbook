import type { Logger, LogLevelDesc } from 'loglevel';
import { getLogger } from '@flipbookqr/shared';
import { WebRTCProcessor, type FrameProcessor } from './processors';

interface ReaderProps {
  logLevel: LogLevelDesc;
  frameProcessor: FrameProcessor;
}

export class Reader {
  private log: Logger;
  opts: ReaderProps;

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

  async read(): Promise<string> {
    return this.opts.frameProcessor.read();
  }
}
