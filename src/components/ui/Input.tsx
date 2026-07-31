import type { InputHTMLAttributes, Ref, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export default function Input({ label, hint, className = '', id, ...props }: InputProps) {
  return (
    <label className="block" htmlFor={id}>
      {label && <span className="mb-2 block text-xs font-bold text-brand-700">{label}</span>}
      <input id={id} className={`ui-input ${className}`} {...props} />
      {hint && <span className="mt-1.5 block text-[11px] leading-5 text-brand-400">{hint}</span>}
    </label>
  );
}

export function Textarea({ label, hint, className = '', id, ref, ...props }: TextareaProps) {
  return (
    <label className="block" htmlFor={id}>
      {label && <span className="mb-2 block text-xs font-bold text-brand-700">{label}</span>}
      <textarea ref={ref} id={id} className={`ui-input min-h-28 resize-none leading-7 ${className}`} {...props} />
      {hint && <span className="mt-1.5 block text-[11px] leading-5 text-brand-400">{hint}</span>}
    </label>
  );
}
