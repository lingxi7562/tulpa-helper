import { useState, useEffect, useCallback } from 'react';
import { useEntryStore } from '../../stores/useEntryStore';
import { useStageStore } from '../../stores/useStageStore';
import { getResonanceEntries } from '../../db/database';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import type { Entry } from '../../db/schema';

const MOOD_LABELS = ['', '很淡', '轻微', '中等', '明显', '强烈'];

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ResonanceTracker() {
  const { addEntry } = useEntryStore();
  const { activeStageId } = useStageStore();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [mood, setMood] = useState(3);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const rows = await getResonanceEntries(7);
      setEntries(rows);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await addEntry({
        stage_id: activeStageId,
        type: 'resonance',
        title: '情感共振',
        content: MOOD_LABELS[mood],
        mood,
      });
      await load();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // 按本地日期去重，每天只取最新一条
  const byDate = new Map<string, Entry>();
  for (const e of entries) {
    const key = e.created_at?.slice(0, 10) ?? '';
    if (!byDate.has(key)) {
      byDate.set(key, e); // entries 已按 DESC 排序，只保留第一条（最新）
    }
  }
  const distinctDays = byDate.size;

  return (
    <Card hoverable={false}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-black text-brand-900">情感共振</h3>
          <p className="mt-1 text-xs leading-6 text-brand-400">留意每日共鸣的细微变化。</p>
        </div>
        <Badge variant="dev">{distinctDays} 天</Badge>
      </div>

      <div className="mb-5">
        <p className="text-[11px] font-bold text-brand-500 mb-3">今日共振强度</p>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(level => (
            <button
              key={level}
              onClick={() => setMood(level)}
              className={`grid h-10 w-10 place-items-center rounded-xl text-xs font-bold transition-all ${
                mood === level
                  ? 'bg-blue-500 text-white shadow-[0_6px_16px_rgba(59,130,246,.25)]'
                  : 'border border-brand-200 bg-white text-brand-500 hover:border-blue-300'
              }`}
              title={MOOD_LABELS[level]}
            >
              {level}
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-brand-400">
          <span>微弱</span>
          <span className="font-bold text-blue-500">{MOOD_LABELS[mood]}</span>
          <span>强烈</span>
        </div>
        <Button size="sm" className="mt-3" onClick={handleSave} disabled={saving}>
          {saving ? '保存中…' : '记录今日'}
        </Button>
      </div>

      {entries.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-brand-500 mb-3">近 7 天趋势</p>
          <div className="flex h-28 items-end gap-2 rounded-2xl bg-brand-50/75 px-3 pb-3 pt-5">
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const date = localDateKey(d);
              const entry = byDate.get(date);
              const value = entry?.mood || 0;
              const height = value ? Math.max(8, (value / 5) * 100) : 0;
              return (
                <div key={date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-[9px] font-bold text-blue-600">{value || ''}</span>
                  {value > 0 ? (
                    <div
                      className="w-full max-w-8 rounded-t-lg bg-blue-500 shadow-sm"
                      style={{ height: `${height}%` }}
                    />
                  ) : (
                    <div className="w-full max-w-8 rounded-t-lg bg-brand-100" style={{ height: '8px' }} />
                  )}
                  <span className="text-[9px] text-brand-400">{date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
