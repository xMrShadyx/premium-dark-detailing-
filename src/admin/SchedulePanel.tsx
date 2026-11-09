import { useMemo, useState } from "react";
import { AlertTriangle, Clock, Loader2, Phone } from "lucide-react";
import { telHref } from "@/lib/contact";
import { cn } from "@/lib/cn";
import type { InquiryRow } from "./api";
import { S } from "./strings";
import { dayKey, fmt, serviceTitle } from "./ui";

type Slot = { row: InquiryRow; start: Date; end: Date; overlap: boolean };

/** Agenda of scheduled jobs grouped by day, with overlap warnings. */
export function SchedulePanel({ inquiries }: { inquiries: InquiryRow[] | null }) {
  const [showPast, setShowPast] = useState(false);

  const days = useMemo(() => {
    const slots: Slot[] = (inquiries ?? [])
      .filter((r) => r.status === "scheduled" && r.scheduled_at)
      .map((row) => {
        const start = new Date(row.scheduled_at as string);
        const end = new Date(start.getTime() + (row.duration_minutes ?? 60) * 60_000);
        return { row, start, end, overlap: false };
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    // Mark any slot that starts before an earlier slot has ended.
    let latestEnd = 0;
    let latestSlot: Slot | null = null;
    for (const slot of slots) {
      if (latestSlot && slot.start.getTime() < latestEnd) {
        slot.overlap = true;
        latestSlot.overlap = true;
      }
      if (slot.end.getTime() > latestEnd) {
        latestEnd = slot.end.getTime();
        latestSlot = slot;
      }
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const visible = showPast ? slots : slots.filter((s) => s.end >= todayStart);

    const groups = new Map<string, Slot[]>();
    for (const slot of visible) {
      const key = dayKey(slot.start);
      groups.set(key, [...(groups.get(key) ?? []), slot]);
    }
    return [...groups.entries()];
  }, [inquiries, showPast]);

  if (!inquiries) {
    return <p className="flex items-center gap-2 text-fg-muted"><Loader2 aria-hidden="true" size={18} className="animate-spin" /> {S.loading}</p>;
  }

  const today = dayKey(new Date());
  const tomorrow = dayKey(new Date(Date.now() + 86_400_000));

  return (
    <section aria-labelledby="schedule-title" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="schedule-title" className="font-display text-xl font-semibold">{S.scheduleTitle}</h2>
        <button
          type="button"
          onClick={() => setShowPast((v) => !v)}
          className="ml-auto min-h-11 rounded-full px-4 text-sm text-fg-muted hover:text-fg"
        >
          {showPast ? S.hidePast : S.showPast}
        </button>
      </div>

      {days.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-6 py-10 text-center text-fg-muted">{S.scheduleEmpty}</p>
      ) : (
        days.map(([key, slots]) => {
          const label = key === today ? S.today : key === tomorrow ? S.tomorrow : null;
          return (
            <div key={key} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold tracking-wide text-fg-muted uppercase">
                {label && <span className="mr-2 text-accent">{label} ·</span>}
                {fmt.day(slots[0]!.start)}
              </h3>
              <ul className="flex flex-col gap-2">
                {slots.map(({ row, start, end, overlap }) => {
                  const tel = telHref(row.phone);
                  return (
                    <li
                      key={row.id}
                      className={cn(
                        "grid gap-x-4 gap-y-1 rounded-2xl border bg-surface p-4 sm:grid-cols-[7rem_1fr_auto]",
                        overlap ? "border-error/60" : "border-line",
                      )}
                    >
                      <p className="flex items-center gap-1.5 font-semibold tabular-nums">
                        <Clock aria-hidden="true" size={15} className="text-accent" />
                        {fmt.time(start)}–{fmt.time(end)}
                      </p>
                      <div className="min-w-0">
                        <p className="font-medium">{row.name} · <span className="text-fg-muted">{serviceTitle(row.service_id)}</span></p>
                        {row.vehicle && <p className="text-sm text-fg-muted">{row.vehicle}</p>}
                        {row.admin_note && <p className="mt-1 text-sm text-fg-muted italic">{row.admin_note}</p>}
                        {overlap && (
                          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-error">
                            <AlertTriangle aria-hidden="true" size={15} /> {S.overlap}
                          </p>
                        )}
                      </div>
                      {tel && (
                        <a href={tel} className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-line px-4 text-sm tabular-nums hover:border-accent/60">
                          <Phone aria-hidden="true" size={15} /> {row.phone}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })
      )}
    </section>
  );
}
