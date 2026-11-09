import { useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CalendarPlus, ChevronLeft, ChevronRight, GripVertical, Inbox, Lock, LockOpen, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getEnabledServices } from "@/config";
import { cn } from "@/lib/cn";
import {
  createBooking,
  deleteInquiry,
  setClosedDay,
  updateInquiry,
  type ClosedDay,
  type InquiryRow,
} from "../api";
import { serviceTitle } from "../ui";
import { BookingDialog, type BookingValues, type DialogState } from "./BookingDialog";
import {
  barsForMonth,
  buildMonths,
  calendarEntries,
  isoDay,
  MONTHS_BG,
  MONTHS_BG_LONG,
  overlappingIds,
  parsePrice,
  shadeIndexes,
  WEEKDAYS_BG,
  type MonthRow,
} from "./model";

const SERVICE_COLORS = ["#2f6fd6", "#1f8a99", "#8a5cd0", "#c46a2b"];
const DONE_COLOR = "#3f8f4f";
/** Variants of one color for neighbouring entries: base, lighter, darker. */
const SHADES: ((color: string) => string)[] = [
  (c) => c,
  (c) => `color-mix(in srgb, ${c} 72%, white)`,
  (c) => `color-mix(in srgb, ${c} 68%, black)`,
];
const LANE = 1.45; // rem per stacked bar
const MONTHS_SHOWN = 12;

type Menu = { day: string; x: number; y: number };

function serviceColor(id: string): string {
  const index = getEnabledServices().findIndex((s) => s.id === id);
  return SERVICE_COLORS[(index < 0 ? 0 : index) % SERVICE_COLORS.length]!;
}

function baseColor(row: InquiryRow): string {
  return row.status === "done" ? DONE_COLOR : serviceColor(row.service_id);
}

function todayIso(): string {
  const d = new Date();
  return isoDay(d.getFullYear(), d.getMonth(), d.getDate());
}

export function CalendarPanel({
  sb,
  inquiries,
  closedDays,
  onChanged,
}: {
  sb: SupabaseClient;
  inquiries: InquiryRow[];
  closedDays: ClosedDay[];
  onChanged: () => Promise<void>;
}) {
  const [start, setStart] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [menu, setMenu] = useState<Menu | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [assigning, setAssigning] = useState<InquiryRow | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const months = useMemo(() => buildMonths(start, MONTHS_SHOWN), [start]);
  const entries = useMemo(() => calendarEntries(inquiries), [inquiries]);
  const overlaps = useMemo(() => overlappingIds(entries), [entries]);
  const shades = useMemo(() => shadeIndexes(entries, baseColor, SHADES.length), [entries]);
  const unassigned = useMemo(
    () =>
      inquiries
        .filter((r) => r.status === "new")
        .sort((a, b) => (a.preferred_date ?? "9999").localeCompare(b.preferred_date ?? "9999")),
    [inquiries],
  );
  const closed = useMemo(() => new Set(closedDays.map((d) => d.day)), [closedDays]);
  const today = todayIso();
  const highlight = assigning?.preferred_date ?? null;

  // Close the day menu on outside click, Escape or scroll; focus its first item when it opens.
  useEffect(() => {
    if (!menu) return;
    menuRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      if (e instanceof MouseEvent && menuRef.current?.contains(e.target as Node)) return;
      setMenu(null);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [menu]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      await onChanged();
      setDialog(null);
      setAssigning(null);
    } catch {
      setError("Записът не беше запазен. Проверете данните и опитайте отново.");
    } finally {
      setBusy(false);
    }
  };

  const onDayClick = (day: string, target: HTMLElement) => {
    if (assigning) {
      setDialog({ mode: "assign", date: day, row: assigning });
      return;
    }
    const rect = target.getBoundingClientRect();
    setMenu({
      day,
      x: Math.min(rect.left, window.innerWidth - 232),
      y: rect.bottom + 236 > window.innerHeight ? Math.max(8, rect.top - 236) : rect.bottom + 4,
    });
  };

  const onDrop = (e: DragEvent, day: string) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData("text/inquiry-id");
    const row = unassigned.find((r) => r.id === id);
    if (row) setDialog({ mode: "assign", date: day, row });
  };

  const save = (values: BookingValues) => {
    if (!dialog) return;
    const from = new Date(`${values.startDate}T${values.startTime}`);
    const to = new Date(`${values.endDate}T${values.endTime}`);
    const fields = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      service_id: values.serviceId,
      vehicle: values.vehicle.trim() || null,
      scheduled_at: from.toISOString(),
      duration_minutes: Math.round((to.getTime() - from.getTime()) / 60_000),
      admin_note: values.note.trim() || null,
      price: parsePrice(values.price),
    };
    void run(async () => {
      if (dialog.mode === "create") await createBooking(sb, fields);
      else if (dialog.mode === "assign") await updateInquiry(sb, dialog.row.id, { ...fields, status: "scheduled" });
      else await updateInquiry(sb, dialog.row.id, fields);
    });
  };

  const shift = (months: number) => setStart((s) => new Date(s.getFullYear(), s.getMonth() + months, 1));

  const gridStyle: CSSProperties = { gridTemplateColumns: "7.5rem repeat(31, minmax(2.6rem, 1fr))" };
  const dayNumbers = Array.from({ length: 31 }, (_, i) => i + 1);

  const renderMonth = (month: MonthRow) => {
    const bars = barsForMonth(entries, month, overlaps);
    const lanes = bars.reduce((n, b) => Math.max(n, b.lane + 1), 0);
    const rowHeight = `${Math.max(3.4, 1.55 + lanes * LANE + 0.25)}rem`;

    return (
      <div key={month.key} role="row" className="grid border-b border-line" style={{ ...gridStyle, minHeight: rowHeight }}>
        <div
          role="rowheader"
          className="sticky left-0 z-20 flex flex-col justify-center border-r border-line bg-surface px-3 text-sm"
          style={{ gridRow: 1, gridColumn: 1 }}
        >
          <span className="font-semibold">{MONTHS_BG_LONG[month.month]}</span>
          <span className="text-xs text-fg-muted tabular-nums">{month.year}</span>
        </div>

        {dayNumbers.map((n) => {
          const exists = n <= month.days;
          const day = isoDay(month.year, month.month, n);
          const weekday = new Date(month.year, month.month, n).getDay();
          const weekend = weekday === 0 || weekday === 6;
          const isClosed = exists && closed.has(day);
          const style: CSSProperties = { gridRow: 1, gridColumn: n + 1 };
          if (!exists) {
            return (
              <div
                key={n}
                aria-hidden="true"
                style={style}
                className="border-r border-line/60 bg-[repeating-linear-gradient(135deg,var(--color-bg-2)_0_5px,transparent_5px_10px)]"
              />
            );
          }
          return (
            <button
              key={n}
              type="button"
              role="gridcell"
              style={style}
              aria-label={`${n} ${MONTHS_BG_LONG[month.month]} ${month.year}, ${WEEKDAYS_BG[weekday]}${isClosed ? ", неработен" : ""}`}
              onClick={(e) => onDayClick(day, e.currentTarget)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(day);
              }}
              onDragLeave={() => setDragOver((d) => (d === day ? null : d))}
              onDrop={(e) => onDrop(e, day)}
              className={cn(
                "relative flex flex-col items-start border-r border-line/60 px-1 pt-0.5 text-left transition-colors hover:bg-gold/10 focus-visible:z-30",
                weekend && "bg-bg-2/70",
                isClosed && "bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--color-error)_22%,transparent)_0_4px,transparent_4px_9px)]",
                (dragOver === day || highlight === day) && "bg-gold/20 outline-2 -outline-offset-2 outline-gold",
                assigning && "cursor-copy",
              )}
            >
              <span className={cn("text-[11px] leading-none tabular-nums", day === today ? "rounded bg-gold px-1 py-0.5 font-bold text-bg" : "text-fg-muted", weekend && day !== today && "text-fg")}>
                {String(n).padStart(2, "0")}
              </span>
              <span className={cn("text-[9px] leading-tight", weekend ? "font-semibold text-error" : "text-fg-muted/80")}>
                {WEEKDAYS_BG[weekday]}
              </span>
            </button>
          );
        })}

        {/* Bars layer over the 31 day columns. */}
        <div className="pointer-events-none relative z-10" style={{ gridRow: 1, gridColumn: "2 / -1" }}>
          {bars.map((bar) => {
            const row = bar.row;
            const color = SHADES[shades.get(row.id) ?? 0]!(baseColor(row));
            const time = row.scheduled_at
              ? new Date(row.scheduled_at).toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" })
              : "";
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => setDialog({ mode: "edit", row })}
                title={`${time} ${row.name} · ${serviceTitle(row.service_id)}${bar.overlap ? " · застъпване!" : ""}`}
                aria-label={`${row.name}, ${serviceTitle(row.service_id)}, ${time}${row.status === "done" ? ", завършена" : ""}${bar.overlap ? ", застъпва се" : ""}`}
                className={cn(
                  "pointer-events-auto absolute flex items-center overflow-hidden px-1 text-left text-[11px] leading-none font-medium whitespace-nowrap text-white shadow-sm",
                  bar.continuesBefore ? "rounded-l-none" : "rounded-l-lg",
                  bar.continuesAfter ? "rounded-r-none" : "rounded-r-lg",
                  bar.overlap && "ring-2 ring-error ring-offset-1 ring-offset-surface",
                )}
                style={{
                  left: `calc(${((bar.startDay - 1) / 31) * 100}% + 2px)`,
                  width: `calc(${((bar.endDay - bar.startDay + 1) / 31) * 100}% - 4px)`,
                  top: `${1.55 + bar.lane * LANE}rem`,
                  height: `${LANE - 0.15}rem`,
                  background: color,
                }}
              >
                <span className="truncate">
                  <span className="tabular-nums">{time}</span>
                  {bar.endDay - bar.startDay >= 1 && <span className="opacity-90"> {row.name}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section aria-label="Календар" className="flex flex-col gap-5">
      {/* --- Unassigned requests ------------------------------------------- */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Inbox aria-hidden="true" size={18} className="text-gold" />
          Неразпределени
          <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-bg tabular-nums">{unassigned.length}</span>
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          Заявки от сайта, които още нямат час. Плъзнете карта върху ден или натиснете „Разпредели“ и изберете ден.
        </p>
        {unassigned.length === 0 ? (
          <p className="mt-3 text-sm text-fg-muted">Няма чакащи заявки.</p>
        ) : (
          <ul className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {unassigned.map((row) => (
              <li
                key={row.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/inquiry-id", row.id);
                  e.dataTransfer.effectAllowed = "move";
                  setAssigning(null);
                }}
                className={cn(
                  "flex w-64 shrink-0 cursor-grab flex-col gap-1 rounded-xl border bg-bg p-3 text-sm active:cursor-grabbing",
                  assigning?.id === row.id ? "border-gold" : "border-line",
                )}
              >
                <p className="flex items-center gap-1.5 font-semibold">
                  <GripVertical aria-hidden="true" size={15} className="shrink-0 text-fg-muted" />
                  <span className="truncate">{row.name}</span>
                </p>
                <p className="flex items-center gap-2 text-fg-muted">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: serviceColor(row.service_id) }} aria-hidden="true" />
                  {serviceTitle(row.service_id)}
                </p>
                <p className="text-fg-muted tabular-nums">{row.phone}</p>
                {row.preferred_date && (
                  <p className="text-xs text-gold">
                    Предпочита {new Date(`${row.preferred_date}T00:00:00`).toLocaleDateString("bg-BG", { day: "numeric", month: "long" })}
                  </p>
                )}
                {row.message && <p className="line-clamp-2 text-xs text-fg-muted">{row.message}</p>}
                <div className="mt-1 flex gap-2">
                  <Button size="sm" className="min-h-9 px-3" onClick={() => setAssigning(assigning?.id === row.id ? null : row)}>
                    {assigning?.id === row.id ? "Избира се…" : "Разпредели"}
                  </Button>
                  {row.preferred_date && (
                    <Button size="sm" variant="secondary" className="min-h-9 px-3" onClick={() => setDialog({ mode: "assign", date: row.preferred_date!, row })}>
                      На желаната дата
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {assigning && (
        <p role="status" className="sticky top-28 z-30 flex flex-wrap items-center gap-3 rounded-xl border border-gold bg-surface px-4 py-3 text-sm shadow-lg">
          Изберете ден в календара за <strong>{assigning.name}</strong>
          {assigning.preferred_date && <span className="text-fg-muted">(желаната дата е маркирана)</span>}
          <Button size="sm" variant="ghost" className="ml-auto min-h-9" onClick={() => setAssigning(null)}>
            <X aria-hidden="true" size={15} /> Отказ
          </Button>
        </p>
      )}

      {/* --- Toolbar ---------------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => setDialog({ mode: "create", date: today })}>
          <CalendarPlus aria-hidden="true" size={16} /> Нов запис
        </Button>
        <Button size="sm" variant="secondary" aria-label="Предишен месец" onClick={() => shift(-1)}>
          <ChevronLeft aria-hidden="true" size={17} />
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setStart(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>
          Днес
        </Button>
        <Button size="sm" variant="secondary" aria-label="Следващ месец" onClick={() => shift(1)}>
          <ChevronRight aria-hidden="true" size={17} />
        </Button>
        <span className="text-sm text-fg-muted">
          {MONTHS_BG[months[0]!.month]} {months[0]!.year} – {MONTHS_BG[months[months.length - 1]!.month]} {months[months.length - 1]!.year}
        </span>
        <ul className="ml-auto flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted" aria-label="Легенда">
          {getEnabledServices().map((s) => (
            <li key={s.id} className="flex items-center gap-1.5">
              <span className="h-3 w-5 rounded" style={{ background: serviceColor(s.id) }} aria-hidden="true" /> {s.title.bg}
            </li>
          ))}
          <li className="flex items-center gap-1.5"><span className="h-3 w-5 rounded" style={{ background: DONE_COLOR }} aria-hidden="true" /> Завършена</li>
          <li className="flex items-center gap-1.5"><span className="h-3 w-5 rounded bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--color-error)_45%,transparent)_0_3px,transparent_3px_6px)]" aria-hidden="true" /> Неработен ден</li>
        </ul>
      </div>

      {/* --- Month × day grid ------------------------------------------------- */}
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <div role="grid" aria-label="Календар по месеци" className="min-w-max">
          <div role="row" className="sticky top-0 z-30 grid border-b border-line bg-surface-hover" style={gridStyle}>
            <div role="columnheader" className="sticky left-0 z-20 border-r border-line bg-surface-hover px-3 py-2 text-xs font-semibold text-fg-muted">
              Месец
            </div>
            {dayNumbers.map((n) => (
              <div key={n} role="columnheader" className="border-r border-line/60 py-2 text-center text-xs font-semibold tabular-nums text-fg-muted">
                {n}
              </div>
            ))}
          </div>
          {months.map(renderMonth)}
        </div>
      </div>

      {/* --- Day menu (like a context menu) ---------------------------------- */}
      {menu && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`Ден ${new Date(`${menu.day}T00:00:00`).toLocaleDateString("bg-BG")}`}
          className="fixed z-50 w-56 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-2xl"
          style={{ left: menu.x, top: menu.y }}
        >
          <p className="border-b border-line px-4 py-2 text-xs font-semibold text-fg-muted">
            {new Date(`${menu.day}T00:00:00`).toLocaleDateString("bg-BG", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setDialog({ mode: "create", date: menu.day });
              setMenu(null);
            }}
            className="flex min-h-11 w-full items-center gap-2.5 px-4 text-left text-sm hover:bg-surface-hover focus:bg-surface-hover focus:outline-none"
          >
            <CalendarPlus aria-hidden="true" size={16} className="text-gold" /> Нов запис
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={busy}
            onClick={() => {
              const day = menu.day;
              setMenu(null);
              void run(() => setClosedDay(sb, day, !closed.has(day)));
            }}
            className="flex min-h-11 w-full items-center gap-2.5 px-4 text-left text-sm hover:bg-surface-hover focus:bg-surface-hover focus:outline-none"
          >
            {closed.has(menu.day) ? (
              <><LockOpen aria-hidden="true" size={16} /> Работен ден</>
            ) : (
              <><Lock aria-hidden="true" size={16} /> Неработен ден</>
            )}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => setMenu(null)}
            className="flex min-h-11 w-full items-center gap-2.5 px-4 text-left text-sm text-fg-muted hover:bg-surface-hover focus:bg-surface-hover focus:outline-none"
          >
            <X aria-hidden="true" size={16} /> Затвори
          </button>
        </div>
      )}

      {error && !dialog && <p role="alert" className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p>}

      {dialog && (
        <BookingDialog
          key={dialog.mode === "create" ? `c-${dialog.date}` : `${dialog.mode}-${dialog.row.id}`}
          state={dialog}
          busy={busy}
          error={error}
          onClose={() => {
            setDialog(null);
            setError(null);
          }}
          onSave={save}
          onStatus={
            dialog.mode === "edit"
              ? (status) =>
                  void run(() =>
                    updateInquiry(
                      sb,
                      dialog.row.id,
                      status === "new" ? { status, scheduled_at: null, duration_minutes: null } : { status },
                    ),
                  )
              : undefined
          }
          onDelete={dialog.mode === "edit" ? () => void run(() => deleteInquiry(sb, dialog.row.id)) : undefined}
        />
      )}
    </section>
  );
}
