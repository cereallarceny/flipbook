'use client';

import { Reader } from '@flipbookqr/reader';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { Writer, type WriterProps } from '@flipbookqr/writer';
import { Button, IconButton } from '../../components/button';
import useNavigatorSupport from '../../components/support';

interface OutputProps {
  code: string;
  configuration: Partial<WriterProps>;
  reset: () => void;
}

const GIF_NAME = 'flipbook-qr.gif';

export default function Output({
  code,
  configuration,
  reset,
}: OutputProps): JSX.Element {
  // Get the navigator support
  const supports = useNavigatorSupport();

  // Store a reference to the canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Store the read output
  const [output, setOutput] = useState<string>('');

  // A function to read a QR on the screen
  const readQR = useCallback(async () => {
    // Set output to "reading"
    setOutput('Reading...');

    // Read the QR code
    const reader = new Reader({ logLevel: configuration.logLevel });
    const readResult = await reader.read();

    // Set the output
    setOutput(readResult);
  }, [configuration]);

  // A function to download the current QR code as a GIF
  const downloadQR = useCallback(async () => {
    // Create a new writer
    const writer = new Writer(configuration);

    // Write the QR code
    const qrs = writer.write(code);

    // Compose the QR code GIF
    const blob = writer.toGif(qrs);

    // Create the link
    const link = document.createElement('a');
    link.download = GIF_NAME;
    link.href = URL.createObjectURL(blob);

    // Add the link to the body
    document.body.appendChild(link);

    // Click the link
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  }, []);

  // A function to reset us back to the editor
  const resetOutput = useCallback(() => {
    // Reset the output
    setOutput('');

    // Reset the QR code
    reset();
  }, []);

  // When the component mounts, write the QR code
  useEffect(() => {
    // Create a new writer
    const writer = new Writer(configuration);

    // Write the QR code
    const qrs = writer.write(code);

    // Compose the QR code onto the canvas
    writer.toCanvas(qrs, canvasRef.current!);
  }, [code, configuration]);

  return (
    <div className="bg-white flex flex-col items-center rounded-tl-xl gap-4 py-8">
      <canvas ref={canvasRef} />
      {output !== '' && (
        <div className="w-full px-8 my-2">
          <p className="font-bold mb-1">Results:</p>
          <pre className="overflow-x-hidden overflow-y-auto max-h-60">
            <code>{output}</code>
          </pre>
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {supports.getDisplayMedia && (
          <Button onClick={() => void readQR()} type="button">
            Read QR
          </Button>
        )}
        <Button onClick={downloadQR} type="button">
          Download (as GIF)
        </Button>
        <Button as={Link as unknown as 'a'} color="secondary" href="/">
          Download Reader
        </Button>
        <IconButton
          color="secondary"
          onClick={resetOutput}
          role="spinbutton"
          type="button"
        >
          <ArrowPathIcon className="w-6 h-6" />
        </IconButton>
      </div>
    </div>
  );
}
