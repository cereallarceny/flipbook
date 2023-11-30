import type { LogLevelDesc } from 'loglevel';
import type { QRCodeToDataURLOptions } from 'qrcode';

export interface WriterResult {
  code: string;
  image: string;
}

export interface WriterProps {
  logLevel: LogLevelDesc;
  qrOptions: QRCodeToDataURLOptions;
  size: number;
  splitLength: number;
}
