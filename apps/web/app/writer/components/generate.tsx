'use client';

import { useCallback } from 'react';
import { Writer } from '@flipbook/writer';
import { Button } from '../../components/button';

interface GenerateProps {
  code: string;
  size: number;
  setQR: (qr: string) => void;
  setSize: (size: number) => void;
}

export default function Generate({
  code,
  size,
  setSize,
  setQR,
}: GenerateProps): JSX.Element {
  // A function to create the QR code
  const createQR = useCallback(async (): Promise<void> => {
    try {
      // Resetting whatever QR code was there before
      setQR('');

      // Write the QR code
      const writer = new Writer({ size, logLevel: 'debug' });
      const qrs = await writer.write(code);
      const result = await writer.newCompose(qrs);

      // Set the QR code
      setQR(result);
    } catch (e) {
      console.error(e);
    }
  }, [code, setQR, size]);

  return (
    <div className="absolute right-0 -bottom-8 flex align-middle">
      <div className="relative mr-4 rounded-md overflow-hidden">
        <input
          className=" text-black px-4 py-3 text-md w-28 pr-10 focus:outline-none"
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
      <Button onClick={() => void createQR()} type="button">
        Generate Flipbook
      </Button>
    </div>
  );
}
