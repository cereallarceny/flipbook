'use client';

import { useMemo, useState } from 'react';
import { Writer, type WriterProps } from '@flipbookqr/writer';
import { fileTypes, type FileType } from './filetypes';
import Editor from './editor';
import Generate from './generate';
import Output from './output';

const sampleCode = `const fibbonacci = (n: number): number => {
  if (n <= 1) return n;
  return fibbonacci(n - 1) + fibbonacci(n - 2);
}

fibbonacci(10);`;

export default function Playground(): JSX.Element {
  // The result of the editor
  const [code, setCode] = useState<string>(sampleCode);

  // Store the file type
  const [fileName, setFileName] = useState<FileType['value']>('typescript');

  // Get the current file type
  const currentFileType = useMemo(
    () => fileTypes.find((fileType) => fileType.value === fileName),
    [fileName]
  );

  // Store the QR code
  const [qr, setQR] = useState<string>('');

  // Store the configuration
  const [configuration, setConfiguration] = useState<Partial<WriterProps>>({
    ...new Writer().opts,
  });

  if (qr !== '') {
    return <Output configuration={configuration} qr={qr} setQR={setQR} />;
  }

  return (
    <div className="overflow-hidden rounded-tl-xl bg-gray-900">
      <div className="flex bg-gray-800/40 ring-1 ring-white/5">
        <div className="-mb-px flex text-sm font-medium leading-6 text-gray-400">
          <div className="border-b border-r border-b-white/20 border-r-white/10 bg-white/5 px-4 py-2 text-white">
            <select
              className="bg-transparent block w-full border-0 py-2 pl-2 pr-8 text-white sm:text-sm sm:leading-6 focus:outline-none"
              defaultValue={currentFileType?.value}
              id="location"
              name="location"
              onChange={(e) => {
                setFileName(e.target.value);
              }}
            >
              {fileTypes.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="px-6 pb-14 pt-6 relative">
        <div className="relative">
          <Editor
            fileName={fileName}
            onChange={(value) => {
              if (value) setCode(value);
            }}
            sampleCode={sampleCode}
          />
          <Generate
            code={code}
            configuration={configuration}
            setConfiguration={setConfiguration}
            setQR={setQR}
          />
        </div>
      </div>
    </div>
  );
}
