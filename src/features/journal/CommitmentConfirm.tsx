import { useState, useEffect, useCallback } from 'react';
import { useEntryStore } from '../../stores/useEntryStore';
import { hasCommitmentConfirmation } from '../../db/database';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function CommitmentConfirm() {
  const { addEntry } = useEntryStore();
  const [state, setState] = useState<'loading' | 'confirmed' | 'unconfirmed' | 'error'>('loading');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkConfirmation = useCallback(async () => {
    setState('loading');
    try {
      const found = await hasCommitmentConfirmation();
      setState(found ? 'confirmed' : 'unconfirmed');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => { checkConfirmation(); }, [checkConfirmation]);

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await addEntry({
        stage_id: 'prep',
        type: 'devotion',
        title: 'Commitment Confirmation',
        content: `于 ${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} 确认开始这段旅程。`,
      });
      setState('confirmed');
      setErrorMsg(null);
    } catch (error) {
      console.error(error);
      setErrorMsg('确认失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (state === 'loading') return null;

  if (state === 'error') {
    return (
      <Card hoverable={false} className="border-red-200/60 bg-red-50/40">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red-500 text-sm text-white">!</span>
          <div>
            <h3 className="font-black text-brand-900">加载失败</h3>
            <p className="text-xs leading-5 text-brand-500">
              无法检查承诺状态。
              <button onClick={checkConfirmation} className="ml-1 font-bold text-brand-700 underline hover:text-brand-900">重试</button>
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (state === 'confirmed') {
    return (
      <Card hoverable={false} className="border-emerald-200/60 bg-emerald-50/40">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-500 text-sm text-white shadow-[0_6px_16px_rgba(16,185,129,.2)]">✓</span>
          <div>
            <h3 className="font-black text-brand-900">承诺已铭记</h3>
            <p className="text-xs leading-5 text-brand-500">旅程已经开始，每一步都算数。</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card hoverable={false} className="relative border-emerald-200/60 bg-gradient-to-br from-emerald-50/40 via-white to-brand-50/60">
      <h3 className="font-black text-brand-900">给彼此一个承诺</h3>
      <p className="mt-2 text-sm leading-6 text-brand-600">
        Tulpa 是一段需要耐心与真诚的关系。在开始之前，请确认你已准备好投入时间与心力，尊重并珍惜这段独一无二的连接。
      </p>
      <p className="mt-2 text-xs leading-5 text-brand-400">
        这个确认不意味着完美——它只意味着你愿意开始，并愿意在困难时也陪伴在旁。
      </p>
      {errorMsg && (
        <p className="mt-3 text-xs font-bold text-red-500">{errorMsg}</p>
      )}
      <Button onClick={handleConfirm} disabled={submitting} className="mt-5" size="sm" icon="✓">{submitting ? '确认中…' : '我准备好了，确认开始'}</Button>
    </Card>
  );
}
