import log from 'loglevel';
import { create, toDataURL } from 'qrcode';
import { split, type WriterProps, type WriterResult } from 'shared';
import { DEFAULT_WRITER_PROPS } from './constants';

// Receive an arbitrary string and split it into multiple QR codes
export const write = async (
  code: string,
  opts: Partial<WriterProps> = {}
): Promise<WriterResult[]> => {
  // Merge the options with the default options
  const mergedOpts: WriterProps = { ...DEFAULT_WRITER_PROPS, ...opts };

  // Set up the logger
  log.setLevel(mergedOpts.logLevel);
  log.debug('logger established');
  log.debug('merged options', mergedOpts);

  // Split the code into multiple strings
  const codes = split(code, mergedOpts);
  log.debug('split codes', codes);

  // Generate all the QR codes
  const allQrs = await Promise.all(
    codes.map((v) => create(v, mergedOpts.qrOptions))
  );
  log.debug('generated QR codes (initial)', allQrs);

  // Find the highest version of all the QR codes
  const highestVersion = allQrs.reduce((acc, v) => {
    if (v.version > acc) return v.version;
    return acc;
  }, 0);
  log.debug('highest version', highestVersion);

  // Regenerate each frame again with the highest version
  return Promise.all(
    codes.map(async (v) => ({
      code: v,
      image: await toDataURL(v, {
        ...mergedOpts.qrOptions,
        version: highestVersion,
      }),
    }))
  );
};
