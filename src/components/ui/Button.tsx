import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-900 text-white border-brand-900 shadow-[0_8px_20px_rgba(63,57,49,.18)] hover:bg-brand-700 hover:border-brand-700 hover:shadow-[0_12px_26px_rgba(63,57,49,.24)]',
  secondary: 'bg-white/80 text-brand-800 border-brand-200 shadow-[0_4px_14px_rgba(63,57,49,.06)] hover:bg-white hover:border-brand-300 hover:shadow-[0_9px_20px_rgba(63,57,49,.11)]',
  ghost: 'bg-transparent text-brand-600 border-transparent hover:bg-brand-100/80 hover:text-brand-900',
  danger: 'bg-red-600 text-white border-red-600 shadow-[0_8px_18px_rgba(220,38,38,.16)] hover:bg-red-700 hover:border-red-700 hover:shadow-[0_11px_24px_rgba(220,38,38,.22)]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-8 px-3.5 py-1.5 text-xs gap-1.5',
  md: 'min-h-10 px-5 py-2.5 text-sm gap-2',
  lg: 'min-h-12 px-7 py-3.5 text-sm gap-2.5',
};

export default function Button({ variant = 'primary', size = 'md', fullWidth, icon, className = '', children, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`ui-button inline-flex items-center justify-center rounded-full border font-bold ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
}
