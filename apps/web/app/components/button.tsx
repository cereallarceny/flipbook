type ButtonProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
} & React.ComponentPropsWithoutRef<T>;

export default function Button<T extends React.ElementType>({
  as: asComponent,
  className,
  ...props
}: ButtonProps<T>): JSX.Element {
  // The `as` prop allows us to render a different component
  const Component = asComponent || 'button';

  // The `extra` object allows us to add extra props to the component
  const extra: any = {};

  // If the button has an `href` prop and it's external, we want to launch it in a new window
  if ('href' in props && props.href.includes('http')) {
    extra['rel'] = 'noreferrer';
    extra['target'] = '_blank';
  }

  return (
    <Component
      className={`rounded-md bg-indigo-500 px-4 py-3 font-semibold text-white hover:bg-indigo-600 focus:outline-none transition-colors ${
        className || ''
      }`}
      {...extra}
      {...props}
    />
  );
}
