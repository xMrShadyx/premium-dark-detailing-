import { getServiceById } from "@/config";

export const inputClass =
  "w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-fg font-normal transition-colors focus:border-accent focus:outline-none";

const dateTime = new Intl.DateTimeFormat("bg-BG", { dateStyle: "medium", timeStyle: "short" });
const dateOnly = new Intl.DateTimeFormat("bg-BG", { dateStyle: "medium" });
const timeOnly = new Intl.DateTimeFormat("bg-BG", { timeStyle: "short" });
const dayLabel = new Intl.DateTimeFormat("bg-BG", { weekday: "long", day: "numeric", month: "long" });

export const fmt = {
  dateTime: (iso: string) => dateTime.format(new Date(iso)),
  date: (isoDate: string) => dateOnly.format(new Date(`${isoDate}T00:00:00`)),
  time: (d: Date) => timeOnly.format(d),
  day: (d: Date) => dayLabel.format(d),
};

export function serviceTitle(id: string): string {
  return getServiceById(id)?.title.bg ?? id;
}

export function serviceDuration(id: string): number {
  return getServiceById(id)?.durationMinutes ?? 120;
}

/** "YYYY-MM-DD" and "HH:MM" in local time. */
export function toLocalInputs(d: Date): { date: string; time: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export function dayKey(d: Date): string {
  return toLocalInputs(d).date;
}

const relative = new Intl.RelativeTimeFormat("bg-BG", { numeric: "auto" });

/** "преди 5 минути", "преди 2 часа", "вчера", "преди 3 дни"; older than a week → the date. */
export function timeAgo(iso: string, now = new Date()): string {
  const then = new Date(iso);
  const minutes = Math.round((now.getTime() - then.getTime()) / 60_000);
  if (minutes < 1) return "току-що";
  if (minutes < 60) return relative.format(-minutes, "minute");
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(then)) / 86_400_000);
  if (days === 0) return relative.format(-Math.round(minutes / 60), "hour");
  if (days < 7) return relative.format(-days, "day");
  return dateOnly.format(then);
}
