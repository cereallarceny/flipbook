'use client';

import { reader } from '@flipbook/reader';
import { writer, compose, type WriterResult } from '@flipbook/writer';
import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import GitHubButton from 'react-github-btn';
import { Editor } from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import Hero from '../components/hero';
import { type FileType, fileTypes } from '../lib/filetypes';

const sampleCode = `const fibbonacci = (n: number): number => {
  if (n <= 1) return n;
  return fibbonacci(n - 1) + fibbonacci(n - 2);
}

fibbonacci(10);`;

// ----- UI/UX ----- //
// TODO: Make the outputted QR code UX better
// TODO: Make various components for buttons, inputs, etc.
// TODO: Add a proper readme
// TODO: Add link to download reader as an app

// ----- Features ----- //
// TODO: Add more time between frames
// TODO: Find a better way to process more than 2-3 frames
// TODO: Add an "advanced mode" where you can pass a lot more options
// TODO: Look into performance issues with screen reading
// TODO: Release reader and writer as separate packages to NPM: @flipbook/reader and @flipbook/writer

// ----- Final Steps ----- //
// TODO: Create a series of "help wanted" issues for people to contribute to
// - Bindings for other languages?
// TODO: Post to HN

const EDITOR_THEME = 'flipbook-theme';

export default function Page(): JSX.Element {
  // Store the text we want to convert to QR
  const editorRef = useRef<editor.IStandaloneCodeEditor>();

  // Store the file type
  const [fileName, setFileName] = useState<FileType['value']>('typescript');

  // Store the QR codes used to create the final QR code
  const [qrImages, setQRImages] = useState<WriterResult[]>([]);

  // Store the QR code
  const [qr, setQR] = useState<string>('');

  // Store the processing state
  const [isProcessingWrite, setIsProcessingWrite] = useState<boolean>(false);
  const [isProcessingRead, setIsProcessingRead] = useState<boolean>(false);

  // Store the size of the QR code
  const [size, setSize] = useState<number>(512);

  // Store the read output
  const [output, setOutput] = useState<string>('');

  // Store the canvas element
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // A function to create the QR code
  const createQR = useCallback(async (): Promise<void> => {
    try {
      // If there's no canvas element, return
      if (canvasRef.current === null) return;

      // Set the processing state to true
      setIsProcessingWrite(true);

      // Show the canvas
      setQR('');
      canvasRef.current.width = size;
      canvasRef.current.height = size;

      // Get the value of the editor
      if (editorRef.current === undefined) return;
      const value = editorRef.current.getValue();

      // Write all the QR codes
      const qrs = await writer(value, { width: size });

      // Set the QR codes
      setQRImages(qrs);

      // Compose the QR codes into a single image
      const composed = await compose(
        qrs.map((item) => item.image),
        canvasRef.current,
        { width: size, height: size }
      );

      // Set the QR code
      setQR(composed);

      // Hide the canvas
      canvasRef.current.width = 0;
      canvasRef.current.height = 0;

      // Set the processing state to false
      setIsProcessingWrite(false);
    } catch (e) {
      console.error(e);
    }
  }, [size, editorRef]);

  // A function to read a QR on the screen
  const readQR = useCallback(async (): Promise<void> => {
    // Set the processing state to true
    setIsProcessingRead(true);

    // Read the QR code
    const readResult = await reader();

    // Set the output
    setOutput(readResult);

    // Set the processing state to false
    setIsProcessingRead(false);
  }, []);

  return (
    <div>
      <Hero
        buttons={[
          {
            id: 1,
            children: 'View on Github',
            href: 'https://github.com/cereallarceny/flipbook',
          },
          {
            id: 2,
            children: (
              <div className="-mb-1">
                <GitHubButton
                  aria-label="Star cereallarceny/flipbook on GitHub"
                  data-icon="octicon-star"
                  data-show-count="true"
                  data-size="large"
                  href="https://github.com/cereallarceny/flipbook"
                  key="star"
                >
                  Star
                </GitHubButton>
              </div>
            ),
          },
          {
            id: 3,
            children: (
              <div className="-mb-1">
                <GitHubButton
                  aria-label="Sponsor @cereallarceny on GitHub"
                  data-icon="octicon-heart"
                  data-size="large"
                  href="https://github.com/sponsors/cereallarceny"
                  key="sponsor"
                >
                  Sponsor
                </GitHubButton>
              </div>
            ),
          },
        ]}
        description="Flipbook is a superset of QR codes that allows for infinitely sized payloads. Download apps, rich-text, and more without the need for an internet connection."
        fileName={fileName}
        fileTypes={fileTypes}
        setFileName={setFileName}
        title="QR Codes of infinite size"
      >
        <div className="relative">
          <Editor
            className="h-64 mb-10 mt-2 -ml-4"
            defaultValue={sampleCode}
            language={fileName}
            loading={
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-12 h-12 mt-8 mb-12 text-gray-200 animate-spin dark:text-gray-600 fill-indigo-500"
                  fill="none"
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            }
            onMount={(e, m) => {
              editorRef.current = e;

              m.editor.defineTheme(EDITOR_THEME, {
                base: 'vs-dark',
                colors: {
                  'editor.background': '#111827',
                },
                inherit: true,
                rules: [
                  {
                    background: '111827',
                    token: '',
                  },
                ],
              });

              m.editor.setTheme(EDITOR_THEME);
            }}
            options={{
              fontSize: 16,
              minimap: {
                enabled: false,
              },
              scrollBeyondLastLine: false,
              scrollbar: {
                horizontal: 'hidden',
                vertical: 'visible',
              },
              wordWrap: 'on',
            }}
          />
          {!isProcessingWrite && (
            <div className="absolute right-0 -bottom-8 flex align-middle">
              <div className="relative mr-4 rounded-md overflow-hidden">
                <input
                  className=" text-black px-4 py-2 text-md w-28 pr-10 focus:outline-none"
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                  }}
                  type="number"
                  value={size}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 sm:text-sm">px</span>
                </div>
              </div>
              <button
                className="rounded-md bg-indigo-500 px-4 py-2 text-md font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline"
                onClick={() => void createQR()}
                type="button"
              >
                Generate Flipbook
              </button>
            </div>
          )}
        </div>
      </Hero>
      {output !== '' && !isProcessingRead && (
        <pre>
          <code>{output}</code>
        </pre>
      )}
      {qr !== '' && !isProcessingWrite && (
        <>
          <Image alt="Flipbook QR" height={size} src={qr} width={size} />
          <button onClick={() => void readQR()} type="button">
            Read QR
          </button>
        </>
      )}
      {Boolean(isProcessingWrite) && (
        <>
          {qrImages.map((item) => (
            <Image
              alt={`Frame ${item.index}`}
              height={0}
              key={item.index}
              src={item.image}
              width={0}
            />
          ))}
        </>
      )}
      <canvas height={0} ref={canvasRef} width={0} />
    </div>
  );
}
