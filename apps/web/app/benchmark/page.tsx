'use client';

import { useState, useCallback } from 'react';
import type { FormEventHandler, JSX } from 'react';
import { Writer } from '@flipbookqr/writer';
import { Reader, FileProcessor } from '@flipbookqr/reader';
import Image from 'next/image';

export default function File(): JSX.Element {
  const [decoded, setDecoded] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [text, setText] = useState('');
  const [src, setSrc] = useState('');

  const generate = useCallback(async () => {
    const writer = new Writer();
    const qrs = writer.write(text);

    const blob = writer.toGif(qrs);
    const url = URL.createObjectURL(blob);

    setSrc(url);

    // Create the link
    const link = document.getElementById('download') as HTMLAnchorElement;
    link.download = 'qr.gif';
    link.href = url;
  }, [text]);

  const handleSubmit = async (event: Event): Promise<void> => {
    event.preventDefault();
    setIsDecoding(true);

    try {
      const formData = new FormData(event.target as unknown as HTMLFormElement);
      const file = formData.get('inputFile') as File;

      const reader = new Reader({
        frameProcessor: new FileProcessor(),
      });

      const decodedData = await reader.read(file);

      setDecoded(decodedData);
    } catch (error) {
      // eslint-disable-next-line no-console -- Intentional
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
      {src && (
        <>
          <Image alt="QR code" id="image" src={src} width={200} height={200} />
          <a id="download" type="button">
            Download
          </a>
        </>
      )}

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
