import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm';

  const variants = {
    primary: 'bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white focus:ring-sky-400 border border-sky-500 shadow-sm shadow-sky-200/50',
    secondary: 'bg-sky-50 hover:bg-sky-100 text-sky-800 focus:ring-sky-300 border border-sky-200',
    outline: 'bg-white border border-sky-200 hover:bg-sky-50 hover:border-sky-300 text-sky-700 hover:text-sky-900 focus:ring-sky-300',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-400 border border-rose-500',
    ghost: 'bg-transparent hover:bg-sky-50 text-slate-600 hover:text-sky-700 focus:ring-sky-300 shadow-none',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
