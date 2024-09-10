export abstract class FrameProcessor {
  abstract read(): Promise<string>;
}
