import { useState, useEffect } from 'react';
import { getDialogueMessages } from '../../db/database';
import type { DialogueMessage } from '../../db/schema';
import { useProfileStore } from '../../stores/useProfileStore';

interface Props {
  entryId: number;
}

export default function DialogueDisplay({ entryId }: Props) {
  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const tulpaName = useProfileStore(state => state.tulpaName) || 'Tulpa';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    getDialogueMessages(entryId)
      .then((rows) => {
        if (!cancelled) setMessages(rows as DialogueMessage[]);
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [entryId]);

  if (loading) return (
    <div className="mt-4 rounded-2xl bg-brand-50/60 px-4 py-3">
      <p className="text-[10px] text-brand-400">加载中…</p>
    </div>
  );

  if (error) return (
    <div className="mt-4 rounded-2xl bg-red-50/60 px-4 py-3">
      <p className="text-[10px] text-red-500">对话记录加载失败</p>
    </div>
  );

  if (!messages.length) return null;

  return (
    <div className="mt-4 space-y-3 rounded-2xl bg-brand-50/60 p-4">
      <p className="text-[10px] font-bold tracking-wider text-brand-400">Dialogue</p>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.speaker === 'self' ? 'justify-end' : 'justify-start'} animate-[pageEnter_.4s_var(--ease)_both]`}
        >
          <div
            className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
              msg.speaker === 'self'
                ? 'rounded-br-md bg-brand-900 text-white shadow-[0_6px_18px_rgba(63,57,49,.15)]'
                : 'rounded-bl-md border border-brand-200 bg-white text-brand-800 shadow-[0_4px_14px_rgba(63,57,49,.05)]'
            }`}
          >
            <p className={`mb-0.5 text-[10px] font-bold ${msg.speaker === 'self' ? 'text-white/50' : 'text-brand-400'}`}>
              {msg.speaker === 'self' ? 'You' : tulpaName}
            </p>
            <p>{msg.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
