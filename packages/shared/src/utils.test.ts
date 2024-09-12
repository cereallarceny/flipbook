import {
  convertFileToBuffer,
  convertUnit8ClampedArrayToFile,
  dataURLtoUint8Array,
  dataURLtoBlob,
} from './utils'; // Update with actual file path

// // Mocking FileReader to simulate file reading
// global.FileReader = class {
//   onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null =
//     null;
//   onerror: (() => void) | null = null;
//   result: ArrayBuffer | null = null;

//   readAsArrayBuffer() {
//     if (this.onload) {
//       const buffer = new ArrayBuffer(8);
//       this.result = buffer;
//       this.onload({ target: { result: buffer } } as ProgressEvent<FileReader>);
//     }
//   }
// };

// // Mocking Blob and File creation
// global.File = class {
//   constructor(
//     public parts: BlobPart[],
//     public fileName: string,
//     public options: FilePropertyBag
//   ) {}
// };
// global.Blob = class {
//   constructor(
//     public parts: BlobPart[],
//     public options: BlobPropertyBag = {}
//   ) {}
// };

describe('convertFileToBuffer', () => {
  it('should resolve with an ArrayBuffer when the file is read successfully', async () => {
    const mockFile = new File(['file content'], 'test.txt');
    const result = await convertFileToBuffer(mockFile);

    expect(result).toBeInstanceOf(ArrayBuffer);
  });

  it('should reject with an error when file reading fails', async () => {
    const mockFile = new File(['file content'], 'test.txt');

    // Mock the FileReader with an implementation that triggers the onerror handler
    const mockFileReader = {
      readAsArrayBuffer: jest.fn(),
      onerror: jest.fn(),
    };

    jest
      .spyOn(global, 'FileReader')
      .mockImplementation(() => mockFileReader as unknown as FileReader);

    // Manually trigger the error after `readAsArrayBuffer` is called
    mockFileReader.readAsArrayBuffer.mockImplementation(function () {
      if (mockFileReader.onerror) {
        const event = new ProgressEvent('error');
        mockFileReader.onerror(event); // Simulate the error event
      }
    });

    await expect(convertFileToBuffer(mockFile)).rejects.toThrow(
      'Failed to read file'
    );

    jest.restoreAllMocks(); // Cleanup the mocked FileReader after the test
  });
});

describe('convertUnit8ClampedArrayToFile', () => {
  it('should create a File object from Uint8ClampedArray', () => {
    const imageData = new Uint8ClampedArray([
      255, 0, 0, 255, 0, 255, 0, 255, 255, 0, 0, 255, 0, 255, 0, 255,
    ]); // 2x2 red and green pixels
    const width = 2;
    const height = 2;
    const fileName = 'testImage.png';

    const file = convertUnit8ClampedArrayToFile(
      imageData,
      width,
      height,
      fileName
    );

    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe(fileName);
    expect(file.type).toBe('image/png'); // Depending on the Blob type

    // Check if the file size matches the expected Blob size (you can't access 'parts')
    const blobSize = new Blob([file]).size;
    expect(blobSize).toBeGreaterThan(0);
  });

  it('should throw an error if 2D context is not supported', () => {
    const imageData = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]);
    const width = 2;
    const height = 2;
    const fileName = 'testImage.png';

    // Simulate no 2D context support
    jest.spyOn(document, 'createElement').mockReturnValueOnce({
      getContext: () => null,
    } as unknown as HTMLCanvasElement);

    expect(() =>
      convertUnit8ClampedArrayToFile(imageData, width, height, fileName)
    ).toThrow('2D context not supported');
  });
});

describe('dataURLtoUint8Array', () => {
  it('should convert a data URL to a Uint8Array', () => {
    const dataURL = 'data:image/png;base64,AAECAwQFBgc=';
    const uint8Array = dataURLtoUint8Array(dataURL);

    expect(uint8Array).toBeInstanceOf(Uint8Array);
    expect(uint8Array.length).toBeGreaterThan(0);
  });
});

describe('dataURLtoBlob', () => {
  it('should convert a data URL to a Blob object', () => {
    const dataURL = 'data:image/png;base64,AAECAwQFBgc=';
    const blob = dataURLtoBlob(dataURL);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');

    // Verify the size of the Blob (based on the length of the Uint8Array)
    const expectedSize = dataURLtoUint8Array(dataURL).length;
    expect(blob.size).toBe(expectedSize);
  });
});
