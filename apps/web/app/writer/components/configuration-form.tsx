import type { WriterProps } from '@flipbookqr/writer';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { Button } from '../../components/button';
import InputGroup from '../../components/input-group';
import NumberInput from '../../components/number-input';
import SelectInput from '../../components/select-input';
import { ErrorCorrectionLevel } from '@nuintun/qrcode';
import { useMemo } from 'react';

interface ConfigurationFormProps {
  defaultValues: Partial<WriterProps>;
  onSubmit: SubmitHandler<Partial<WriterProps>>;
}

export default function ConfigurationForm({
  defaultValues,
  onSubmit,
}: ConfigurationFormProps): JSX.Element {
  const { register, handleSubmit } = useForm({ defaultValues });

  const errorLevels = useMemo(() => {
    const keys = Object.keys(ErrorCorrectionLevel);

    return keys.reduce((acc, key) => {
      if (!isNaN(Number(key))) {
        return acc;
      }

      return {
        ...acc,
        [key]: ErrorCorrectionLevel[key as keyof typeof ErrorCorrectionLevel],
      };
    }, {});
  }, []);

  return (
    <form onSubmit={(...args) => void handleSubmit(onSubmit)(...args)}>
      <p className="font-bold text-xl mb-4">Configuration</p>
      <div className="flex gap-4 flex-col mb-4">
        <InputGroup label="Error Correction Level">
          <SelectInput {...register('errorCorrectionLevel')}>
            {Object.keys(errorLevels).map((key) => (
              <option
                key={key}
                value={errorLevels[key as keyof typeof errorLevels]}
              >
                {key}
              </option>
            ))}
          </SelectInput>
        </InputGroup>
        <InputGroup label="Encoding Hint">
          <SelectInput {...register('encodingHint')}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </SelectInput>
        </InputGroup>
        <InputGroup label="Version">
          <NumberInput {...register('version')} min={1} max={40} />
        </InputGroup>
        <InputGroup label="Module Size">
          <NumberInput {...register('moduleSize')} min={1} />
        </InputGroup>
        <InputGroup label="Margin">
          <NumberInput {...register('margin')} min={0} />
        </InputGroup>
        <InputGroup label="Delay (in ms)">
          <NumberInput {...register('delay')} />
        </InputGroup>
        <InputGroup label="Split Length">
          <NumberInput {...register('splitLength')} min={1} />
        </InputGroup>
        <InputGroup label="Log Level">
          <SelectInput {...register('logLevel')}>
            <option value="trace">Trace</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
            <option value="silent">Silent</option>
          </SelectInput>
        </InputGroup>
      </div>
      <Button type="submit">Save Configuration</Button>
    </form>
  );
}
