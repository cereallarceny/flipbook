// The base index tag
const DEFAULT_IDX_TAG = '>>>IDX';

// The base head tag
const DEFAULT_HEAD_TAG = '>>>HEAD';

// Check if a tag is the head tag
export const isHead = (headTag: string): boolean =>
  headTag.startsWith(DEFAULT_HEAD_TAG);

// Create an index tag
export const createIndexTag = (idx: number): string =>
  `${DEFAULT_IDX_TAG}${idx}`;

// Create a head tag
export const createHeadTag = (numFrames: number): string =>
  `${DEFAULT_HEAD_TAG}${numFrames}`;

// Get the index from a string
export const getIndex = (str: string): number => {
  // Make a copy of the string
  let newStr = str;

  // If it's the head tag, remove everything before the first space
  if (isHead(newStr)) {
    newStr = str.slice().slice(str.indexOf(' ') + 1);
  }

  // Get the index of the next space
  const nextSpace = newStr.indexOf(' ');

  // If there is no more space, return -1
  if (nextSpace === -1) return -1;

  // Return the index
  return parseInt(newStr.slice().slice(DEFAULT_IDX_TAG.length, nextSpace));
};

// Get the length of the head
export const getHeadLength = (str: string): number => {
  // Get the index of the next space
  const nextSpace = str.indexOf(' ');

  // If there is no space or it's not the head, return -1
  if (nextSpace === -1 || !isHead(str)) return -1;

  // Return the index
  return parseInt(str.slice(DEFAULT_HEAD_TAG.length, nextSpace));
};
