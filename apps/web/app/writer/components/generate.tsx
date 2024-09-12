'use client';

import { useCallback, useState } from 'react';
import { type WriterProps } from '@flipbookqr/writer';
import { CogIcon } from '@heroicons/react/24/solid';
import { Button, IconButton } from '../../components/button';
import DialogBox from '../../components/dialog';
import ConfigurationForm from './configuration-form';

interface GenerateProps {
  configuration: Partial<WriterProps>;
  setConfiguration: (config: Partial<WriterProps>) => void;
  createQR: () => void;
}

export default function Generate({
  configuration,
  setConfiguration,
  createQR,
}: GenerateProps): JSX.Element {
  // State whether the dialog is open
  const [isOpen, setIsOpen] = useState(false);

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
