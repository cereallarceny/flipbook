import * as shared from '@flipbookqr/shared';
import { sortFrames, sliceFrames } from './helpers';

jest.mock('@flipbookqr/shared', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@flipbookqr/shared'),
  };
});

describe('Helpers', () => {
  describe('sortFrames', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    test('should sort frames with head first', () => {
      jest.spyOn(shared, 'isHead').mockReturnValue(true);

      const result = sortFrames('[INDEX:1]', '[HEAD]');
      expect(result).toBe(-1);
    });

    test('should sort frames by index', () => {
      const FRAME_1 = '[INDEX:1]';
      const FRAME_2 = '[INDEX:2]';

      jest.spyOn(shared, 'getIndex').mockImplementation((frame: string) => {
        if (frame === FRAME_2) return 1;
        return 2;
      });

      const resultA = sortFrames(FRAME_2, FRAME_1);
      expect(resultA).toBe(-1);

      jest.spyOn(shared, 'getIndex').mockImplementation((frame: string) => {
        if (frame === FRAME_2) return 2;
        return 1;
      });

      const resultB = sortFrames(FRAME_2, FRAME_1);
      expect(resultB).toBe(1);
    });

    test('should handle frames with the same index', () => {
      const result = sortFrames('[INDEX:1]', '[INDEX:1]');
      expect(result).toBe(0);
    });
  });

  describe('sliceFrames', () => {
    test('should remove everything before the index', () => {
      const result = sliceFrames('[INDEX:2]Some content');
      expect(result).toBe('Some content');
    });

    test('should handle frames without an index', () => {
      jest.spyOn(shared, 'getIndex').mockReturnValue(-1);

      const result = sliceFrames('No index here');
      expect(result).toBe('No index here');
    });
  });
});
