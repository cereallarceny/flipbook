# @flipbookqr/reader

The Flipbook reader is responsible for reading "flipbooks" created by the [Flipbook writer](../writer). It can be used to decode a series of QR codes into a single payload.

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

```typescript
import { Reader } from '@flipbookqr/reader';

// Create a new instance of the Flipbook reader
const reader = new Reader(optionalConfig);

// Read the Flipbook visible on the screen
const result = await reader.read();
```

The `result` is a is the original payload that was encoded into the series of QR codes.

**Please note:** The default configuration of the reader is to read the QR codes visible on the screen using WebRTC's `getUserMedia` API. This means that the reader will ask for permission to view the user's screen. You may want to use a different `frameProcessor` if you want to read the QR codes from a different source, such as a file. You can change the `frameProcessor` like this:

```ts
import { Reader, FileProcessor } from '@flipbookqr/reader';

const file = // some file

const reader = new Reader({
  frameProcessor: new FileProcessor(file)
});

const result = await reader.read()
```

## Configuration

The `Writer` class accepts an optional configuration object that can be used to customize the behavior of the writer. The following options are available:

```typescript
{
  logLevel: 'silent' | 'trace' | 'debug' | 'info' | 'warn' | 'error', // Default: 'silent'
  frameProcessor: FrameProcessor, // Default: new WebRTCProcessor()
}
```
