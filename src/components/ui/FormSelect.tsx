import { Icon } from '@iconify/react';
import type { SelectOption } from '@/lib/types';

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  error?: string;
  id?: string;
}

const baseSelectClass =
  'w-full px-4 py-2.5 md:py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all text-[14px] md:text-[15px] bg-surface-elevated appearance-none';

export default function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  id,
}: FormSelectProps) {
  const selectId = id ?? `select-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div>
      <label
        htmlFor={selectId}
        className="block text-[14px] md:text-[15px] font-medium text-text-primary mb-1.5 text-right"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseSelectClass} ${
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-200 bg-red-50'
              : 'border-border focus:border-accent'
          } ${!value ? 'text-text-muted' : 'text-text-primary'}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
          <Icon icon="lucide:chevron-down" className="w-3 h-3" />
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-[12px] text-red-500 text-right flex items-center justify-start gap-1">
          <Icon icon="lucide:alert-circle" className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
