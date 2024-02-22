'use client';

import { Reader } from '@flipbook/reader';
import { useState, type ChangeEventHandler, type JSX } from 'react';
import { FileProcessor } from '@flipbook/reader/src/processors/file-processor';

export default function File(): JSX.Element {
  const [decoded, setDecoded] = useState<string | null>(null);

  const handleChange = async (event: Event): Promise<void> => {
    const inputElement = event.target as HTMLInputElement;

    try {
      if (inputElement.files?.length) {
        const file = inputElement.files[0];

        if (!file) throw new Error('No File Found!');

        const reader = new Reader({
          frameProcessor: new FileProcessor(file),
        });

        const decodedData = await reader.read();

        setDecoded(decodedData);
      }
    } catch (error) {
      console.error('Error reading QR code:', error);
    }
  };

  return (
    <div>
      <h2>File Processor</h2>

      <br />

      <input
        onChange={
          handleChange as unknown as ChangeEventHandler<HTMLInputElement>
        }
        type="file"
      />

      <br />
      <br />
      <br />

      {decoded ? (
        <pre>
          <code>{decoded}</code>
        </pre>
      ) : (
        'No QR code detected'
      )}
    </div>
  );
}
