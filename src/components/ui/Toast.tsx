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
    <div className="fixed bottom-6 right-6 bg-brand-900 text-white px-4 py-2.5 rounded-lg shadow-lg z-50 animate-[fadeIn_0.3s_ease-out]">
      ✅ {message}
    </div>
  );
}
