'use client';

import { useState } from 'react';
import { ArrowPathIcon, ClipboardIcon } from '@heroicons/react/24/solid';
import { homepage } from './content';
import { CameraScan, ScreenScan, Upload } from './method-buttons';
import { IconButton } from './components/button';

export default function Hero(): JSX.Element {
  const [results, setResults] = useState('');

  return (
    <div className="px-6 lg:px-8">
      <div className="mx-auto max-w-3xl py-24 sm:py-36 lg:py-48">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full aspect-video max-w-3xl mx-auto mb-8 lg:mb-12"
          referrerPolicy="strict-origin-when-cross-origin"
          src="https://www.youtube.com/embed/D4QD9DaISEs?si=-0S6GmPbqu6t9GGh&amp;controls=0"
          title="Flipbook Video"
        />
        <div className="hidden sm:mb-8 sm:flex sm:justify-center">
          <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
            {homepage.version}
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            {homepage.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {homepage.description}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <CameraScan setResults={setResults}>{homepage.camera}</CameraScan>
            <Upload setResults={setResults}>{homepage.upload}</Upload>
            <ScreenScan setResults={setResults}>{homepage.screen}</ScreenScan>
          </div>
          {results ? (
            <div>
              <div className="mt-10 overflow-auto h-48 text-left border-2 p-4 rounded-md">
                <pre>
                  <code>{results}</code>
                </pre>
              </div>
              <div className="mt-4 flex items-center justify-center gap-x-4">
                <IconButton
                  color="secondary"
                  onClick={async () => {
                    await navigator.clipboard.writeText(results);
                  }}
                >
                  <ClipboardIcon className="w-6 h-6" />
                </IconButton>
                <IconButton
                  color="secondary"
                  onClick={() => {
                    setResults('');
                  }}
                >
                  <ArrowPathIcon className="w-6 h-6" />
                </IconButton>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
