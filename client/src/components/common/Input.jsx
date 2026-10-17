import React from 'react';

const Input = React.forwardRef(
  (
    {
      label,
      type = 'text',
      name,
      value,
      onChange,
      placeholder,
      error,
      helperText,
      required = false,
      disabled = false,
      icon: Icon,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={name} className="block text-xs font-medium text-slate-300">
            {label} {required && <span className="text-rose-400">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`block w-full rounded-lg bg-slate-950/70 border ${
              error ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-800 focus:ring-brand-500 focus:border-brand-500'
            } text-slate-100 placeholder-slate-500 text-sm transition duration-150 py-2.5 ${
              Icon ? 'pl-9' : 'pl-3.5'
            } pr-3.5 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:bg-slate-900 ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-400 font-medium mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-400 mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
