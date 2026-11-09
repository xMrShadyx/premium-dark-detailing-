import type { DragEvent } from "react";
import { CalendarDays, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ServiceIcon } from "@/components/services/ServiceIcon";
import { telHref, viberHref } from "@/lib/contact";
import { cn } from "@/lib/cn";
import type { InquiryRow } from "../api";
import { serviceTitle, timeAgo } from "../ui";
import { MONTHS_BG } from "./model";

type Props = {
  row: InquiryRow;
  /** Service colour, same as the calendar bars. */
  color: string;
  /** This request is the one being placed on the calendar. */
  selected: boolean;
  onAssign: () => void;
  onPreferredDate: () => void;
  onDragStart: (e: DragEvent<HTMLLIElement>) => void;
};

// "8 дек" — Intl's short Bulgarian month comes out as "8.12".
const shortDate = { format: (d: Date) => `${d.getDate()} ${MONTHS_BG[d.getMonth()]!.toLowerCase()}` };
const longDate = new Intl.DateTimeFormat("bg-BG", { day: "numeric", month: "long" });

/** Compact card for a website request waiting for a time slot (design variant A). */
export function RequestCard({ row, color, selected, onAssign, onPreferredDate, onDragStart }: Props) {
  const preferred = row.preferred_date ? new Date(`${row.preferred_date}T00:00:00`) : null;
  const tel = telHref(row.phone);
  // Viber needs the international form: a local Bulgarian 08… number becomes +3598…
  const viber = viberHref(row.phone.trim().replace(/^0(?!0)/, "+359"));
  const iconBtn =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line transition-colors hover:border-accent/60";

  return (
    <li
      draggable
      onDragStart={onDragStart}
      className={cn(
        "flex w-80 shrink-0 cursor-grab flex-col gap-2.5 rounded-xl border bg-bg-2 p-3.5 text-sm active:cursor-grabbing",
        selected ? "border-accent shadow-[0_0_18px_-6px] shadow-accent" : "border-line",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/15 font-display text-sm font-extrabold text-accent uppercase"
        >
          {row.name.trim().charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-[15px] font-bold">{row.name}</p>
          <p className="text-xs text-fg-muted tabular-nums">{row.phone}</p>
        </div>
        <time dateTime={row.created_at} title={new Date(row.created_at).toLocaleString("bg-BG")} className="ml-auto shrink-0 self-start text-xs text-fg-muted">
          {timeAgo(row.created_at)}
        </time>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
          style={{ borderColor: `color-mix(in srgb, ${color} 55%, transparent)`, background: `color-mix(in srgb, ${color} 15%, transparent)` }}
        >
          <ServiceIcon id={row.service_id} size={15} />
          {serviceTitle(row.service_id)}
        </span>
        {preferred && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/45 bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
            <CalendarDays aria-hidden="true" size={13} />
            Иска {longDate.format(preferred)}
          </span>
        )}
        {row.vehicle && (
          <span className="inline-flex items-center rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold">{row.vehicle}</span>
        )}
      </div>

      {row.message && (
        <p className="line-clamp-2 border-l-2 border-accent py-0.5 pl-2.5 text-xs text-fg-muted italic" title={row.message}>
          „{row.message}“
        </p>
      )}

      <div className="mt-auto flex gap-1.5">
        <Button size="sm" className="min-h-9 flex-1 px-3" onClick={onAssign}>
          {selected ? "Избира се…" : "Разпредели"}
        </Button>
        {preferred && (
          <Button size="sm" variant="secondary" className="min-h-9 px-3" onClick={onPreferredDate}>
            На {shortDate.format(preferred)}
          </Button>
        )}
        {tel && (
          <a href={tel} className={iconBtn} aria-label={`Обади се на ${row.name}`} title="Обади се">
            <Phone aria-hidden="true" size={15} />
          </a>
        )}
        {viber && (
          <a href={viber} className={cn(iconBtn, "text-[#a99cff]")} aria-label={`Пиши на ${row.name} във Viber`} title="Viber">
            <MessageCircle aria-hidden="true" size={15} />
          </a>
        )}
      </div>
    </li>
  );
}
