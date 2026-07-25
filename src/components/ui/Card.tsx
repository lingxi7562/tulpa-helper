import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode;
  footer?: ReactNode;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = { none: '', sm: 'p-4', md: 'p-5 sm:p-6', lg: 'p-6 sm:p-8' };

export default function Card({ header, footer, hoverable = true, padding = 'md', className = '', children, ...props }: CardProps) {
  return (
    <section className={`ui-card ${hoverable ? 'ui-card--hoverable' : ''} ${className}`} {...props}>
      {header && <div className="border-b border-brand-100 px-5 py-4 sm:px-6">{header}</div>}
      <div className={paddingMap[padding]}>{children}</div>
      {footer && <div className="border-t border-brand-100 px-5 py-4 sm:px-6">{footer}</div>}
    </section>
  );
}
