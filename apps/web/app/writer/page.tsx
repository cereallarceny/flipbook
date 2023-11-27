'use client';

import { useState } from 'react';
import GitHubButton from 'react-github-btn';
import Hero from './hero';
import { type FileType, fileTypes } from '../lib/filetypes';
import Button from '../components/button';
import Editor from './components/editor';
import Generate from './components/generate';
import Output from './components/output';
import { title, description } from '../content';

const sampleCode = `const fibbonacci = (n: number): number => {
  if (n <= 1) return n;
  return fibbonacci(n - 1) + fibbonacci(n - 2);
}

fibbonacci(10);`;

// ----- UI/UX ----- //
// TODO: Add a proper readme
// TODO: Add link to download reader as an app (as the homepage, which is consumer-facing)

// ----- Features ----- //
// TODO: Add more time between frames
// TODO: Find a better way to process more than 2-3 frames
// TODO: Add an "advanced mode" where you can pass a lot more options
// TODO: Look into performance issues with screen reading
// TODO: Release reader and writer as separate packages to NPM: @flipbook/reader and @flipbook/writer

// ----- Final Steps ----- //
// TODO: Create a series of "help wanted" issues for people to contribute to
// - Bindings for other languages?
// TODO: Post to HN

export default function Page(): JSX.Element {
  // The result of the editor
  const [code, setCode] = useState<string>(sampleCode);

  // Store the file type
  const [fileName, setFileName] = useState<FileType['value']>('typescript');

  // Store the QR code
  const [qr, setQR] = useState<string>('');

  // Store the size of the QR code
  const [size, setSize] = useState<number>(512);

  return (
    <div>
      <Hero
        buttons={[
          {
            children: (
              <Button as="a" href="https://github.com/cereallarceny/flipbook">
                View on Github
              </Button>
            ),
          },
          {
            children: (
              <div className="-mb-1">
                <GitHubButton
                  aria-label="Star cereallarceny/flipbook on GitHub"
                  data-icon="octicon-star"
                  data-show-count="true"
                  data-size="large"
                  href="https://github.com/cereallarceny/flipbook"
                  key="star"
                >
                  Star
                </GitHubButton>
              </div>
            ),
          },
          {
            children: (
              <div className="-mb-1">
                <GitHubButton
                  aria-label="Sponsor @cereallarceny on GitHub"
                  data-icon="octicon-heart"
                  data-size="large"
                  href="https://github.com/sponsors/cereallarceny"
                  key="sponsor"
                >
                  Sponsor
                </GitHubButton>
              </div>
            ),
          },
        ]}
        description={description}
        fileName={fileName}
        fileTypes={fileTypes}
        setFileName={setFileName}
        title={title}
      >
        <div className="relative">
          <Editor
            fileName={fileName}
            onChange={(value) => {
              if (value) setCode(value);
            }}
            sampleCode={sampleCode}
          />
          <Generate code={code} setQR={setQR} setSize={setSize} size={size} />
        </div>
      </Hero>
      <Output size={size} qr={qr} />
    </div>
  );
}
