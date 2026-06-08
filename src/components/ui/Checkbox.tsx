interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  className?: string;
}

export default function Checkbox({
  id,
  checked,
  onChange,
  label,
  className = "",
}: CheckboxProps) {
  return (
    <div className={`flex items-center justify-start gap-3 ${className}`}>
      <div className="relative flex items-center shrink-0">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer appearance-none w-5 h-5 border-[1.5px] border-slate-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/30 checked:bg-primary checked:border-primary cursor-pointer transition-colors"
        />
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <label
        htmlFor={id}
        className="text-[13px] md:text-[14px] text-text-secondary cursor-pointer select-none"
      >
        {label}
      </label>
    </div>
  );
}
