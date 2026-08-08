import { useEffect } from 'react';
import Card from '../../components/ui/Card';
import { useFormStore } from '../../stores/useFormStore';

const SENSES = [
  { type: 'visual', label: '视觉', icon: '👁', style: 'border-purple-200 bg-purple-50 text-purple-700' },
  { type: 'audio', label: '听觉', icon: '👂', style: 'border-blue-200 bg-blue-50 text-blue-700' },
  { type: 'touch', label: '触觉', icon: '✋', style: 'border-amber-200 bg-amber-50 text-amber-700' },
  { type: 'smell', label: '嗅觉', icon: '👃', style: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  { type: 'taste', label: '味觉', icon: '👅', style: 'border-rose-200 bg-rose-50 text-rose-700' },
] as const;

interface FormSummaryProps {
  embedded?: boolean;
}

export default function FormSummary({ embedded = false }: FormSummaryProps) {
  const { formDetails, loadFormDetails, loadError } = useFormStore();

  useEffect(() => { loadFormDetails(); }, [loadFormDetails]);

  if (formDetails.length === 0) {
    if (!loadError) return null;
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs font-bold text-red-600">
        <span>形态资料加载失败。</span>
        <button type="button" onClick={() => void loadFormDetails()} className="ml-2 underline hover:text-red-800">重试</button>
      </div>
    );
  }

  const content = (
    <>
      <p className="mb-2 text-[10px] font-bold text-brand-400">形态蓝图 · 只读</p>
      <div className="flex flex-wrap gap-1.5">
        {SENSES.flatMap(sense => formDetails
          .filter(detail => detail.sense_type === sense.type)
          .map(detail => (
            <span
              key={detail.id}
              title={`${sense.label}：${detail.description}`}
              className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${sense.style}`}
            >
              <span className="text-[10px]">{sense.icon}</span>
              <span className="truncate">{detail.description}</span>
            </span>
          )))}
      </div>
    </>
  );

  if (embedded) {
    return (
      <div className="mb-4 space-y-2">
        {loadError && <p role="alert" className="text-[10px] font-bold text-red-500">形态资料刷新失败，当前显示上次成功读取的内容。</p>}
        <div className="rounded-xl border border-purple-100 bg-white/60 p-3">{content}</div>
      </div>
    );
  }

  return (
    <Card padding="sm" hoverable={false}>
      {loadError && <p role="alert" className="mb-2 text-[10px] font-bold text-red-500">形态资料刷新失败，当前显示上次成功读取的内容。</p>}
      {content}
    </Card>
  );
}
