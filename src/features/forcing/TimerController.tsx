import { useCallback, useEffect } from 'react';
import { useTimerStore } from '../../stores/useTimerStore';
import { useEntryStore } from '../../stores/useEntryStore';
import { useMilestoneStore } from '../../stores/useMilestoneStore';
import { useToast } from '../../hooks/useToast';
import { getSessionTypeLabel, STAGES, type StageId } from '../../constants/stages';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Textarea } from '../../components/ui/Input';

export default function TimerController() {
  const phase = useTimerStore(state => state.phase);
  const pendingRun = useTimerStore(state => state.pendingRun);
  const summaryDraft = useTimerStore(state => state.summaryDraft);
  const saveError = useTimerStore(state => state.saveError);
  const syncClock = useTimerStore(state => state.syncClock);
  const claimPendingSave = useTimerStore(state => state.claimPendingSave);
  const saveFailed = useTimerStore(state => state.saveFailed);
  const saveSucceeded = useTimerStore(state => state.saveSucceeded);
  const setSummaryDraft = useTimerStore(state => state.setSummaryDraft);
  const addEntry = useEntryStore(state => state.addEntry);
  const checkAndCelebrate = useMilestoneStore(state => state.checkAndCelebrate);
  const showToast = useToast(state => state.show);

  useEffect(() => {
    if (phase !== 'running') return;
    syncClock();
    const syncNow = () => syncClock();
    const intervalId = window.setInterval(syncNow, 1000);
    const syncWhenVisible = () => {
      if (document.visibilityState === 'visible') syncNow();
    };
    document.addEventListener('visibilitychange', syncWhenVisible);
    window.addEventListener('focus', syncNow);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', syncWhenVisible);
      window.removeEventListener('focus', syncNow);
    };
  }, [phase, syncClock]);

  const saveCompletedSession = useCallback(async (content: string) => {
    const run = claimPendingSave();
    if (!run) return;
    const label = getSessionTypeLabel(run.stageId, run.sessionType);

    try {
      await addEntry({
        stage_id: run.stageId,
        type: run.sessionType,
        title: `${label} 完成`,
        duration_seconds: run.durationSeconds,
        content: content.trim() || `番茄钟完成：${label}`,
        tags: JSON.stringify(['timer', `timer:${run.id}`]),
      });
    } catch (error) {
      console.error(error);
      saveFailed('记录未能保存，请重试。你的总结仍保留在这里。');
      showToast('保存失败，内容已保留');
      return;
    }

    saveSucceeded();
    showToast('专注记录已保存');
    try {
      await checkAndCelebrate();
    } catch (error) {
      console.error(error);
    }
  }, [addEntry, checkAndCelebrate, claimPendingSave, saveFailed, saveSucceeded, showToast]);

  useEffect(() => {
    if (phase === 'completed' && pendingRun?.completionMode === 'auto' && !saveError) {
      void saveCompletedSession('');
    }
  }, [pendingRun, phase, saveCompletedSession, saveError]);

  const showSummary = Boolean(
    pendingRun
    && (phase === 'completed' || phase === 'saving')
    && (pendingRun.completionMode === 'prompt' || saveError),
  );

  if (!showSummary || !pendingRun) return null;

  const stage = STAGES[pendingRun.stageId as StageId];
  const label = getSessionTypeLabel(pendingRun.stageId, pendingRun.sessionType);
  const saving = phase === 'saving';

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-brand-900/35 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="timer-summary-title">
      <Card hoverable={false} className="w-full max-w-lg" padding="lg">
        <div className="flex flex-col items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-2xl text-white shadow-[0_10px_24px_rgba(16,185,129,.2)]">✓</span>
          <div className="text-center">
            <h2 id="timer-summary-title" className="font-black text-brand-900">专注完成</h2>
            <p className="mt-1 text-xs text-brand-500">{stage?.name ?? pendingRun.stageId} · {label} · {Math.round(pendingRun.durationSeconds / 60)} 分钟</p>
          </div>
          {saveError && (
            <p role="alert" className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{saveError}</p>
          )}
          <Textarea
            value={summaryDraft}
            onChange={event => setSummaryDraft(event.target.value)}
            placeholder="这次专注有什么感受？记下一两句……（可不写）"
            className="min-h-24 w-full"
            disabled={saving}
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => void saveCompletedSession(summaryDraft)} disabled={saving}>{saving ? '保存中…' : saveError ? '重试保存' : '保存记录'}</Button>
            <Button size="sm" variant="ghost" onClick={() => void saveCompletedSession('')} disabled={saving}>不写总结</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
