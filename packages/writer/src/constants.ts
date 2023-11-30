import { type WriterProps } from 'shared';

export const DEFAULT_WRITER_PROPS: WriterProps = {
  logLevel: 'silent',
  qrOptions: {
    errorCorrectionLevel: 'M',
    type: 'image/png',
  },
  size: 512,
  splitLength: 100,
};
