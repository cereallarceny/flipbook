import log from 'loglevel';
import { type WriterProps } from './types';

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
  log.debug('getting index', newStr);

  // If it's the head tag, remove everything before the first space
  if (isHead(newStr)) {
    newStr = str.slice().slice(str.indexOf(' ') + 1);
    log.debug('removing head tag', newStr);
  }

  // Get the index of the next space
  const nextSpace = newStr.indexOf(' ');

  // If there is no more space, return -1
  if (nextSpace === -1) return -1;

  // Return the index
  const result = parseInt(
    newStr.slice().slice(DEFAULT_IDX_TAG.length, nextSpace)
  );
  log.debug('returning index', result);
  return result;
};

// Get the length of the head
export const getHeadLength = (str: string): number => {
  // Get the index of the next space
  const nextSpace = str.indexOf(' ');
  log.debug('getting head length', str);

  // If there is no space or it's not the head, return -1
  if (nextSpace === -1 || !isHead(str)) return -1;

  // Return the index
  const result = parseInt(str.slice(DEFAULT_HEAD_TAG.length, nextSpace));
  log.debug('returning head length', result);
  return result;
};

// Split an input string into multiple string of a certain length
export const split = (code: string, opts: WriterProps): string[] => {
  // Get the split length from the options
  const { splitLength } = opts;
  log.debug('split length', splitLength);

  // Store all the codes and the length of the input string
  const codes: string[] = [];
  const length = code.length;

  // Loop through the input string
  let i = 0;
  while (i < length) {
    // Get a slice and push it into the codes array and move onto the next
    codes.push(code.slice(i, i + splitLength));
    log.debug('creating slice', i, i + splitLength);
    i += splitLength;
  }

  // Add the index to each of the codes
  const indexedCodes = codes.map((v, idx) => `${createIndexTag(idx)} ${v}`);
  log.debug('indexed codes', indexedCodes);

  // Add the head tag to the first code with the number of codes
  indexedCodes[0] = `${createHeadTag(indexedCodes.length)} ${indexedCodes[0]}`;
  log.debug('indexing head', [indexedCodes[0]]);

  // Return the indexedCodes array
  return indexedCodes;
};

export type { WriterProps, WriterResult } from './types';
