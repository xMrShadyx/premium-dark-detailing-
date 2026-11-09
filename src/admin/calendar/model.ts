import type { InquiryRow } from "../api";

export type MonthRow = { year: number; month: number; days: number; key: string };

export type Bar = {
  row: InquiryRow;
  startDay: number; // 1-based, clipped to the month
  endDay: number; // inclusive
  lane: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
  overlap: boolean;
};

export const MONTHS_BG = ["Яну", "Фев", "Мар", "Апр", "Май", "Юни", "Юли", "Авг", "Сеп", "Окт", "Ное", "Дек"];
export const MONTHS_BG_LONG = [
  "Януари", "Февруари", "Март", "Април", "Май", "Юни",
  "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември",
];
export const WEEKDAYS_BG = ["нд", "пн", "вт", "ср", "чт", "пт", "сб"];

/** `count` months starting from `start` (any day inside the first month). */
export function buildMonths(start: Date, count: number): MonthRow[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    return { year, month, days: new Date(year, month + 1, 0).getDate(), key: `${year}-${month}` };
  });
}

export function isoDay(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function entryRange(row: InquiryRow): { start: Date; end: Date } | null {
  if (!row.scheduled_at) return null;
  const start = new Date(row.scheduled_at);
  const end = new Date(start.getTime() + (row.duration_minutes ?? 60) * 60_000);
  return { start, end };
}

/** Rows that sit on the calendar (scheduled or done, with a time). */
export function calendarEntries(rows: InquiryRow[]): InquiryRow[] {
  return rows.filter((r) => (r.status === "scheduled" || r.status === "done") && r.scheduled_at);
}

/** Ids of scheduled entries whose time ranges overlap another scheduled entry. */
export function overlappingIds(rows: InquiryRow[]): Set<string> {
  const ranges = rows
    .filter((r) => r.status === "scheduled")
    .map((r) => ({ id: r.id, ...entryRange(r)! }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  const ids = new Set<string>();
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length && ranges[j]!.start < ranges[i]!.end; j++) {
      ids.add(ranges[i]!.id);
      ids.add(ranges[j]!.id);
    }
  }
  return ids;
}

/**
 * Bars for one month row. A job ending exactly at midnight does not occupy the next day.
 * Bars are packed into lanes so overlapping days stack instead of covering each other.
 */
export function barsForMonth(rows: InquiryRow[], month: MonthRow, overlaps: Set<string>): Bar[] {
  const monthStart = new Date(month.year, month.month, 1);
  const monthEnd = new Date(month.year, month.month + 1, 1);

  const raw = rows
    .map((row) => {
      const range = entryRange(row);
      if (!range) return null;
      const lastMoment = new Date(range.end.getTime() - 60_000);
      if (lastMoment < monthStart || range.start >= monthEnd) return null;
      const startDay = range.start < monthStart ? 1 : range.start.getDate();
      const endDay = lastMoment >= monthEnd ? month.days : Math.max(startDay, lastMoment.getDate());
      return {
        row,
        startDay,
        endDay,
        lane: 0,
        continuesBefore: range.start < monthStart,
        continuesAfter: lastMoment >= monthEnd,
        overlap: overlaps.has(row.id),
        sortKey: range.start.getTime(),
      };
    })
    .filter((b): b is Bar & { sortKey: number } => b !== null)
    .sort((a, b) => a.sortKey - b.sortKey);

  const laneEnds: number[] = [];
  for (const bar of raw) {
    let lane = laneEnds.findIndex((end) => end < bar.startDay);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = bar.endDay;
    bar.lane = lane;
  }
  return raw;
}

/** Local midnight of the day a moment falls on. */
function dayOf(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * Shade index (0, 1, 2…) per entry id, so entries of the same color that sit next to each other
 * (same or consecutive days) get different shades. A gap of a free day resets to the base shade.
 */
export function shadeIndexes(
  rows: InquiryRow[],
  colorOf: (row: InquiryRow) => string,
  shades: number,
): Map<string, number> {
  const groups = new Map<string, { id: string; start: Date; end: Date }[]>();
  for (const row of rows) {
    const range = entryRange(row);
    if (!range) continue;
    const key = colorOf(row);
    groups.set(key, [...(groups.get(key) ?? []), { id: row.id, ...range }]);
  }

  const result = new Map<string, number>();
  for (const group of groups.values()) {
    group.sort((a, b) => a.start.getTime() - b.start.getTime());
    let shade = 0;
    let dayAfterRun = -Infinity; // the day right after the last occupied day so far
    for (const entry of group) {
      shade = dayOf(entry.start) <= dayAfterRun ? (shade + 1) % shades : 0;
      result.set(entry.id, shade);
      const last = new Date(entry.end.getTime() - 60_000); // ending at midnight does not occupy the next day
      const after = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1).getTime();
      dayAfterRun = Math.max(dayAfterRun, after);
    }
  }
  return result;
}

/** Duration presets: hours within a day, or whole days (ending 8 h into the last day). */
export const DURATIONS: { label: string; minutes: number }[] = [
  { label: "1 ч", minutes: 60 },
  { label: "1 ч 30 мин", minutes: 90 },
  { label: "2 ч", minutes: 120 },
  { label: "3 ч", minutes: 180 },
  { label: "4 ч", minutes: 240 },
  { label: "6 ч", minutes: 360 },
  { label: "Цял ден (8 ч)", minutes: 480 },
  { label: "2 дни", minutes: 1440 + 480 },
  { label: "3 дни", minutes: 2 * 1440 + 480 },
  { label: "5 дни", minutes: 4 * 1440 + 480 },
  { label: "7 дни", minutes: 6 * 1440 + 480 },
];
