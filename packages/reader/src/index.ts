import log, { type LogLevelDesc } from 'loglevel';
import jsQR from 'jsqr';
import { getHeadLength } from 'shared';
import { sliceFrames, sortFrames } from './helpers';

interface ReaderProps {
  mediaOptions: DisplayMediaStreamOptions;
  logLevel: LogLevelDesc;
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
    };

    // Merge the options with the defaults
    this.opts = { ...DEFAULT_READER_PROPS, ...opts };

    // Set up the logger
    const logger = log.getLogger('qr-reader');
    logger.setLevel(this.opts.logLevel);
    this.log = logger;
  }

  // grab the frames from track and return the code against all frames
  private async processAllFrames(
    track: MediaStreamTrack,
    ctx: CanvasRenderingContext2D,
    { width, height }: { width: number; height: number }
  ): Promise<string[]> {
    // Store all the frames
    const allFrames: string[] = [];

    // Store the expected number of frames
    let numExpectedFrames: number;

    const process = async (): Promise<void> => {
      // Get the current frame
      const imageCapture = new ImageCapture(track);
      const frame = await imageCapture.grabFrame();

      // Draw it on the canvas
      ctx.drawImage(frame, 0, 0, width, height);

      // Get the data from the canvas
      const { data } = ctx.getImageData(0, 0, width, height);

      // Decode the data
      const result = jsQR(data, width, height);

      // Get the code from the result
      const code = result && 'data' in result ? result.data : '';

      // If the code is not empty and we haven't seen it before, add it to the list
      if (code !== '' && !allFrames.includes(code)) {
        allFrames.push(code);

        // If the code is the head frame, get the number of frames
        if (getHeadLength(code) !== -1) {
          numExpectedFrames = getHeadLength(code);
        }
      }

      // If we've seen all the frames, stop the interval
      if (allFrames.length !== numExpectedFrames) {
        await process();
      }
    };

    // Kick it off
    await process();

    return new Promise((resolve) => {
      resolve(allFrames);
    });
  }

  async read(): Promise<string> {
    const captureStream = await navigator.mediaDevices.getDisplayMedia(
      this.opts.mediaOptions
    );

    const track = captureStream.getVideoTracks()[0];

    try {
      if (!track) throw new Error('Could not get video track');

      const { width = 1920, height = 1080 } = track.getSettings();

      // Create a canvas to draw the frame
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      // Get the canvas context
      const ctx = canvas.getContext('2d');

      // Make sure the context exists
      if (!ctx) throw new Error('Could not create canvas context');

      // Process all the frames
      const allFrames = await this.processAllFrames(track, ctx, {
        width,
        height,
      });

      // Stop the track
      track.stop();

      // Destroy the temporary canvas
      canvas.remove();

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
