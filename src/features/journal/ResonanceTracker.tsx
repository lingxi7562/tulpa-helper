import { useState, useEffect, useCallback } from 'react';
import { useEntryStore } from '../../stores/useEntryStore';
import { useStageStore } from '../../stores/useStageStore';
import { getResonanceEntries } from '../../db/database';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../hooks/useToast';
import type { Entry } from '../../db/schema';

const MOOD_LABELS = ['', '很淡', '轻微', '中等', '明显', '强烈'];
const WEEKS_TO_SHOW = 8;
const DAYS_TO_FETCH = WEEKS_TO_SHOW * 7;

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseCreatedAt(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value.replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfIsoWeek(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);
  return start;
}

function weekKey(date: Date): string {
  return localDateKey(startOfIsoWeek(date));
}

function isoWeekLabel(weekStart: Date): string {
  const thursday = new Date(weekStart);
  thursday.setDate(thursday.getDate() + 3);
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  const firstWeekStart = startOfIsoWeek(firstThursday);
  const weekNumber = Math.round((weekStart.getTime() - firstWeekStart.getTime()) / 604_800_000) + 1;
  return `W${weekNumber}`;
}

export default function ResonanceTracker() {
  const { addEntry, updateEntry } = useEntryStore();
  const { activeStageId } = useStageStore();
  const showToast = useToast(state => state.show);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [mood, setMood] = useState(3);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const rows = await getResonanceEntries(DAYS_TO_FETCH);
      setEntries(rows);
    } catch (error) {
      console.error(error);
      setLoadError(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (saving) return;
    const currentWeekKey = weekKey(new Date());
    const currentWeekEntry = entries.find(e => {
      const createdAt = parseCreatedAt(e.created_at);
      return createdAt ? weekKey(createdAt) === currentWeekKey : false;
    });
    if (currentWeekEntry && !window.confirm('本周已记录过情感共振，确定要覆盖吗？')) return;
    setSaving(true);
    try {
      if (currentWeekEntry) {
        // 覆盖本周已有记录，避免 DB 堆积冗余数据
        await updateEntry(currentWeekEntry.id, { content: MOOD_LABELS[mood], mood });
      } else {
        await addEntry({
          stage_id: activeStageId,
          type: 'resonance',
          title: '情感共振',
          content: MOOD_LABELS[mood],
          mood,
        });
      }
      await load();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // 按 ISO 周（周一至周日）去重，每周只取最新一条
  const byWeek = new Map<string, Entry>();
  for (const e of entries) {
    const createdAt = parseCreatedAt(e.created_at);
    if (!createdAt) continue;
    const key = weekKey(createdAt);
    if (!byWeek.has(key)) {
      byWeek.set(key, e); // entries 已按 DESC 排序，只保留第一条（最新）
    }
  }
  const distinctWeeks = byWeek.size;
  const currentWeekStart = startOfIsoWeek(new Date());
  const currentWeekHasEntry = byWeek.has(weekKey(currentWeekStart));

  return (
    <Card hoverable={false}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-black text-brand-900">情感共振</h3>
          <p className="mt-1 text-xs leading-6 text-brand-400">不必每天记录，一周回顾一次就好</p>
        </div>
        <Badge variant="dev">{distinctWeeks} 周</Badge>
      </div>
      {loadError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50/70 p-3">
          <p role="alert" className="text-xs font-bold text-red-600">共振记录加载失败。</p>
          <button type="button" onClick={() => void load()} className="mt-1 text-[10px] font-bold text-red-700 underline hover:text-red-900">重试</button>
        </div>
      )}

      <div className="mb-5">
        <p className="text-[11px] font-bold text-brand-500 mb-3">本周共振强度</p>
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
          {saving ? '保存中…' : '记录本周'}
        </Button>
      </div>

      <div>
        <p className="text-[11px] font-bold text-brand-500 mb-3">近 8 周趋势</p>
        <div className="flex h-28 items-end gap-2 rounded-2xl bg-brand-50/75 px-3 pb-3 pt-5">
          {Array.from({ length: WEEKS_TO_SHOW }, (_, i) => {
            const weekStart = new Date(currentWeekStart);
            weekStart.setDate(weekStart.getDate() - (WEEKS_TO_SHOW - 1 - i) * 7);
            const key = weekKey(weekStart);
            const entry = byWeek.get(key);
            const value = entry?.mood || 0;
            const height = value ? Math.max(8, (value / 5) * 100) : 0;
            return (
              <div key={key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[9px] font-bold text-blue-600">{value || ''}</span>
                {value > 0 ? (
                  <div
                    className="w-full max-w-8 rounded-t-lg bg-blue-500 shadow-sm"
                    style={{ height: `${height}%` }}
                  />
                ) : (
                  <div className="w-full max-w-8 rounded-t-lg bg-brand-100/60" style={{ height: '3px' }} title="未记录" />
                )}
                <span className="text-[9px] text-brand-400">{isoWeekLabel(weekStart)}</span>
              </div>
            );
          })}
        </div>
        {!currentWeekHasEntry && (
          <p className="mt-2 text-center text-[10px] text-brand-400">本周尚未记录</p>
        )}
      </div>
    </Card>
  );
}
