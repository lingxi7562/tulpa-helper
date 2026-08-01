import { useEffect } from 'react';
import IconButton from './IconButton';

interface Props { message: string; onClose: () => void; duration?: number; }

export default function Toast({ message, onClose, duration = 3000 }: Props) {
  useEffect(() => { const timer = setTimeout(onClose, duration); return () => clearTimeout(timer); }, [onClose, duration]);
  return (
    <div role="status" aria-live="polite" className="fixed bottom-5 left-1/2 z-[110] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/15 bg-brand-900/95 p-2.5 pl-4 text-sm font-semibold text-white shadow-[0_22px_60px_rgba(63,57,49,.32)] backdrop-blur-xl animate-[toastEnter_.35s_var(--ease)_both] sm:bottom-7 sm:left-auto sm:right-7 sm:w-auto sm:translate-x-0">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/12 text-xs">✓</span><span className="flex-1">{message}</span><IconButton label="关闭提示" icon="×" size="sm" onClick={onClose} className="!border-white/10 !bg-white/10 !text-white hover:!bg-white/20" />
    </div>
  );
}
