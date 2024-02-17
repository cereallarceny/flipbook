'use client';

import { Reader } from '@flipbook/reader';
import { Writer } from '@flipbook/writer';
import Image from 'next/image';
import { useCallback, useState } from 'react';

export default function Page(): JSX.Element {
  const [text, setText] = useState('');
  const [qr, setQr] = useState('');
  const [readResult, setReadResult] = useState('');

  const generate = useCallback(async () => {
    const writer = new Writer();
    const qrs = await writer.write(text);
    const result = await writer.compose(qrs);

    setQr(result);
  }, [text]);

  const read = useCallback(async () => {
    const reader = new Reader();
    const result = await reader.read();

    setReadResult(result);
  }, []);

  return (
    <div>
      <textarea
        id="textarea"
        onChange={(e) => {
          setText(e.target.value);
        }}
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
          <button id="read-qr" onClick={() => void read()} type="button">
            Read Flipbook
          </button>
          <div id="read-result">{readResult}</div>
        </div>
      ) : null}
    </div>
  );
}
