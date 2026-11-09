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
