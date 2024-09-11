'use client';

import { useCallback, useState } from 'react';
import { Writer, type WriterProps } from '@flipbookqr/writer';
import { CogIcon } from '@heroicons/react/24/solid';
import { Button, IconButton } from '../../components/button';
import DialogBox from '../../components/dialog';
import ConfigurationForm from './configuration-form';

interface GenerateProps {
  code: string;
  setQR: (qr: string) => void;
  configuration: Partial<WriterProps>;
  setConfiguration: (config: Partial<WriterProps>) => void;
}

export default function Generate({
  code,
  setQR,
  configuration,
  setConfiguration,
}: GenerateProps): JSX.Element {
  // State whether the dialog is open
  const [isOpen, setIsOpen] = useState(false);

  // A function to create the QR code
  const createQR = useCallback(() => {
    try {
      // Resetting whatever QR code was there before
      setQR('');

      // Write the QR code
      const writer = new Writer(configuration);
      const qrs = writer.write(code);
      const result = writer.compose(qrs);

      // Set the QR code
      setQR(result);
    } catch (e) {
      // eslint-disable-next-line no-console -- Intentional
      console.error(e);
    }
  }, [code, setQR, configuration]);

  // A function to launch the configuration dialog
  const launchDialog = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <>
      <DialogBox isOpen={isOpen} setIsOpen={setIsOpen}>
        <ConfigurationForm
          defaultValues={configuration}
          onSubmit={(data) => {
            setConfiguration({ ...configuration, ...data });
            setIsOpen(false);
          }}
        />
      </DialogBox>
      <div className="absolute right-0 -bottom-8 flex align-middle gap-4">
        <IconButton color="secondary" onClick={launchDialog} type="button">
          <CogIcon className="h-6 w-6" />
        </IconButton>
        <Button onClick={createQR} type="button">
          Generate Flipbook
        </Button>
      </div>
    </>
  );
}
