import { getHeadLength } from '@flipbookqr/shared';
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
  protected _video: HTMLVideoElement | undefined;
  protected _track: MediaStreamTrack | undefined;
  protected _mediaType: MediaType;
  protected _mediaOptions: MediaOptions;

  /**
   * Creates an instance of WebRTCProcessor.
   *
   * @param {MediaType} [mediaType='display'] - Type of media to process ('display' or 'camera').
   * @param {MediaOptions} [options={ video: true, audio: false }] - Media stream options for capturing video/audio.
   */
  constructor(mediaType?: MediaType, options?: MediaOptions) {
    // Initialize the processor
    super();

    // Initialize video and track
    this._video = undefined;
    this._track = undefined;

    // Set media type and options
    this._mediaType = mediaType || 'display';
    this._mediaOptions = options || {
      video: true,
      audio: false,
    };
  }

  /**
   * Cleans up by removing the canvas and video elements.
   */
  protected destroy(): void {
    // Remove the canvas and video elements
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
      // Create a Set to store all frames and a variable to store the number of expected frames
      const allFrames = new Set<string>();
      let numExpectedFrames: number;

      this._log.debug('Processing all frames');

      // If no video element is present, log an error and resolve with an empty array
      if (!this._video) {
        this._log.error('No video element to process');
        resolve([]);
        return;
      }

      // Process each frame
      const processFrame = (): void => {
        try {
          // Set the current frame onto the canvas
          this.setFrame(this._video!);

          // Get the QR code data from the frame
          const result = this.getFrameData();
          const code = result && 'data' in result ? result.data : '';

          // Add the QR code data to the set if it is not already present
          if (code !== '' && !allFrames.has(code)) {
            allFrames.add(code);

            // If the head length is found, update the number of expected frames
            if (getHeadLength(code) !== -1) {
              numExpectedFrames = getHeadLength(code);
            }
          }

          // If we still need more frames, wait for the next frame
          if (allFrames.size !== numExpectedFrames) {
            requestAnimationFrame(processFrame);
          }

          // Otherwise, resolve with the array of frames
          else {
            this._log.debug('All frames processed');
            resolve(Array.from(allFrames));
          }
        } catch (error) {
          this._log.error('Error processing frame:', error);
        }
      };

      // Start processing the first frame
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
    // If no track is set, get the tracks from the stream and set the first track
    if (!this._track) {
      const tracks = await this.getStreamTracks();
      this.setStreamTrack(tracks[0]!);
    }

    // Create a new media stream with the track
    const mediaStream = new MediaStream([this._track!]);

    // Create a new video element and set the media stream
    const video = document.createElement('video');
    video.srcObject = mediaStream;
    video.style.display = 'none'; // Hide the video element
    document.body.appendChild(video);

    // Set the video element
    this._video = video;

    // Play the video
    await video.play();
  }

  /**
   * Captures video tracks from the media stream based on the selected media type.
   *
   * @returns {Promise<MediaStreamTrack[]>} A promise that resolves with the video tracks.
   */
  async getStreamTracks(): Promise<MediaStreamTrack[]> {
    // Store the capture stream
    let captureStream: MediaStream;

    // If the media type is 'display', get the display media stream
    if (this._mediaType === 'display') {
      captureStream = await navigator.mediaDevices.getDisplayMedia(
        this._mediaOptions
      );
    }

    // Otherwise, get the user media stream
    else {
      captureStream = await navigator.mediaDevices.getUserMedia(
        this._mediaOptions
      );
    }

    this._log.debug('Got capture stream', captureStream);

    // Return the video tracks from the capture stream
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
      // If no video or track is present, start the video
      if (!this._track || !this._video) {
        await this.startVideo();
      }

      this._log.debug('Got video element', this._video);

      // Process all frames and return the sorted frames as a single string
      const allFrames = await this.processAllFrames();

      // Stop the video track
      if (this._track) {
        this._track.stop();
      }

      this._log.debug('Stopped video track');

      // Destroy the processor
      this.destroy();

      // Sort and slice the frames
      const result = allFrames.sort(sortFrames).map(sliceFrames).join('');

      this._log.debug('Sorted frames', result);

      // Return the processed QR code data
      return result;
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
