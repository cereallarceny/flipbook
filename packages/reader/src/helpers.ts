import { createIndexTag, getIndex, isHead } from '@flipbookqr/shared';

/**
 * Sorts frames based on their index. Ensures the head frame is always first.
 *
 * @param {string} a - The first frame to compare.
 * @param {string} b - The second frame to compare.
 * @returns {number} - Returns -1 if `a` should come before `b`, 1 if `a` should come after `b`, and 0 if they are equal.
 */
export const sortFrames = (a: string, b: string): number => {
  // Make sure the head frame is first
  if (isHead(a)) return -1;

  // Otherwise, get the indexes
  const aIndex = getIndex(a);
  const bIndex = getIndex(b);

  // And sort by index
  if (aIndex < bIndex) return -1;
  if (aIndex > bIndex) return 1;
  return 0;
};

/**
 * Slices a frame string to remove everything before the index tag.
 *
 * @param {string} frame - The frame string to slice.
 * @returns {string} - The sliced frame string.
 */
export const sliceFrames = (frame: string): string => {
  // Get the index
  const idx = getIndex(frame);
  const idxTag = createIndexTag(idx);

  // Remove everything before the index
  if (idx !== -1) {
    return frame.slice(frame.indexOf(idxTag) + idxTag.length + 1);
  }

  return frame;
};
