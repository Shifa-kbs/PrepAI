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
          <label htmlFor={name} className="block text-xs font-semibold text-slate-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-xs">
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
            className={`block w-full rounded-lg bg-white border ${
              error
                ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400'
                : 'border-slate-300 focus:ring-sky-500 focus:border-sky-500 hover:border-slate-400'
            } text-slate-900 placeholder-slate-400 text-sm transition duration-150 py-2.5 ${
              Icon ? 'pl-9' : 'pl-3.5'
            } pr-3.5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white disabled:opacity-50 disabled:bg-slate-50 ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
