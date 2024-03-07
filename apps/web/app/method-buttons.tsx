'use client';

import { useCallback, useEffect, useState } from 'react';
import { FileProcessor, Reader, WebRTCProcessor } from '@flipbook/reader';
import { Button } from './components/button';

interface MethodButtonProps {
  setResults: (results: string) => void;
  children: React.ReactNode;
}

export function CameraScan({
  setResults,
  children,
}: MethodButtonProps): JSX.Element {
  // When clicking the button, we want to trigger a camera capture
  const onClick = useCallback(async () => {
    const reader = new Reader({
      frameProcessor: new WebRTCProcessor('camera', {
        audio: false,
        video: true,
      }),
    });
    setResults(await reader.read());
  }, [setResults]);

  return <Button onClick={onClick}>{children}</Button>;
}

export function Upload({
  setResults,
  children,
}: MethodButtonProps): JSX.Element {
  // Store the file in state
  const [file, setFile] = useState<File | null>(null);

  // When clicking the button, we want to trigger a file input
  const onClick = useCallback(() => {
    // Create an input element and trigger a click event
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();

    // When the input changes, set the file in state
    input.addEventListener('change', () => {
      const f = input.files?.[0];
      if (f) setFile(f);
    });

    // Clean up the input
    input.remove();
  }, []);

  // When the file changes, we want to read the file and set the results
  useEffect(() => {
    const readFile = async (f: File | null): Promise<string | undefined> => {
      if (!f) return;

      const reader = new Reader({
        frameProcessor: new FileProcessor(f),
      });

      setResults(await reader.read());
    };

    try {
      void readFile(file);
    } catch (error) {
      setResults((error as Error).message);
    }
  }, [file, setResults]);

  return <Button onClick={onClick}>{children}</Button>;
}

export function ScreenScan({
  setResults,
  children,
}: MethodButtonProps): JSX.Element {
  // When clicking the button, we want to trigger a screen capture
  const onClick = useCallback(async () => {
    const reader = new Reader();
    setResults(await reader.read());
  }, [setResults]);

  return <Button onClick={onClick}>{children}</Button>;
}
