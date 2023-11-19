import { createIndexTag, getIndex, isHead } from '@flipbook/writer';

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
