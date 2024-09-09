'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import type { FormEventHandler, JSX } from 'react';
import { Writer } from '@flipbookqr/writer';
import { Reader, FileProcessor } from '@flipbookqr/reader';

export default function File(): JSX.Element {
  const [decoded, setDecoded] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [text, setText] = useState('');
  const [qr, setQr] = useState('');

  const generate = useCallback(async () => {
    setQr('');
    const writer = new Writer();
    const qrs = await writer.write(text);
    const result = await writer.compose(qrs);

    setQr(result);
  }, [text]);

  const handleSubmit = async (event: Event): Promise<void> => {
    event.preventDefault();
    setIsDecoding(true);

    try {
      const formData = new FormData(event.target as unknown as HTMLFormElement);
      const file = formData.get('inputFile') as File;

      const reader = new Reader({
        frameProcessor: new FileProcessor(file),
      });

      const decodedData = await reader.read();

      setDecoded(decodedData);
    } catch (error) {
      console.error('Error reading QR code:', error);
    } finally {
      setIsDecoding(false);
    }
  };

  return (
    <div className="pt-24 mx-auto max-w-7xl px-6 lg:px-8">
      <textarea
        id="textarea"
        onChange={(e) => {
          setText(e.target.value);
        }}
        required
        value={text}
      />
      <br />
      <button id="generate" onClick={() => void generate()} type="button">
        Generate Flipbook
      </button>
      <br />
      {qr ? (
        <div>
          <Image alt="QR Code" height={512} id="image" src={qr} width={512} />
        </div>
      ) : null}

      <hr style={{ marginTop: 20, marginBottom: 20 }} />

      <form
        onSubmit={handleSubmit as unknown as FormEventHandler<HTMLFormElement>}
      >
        <input id="upload" name="inputFile" required type="file" />
        <br />
        <button id="decode" type="submit">
          Decode Flipbook
        </button>
        <br />
        {decoded && !isDecoding ? (
          <pre>
            <code id="decoded">{decoded}</code>
          </pre>
        ) : null}
      </form>
    </div>
  );
}
