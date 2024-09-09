# @flipbookqr/writer

The Flipbook writer is responsible for creating "flipbooks" that are a series of QR codes that are stitched together into an animated GIF. This GIF can then be scanned by the [reader library](../reader) and subsequently reassembled into the original payload.

## Installation

NPM:

```bash
npm install @flipbookqr/writer
```

Yarn:

```bash
yarn add @flipbookqr/writer
```

PNPM:

```bash
pnpm add @flipbookqr/writer
```

Bun:

```bash
bun add @flipbookqr/writer
```

## Usage

```typescript
import { Writer } from '@flipbookqr/writer';

// Define the payload to be encoded
const payload = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...';

// Create a new instance of the Flipbook writer
const writer = new Writer(optionalConfig);

// Write the payload to a series of QR codes
const qrs = await writer.write(payload);

// Compose a series of QR codes into a GIF
const result = await writer.compose(qrs);
```

The `result` is a is a string containing a data URL of the animated GIF which can be rendered in a browser or saved to disk as a `.gif` file.

## Configuration

The `Writer` class accepts an optional configuration object that can be used to customize the behavior of the writer. The following options are available:

```typescript
{
  logLevel: 'silent' | 'trace' | 'debug' | 'info' | 'warn' | 'error', // Default: 'silent'
  qrOptions: {
    errorCorrectionLevel: 'M',
    type: 'image/png',
  }, // See options: https://www.npmjs.com/package/qrcode#options-2
  gifOptions: {
    delay: 300,
  }, // See options: https://www.npmjs.com/package/gif.js#addframe-options
  size: integer, // Size of the image, default: 512
  splitLength: interger, // Payload chunk size, default: 100
}
```
