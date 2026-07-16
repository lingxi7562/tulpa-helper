import ScribbleInput from '../dialogue/ScribbleInput';
import FocusTimer from '../forcing/FocusTimer';

export default function DevelopmentPanel() {
  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-brand-900">🗣️ 发展期</h2>
        <p className="text-brand-500 text-sm mt-1">培养独立性，深化连接。</p>
      </div>

      <FocusTimer
        sessionTypes={[{ label: '对话会话', value: 'dialogue_session' }]}
      />

      <ScribbleInput />

      <div className="bg-white border border-brand-200 rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-brand-900 mb-3">🧠 自主性观察日志</h3>
        <p className="text-sm text-brand-400">记录 tulpa 主动表达意愿、独立决策的时刻 — 后续迭代</p>
      </div>

      <div className="bg-white border border-brand-200 rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-brand-900 mb-3">🏡 Wonderland 互动</h3>
        <p className="text-sm text-brand-400">记录心象空间内的活动 — 后续迭代</p>
      </div>

      <div className="bg-white border border-brand-200 rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-brand-900 mb-3">💗 情感共振追踪</h3>
        <p className="text-sm text-brand-400">每日情感共鸣强度记录 — 后续迭代</p>
      </div>
    </div>
  );
}
