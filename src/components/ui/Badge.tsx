import type { HTMLAttributes, ReactNode } from 'react';

type BadgeVariant = 'neutral' | 'prep' | 'create' | 'dev' | 'mature' | 'danger';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: ReactNode;
}

const variants: Record<BadgeVariant, string> = {
  neutral: 'border-brand-200 bg-brand-100 text-brand-700',
  prep: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  create: 'border-amber-200 bg-amber-50 text-amber-700',
  dev: 'border-blue-200 bg-blue-50 text-blue-700',
  mature: 'border-purple-200 bg-purple-50 text-purple-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
};

export default function Badge({ variant = 'neutral', icon, className = '', children, ...props }: BadgeProps) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${variants[variant]} ${className}`} {...props}>{icon}{children}</span>;
}
