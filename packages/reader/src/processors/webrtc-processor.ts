import jsQR, { type QRCode } from 'jsqr';
import { getHeadLength, getLogger } from '@flipbookqr/shared';
import type { Logger } from 'loglevel';
import { sliceFrames, sortFrames } from '../helpers';
import { FrameProcessor } from './frame-processor';

type MediaType = 'display' | 'camera';
type MediaOptions = DisplayMediaStreamOptions | MediaStreamConstraints;

export class WebRTCProcessor extends FrameProcessor {
  protected _ctx: CanvasRenderingContext2D | null;
  protected _canvas: HTMLCanvasElement;
  protected _width: number;
  protected _height: number;
  protected _track: MediaStreamTrack | undefined;
  protected _mediaType: MediaType;
  protected _mediaOptions: MediaOptions;
  protected log: Logger;

  constructor(mediaType?: MediaType, options?: MediaOptions) {
    super();

    this.log = getLogger();

    // Create canvas element
    const canvas = document.createElement('canvas');

    // Set default width and height
    this._width = 1920;
    this._height = 1080;

    // Store the canvas temperorily
    this._canvas = canvas;

    // Store canvas context
    this._ctx = canvas.getContext('2d');

    // Store the track
    this._track = undefined;

    // Store the media options
    this._mediaType = mediaType || 'display';
    this._mediaOptions = options || {
      video: true,
      audio: false,
    };
  }

  setFrame(frame: ImageBitmap): void {
    const { width, height } = frame;

    // Set width and height
    this._width = width;
    this._height = height;

    // Set width and height of the canvas
    this._canvas.width = width;
    this._canvas.height = height;

    this.log.debug('Drawing frame', frame);

    // Draw the frame to the context
    this._ctx?.drawImage(frame, 0, 0, this._width, this._height);
  }

  getFrameData(): QRCode | null {
    // Get the data from the canvas
    const results = this._ctx?.getImageData(0, 0, this._width, this._height);

    // If there is no data, return null
    if (!results) return null;

    this.log.debug('Got frame data', results);

    // Decode the results data
    const decodedData = jsQR(results.data, this._width, this._height);

    this.log.debug('Decoded frame data', decodedData);

    return decodedData;
  }

  // Destroy the temporary canvas
  destroy(): void {
    this._canvas.remove();
    this._track = undefined;
  }

  processAllFrames(): Promise<string[]> {
    // TODO: We should test this
    // istanbul ignore next
    return new Promise((resolve) => {
      // Store all the frames
      const allFrames = new Set<string>();

      // Store the expected number of frames
      let numExpectedFrames: number;

      this.log.debug('Processing all frames');

      // If there is no track, log an error and return an empty array
      if (!this._track) {
        this.log.error('No track to process');
        resolve([]);
        return;
      }

      // Create an image capture
      const imageCapture = new ImageCapture(this._track);

      // Process the next frame
      const processFrame = async (): Promise<void> => {
        try {
          // Grab the next frame
          const frame: ImageBitmap = await imageCapture.grabFrame();

          this.log.debug('Processed frame', frame);

          // Give frame to the frameProcessor
          this.setFrame(frame);

          // Get the data from the frameProcessor
          const result = this.getFrameData();

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

  async getStreamTracks(): Promise<MediaStreamTrack[]> {
    // Get the display media
    let captureStream: MediaStream;

    if (this._mediaType === 'display') {
      captureStream = await navigator.mediaDevices.getDisplayMedia(
        this._mediaOptions
      );
    } else {
      captureStream = await navigator.mediaDevices.getUserMedia(
        this._mediaOptions
      );
    }

    this.log.debug('Got capture stream', captureStream);

    // Return the video tracks
    return captureStream.getVideoTracks();
  }

  setStreamTrack(track: MediaStreamTrack): void {
    // Set the track
    this._track = track;
  }

  async read(): Promise<string> {
    try {
      // If there is no track, set the first one
      if (!this._track) {
        const tracks = await this.getStreamTracks();

        this.setStreamTrack(tracks[0]!);
      }

      this.log.debug('Got video track', this._track);

      // Process all the frames
      const allFrames = await this.processAllFrames();

      // Stop the track
      this._track!.stop();

      this.log.debug('Stopped track');

      // Remove listeners etc, setup by frameProcessor after the process is completed.
      this.destroy();

      this.log.debug('Destroyed frame processor');

      // Sort the frames, slice their tags off, and join them into a single string
      const result = allFrames.sort(sortFrames).map(sliceFrames).join('');

      this.log.debug('Sorted frames', result);

      // Return the code when it's found
      return result;
    } catch (e) {
      return Promise.reject(new Error('Failed to read frames'));
    }
  }
}
