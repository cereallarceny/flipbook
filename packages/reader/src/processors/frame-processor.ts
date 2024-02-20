import { type QRCode } from 'jsqr';

export abstract class FrameProcessor {
  abstract setFrame(frame: ImageBitmap): void;
  abstract getFrameData(): QRCode | null;
  abstract destroy(): void;
  abstract processAllFrames(): Promise<string[]>;
  abstract read(): Promise<string>;
}
