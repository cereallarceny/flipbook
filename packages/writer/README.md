# @flipbookqr/writer

The Flipbook writer is responsible for creating "flipbooks" that are a series of QR codes that are stitched together into an animated GIF. This GIF can then be scanned by the [reader library](https://github.com/cereallarceny/flipbook/tree/main/packages/reader) and subsequently reassembled into the original payload.

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

[View a CodeSandbox example](https://codesandbox.io/p/sandbox/n6hrwl)

```typescript
import { Writer } from '@flipbookqr/writer';

// Define the payload to be encoded
const payload = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...';

// Create a new instance of the Flipbook writer
const writer = new Writer(optionalConfig);

// Write the payload to a series of QR codes
const qrs = writer.write(payload);

// Create a new canvas element
const canvas = document.createElement('canvas');

// Compose a series of QR codes to a canvas element
writer.toCanvas(qrs, canvas);

// Or, compose a series of QR codes to a GIF
writer.toGif(qrs);
```

## Configuration

The `Writer` class accepts an optional configuration object that can be used to customize the behavior of the writer. The following options are available:

```typescript
{
  logLevel: 'silent' | 'trace' | 'debug' | 'info' | 'warn' | 'error', // Default: 'silent'
  errorCorrectionLevel: number, // Level of error correction (see @nuintun/qrcode)
  encodingHint: boolean, // Enable encoding hint (see @nuintun/qrcode)
  version?: number, // QR code version (see @nuintun/qrcode)
  moduleSize: number, // Size of each QR code module, default: 4 (see @nuintun/qrcode)
  margin: number, // Margin around each QR code, default: 8 (see @nuintun/qrcode)
  delay: number, // Delay between frames in milliseconds, default: 100
  splitLength: integer, // Payload chunk size, default: 100
}
```
