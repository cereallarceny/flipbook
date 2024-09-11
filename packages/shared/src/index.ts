import log, { type Logger } from 'loglevel';

// The base index tag
const DEFAULT_IDX_TAG = '>>>IDX';

// The base head tag
const DEFAULT_HEAD_TAG = '>>>HEAD';

/**
 * Returns a logger instance for the 'flipbook' namespace.
 *
 * @returns {Logger} The logger instance.
 */
export const getLogger = (): Logger => log.getLogger('flipbook');

// Define the logger locally
const logger = getLogger();

/**
 * Checks if the given tag is a head tag.
 *
 * @param {string} headTag - The string to check.
 * @returns {boolean} True if the tag starts with the default head tag, otherwise false.
 */
export const isHead = (headTag: string): boolean =>
  headTag.startsWith(DEFAULT_HEAD_TAG);

/**
 * Creates an index tag with the given index.
 *
 * @param {number} idx - The index to be added to the tag.
 * @returns {string} The generated index tag.
 */
export const createIndexTag = (idx: number): string =>
  `${DEFAULT_IDX_TAG}${idx}`;

/**
 * Creates a head tag with the given number of frames.
 *
 * @param {number} numFrames - The number of frames to include in the head tag.
 * @returns {string} The generated head tag.
 */
export const createHeadTag = (numFrames: number): string =>
  `${DEFAULT_HEAD_TAG}${numFrames}`;

/**
 * Extracts the index from a string that contains an index tag.
 *
 * @param {string} str - The string to extract the index from.
 * @returns {number} The extracted index, or -1 if no index is found.
 */
export const getIndex = (str: string): number => {
  let newStr = str;
  logger.debug('Getting index', newStr);

  // If it's the head tag, remove everything before the first space
  if (isHead(newStr)) {
    newStr = str.slice().slice(str.indexOf(' ') + 1);
    logger.debug('Removing head tag', newStr);
  }

  // Get the index of the next space
  const nextSpace = newStr.indexOf(' ');

  // If there is no more space, return -1
  if (nextSpace === -1) return -1;

  // Return the index
  const result = parseInt(
    newStr.slice().slice(DEFAULT_IDX_TAG.length, nextSpace)
  );
  logger.debug('Returning index', result);
  return result;
};

/**
 * Extracts the length from the head tag of the given string.
 *
 * @param {string} str - The string to extract the head length from.
 * @returns {number} The head length, or -1 if no valid head tag is found.
 */
export const getHeadLength = (str: string): number => {
  const nextSpace = str.indexOf(' ');
  logger.debug('Getting head length', str);

  // If there is no space or it's not the head, return -1
  if (nextSpace === -1 || !isHead(str)) return -1;

  // Return the length from the head tag
  const result = parseInt(str.slice(DEFAULT_HEAD_TAG.length, nextSpace));
  logger.debug('Returning head length', result);
  return result;
};
