import { useEffect, useState } from 'react';
import type { Entry } from '../../db/schema';
import Button from './Button';
import Input, { Textarea } from './Input';

interface Props {
  entry?: Entry | null;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
  saving?: boolean;
}

export default function EntryForm({ entry, onSave, onCancel, saving }: Props) {
  const [title, setTitle] = useState(entry?.title ?? '');
  const [content, setContent] = useState(entry?.content ?? '');

  useEffect(() => {
    setTitle(entry?.title ?? '');
    setContent(entry?.content ?? '');
  }, [entry]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title.trim(), content.trim());
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-brand-50 p-4">
      <h4 className="text-xs font-bold text-brand-500">{entry ? '编辑记录' : '新建记录'}</h4>
      <Input
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSave()}
        placeholder="输入标题"
        disabled={saving}
        autoFocus
      />
      <Textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="内容…"
        disabled={saving}
        className="min-h-20"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={!title.trim() || saving}>
          {saving ? '保存中…' : '保存'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={saving}>取消</Button>
      </div>
    </div>
  );
}
