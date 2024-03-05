declare module 'gifuct-js' {
  export interface GIF {
    frames: Frame[];
    width: number;
    height: number;
    loopCount: number;
    gct: number[];
    framesInfo: any[];
  }

  export interface Frame {
    data: Uint8Array;
    dims: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
    patch: Uint8ClampedArray;
    delay: number;
    disposal: number;
    transparentIndex: number;
    transparentRGB: Uint8Array;
  }

  export function parseGIF(buffer: ArrayBuffer): GIF;
  export function decompressFrames(gif: GIF, buildPatch: boolean): Frame[];
}
