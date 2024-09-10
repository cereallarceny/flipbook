import jsQR, { type QRCode } from 'jsqr';
import { getHeadLength, getLogger } from '@flipbookqr/shared';
import type { Logger } from 'loglevel';
import { sliceFrames, sortFrames } from '../helpers';
import { FrameProcessor } from './frame-processor';

type MediaType = 'display' | 'camera';
type MediaOptions = DisplayMediaStreamOptions | MediaStreamConstraints;

/**
 * A class that processes WebRTC media streams, such as video from a camera or display,
 * and extracts QR code data from the frames.
 *
 * @extends FrameProcessor
 */
export class WebRTCProcessor extends FrameProcessor {
  protected _ctx: CanvasRenderingContext2D | null;
  protected _canvas: HTMLCanvasElement;
  protected _width: number;
  protected _height: number;
  protected _video: HTMLVideoElement | undefined;
  protected _track: MediaStreamTrack | undefined;
  protected _mediaType: MediaType;
  protected _mediaOptions: MediaOptions;
  protected _log: Logger;

  /**
   * Creates an instance of WebRTCProcessor.
   *
   * @param {MediaType} [mediaType='display'] - Type of media to process ('display' or 'camera').
   * @param {MediaOptions} [options={ video: true, audio: false }] - Media stream options for capturing video/audio.
   */
  constructor(mediaType?: MediaType, options?: MediaOptions) {
    super();

    this._log = getLogger();

    const canvas = document.createElement('canvas');
    this._width = 1920;
    this._height = 1080;
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    this._video = undefined;
    this._mediaType = mediaType || 'display';
    this._mediaOptions = options || {
      video: true,
      audio: false,
    };
    this._track = undefined;
  }

  /**
   * Sets the current video frame onto the canvas.
   * If the video element is present, it draws the video frame onto the canvas.
   */
  protected setFrame(): void {
    if (this._video && this._ctx) {
      const { videoWidth, videoHeight } = this._video;

      this._canvas.width = videoWidth;
      this._canvas.height = videoHeight;

      this._ctx.drawImage(this._video, 0, 0, videoWidth, videoHeight);
    }
  }

  /**
   * Retrieves QR code data from the current frame.
   *
   * @returns {QRCode | null} The decoded QR code data, or null if no data was found.
   */
  protected getFrameData(): QRCode | null {
    const results = this._ctx?.getImageData(
      0,
      0,
      this._canvas.width,
      this._canvas.height
    );

    if (!results) return null;

    this._log.debug('Got frame data', results);

    const decodedData = jsQR(
      results.data,
      this._canvas.width,
      this._canvas.height
    );

    this._log.debug('Decoded frame data', decodedData);

    return decodedData;
  }

  /**
   * Cleans up by removing the canvas and video elements.
   */
  protected destroy(): void {
    this._canvas.remove();
    if (this._video) this._video.remove();
  }

  /**
   * Processes all frames and decodes QR codes from the video stream.
   *
   * @returns {Promise<string[]>} A promise that resolves with an array of QR code data strings.
   */
  protected processAllFrames(): Promise<string[]> {
    return new Promise((resolve) => {
      const allFrames = new Set<string>();
      let numExpectedFrames: number;

      this._log.debug('Processing all frames');

      if (!this._video) {
        this._log.error('No video element to process');
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
            this._log.debug('All frames processed');
            resolve(Array.from(allFrames));
          }
        } catch (error) {
          this._log.error('Error processing frame:', error);
        }
      };

      requestAnimationFrame(processFrame);
    });
  }

  /**
   * Starts the video element and begins capturing the video stream.
   * If no track has been set, it selects the first available track.
   *
   * @returns {Promise<void>} A promise that resolves when the video starts playing.
   */
  protected async startVideo(): Promise<void> {
    if (!this._track) {
      const tracks = await this.getStreamTracks();
      this.setStreamTrack(tracks[0]!);
    }

    const mediaStream = new MediaStream([this._track!]);

    const video = document.createElement('video');
    video.srcObject = mediaStream;
    video.style.display = 'none'; // Hide the video element
    document.body.appendChild(video);

    this._video = video;

    await video.play();
  }

  /**
   * Captures video tracks from the media stream based on the selected media type.
   *
   * @returns {Promise<MediaStreamTrack[]>} A promise that resolves with the video tracks.
   */
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

    this._log.debug('Got capture stream', captureStream);

    return captureStream.getVideoTracks();
  }

  /**
   * Sets the media stream track for processing.
   *
   * @param {MediaStreamTrack} track - The media stream track to set.
   */
  setStreamTrack(track: MediaStreamTrack): void {
    this._track = track;
  }

  /**
   * Reads and processes the video stream to extract and decode QR codes.
   *
   * @returns {Promise<string>} A promise that resolves with the decoded QR code data as a string.
   */
  async read(): Promise<string> {
    try {
      if (!this._track || !this._video) {
        await this.startVideo();
      }

      this._log.debug('Got video element', this._video);

      const allFrames = await this.processAllFrames();

      if (this._track) {
        this._track.stop();
      }

      this._log.debug('Stopped video track');

      this.destroy();

      const result = allFrames.sort(sortFrames).map(sliceFrames).join('');

      this._log.debug('Sorted frames', result);

      return result;
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
