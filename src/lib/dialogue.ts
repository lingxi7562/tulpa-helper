import type { Speaker } from '../db/schema';

/**
 * 将速记文本按 /T 标记拆分为对话消息。
 * 规则：`/T`（或 `/t`，或换行后的 `/T`）之后的整段内容标记为 tulpa 发言，
 * 直到下一个 `/T` 或文本结束；其余为 self 发言。
 */
export function parseDialogueText(text: string): { speaker: Speaker; content: string }[] {
  const parts = text.split(/(^|\s)(\/[tT])(?=\s|$)/g);
  const messages: { speaker: Speaker; content: string }[] = [];
  let speaker: Speaker = 'self';
  for (const part of parts) {
    if (/^\/[tT]$/.test(part)) { speaker = 'tulpa'; continue; }
    const trimmed = part.trim();
    if (trimmed) { messages.push({ speaker, content: trimmed }); speaker = 'self'; }
  }
  return messages;
}
