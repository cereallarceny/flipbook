'use client';

import { useCallback, useEffect, useState } from 'react';
import { FileProcessor, Reader, WebRTCProcessor } from '@flipbookqr/reader';
import { Button } from './components/button';
import DialogBox from './components/dialog';

interface MethodButtonProps {
  setResults: (results: string) => void;
  children: React.ReactNode;
}

export function CameraScan({
  setResults,
  children,
}: MethodButtonProps): JSX.Element {
  // Store the reader
  const [reader, setReader] = useState<Reader>();

  // Store the dialog state
  const [isOpen, setIsOpen] = useState(false);

  // Store the tracks in state
  const [tracks, setTracks] = useState<MediaStreamTrack[]>([]);

  // When clicking the button, we want to trigger camera selection
  const onGetCameraTracks = useCallback(async () => {
    // Create a new reader instance
    const readerInstance = new Reader({
      frameProcessor: new WebRTCProcessor('camera', {
        audio: false,
        video: true,
      }),
    });

    if (readerInstance.opts.frameProcessor instanceof WebRTCProcessor) {
      const streamTracks =
        await readerInstance.opts.frameProcessor.getStreamTracks();
      setTracks(streamTracks);
      setReader(readerInstance);
      setIsOpen(true);
    }
  }, []);

  // When clicking the track, we want to set the track in the processor and read
  const onTrackClick = useCallback(
    async (track: MediaStreamTrack) => {
      if (reader && reader.opts.frameProcessor instanceof WebRTCProcessor) {
        setIsOpen(false);
        reader.opts.frameProcessor.setStreamTrack(track);
        setResults(await reader.read());
      }
    },
    [reader, setResults]
  );

  return (
    <>
      <Button onClick={onGetCameraTracks}>{children}</Button>
      <DialogBox isOpen={isOpen} setIsOpen={setIsOpen}>
        <div>
          <strong>Select a source:</strong>
          <div className="mt-4 flex flex-col gap-4">
            {tracks.map((track) => (
              <button
                className="w-full p-4 border-2 border-gray-300 bg-gray-100 hover:bg-gray-300 rounded-md transition-colors"
                key={track.id}
                onClick={() => void onTrackClick(track)}
                type="button"
              >
                {track.label}
              </button>
            ))}
          </div>
        </div>
      </DialogBox>
    </>
  );
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
