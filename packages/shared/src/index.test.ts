import {
  isHead,
  createIndexTag,
  createHeadTag,
  getIndex,
  getHeadLength,
} from './index';

describe('Shared', () => {
  describe('isHead', () => {
    it('should return true for the head tag', () => {
      const result = isHead('>>>HEAD123');
      expect(result).toBe(true);
    });

    it('should return false for the non-head tag', () => {
      const result = isHead('>>>IDX123');
      expect(result).toBe(false);
    });
  });

  describe('createIndexTag', () => {
    it('should create index tag with correct format', () => {
      const result = createIndexTag(123);
      expect(result).toBe('>>>IDX123');
    });
  });

  describe('createHeadTag', () => {
    it('should create head tag with correct format', () => {
      const result = createHeadTag(456);
      expect(result).toBe('>>>HEAD456');
    });
  });

  describe('getIndex', () => {
    it('should return index from string with index tag', () => {
      const result = getIndex('>>>IDX789 some other text');
      expect(result).toBe(789);
    });

    it('should return -1 if there is no more space', () => {
      const result = getIndex('>>>IDX');
      expect(result).toBe(-1);
    });

    it('should return NaN for string without index tag', () => {
      const result = getIndex('some text without index tag');
      expect(result).toBe(NaN);
    });

    it('should return NaN as a index from string with head tag', () => {
      const result = getIndex('>>>HEAD987 some other text');
      expect(result).toBe(NaN);
    });
  });

  describe('getHeadLength', () => {
    it('should return head length from string with head tag', () => {
      const result = getHeadLength('>>>HEAD654 some other text');
      expect(result).toBe(654);
    });

    it('should return -1 for string without head tag', () => {
      const result = getHeadLength('some text without head tag');
      expect(result).toBe(-1);
    });

    it('should return NaN for string with head tag with no length', () => {
      const result = getHeadLength('>>>HEAD some other text');
      expect(result).toBe(NaN);
    });
  });
});
