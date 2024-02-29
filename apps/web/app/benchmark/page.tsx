'use client';

import Image from 'next/image';
import { useState, useCallback, useMemo } from 'react';
import type { FormEventHandler, JSX } from 'react';
import { Writer } from '@flipbook/writer';
import { Reader } from '@flipbook/reader';
import { FileProcessor } from '@flipbook/reader/src/processors/file-processor';

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

  const buttonStyles = useMemo(
    () => ({
      background: 'blue',
      color: 'white',
      padding: '8px 12px',
      borderRadius: 8,
    }),
    []
  );

  return (
    <>
      <textarea
        id="textarea"
        onChange={(e) => {
          setText(e.target.value);
        }}
        required
        value={text}
      />
      <br />
      <button
        id="generate"
        onClick={() => void generate()}
        style={{ ...buttonStyles }}
        type="button"
      >
        Generate Flipbook
      </button>
      <br />
      {qr ? (
        <div>
          <Image alt="QR Code" height={512} id="image" src={qr} width={512} />
        </div>
      ) : null}

      <br />
      <br />
      <hr />
      <br />
      <br />

      <form
        onSubmit={handleSubmit as unknown as FormEventHandler<HTMLFormElement>}
      >
        <input id="upload" name="inputFile" required type="file" />
        <button style={{ ...buttonStyles }} type="submit" id="decode">
          Decode Flipbook
        </button>

        <br />
        {decoded && !isDecoding ? (
          <pre>
            <code>{decoded}</code>
          </pre>
        ) : null}
        {isDecoding ? (
          <span id="in-progress-decoding">Decoding Flipbook...</span>
        ) : null}
      </form>
    </>
  );
}
