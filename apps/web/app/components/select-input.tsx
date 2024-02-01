import { type LegacyRef, forwardRef, type SelectHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

function SelectInputElem(
  { children, className, ...props }: SelectHTMLAttributes<HTMLSelectElement>,
  ref: LegacyRef<HTMLSelectElement>
): JSX.Element {
  return (
    <select
      {...props}
      className={twMerge(
        'block w-full rounded-md border-2 px-4 py-3 text-md focus:outline-none border-gray-300 border-2 hover:border-gray-500 transition-colors',
        className
      )}
      ref={ref}
    >
      {children}
    </select>
  );
}

export default forwardRef(SelectInputElem);
