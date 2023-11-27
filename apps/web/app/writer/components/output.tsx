'use client';

import { reader } from '@flipbook/reader';
import Image from 'next/image';
import { useCallback, useState } from 'react';

type OutputProps = {
  size: number;
  qr: string;
};

export default function Output({ size, qr }: OutputProps): JSX.Element {
  // Store the processing state
  const [isProcessingRead, setIsProcessingRead] = useState<boolean>(false);

  // Store the read output
  const [output, setOutput] = useState<string>('');

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
      {output !== '' && !isProcessingRead && (
        <pre>
          <code>{output}</code>
        </pre>
      )}
      {qr !== '' && (
        <>
          <Image alt="Flipbook QR" height={size} src={qr} width={size} />
          <button onClick={() => void readQR()} type="button">
            Read QR
          </button>
        </>
      )}
    </div>
  );
}
