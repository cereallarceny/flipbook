/**
 * Converts a File object to an ArrayBuffer.
 *
 * @param {File} file - The file to convert.
 * @returns {Promise<ArrayBuffer>} A promise that resolves to the file's ArrayBuffer.
 */
export function convertFileToBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    // Create a new FileReader instance
    const reader = new FileReader();

    // When the file is read, resolve the promise with the ArrayBuffer
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result;
      if (arrayBuffer) {
        resolve(arrayBuffer as ArrayBuffer);
      }
    };

    // When an error occurs, reject the promise
    reader.onerror = () => reject(new Error('Failed to read file'));

    // Read the file as an ArrayBuffer
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Converts an Uint8ClampedArray to a File object.
 *
 * @param {Uint8ClampedArray} imageData - The image data array.
 * @param {number} width - The width of the image.
 * @param {number} height - The height of the image.
 * @param {string} fileName - The name of the file to create.
 * @returns {File} The created File object.
 */
export function convertUnit8ClampedArrayToFile(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  fileName: string
): File {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // Get the 2D context
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D context not supported');
  }

  // Create an ImageData object and put it on the canvas
  const imageDataObj = new ImageData(imageData, width, height);
  ctx.putImageData(imageDataObj, 0, 0);

  // Convert the canvas to a data URL
  const dataURL = canvas.toDataURL();

  // Convert the data URL to a Blob object
  const blob = dataURLtoBlob(dataURL);

  // Create a new File object
  return new File([blob], fileName, { type: blob.type });
}

/**
 * Converts a data URL to a Uint8Array.
 *
 * @param {string} dataURL - The data URL to convert.
 * @returns {Uint8Array} The Uint8Array created from the data URL.
 */
export function dataURLtoUint8Array(dataURL: string): Uint8Array {
  // Split the data URL into parts
  const parts = dataURL.split(';base64,');
  const raw = window.atob(parts[1]!);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  // Create a Uint8Array from the raw data
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return uInt8Array;
}

/**
 * Converts a data URL to a Blob object.
 *
 * @param {string} dataURL - The data URL to convert.
 * @returns {Blob} The Blob object created from the data URL.
 */
export function dataURLtoBlob(dataURL: string): Blob {
  // Convert the data URL to a Uint8Array
  const uInt8Array = dataURLtoUint8Array(dataURL);

  // Get the content type
  const parts = dataURL.split(';base64,');
  const contentType = parts[0]?.split(':')[1];

  // Return a new Blob object
  return new Blob([uInt8Array], { type: contentType });
}
