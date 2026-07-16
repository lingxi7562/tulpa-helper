import { useState, useEffect, useCallback } from 'react';
import { getTotalDuration, getDurationByStage, getDailyDurations, getConsecutiveDays } from '../db/database';

interface StatsData {
  totalSeconds: number;
  stageBreakdown: { stage_id: string; total: number }[];
  dailyDurations: { day: string; total: number }[];
  consecutiveDays: number;
  loading: boolean;
}

export function useStats(): StatsData & { refresh: () => void } {
  const [data, setData] = useState<StatsData>({
    totalSeconds: 0,
    stageBreakdown: [],
    dailyDurations: [],
    consecutiveDays: 0,
    loading: true,
  });

  const refresh = useCallback(async () => {
    setData((d) => ({ ...d, loading: true }));
    const [total, breakdown, daily, consecutive] = await Promise.all([
      getTotalDuration(),
      getDurationByStage(),
      getDailyDurations(7),
      getConsecutiveDays(),
    ]);
    setData({
      totalSeconds: total,
      stageBreakdown: breakdown as any[],
      dailyDurations: daily as any[],
      consecutiveDays: consecutive,
      loading: false,
    });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { ...data, refresh };
}
