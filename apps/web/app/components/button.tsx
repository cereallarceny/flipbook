import { twMerge } from 'tailwind-merge';

type ButtonProps<T extends React.ElementType> =
  React.ComponentPropsWithoutRef<T> & {
    as?: T;
    color?: 'primary' | 'secondary';
    className?: string;
  };

function BaseButton<T extends React.ElementType>({
  as: asComponent,
  className = '',
  color = 'primary',
  ...props
}: ButtonProps<T>): JSX.Element {
  // The `as` prop allows us to render a different component
  const Component = asComponent || 'button';

  // If the button has an `href` prop and it's external, we want to launch it in a new window
  const isLink: boolean =
    'href' in props &&
    Boolean(
      (props as React.ComponentPropsWithoutRef<'a'>).href?.includes('http')
    );

  const colorClasses = {
    primary: 'bg-indigo-500 hover:bg-indigo-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-black',
  };

  return (
    <Component
      className={twMerge(
        'rounded-md font-semibold focus:outline-none transition-colors',
        colorClasses[color],
        className
      )}
      rel={isLink ? 'noreferrer' : undefined}
      target={isLink ? '_blank' : undefined}
      {...props}
    />
  );
}

export function Button<T extends React.ElementType>({
  as: asComponent,
  className = '',
  ...props
}: ButtonProps<T>): JSX.Element {
  return (
    <BaseButton
      as={asComponent || 'button'}
      className={twMerge('px-4 py-3', className)}
      {...props}
    />
  );
}

export function IconButton<T extends React.ElementType>({
  as: asComponent,
  className = '',
  ...props
}: ButtonProps<T>): JSX.Element {
  return (
    <BaseButton
      as={asComponent || 'button'}
      className={twMerge(
        'inline-flex items-center justify-center w-12 h-12',
        className
      )}
      {...props}
    />
  );
}
