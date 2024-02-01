interface InputGroupProps {
  className?: string;
  label: string;
  children: React.ReactNode;
}

export default function InputGroup({
  className = '',
  label,
  children,
}: InputGroupProps): JSX.Element {
  return (
    <div className={className}>
      <label className="block text-sm font-medium leading-6 text-gray-900">
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
