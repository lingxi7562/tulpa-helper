import FocusTimer from '../forcing/FocusTimer';

export default function MaturePanel() {
  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-brand-900">🤝 成熟期</h2>
        <p className="text-brand-500 text-sm mt-1">高阶练习与长期维护。</p>
      </div>

      <FocusTimer
        sessionTypes={[
          { label: 'Imposition', value: 'imposition' },
          { label: 'Switching', value: 'switch' },
          { label: 'Possession', value: 'practice' },
        ]}
      />

      <div className="bg-white border border-brand-200 rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-brand-900 mb-3">👁 Imposition 练习</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: '👁', label: '视觉' },
            { icon: '👂', label: '听觉' },
            { icon: '✋', label: '触觉' },
            { icon: '👃', label: '嗅觉' },
          ].map((sense) => (
            <div key={sense.label} className="text-center p-3 bg-brand-50 rounded-lg">
              <div className="text-lg">{sense.icon}</div>
              <div className="text-[10px] text-brand-600 font-semibold">{sense.label}</div>
              <div className="text-[10px] text-brand-400">Lv.1</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-brand-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-brand-900 mb-3">🔄 Switching</h3>
          <p className="text-sm text-brand-400">记录 switching 练习 — 后续迭代</p>
        </div>
        <div className="bg-white border border-brand-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-brand-900 mb-3">✍️ Possession</h3>
          <p className="text-sm text-brand-400">记录 possession 练习 — 后续迭代</p>
        </div>
      </div>

      <div className="bg-white border border-brand-200 rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-brand-900 mb-3">📅 日常陪伴</h3>
        <p className="text-sm text-brand-400">热力图 + 周统计 — 后续迭代</p>
      </div>
    </div>
  );
}
