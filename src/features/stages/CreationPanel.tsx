import { useEffect } from 'react';
import FocusTimer from '../forcing/FocusTimer';
import ScribbleInput from '../dialogue/ScribbleInput';
import { useEntryStore } from '../../stores/useEntryStore';

export default function CreationPanel() {
  const { entries, loadEntries } = useEntryStore();

  useEffect(() => { loadEntries('create'); }, []);

  const stats = {
    sessions: entries.filter(e => e.type === 'session' || e.type === 'narration').length,
    dialogue: entries.filter(e => e.type === 'dialogue').length,
    signals: entries.filter(e => e.type === 'signal').length,
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-brand-900">✨ 创建期</h2>
        <p className="text-brand-500 text-sm mt-1">通过持续的专注与交流赋予 tulpa 生命力。</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
          <div className="text-lg">⏱️</div>
          <div className="text-xs font-semibold text-orange-900">专注会话</div>
          <div className="text-[10px] text-orange-700">{stats.sessions} 次</div>
        </div>
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
          <div className="text-lg">💬</div>
          <div className="text-xs font-semibold text-pink-900">对话记录</div>
          <div className="text-[10px] text-pink-700">{stats.dialogue} 条</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          <div className="text-lg">⚡</div>
          <div className="text-xs font-semibold text-green-900">回应迹象</div>
          <div className="text-[10px] text-green-700">{stats.signals} 次</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div className="text-lg">🔥</div>
          <div className="text-xs font-semibold text-blue-900">连续坚持</div>
          <div className="text-[10px] text-blue-700">统计中</div>
        </div>
      </div>

      <FocusTimer
        sessionTypes={[
          { label: 'Narration', value: 'narration' },
          { label: 'Active Forcing', value: 'session' },
        ]}
      />

      <ScribbleInput />
    </div>
  );
}
