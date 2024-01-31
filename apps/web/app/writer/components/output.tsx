'use client';

import { Reader } from '@flipbook/reader';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { Button, IconButton } from '../../components/button';

interface OutputProps {
  qr: string;
  setQR: (qr: string) => void;
}

const GIF_NAME = 'flipbook-qr.gif';

export default function Output({ qr, setQR }: OutputProps): JSX.Element {
  // Store the read output
  const [output, setOutput] = useState<string>('');

  // A function to read a QR on the screen
  const readQR = useCallback(async () => {
    // Set output to "reading"
    setOutput('Reading...');

    // Read the QR code
    const reader = new Reader({
      logLevel: 'debug',
      /* frameProcessor: new AdvancedProcessor() // defaults to "new CanvasProcesstor()" */
    });
    const readResult = await reader.read();

    // Set the output
    setOutput(readResult);
  }, []);

  // A function to download the current QR code as a GIF
  const downloadQR = useCallback(() => {
    // Create the link
    const link = document.createElement('a');
    link.download = GIF_NAME;
    link.href = qr;

    // Add the link to the body
    document.body.appendChild(link);

    // Click the link
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  }, [qr]);

  // A function to reset us back to the editor
  const reset = useCallback(() => {
    // Reset the output
    setOutput('');

    // Reset the QR code
    setQR('');
  }, [setQR]);

  return (
    <div>
      {qr !== '' && (
        <div className="bg-white flex flex-col items-center rounded-tl-xl gap-4 py-8">
          <Image alt="Flipbook QR" height={200} src={qr} width={200} />
          {output !== '' && (
            <div className="w-full px-8 my-2">
              <p className="font-bold mb-1">Results:</p>
              <pre className="overflow-x-hidden overflow-y-auto max-h-60">
                <code>{output}</code>
              </pre>
            </div>
          )}
          <div className="flex flex-row items-center gap-4">
            <Button onClick={() => void readQR()} type="button">
              Read QR
            </Button>
            <Button
              onClick={() => {
                downloadQR();
              }}
              type="button"
            >
              Download (as GIF)
            </Button>
            <Button as={Link as unknown as 'a'} color="secondary" href="/">
              Download Reader
            </Button>
            <IconButton
              color="secondary"
              onClick={() => {
                reset();
              }}
              role="spinbutton"
              type="button"
            >
              <ArrowPathIcon className="w-6 h-6" />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
}
