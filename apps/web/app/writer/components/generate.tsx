'use client';

import { useCallback, useRef, useState } from 'react';
import { type WriterResult, compose, writer } from '@flipbook/writer';
import Button from '../../components/button';
import Image from 'next/image';

type GenerateProps = {
  code: string;
  size: number;
  setQR: (qr: string) => void;
  setSize: (size: number) => void;
};

export default function Generate({
  code,
  size,
  setSize,
  setQR,
}: GenerateProps): JSX.Element {
  // Are we writing?
  const [isProcessingWrite, setIsProcessingWrite] = useState<boolean>(false);

  // Store the QR codes used to create the final QR code
  const [qrImages, setQRImages] = useState<WriterResult[]>([]);

  // Keep a ref to the canvas
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
      const qrs = await writer(code, { width: size });

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
  }, [size, code]);

  return (
    <>
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
      {isProcessingWrite && (
        <>
          {qrImages.map((item) => (
            <Image
              alt={`Frame ${item.index}`}
              height={size}
              key={item.index}
              src={item.image}
              style={{ display: 'none' }}
              width={size}
            />
          ))}
        </>
      )}
      <canvas
        style={{ display: 'none' }}
        height={size}
        ref={canvasRef}
        width={size}
      />
    </>
  );
}
