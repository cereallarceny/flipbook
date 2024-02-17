import type { Logger, LogLevelDesc } from 'loglevel';
import { getHeadLength, getLogger } from 'shared';
import { sliceFrames, sortFrames } from './helpers';
import { CanvasProcessor, type FrameProcessor } from './processors';

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
      frameProcessor: new CanvasProcessor(),
    };

    // Merge the options with the defaults
    this.opts = { ...DEFAULT_READER_PROPS, ...opts };

    // Set up the logger
    const logger = getLogger();
    logger.setLevel(this.opts.logLevel);
    this.log = logger;
  }

  protected processAllFrames(track: MediaStreamTrack): Promise<string[]> {
    return new Promise((resolve) => {
      // Store all the frames
      const allFrames = new Set<string>();

      // Store the expected number of frames
      let numExpectedFrames: number;

      this.log.debug('Processing all frames');

      // Create an image capture
      const imageCapture = new ImageCapture(track);

      const processFrame = async (): Promise<void> => {
        try {
          // Grab the next frame
          const frame: ImageBitmap = await imageCapture.grabFrame();

          this.log.debug('Processed frame', frame);

          // Give frame to the frameProcessor
          this.opts.frameProcessor.setFrame(frame);

          // Get the data from the frameProcessor
          const result = this.opts.frameProcessor.getFrameData();

          this.log.debug('Got frame data result', result);

          // Get the code from the result
          const code = result && 'data' in result ? result.data : '';

          this.log.debug('Got code', code);

          // If the code is not empty and we haven't seen it before, add it to the list
          if (code !== '' && !allFrames.has(code)) {
            allFrames.add(code);

            this.log.debug("That code didn't exist yet, adding frame to list");

            // If the code is the head frame, get the number of frames
            if (getHeadLength(code) !== -1) {
              this.log.debug('Got head frame', code);
              numExpectedFrames = getHeadLength(code);
            }
          }

          // If we haven't seen all the frames, continue processing
          if (allFrames.size !== numExpectedFrames) {
            requestAnimationFrame(processFrame as () => void);
          } else {
            this.log.debug('All frames processed');
            resolve(Array.from(allFrames));
          }
        } catch (error) {
          this.log.error('Error processing frame:', error);
        }
      };

      // Kick off the first frame processing
      requestAnimationFrame(processFrame as () => void);
    });
  }

  async read(): Promise<string> {
    const captureStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'window',
      },
      audio: false,
    });

    this.log.debug('Got capture stream', captureStream);

    const track = captureStream.getVideoTracks()[0];

    try {
      if (!track) throw new Error('Could not get video track');

      this.log.debug('Got video track', track);

      // Process all the frames
      const allFrames = await this.processAllFrames(track);

      // Stop the track
      track.stop();

      this.log.debug('Stopped track');

      // Remove listeners etc, setup by frameProcessor after the process is completed.
      this.opts.frameProcessor.destroy();

      this.log.debug('Destroyed frame processor');

      // Sort the frames, slice their tags off, and join them into a single string
      const result = allFrames.sort(sortFrames).map(sliceFrames).join('');

      this.log.debug('Sorted frames', result);

      // Return the code when it's found
      return result;
    } catch (e) {
      this.log.error('Error reading:', e);

      // Stop the track
      if (track) track.stop();

      return Promise.reject(e);
    }
  }
}
