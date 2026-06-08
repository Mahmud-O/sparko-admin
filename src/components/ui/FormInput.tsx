import { Icon } from '@iconify/react';

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  dir?: 'rtl' | 'ltr';
  className?: string;
  error?: string;
  /** @deprecated Use `name` prop instead — auto-generated from `name` if omitted */
  id?: string;
}

const baseInputClass =
  'w-full px-4 py-2.5 md:py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-accent/30 text-text-primary placeholder-text-muted transition-all text-[14px] md:text-[15px]';

export default function FormInput({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
  dir = 'rtl',
  className,
  error,
  id,
}: FormInputProps) {
  const inputId = id ?? `input-${name}`;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-[14px] md:text-[15px] font-medium text-text-primary mb-1.5 text-right"
      >
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        dir={dir}
        className={`${baseInputClass} ${
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-200 bg-red-50'
            : 'border-border focus:border-accent'
        } ${disabled ? 'bg-surface-elevated text-text-muted cursor-not-allowed' : ''} ${className ?? ''}`}
      />
      {error && (
        <p className="mt-1.5 text-[12px] text-red-500 text-right flex items-center justify-start gap-1">
          <Icon icon="lucide:alert-circle" className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
