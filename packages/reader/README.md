# @flipbookqr/reader

The Flipbook reader is responsible for reading "flipbooks" created by the [Flipbook writer](https://github.com/cereallarceny/flipbook/tree/main/packages/writer). It can be used to decode a series of QR codes into a single payload.

## Installation

NPM:

```bash
npm install @flipbookqr/reader
```

Yarn:

```bash
yarn add @flipbookqr/reader
```

PNPM:

```bash
pnpm add @flipbookqr/reader
```

Bun:

```bash
bun add @flipbookqr/reader
```

## Usage

### Screenshare

The following will read a QR code via the `getDisplayMedia` (screenshare) API:

```ts
import { Reader } from '@flipbookqr/reader';

// Create a new instance of the Flipbook reader
const reader = new Reader(optionalConfig);

// Read the Flipbook visible on the screen
const result = await reader.read();
```

The `result` is a is the original payload that was encoded into the series of QR codes.

### Camera

The following will read a QR code via the `getUserMedia` (camera) API:

```ts
import { Reader, WebRTCProcessor } from '@flipbookqr/reader';

// Create a new instance of the Flipbook reader
const reader = new Reader({
  frameProcessor: new WebRTCProcessor('camera')
});

// Get a list of all available camera sources
const sources = await reader.opts.frameProcessor.getStreamTracks();

// Select a camera source
reader.opts.frameProcessor.setStreamTrack(sources[0]);

// Note: If you don't do the above two commands, it will default to the first camera source

// Read the Flipbook visible on the screen
const result = await reader.read();
```

The `result` is a is the original payload that was encoded into the series of QR codes.

### File upload

The following will read a QR code from a file:

```ts
import { Reader, FileProcessor } from '@flipbookqr/reader';

const file = new File(); // some file

const reader = new Reader({
  frameProcessor: new FileProcessor(file)
});

const result = await reader.read();
```

The `result` is a is the original payload that was encoded into the series of QR codes.

## Configuration

The `Writer` class accepts an optional configuration object that can be used to customize the behavior of the writer. The following options are available:

```typescript
{
  logLevel: 'silent' | 'trace' | 'debug' | 'info' | 'warn' | 'error', // Default: 'silent'
  frameProcessor: FrameProcessor, // Default: new WebRTCProcessor()
}
```
