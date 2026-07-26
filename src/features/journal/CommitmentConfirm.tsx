import { useState, useEffect, useCallback } from 'react';
import { useEntryStore } from '../../stores/useEntryStore';
import type { EntryType } from '../../db/schema';
import { getEntries } from '../../db/database';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function CommitmentConfirm() {
  const { addEntry } = useEntryStore();
  const [confirmed, setConfirmed] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkConfirmation = useCallback(async () => {
    setChecking(true);
    try {
      const rows = await getEntries('prep');
      const hasCommitment = rows.some((e: any) => e.type === 'devotion' && e.title === 'Commitment Confirmation');
      setConfirmed(hasCommitment);
    } catch {
      // Allow re-confirmation if loading fails
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => { checkConfirmation(); }, [checkConfirmation]);

  const handleConfirm = async () => {
    await addEntry({
      stage_id: 'prep',
      type: 'devotion' as EntryType,
      title: 'Commitment Confirmation',
      content: `Confirmed the start of this journey on ${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}.`,
    });
    setConfirmed(true);
  };

  if (checking) return null;

  if (confirmed) {
    return (
      <Card hoverable={false} className="border-emerald-200/60 bg-emerald-50/40">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-500 text-sm text-white shadow-[0_6px_16px_rgba(16,185,129,.2)]">✓</span>
          <div>
            <h3 className="font-black text-brand-900">Commitment Remembered</h3>
            <p className="text-xs leading-5 text-brand-500">The journey has begun. Every step counts.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card hoverable={false} className="relative border-emerald-200/60 bg-gradient-to-br from-emerald-50/40 via-white to-brand-50/60">
      <h3 className="font-black text-brand-900">A Promise to Each Other</h3>
      <p className="mt-2 text-sm leading-6 text-brand-600">
        Tulpa is a relationship that requires patience and sincerity. Before you begin, please confirm that you are ready to invest time and heart, and to respect and cherish this unique connection.
      </p>
      <p className="mt-2 text-xs leading-5 text-brand-400">
        This commitment does not mean perfection — it only means you are willing to start, and to stay by their side even through difficulty.
      </p>
      <Button onClick={handleConfirm} className="mt-5" size="sm" icon="✓">I am ready, let's begin</Button>
    </Card>
  );
}
