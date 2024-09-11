import { Writer } from './writer';

let writer: Writer;

describe('Writer', () => {
  beforeEach(() => {
    writer = new Writer();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('write', () => {
    it('should generate QR Codes from text input', () => {
      const TEST_CODE =
        'TEST_CODE_TEST_CODE_TEST_CODE_TEST_CODE_TEST_CODE_TEST_CODE_TEST_CODE_TEST_CODE_TEST_CODE_TEST_CODE_TEST_CODE';

      // Spy on qrcode.create
      jest.spyOn(qrcode, 'create');

      // Call the write method
      const result = writer.write(TEST_CODE);

      // Verify that the create method was called with the correct arguments
      expect(create).toHaveBeenCalled();

      // Verify that the result is an array of objects with image and code properties
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
      expect(result[0]?.image).toMatch(/^data:image\/png;base64/);
      expect(result[0]?.code).toMatch(/TEST_CODE_$/);
    });
  });

  describe('compose', () => {
    it('should reject with an error when an exception occurs during GIF rendering', async () => {
      const ERROR_MESSAGE = 'Failed to create object URL';
      const qrs = [
        { code: 'code1', image: 'image1' },
        { code: 'code2', image: 'image2' },
      ];

      //  Mock the URL.createObjectURL
      jest.spyOn(global.URL, 'createObjectURL').mockImplementation(() => {
        throw new Error(ERROR_MESSAGE);
      });

      await expect(writer.compose(qrs)).rejects.toThrow(ERROR_MESSAGE);
    });
  });
});
