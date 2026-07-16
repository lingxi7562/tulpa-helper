import { useEffect, useState } from 'react';
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
    <div className="space-y-3">
      {messages.map((m) => {
        const isSelf = m.speaker === 'self';
        return (
          <div key={m.id} className={`flex gap-2 ${isSelf ? 'justify-end' : ''}`}>
            {!isSelf && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-pink-400 flex items-center justify-center text-white text-xs shrink-0">T</div>
            )}
            <div className={`rounded-2xl px-3 py-2 max-w-[75%] text-sm ${
              isSelf
                ? 'bg-blue-50 text-blue-800 rounded-br-sm'
                : 'bg-gradient-to-r from-amber-50 to-pink-50 text-amber-900 rounded-bl-sm'
            }`}>
              {m.content}
            </div>
            {isSelf && (
              <div className="w-7 h-7 rounded-full bg-blue-300 flex items-center justify-center text-white text-xs shrink-0">我</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
