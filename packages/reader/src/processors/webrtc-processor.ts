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
  protected _video: HTMLVideoElement | undefined;
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

    // Store the canvas temporarily
    this._canvas = canvas;

    // Store canvas context
    this._ctx = canvas.getContext('2d');

    // Store the video element for media stream rendering
    this._video = undefined;

    // Store the media options
    this._mediaType = mediaType || 'display';
    this._mediaOptions = options || {
      video: true,
      audio: false,
    };
  }

  setFrame(): void {
    if (this._video && this._ctx) {
      const { videoWidth, videoHeight } = this._video;

      // Set canvas dimensions to match the video dimensions
      this._canvas.width = videoWidth;
      this._canvas.height = videoHeight;

      // Draw the current video frame onto the canvas
      this._ctx.drawImage(this._video, 0, 0, videoWidth, videoHeight);
    }
  }

  getFrameData(): QRCode | null {
    // Get the data from the canvas
    const results = this._ctx?.getImageData(
      0,
      0,
      this._canvas.width,
      this._canvas.height
    );

    // If there is no data, return null
    if (!results) return null;

    this.log.debug('Got frame data', results);

    // Decode the results data
    const decodedData = jsQR(
      results.data,
      this._canvas.width,
      this._canvas.height
    );

    this.log.debug('Decoded frame data', decodedData);

    return decodedData;
  }

  // Destroy the temporary canvas and video element
  destroy(): void {
    this._canvas.remove();
    if (this._video) this._video.remove();
  }

  processAllFrames(): Promise<string[]> {
    return new Promise((resolve) => {
      const allFrames = new Set<string>();
      let numExpectedFrames: number;

      this.log.debug('Processing all frames');

      if (!this._video) {
        this.log.error('No video element to process');
        resolve([]);
        return;
      }

      const processFrame = (): void => {
        try {
          this.setFrame();

          const result = this.getFrameData();
          const code = result && 'data' in result ? result.data : '';

          if (code !== '' && !allFrames.has(code)) {
            allFrames.add(code);

            if (getHeadLength(code) !== -1) {
              numExpectedFrames = getHeadLength(code);
            }
          }

          if (allFrames.size !== numExpectedFrames) {
            requestAnimationFrame(processFrame);
          } else {
            this.log.debug('All frames processed');
            resolve(Array.from(allFrames));
          }
        } catch (error) {
          this.log.error('Error processing frame:', error);
        }
      };

      requestAnimationFrame(processFrame);
    });
  }

  async getStreamTracks(): Promise<MediaStreamTrack[]> {
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

  async startVideo(): Promise<void> {
    const tracks = await this.getStreamTracks();
    const mediaStream = new MediaStream(tracks);

    const video = document.createElement('video');
    video.srcObject = mediaStream;
    video.style.display = 'none'; // Hide the video element
    document.body.appendChild(video);

    this._video = video;

    await video.play(); // Ensure the video starts playing before processing frames
  }

  async read(): Promise<string> {
    try {
      if (!this._video) {
        await this.startVideo();
      }

      this.log.debug('Got video element', this._video);

      const allFrames = await this.processAllFrames();

      if (this._video) {
        (this._video.srcObject as MediaStream)
          ?.getTracks()
          .forEach((track) => track.stop());
      }

      this.log.debug('Stopped video stream');

      this.destroy();

      const result = allFrames.sort(sortFrames).map(sliceFrames).join('');

      this.log.debug('Sorted frames', result);

      return result;
    } catch (e) {
      return Promise.reject(new Error('Failed to read frames'));
    }
  }
}
