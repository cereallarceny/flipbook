import type { WriterProps } from '@flipbookqr/writer';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { Button } from '../../components/button';
import InputGroup from '../../components/input-group';
import NumberInput from '../../components/number-input';
import SelectInput from '../../components/select-input';

interface ConfigurationFormProps {
  defaultValues: Partial<WriterProps>;
  onSubmit: SubmitHandler<Partial<WriterProps>>;
}

export default function ConfigurationForm({
  defaultValues,
  onSubmit,
}: ConfigurationFormProps): JSX.Element {
  const { register, handleSubmit } = useForm({ defaultValues });

  return (
    <form onSubmit={(...args) => void handleSubmit(onSubmit)(...args)}>
      <p className="font-bold text-xl mb-4">Configuration</p>
      <div className="flex gap-4 flex-col mb-4">
        <InputGroup label="Size (in pixels)">
          <NumberInput {...register('size')} />
        </InputGroup>
        <InputGroup label="Delay (in ms)">
          <NumberInput {...register('gifOptions.delay')} />
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
