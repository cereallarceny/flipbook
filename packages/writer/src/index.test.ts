import qrcode, { create } from 'qrcode';
import { Writer } from './index';

describe('Writer', () => {
  let writer: Writer; // Use the TestableWriter class

  beforeEach(() => {
    writer = new Writer();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('write method should generate QR Codes from text input', async () => {
    const TEST_CODE = 'TEST_CODE';
    const CODE_AFTER_SPLIT = '>>>HEAD1 >>>IDX0 TEST_CODE';
    const WRITE_OPTIONS = { errorCorrectionLevel: 'M', type: 'image/png' };

    // Spy on qrcode.create
    jest.spyOn(qrcode, 'create');

    // Call the write method
    const result = await writer.write(TEST_CODE);

    // Verify that the create method was called with the correct arguments
    expect(create).toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith(CODE_AFTER_SPLIT, WRITE_OPTIONS);

    // Verify that the result is an array of objects with image and code properties
    expect(result[0]?.image).toMatch(/^data:image\/png;base64/);
    expect(result[0]?.code).toMatch(/TEST_CODE$/);
  });
});
