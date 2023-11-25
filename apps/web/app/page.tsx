'use client';

import { reader } from '@flipbook/reader';
import { writer, compose, type WriterResult } from '@flipbook/writer';
import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { Roboto_Mono as RobotoMono } from 'next/font/google';
import Hero from './components/hero';

const robotoMono = RobotoMono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
});

const sampleCode = `const fibbonacci = (n: number): number => {
  if (n <= 1) return n;
  return fibbonacci(n - 1) + fibbonacci(n - 2);
}

fibbonacci(10);`;

export default function Page(): JSX.Element {
  // Store the text we want to convert to QR
  const [text, setText] = useState(sampleCode);

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

      // Write all the QR codes
      const qrs = await writer(text, { width: size });

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
  }, [size, text]);

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
          { children: 'Documentation', href: '#' },
          {
            children: (
              <>
                View on GitHub <span aria-hidden="true">→</span>
              </>
            ),
            href: 'https://github.com/cereallarceny/flipbook',
          },
        ]}
        description="Flipbook is a new superset of QR codes that allows for infinite size. By chunking any payload into a series of QR codes, they can be read and stitched together reliably."
        fileName="main.ts"
        title="QR Codes of infinite size"
      >
        <div className="relative">
          <div className={robotoMono.className} style={{ width: '100%' }}>
            <textarea
              className="appearance-none bg-transparent block w-full text-white placeholder-white border-none focus:outline-none resize-none h-72"
              onChange={(e) => {
                setText(e.target.value);
              }}
              value={text}
            />
          </div>
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
