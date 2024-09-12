/* eslint-disable @typescript-eslint/no-explicit-any */

import { getHeadLength } from '@flipbookqr/shared';
import { WebRTCProcessor } from './webrtc-processor'; // Adjust the path if needed

// Mock dependencies
jest.mock('@flipbookqr/shared', () => ({
  ...jest.requireActual('@flipbookqr/shared'),
  getHeadLength: jest.fn(),
}));

// Mock MediaStream and related Web API methods
global.MediaStream = jest.fn(() => ({
  getVideoTracks: jest.fn().mockReturnValue(['mockTrack']),
})) as any;

// Mock HTMLVideoElement play method
global.HTMLVideoElement.prototype.play = jest.fn().mockResolvedValue(undefined);

describe('WebRTCProcessor', () => {
  let processor: WebRTCProcessor;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let playSpy: jest.SpyInstance;

  beforeEach(() => {
    processor = new WebRTCProcessor('display', { video: true, audio: false });

    // Spy on the logger
    logSpy = jest
      .spyOn(processor['_log'], 'debug')
      .mockImplementation(jest.fn());
    errorSpy = jest
      .spyOn(processor['_log'], 'error')
      .mockImplementation(jest.fn());

    // Mock navigator.mediaDevices and its methods
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getDisplayMedia: jest.fn().mockResolvedValue(new MediaStream()),
        getUserMedia: jest.fn().mockResolvedValue(new MediaStream()),
      },
    });

    // Mock document.body.appendChild
    document.body.appendChild = jest.fn();

    // Mock the HTMLVideoElement play method
    playSpy = jest
      .spyOn(HTMLVideoElement.prototype, 'play')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startVideo', () => {
    beforeEach(() => {
      // Mock getDisplayMedia and getUserMedia
      navigator.mediaDevices.getDisplayMedia = jest
        .fn()
        .mockResolvedValue(new MediaStream());
      navigator.mediaDevices.getUserMedia = jest
        .fn()
        .mockResolvedValue(new MediaStream());
    });

    it('should set the first track and create a video element', async () => {
      await (processor as any).startVideo();

      expect(processor['_track']).toBeDefined();
      expect(processor['_video']).toBeDefined();
      expect(document.body.appendChild).toHaveBeenCalled();

      // Check the correct order of log calls
      expect(logSpy).toHaveBeenCalledTimes(2);
      // expect(logSpy).toHaveBeenNthCalledWith(1, 'Got capture stream', {
      //   getVideoTracks: MediaStream,
      // });
      expect(logSpy).toHaveBeenNthCalledWith(
        2,
        'Got video element',
        processor['_video']
      );
    });

    it('should play the video when it is started', async () => {
      await (processor as any).startVideo();

      // Check that the play() method is called
      expect(playSpy).toHaveBeenCalled();
    });
  });

  describe('getStreamTracks', () => {
    it('should get display media tracks when media type is "display"', async () => {
      const mockMediaStream = new MediaStream();
      navigator.mediaDevices.getDisplayMedia = jest
        .fn()
        .mockResolvedValue(mockMediaStream);

      const tracks = await processor.getStreamTracks();

      expect(tracks).toEqual(['mockTrack']);
      expect(logSpy).toHaveBeenCalledWith(
        'Got capture stream',
        mockMediaStream
      );
    });

    it('should get user media tracks when media type is "camera"', async () => {
      const cameraProcessor = new WebRTCProcessor('camera', { video: true });
      const mockMediaStream = new MediaStream();
      navigator.mediaDevices.getUserMedia = jest
        .fn()
        .mockResolvedValue(mockMediaStream);

      const tracks = await cameraProcessor.getStreamTracks();

      expect(tracks).toEqual(['mockTrack']);
    });
  });

  describe('destroy', () => {
    let mockCanvas: HTMLCanvasElement;
    let mockVideo: HTMLVideoElement;

    beforeEach(() => {
      // Create a mock canvas element
      mockCanvas = document.createElement('canvas');
      mockCanvas.remove = jest.fn();

      // Create a mock video element
      mockVideo = document.createElement('video');
      mockVideo.remove = jest.fn();

      // Assign the mock elements to the processor

      (processor as any)._canvas = mockCanvas;

      (processor as any)._video = mockVideo;
    });

    it('should remove the canvas and video elements', () => {
      // Call destroy
      (processor as any).destroy();

      // Verify that the canvas and video elements' remove methods were called
      expect(mockCanvas.remove).toHaveBeenCalled();
      expect(mockVideo.remove).toHaveBeenCalled();
    });

    it('should remove the canvas element even if there is no video element', () => {
      // Set the video to undefined
      (processor as any)._video = undefined;

      // Call destroy
      (processor as any).destroy();

      // Verify that only the canvas element's remove method was called
      expect(mockCanvas.remove).toHaveBeenCalled();
    });
  });

  describe('processSingleFrame', () => {
    let mockCanvas: HTMLCanvasElement;
    let mockVideo: HTMLVideoElement;

    beforeEach(() => {
      // Mock canvas and video elements
      mockCanvas = document.createElement('canvas');
      mockVideo = document.createElement('video');
      processor['_canvas'] = mockCanvas;
      processor['_video'] = mockVideo;

      // Mock getFrameData to return a QR code result
      jest
        .spyOn(processor as any, 'getFrameData')
        .mockReturnValue({ data: 'mockQRCode' });

      // Mock setFrame to set the video frame on the canvas
      jest.spyOn(processor as any, 'setFrame').mockImplementation(() => {});

      // Mock getHeadLength to return a head length
      (getHeadLength as jest.Mock).mockReturnValue(5);
    });

    it('should process a single frame and add the QR code data to the set', () => {
      // Call processSingleFrame
      (processor as any).processSingleFrame();

      // Verify that the QR code data was added to the set
      expect(processor['_allFrames'].has('mockQRCode')).toBe(true);
    });

    it('should update the number of expected frames if head length is found', () => {
      // Call processSingleFrame
      (processor as any).processSingleFrame();

      // Verify that the number of expected frames is updated
      expect(processor['_numExpectedFrames']).toBe(5);
    });

    it('should not add empty QR code data to the set', () => {
      // Mock getFrameData to return an empty string
      jest
        .spyOn(processor as any, 'getFrameData')
        .mockReturnValue({ data: '' });

      // Call processSingleFrame
      (processor as any).processSingleFrame();

      // Verify that no data was added to the set
      expect(processor['_allFrames'].size).toBe(0);
    });

    it('should handle errors and log them', () => {
      // Mock setFrame to throw an error
      jest.spyOn(processor as any, 'setFrame').mockImplementation(() => {
        throw new Error('mockError');
      });

      // Call processSingleFrame
      (processor as any).processSingleFrame();

      // Verify that the error was logged
      expect(errorSpy).toHaveBeenCalledWith(
        'Error processing frame:',
        new Error('mockError')
      );
    });
  });

  describe('processAllFrames', () => {
    let requestAnimationFrameSpy: jest.SpyInstance;
    let processSingleFrameSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.useFakeTimers(); // Use fake timers to control requestAnimationFrame

      // Mock requestAnimationFrame globally
      requestAnimationFrameSpy = jest
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation((callback) => {
          setTimeout(() => callback(0), 16); // Simulate a frame every 16ms (roughly 60fps)
          return 1; // Return a mock animation frame ID
        });

      // Spy on processSingleFrame method
      processSingleFrameSpy = jest
        .spyOn(processor as any, 'processSingleFrame')
        .mockImplementation(() => {
          // Simulate processing of a frame and adding it to the set
          processor['_allFrames'].add(
            `mockQRCodeData${processor['_allFrames'].size + 1}`
          );
        });
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.useRealTimers(); // Restore timers after each test
    });

    it('should resolve with an empty array if no video element is present', async () => {
      // Set video to undefined
      processor['_video'] = undefined;

      const result = await (processor as any).processAllFrames();

      // Check that an empty array is returned
      expect(result).toEqual([]);

      // Check that the "Processing all frames" message is logged first
      expect(logSpy).toHaveBeenCalledWith('Processing all frames');

      // Check that the "No video element to process" message is logged next
      expect(errorSpy).toHaveBeenCalledWith('No video element to process');
    });

    it('should process frames until the expected number of frames is reached', async () => {
      processor['_video'] = document.createElement('video'); // Mock video element
      processor['_numExpectedFrames'] = 3; // Simulate expecting 3 frames

      const resultPromise = (processor as any).processAllFrames();

      // Simulate the passage of time and frame processing
      expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(16); // Move time forward for frame 1
      expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(2);
      jest.advanceTimersByTime(16); // Move time forward for frame 2
      expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(3);
      jest.advanceTimersByTime(16); // Move time forward for frame 3

      // Await the promise resolution
      const result = await resultPromise;

      // Check that processSingleFrame was called the correct number of times
      expect(processSingleFrameSpy).toHaveBeenCalledTimes(3);

      // Ensure all frames are returned as an array
      expect(result).toEqual([
        'mockQRCodeData1',
        'mockQRCodeData2',
        'mockQRCodeData3',
      ]);

      // Ensure logging for frame processing was done
      expect(logSpy).toHaveBeenCalledWith('All frames processed');
    });
  });

  describe('read', () => {
    let startVideoSpy: jest.SpyInstance;
    let processAllFramesSpy: jest.SpyInstance;
    let destroySpy: jest.SpyInstance;

    beforeEach(() => {
      // Mock MediaStreamTrack globally with a stop method
      global.MediaStreamTrack = jest.fn().mockImplementation(() => ({
        stop: jest.fn(), // Mock the stop method
      })) as any;

      // Spy on the startVideo, processAllFrames, and destroy methods
      startVideoSpy = jest
        .spyOn(processor as any, 'startVideo')
        .mockResolvedValue(undefined);
      processAllFramesSpy = jest
        .spyOn(processor as any, 'processAllFrames')
        .mockResolvedValue(['frame1', 'frame2', 'frame3']);
      destroySpy = jest
        .spyOn(processor as any, 'destroy')
        .mockImplementation(() => {});

      processor['_track'] = new MediaStreamTrack(); // Mock a track
      processor['_video'] = document.createElement('video'); // Mock a video element
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call startVideo if video or track is not initialized', async () => {
      processor['_video'] = undefined; // Simulate no video

      await processor.read();

      expect(startVideoSpy).toHaveBeenCalled();
    });

    it('should process all frames and return sorted QR code data', async () => {
      const result = await processor.read();

      // Verify that processAllFrames is called
      expect(processAllFramesSpy).toHaveBeenCalled();

      // Ensure frames are processed, sorted, sliced, and joined
      expect(result).toBe('frame1frame2frame3');
    });

    it('should stop the video track after processing', async () => {
      await processor.read();

      // Check that the stop method was called
      expect(processor['_track']!.stop).toHaveBeenCalled();
      expect(destroySpy).toHaveBeenCalled();
    });

    it('should reject if an error occurs', async () => {
      // Force an error to occur
      processAllFramesSpy.mockRejectedValue(new Error('mockError'));

      await expect(processor.read()).rejects.toThrow('mockError');
    });

    it('should not call startVideo if video and track are already initialized', async () => {
      await processor.read();

      // Ensure startVideo is not called since video and track are already initialized
      expect(startVideoSpy).not.toHaveBeenCalled();
    });
  });
});
