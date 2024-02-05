import { Reader } from './index';

class TestableReader extends Reader {
  public processAllFrames(track: MediaStreamTrack): Promise<string[]> {
    return this.processAllFrames(track);
  }

  public getImageCapture(track: MediaStreamTrack): ImageCapture {
    return this.getImageCapture(track);
  }
}

describe('Reader', () => {
  let reader: TestableReader;

  beforeAll(() => {
    jest.restoreAllMocks();

    reader = new TestableReader();
  });

  describe('read', () => {
    beforeAll(() => {
      class MediaStreamTrackMock {
        stop = jest.fn();
      }

      const mockGetDisplayMediaMock = jest.fn(async () => {
        return new Promise<{ getVideoTracks: () => MediaStreamTrackMock[] }>(
          (resolve) => {
            resolve({
              getVideoTracks: () => {
                return [new MediaStreamTrackMock()];
              },
            });
          }
        );
      });

      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: {
          getDisplayMedia: mockGetDisplayMediaMock,
        },
      });
    });

    it('should read frames', async () => {
      const mockedData = ['A', 'B', 'C'];
      const mockedDataPromise = new Promise((resolve) => {
        resolve(mockedData);
      });

      jest
        .spyOn(reader, 'processAllFrames')
        .mockReturnValueOnce(mockedDataPromise as Promise<string[]>);

      const result = await reader.read();

      expect(result).toBe('ABC');
    });

    it('should throw an error', async () => {
      const ERROR_MESSAGE = 'Simulated error';

      try {
        jest
          .spyOn(reader, 'processAllFrames')
          .mockRejectedValueOnce(ERROR_MESSAGE);

        await reader.read();
      } catch (error) {
        expect(error).toBe(ERROR_MESSAGE);
      }
    });
  });
});
