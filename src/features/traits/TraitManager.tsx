import { useState } from 'react';
import { useTraitStore } from '../../stores/useTraitStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import IconButton from '../../components/ui/IconButton';

export default function TraitManager() {
  const { traits, addTrait, removeTrait } = useTraitStore();
  const [name, setName] = useState(''); const [showForm, setShowForm] = useState(false);
  const handleAdd = async () => { if (!name.trim()) return; await addTrait({ name: name.trim(), weight: 5 }); setName(''); setShowForm(false); };
  return (
    <Card hoverable={false}>
      <div className="mb-5 flex items-start justify-between gap-4"><div><h3 className="font-black text-brand-900">性格特质蓝图</h3><p className="mt-1 text-xs leading-6 text-brand-400">用温柔而清晰的词语描绘独特个性。</p></div><Badge variant="prep">{traits.length} 项</Badge></div>
      <div className="mb-5 flex min-h-9 flex-wrap gap-2">{traits.length ? traits.map(trait => <Badge key={trait.id} className="group !py-1.5 !pl-3.5 !pr-1.5 !text-xs">{trait.name}<IconButton label={`删除${trait.name}`} icon="×" size="sm" variant="danger" onClick={() => removeTrait(trait.id)} className="!h-6 !w-6 !border-transparent !bg-transparent opacity-55 group-hover:opacity-100" /></Badge>) : <p className="text-xs text-brand-400">还没有特质，从一个最重要的词开始。</p>}</div>
      {showForm ? <div className="flex flex-col gap-2 rounded-2xl bg-brand-50 p-2 sm:flex-row"><Input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="输入特质名称..." className="min-w-0 flex-1" /><div className="flex gap-2"><Button onClick={handleAdd} size="sm">保存</Button><Button onClick={() => setShowForm(false)} variant="ghost" size="sm">取消</Button></div></div> : <Button onClick={() => setShowForm(true)} variant="secondary" fullWidth className="border-dashed">＋ 添加新特质</Button>}
    </Card>
  );
}
