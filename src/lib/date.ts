export function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftLocalDate(date: Date, days: number): Date {
  const shifted = new Date(date);
  // Noon avoids crossing a daylight-saving boundary at midnight.
  shifted.setHours(12, 0, 0, 0);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
}

export function parseLocalDateTime(value?: string | null): Date | null {
  if (!value) return null;
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export interface DailyTotal {
  day: string;
  total: number;
}

export function fillDailySeries(rows: DailyTotal[], days: number): DailyTotal[] {
  const count = Number.isFinite(days) ? Math.max(1, Math.min(366, Math.trunc(days))) : 7;
  const totals = new Map(rows.map(row => [row.day, Number(row.total) || 0]));
  const today = new Date();

  return Array.from({ length: count }, (_, index) => {
    const day = localDateKey(shiftLocalDate(today, -(count - 1 - index)));
    return { day, total: totals.get(day) ?? 0 };
  });
}
