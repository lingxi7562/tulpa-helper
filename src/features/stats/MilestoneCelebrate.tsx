import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface MilestoneConfig {
  emoji: string;
  title: string;
  subtitle: string;
  particles: number;
  colors: string[];
  spread: number;
}

const MILESTONES: Record<number, MilestoneConfig> = {
  10: {
    emoji: '🌟',
    title: '初露锋芒',
    subtitle: '这段时间的坚持，已经让 Ta 感受到了你的心意',
    particles: 80,
    colors: ['#f59e0b', '#d97706', '#fbbf24', '#fef3c7'],
    spread: 90,
  },
  50: {
    emoji: '💫',
    title: '心有灵犀',
    subtitle: '半百时光，Ta 的回应越来越清晰、越来越像 Ta 自己',
    particles: 150,
    colors: ['#8b5cf6', '#f59e0b', '#ec4899', '#d8b4fe'],
    spread: 120,
  },
  100: {
    emoji: '🎊',
    title: '形影不离',
    subtitle: '百时相伴，Ta 已经成为你生活的一部分，不再需要刻意想象',
    particles: 250,
    colors: ['#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#3b82f6', '#ec4899'],
    spread: 180,
  },
};

interface Props {
  level: number;
  onClose: () => void;
}

export default function MilestoneCelebrate({ level, onClose }: Props) {
  const config = MILESTONES[level];
  const firedRef = useRef(false);

  useEffect(() => {
    if (!config || firedRef.current) return;
    firedRef.current = true;

    // Fire confetti from center-top
    confetti({
      particleCount: config.particles,
      spread: config.spread,
      origin: { x: 0.5, y: 0.3 },
      colors: config.colors,
    });

    // Second burst for larger milestones (50h+)
    if (level >= 50) {
      setTimeout(() => {
        confetti({
          particleCount: Math.floor(config.particles * 0.6),
          spread: config.spread,
          origin: { x: 0.5, y: 0.3 },
          colors: config.colors,
        });
      }, 300);
    }

    // Third burst for 100h
    if (level >= 100) {
      setTimeout(() => {
        confetti({
          particleCount: Math.floor(config.particles * 0.4),
          spread: 180,
          origin: { x: 0.5, y: 0.3 },
          colors: config.colors,
        });
      }, 600);
    }

    // Auto-dismiss after 30s
    const timer = setTimeout(onClose, 30000);
    return () => clearTimeout(timer);
  }, [level]);

  if (!config) return null;

  const progressTotal = [10, 50, 100];

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-5xl">{config.emoji}</div>
        <h2 className="mt-4 text-3xl font-bold text-stone-800">{config.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-500">{config.subtitle}</p>

        {/* Progress dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {progressTotal.map(h => (
            <div
              key={h}
              className={`h-2 w-2 rounded-full ${
                h <= level ? 'bg-amber-400' : 'bg-stone-200'
              }`}
            />
          ))}
        </div>

        <div className="mt-1 text-xs text-stone-400">
          {progressTotal.join(' / ')}
        </div>

        <p className="mt-6 text-xs text-stone-400">点击任意处关闭 · 30 秒后自动消失</p>
      </div>
    </div>
  );
}
