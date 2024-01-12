import log, { type LogLevelDesc } from 'loglevel';
import { getHeadLength } from 'shared';
import { sliceFrames, sortFrames } from './helpers';
import { type FrameProcessor } from './frame-processor';
import { CanvasProcessor } from './canvas-processor';

interface ReaderProps {
  logLevel: LogLevelDesc;
  mediaOptions: DisplayMediaStreamOptions;
  frameProcessor: FrameProcessor;
}

export class Reader {
  private log: log.Logger;
  opts: ReaderProps;

  constructor(opts: Partial<ReaderProps> = {}) {
    // Set up the default options
    const DEFAULT_READER_PROPS: ReaderProps = {
      mediaOptions: {
        video: {
          displaySurface: 'window',
        },
        audio: false,
      },
      logLevel: 'silent',
      frameProcessor: new CanvasProcessor(),
    };

    // Merge the options with the defaults
    this.opts = { ...DEFAULT_READER_PROPS, ...opts };

    // Set up the logger
    const logger = log.getLogger('qr-reader');
    logger.setLevel(this.opts.logLevel);
    this.log = logger;
  }

  private processAllFrames(track: MediaStreamTrack): Promise<string[]> {
    const processedFrames = new Promise((resolve) => {
      // Store all the frames
      const allFrames = new Set<string>();

      // Store the expected number of frames
      let numExpectedFrames: number;

      // Create an image capture
      const imageCapture = new ImageCapture(track);

      const processFrame = async (): Promise<void> => {
        try {
          // Grab the next frame
          const frame: ImageBitmap = await imageCapture.grabFrame();

          // Give frame to the frameProcessor
          this.opts.frameProcessor.setFrame(frame);

          // Get the data from the frameProcessor
          const result = this.opts.frameProcessor.getFrameData();

          // Get the code from the result
          const code = result && 'data' in result ? result.data : '';

          // If the code is not empty and we haven't seen it before, add it to the list
          if (code !== '' && !allFrames.has(code)) {
            allFrames.add(code);

            // If the code is the head frame, get the number of frames
            if (getHeadLength(code) !== -1) {
              numExpectedFrames = getHeadLength(code);
            }
          }

          // If we haven't seen all the frames, continue processing
          if (allFrames.size !== numExpectedFrames) {
            requestAnimationFrame(processFrame as () => void);
          } else {
            resolve(Array.from(allFrames));
          }
        } catch (error) {
          this.log.error('Error processing frame:', error);
        }
      };

      // Kick off the first frame processing
      requestAnimationFrame(processFrame as () => void);
    });

    return processedFrames as Promise<string[]>;
  }

  async read(): Promise<string> {
    const captureStream = await navigator.mediaDevices.getDisplayMedia(
      this.opts.mediaOptions
    );

    const track = captureStream.getVideoTracks()[0];

    try {
      if (!track) throw new Error('Could not get video track');

      // Process all the frames
      const allFrames = await this.processAllFrames(track);

      // Stop the track
      track.stop();

      // Remove listeners etc, setup by frameProcessor after the process is completed.
      this.opts.frameProcessor.destroy();

      // Sort the frames, slice their tags off, and join them into a single string
      const result = allFrames.sort(sortFrames).map(sliceFrames).join('');

      // Return the code when it's found
      return result;
    } catch (e) {
      // Stop the track
      if (track) track.stop();

      return Promise.reject(e);
    }
  }
}
