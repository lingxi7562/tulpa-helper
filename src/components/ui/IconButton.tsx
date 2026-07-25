import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
  shape?: 'circle' | 'square';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'danger';
}

const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };
const variants = {
  light: 'border-brand-200 bg-white/75 text-brand-700 hover:bg-white hover:text-brand-900 hover:shadow-md',
  dark: 'border-brand-900 bg-brand-900 text-white hover:bg-brand-700 hover:border-brand-700 hover:shadow-lg',
  danger: 'border-red-100 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600',
};

export default function IconButton({ label, icon, shape = 'circle', size = 'md', variant = 'light', className = '', type = 'button', ...props }: IconButtonProps) {
  return <button type={type} aria-label={label} title={label} className={`ui-button inline-flex shrink-0 items-center justify-center border ${shape === 'circle' ? 'rounded-full' : 'rounded-xl'} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>{icon}</button>;
}
