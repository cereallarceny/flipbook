import { forwardRef, type LegacyRef, type InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

function NumberInputElem(
  { className = '', ...props }: InputHTMLAttributes<HTMLInputElement>,
  ref: LegacyRef<HTMLInputElement>
): JSX.Element {
  return (
    <input
      {...props}
      className={twMerge(
        'text-black w-full rounded-md px-4 py-3 text-md focus:outline-none border-gray-300 border-2 hover:border-gray-500 transition-colors',
        className
      )}
      ref={ref}
      type="number"
    />
  );
}

export default forwardRef(NumberInputElem);
