import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  helperText,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-semibold text-neutral-700">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-[11px] text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-neutral-500 font-light">{helperText}</p>
      ) : null}
    </div>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }> = ({
  className = '',
  error,
  ...props
}) => {
  return (
    <input
      className={`w-full px-3.5 py-2 text-xs bg-white rounded-lg border ${
        error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900/10'
      } text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition-all disabled:bg-neutral-50 disabled:text-neutral-400 ${className}`}
      {...props}
    />
  );
};

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }> = ({
  className = '',
  error,
  ...props
}) => {
  return (
    <textarea
      className={`w-full px-3.5 py-2 text-xs bg-white rounded-lg border ${
        error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900/10'
      } text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition-all disabled:bg-neutral-50 disabled:text-neutral-400 ${className}`}
      {...props}
    />
  );
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }> = ({
  className = '',
  error,
  children,
  ...props
}) => {
  return (
    <select
      className={`w-full px-3.5 py-2 text-xs bg-white rounded-lg border ${
        error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900/10'
      } text-neutral-900 focus:outline-none focus:ring-2 transition-all cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

interface SwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <label
      className={`flex items-center justify-between gap-4 p-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50/50 cursor-pointer select-none transition-all hover:bg-neutral-50 hover:border-neutral-300 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <div className="flex-1 pr-2">
        <span className="text-xs font-semibold text-neutral-800 block">{label}</span>
        {description && (
          <span className="text-[11px] text-neutral-500 font-light block mt-0.5 leading-relaxed">
            {description}
          </span>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) onChange(!checked);
        }}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#34C759]/30 ${
          checked ? 'bg-[#34C759]' : 'bg-[#e5e5ea] border border-neutral-300/60'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
};
