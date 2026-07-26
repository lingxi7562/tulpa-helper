import { useState, useEffect } from 'react';
import { getDialogueMessages } from '../../db/database';
import type { DialogueMessage } from '../../db/schema';

interface Props {
  entryId: number;
}

export default function DialogueDisplay({ entryId }: Props) {
  const [messages, setMessages] = useState<DialogueMessage[]>([]);

  useEffect(() => {
    getDialogueMessages(entryId).then((rows) => setMessages(rows as DialogueMessage[]));
  }, [entryId]);

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
              {msg.speaker === 'self' ? 'You' : 'Tulpa'}
            </p>
            <p>{msg.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
