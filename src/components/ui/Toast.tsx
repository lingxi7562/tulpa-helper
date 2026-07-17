import { useEffect } from 'react';

interface Props {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 3000 }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/20 bg-brand-900/95 px-5 py-3.5 text-sm font-medium text-white shadow-[0_18px_50px_rgba(63,57,49,0.3)] backdrop-blur-xl animate-[fadeIn_0.35s_ease-out] sm:bottom-7 sm:left-auto sm:right-7 sm:translate-x-0">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs">✓</span>{message}
    </div>
  );
}
