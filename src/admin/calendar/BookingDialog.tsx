import { useEffect, useRef, useState, type FormEvent } from "react";
import { CalendarCheck, Check, Loader2, Phone, RotateCcw, Trash2, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getEnabledServices } from "@/config";
import { telHref } from "@/lib/contact";
import type { InquiryRow } from "../api";
import { inputClass, serviceDuration, toLocalInputs } from "../ui";
import { DURATIONS, parsePrice } from "./model";

export type DialogState =
  /** New manual booking on a day. */
  | { mode: "create"; date: string }
  /** Assign a customer request (from "Неразпределени") to a day. */
  | { mode: "assign"; date: string; row: InquiryRow }
  /** Open an existing entry from the calendar. */
  | { mode: "edit"; row: InquiryRow };

export type BookingValues = {
  name: string;
  phone: string;
  serviceId: string;
  vehicle: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  note: string;
  /** As typed, e.g. "80" or "80,50"; empty = no price. */
  price: string;
};

type When = Pick<BookingValues, "startDate" | "startTime" | "endDate" | "endTime">;

function toMs(date: string, time: string): number {
  return new Date(`${date}T${time}`).getTime();
}

/** Start/end inputs for a start moment and a length in minutes. */
function range(date: string, time: string, minutes: number): When {
  const end = toLocalInputs(new Date(toMs(date, time) + minutes * 60_000));
  return { startDate: date, startTime: time, endDate: end.date, endTime: end.time };
}

/** Minutes between start and end, or null when the end is missing or not after the start. */
function lengthOf(v: When): number | null {
  const ms = toMs(v.endDate, v.endTime) - toMs(v.startDate, v.startTime);
  return Number.isFinite(ms) && ms > 0 ? Math.round(ms / 60_000) : null;
}

type Props = {
  state: DialogState;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (values: BookingValues) => void;
  onStatus?: (status: "done" | "rejected" | "new" | "scheduled") => void;
  onDelete?: () => void;
};

const PHONE_RE = /^\+?[0-9\s\-()]{6,20}$/;

function initialValues(state: DialogState): BookingValues {
  const services = getEnabledServices();
  if (state.mode === "create") {
    const serviceId = services[0]?.id ?? "";
    return { name: "", phone: "", serviceId, vehicle: "", ...range(state.date, "09:00", serviceDuration(serviceId)), note: "", price: "" };
  }
  const row = state.row;
  const when = state.mode === "edit" && row.scheduled_at ? toLocalInputs(new Date(row.scheduled_at)) : null;
  return {
    name: row.name,
    phone: row.phone,
    serviceId: row.service_id,
    vehicle: row.vehicle ?? "",
    ...range(
      state.mode === "assign" ? state.date : (when?.date ?? ""),
      when?.time ?? "09:00",
      row.duration_minutes ?? serviceDuration(row.service_id),
    ),
    note: row.admin_note ?? "",
    price: row.price === null ? "" : String(row.price).replace(".", ","),
  };
}

/** Modal for creating, assigning and editing calendar entries. Uses the native <dialog> (focus trap, Escape). */
export function BookingDialog({ state, busy, error, onClose, onSave, onStatus, onDelete }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState<BookingValues>(() => initialValues(state));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const services = getEnabledServices();
  const row = state.mode === "create" ? null : state.row;

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal?.();
    return () => dialog?.close?.();
  }, []);

  const set = <K extends keyof BookingValues>(key: K, value: BookingValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const length = lengthOf(values);

  /** Moving the start keeps the entry's length, so the end follows it. */
  const setStart = (key: "startDate" | "startTime", value: string) =>
    setValues((v) => {
      const next = { ...v, [key]: value };
      if (!next.startDate || !next.startTime) return next;
      return { ...next, ...range(next.startDate, next.startTime, lengthOf(v) ?? serviceDuration(v.serviceId)) };
    });

  const valid =
    values.name.trim().length >= 2 &&
    PHONE_RE.test(values.phone.trim()) &&
    !!values.serviceId &&
    /^\d{4}-\d{2}-\d{2}$/.test(values.startDate) &&
    /^\d{2}:\d{2}$/.test(values.startTime) &&
    /^\d{4}-\d{2}-\d{2}$/.test(values.endDate) &&
    /^\d{2}:\d{2}$/.test(values.endTime) &&
    length !== null &&
    !Number.isNaN(parsePrice(values.price));
  const badPrice = Number.isNaN(parsePrice(values.price));
  const endBeforeStart = !!values.endDate && !!values.endTime && length === null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (valid) onSave(values);
  };

  const title =
    state.mode === "create" ? "Нов запис" : state.mode === "assign" ? "Разпределяне на заявка" : "Запис";
  const tel = row ? telHref(row.phone) : null;

  return (
    <dialog
      ref={ref}
      aria-labelledby="booking-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="m-auto w-[min(36rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-0 text-fg backdrop:bg-black/60"
    >
      <form onSubmit={submit} className="flex max-h-[85vh] flex-col">
        <header className="flex items-start gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id="booking-title" className="font-display text-lg font-semibold">{title}</h2>
            {row?.source === "website" && (
              <p className="text-xs text-fg-muted">
                Заявка от сайта · {new Date(row.created_at).toLocaleString("bg-BG", { dateStyle: "medium", timeStyle: "short" })}
                {row.preferred_date && ` · предпочита ${new Date(`${row.preferred_date}T00:00:00`).toLocaleDateString("bg-BG")}`}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Затвори" className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-fg-muted hover:bg-surface-hover hover:text-fg">
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        <div className="grid gap-4 overflow-y-auto px-5 py-4 sm:grid-cols-2">
          {row?.message && (
            <p className="rounded-xl bg-bg px-4 py-3 text-sm whitespace-pre-line sm:col-span-2">{row.message}</p>
          )}
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Име
            <input required minLength={2} maxLength={100} value={values.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Телефон
            <input required type="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Услуга
            <select value={values.serviceId} onChange={(e) => set("serviceId", e.target.value)} className={inputClass}>
              {services.map((s) => <option key={s.id} value={s.id}>{s.title.bg}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Сума
            <span className="relative">
              <input
                inputMode="decimal"
                placeholder="напр. 80"
                value={values.price}
                onChange={(e) => set("price", e.target.value)}
                aria-invalid={badPrice}
                className={`${inputClass} pr-10 font-semibold tabular-nums`}
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-fg-muted">€</span>
            </span>
            {badPrice && <span role="alert" className="text-xs font-normal text-error">Въведете сума, напр. 80 или 80,50.</span>}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
            Автомобил
            <input maxLength={100} value={values.vehicle} onChange={(e) => set("vehicle", e.target.value)} className={inputClass} />
          </label>
          <fieldset className="grid min-w-0 grid-cols-[minmax(0,1fr)_8.5rem] gap-3 sm:col-span-2">
            <legend className="mb-1.5 text-sm font-medium">От</legend>
            <input required type="date" aria-label="Начална дата" value={values.startDate} onChange={(e) => setStart("startDate", e.target.value)} className={inputClass} />
            <input required type="time" aria-label="Начален час" step={900} value={values.startTime} onChange={(e) => setStart("startTime", e.target.value)} className={inputClass} />
          </fieldset>
          <fieldset className="grid min-w-0 grid-cols-[minmax(0,1fr)_8.5rem] gap-3 sm:col-span-2">
            <legend className="mb-1.5 text-sm font-medium">До</legend>
            <input required type="date" aria-label="Крайна дата" min={values.startDate} value={values.endDate} onChange={(e) => set("endDate", e.target.value)} className={inputClass} aria-invalid={endBeforeStart} />
            <input required type="time" aria-label="Краен час" step={900} value={values.endTime} onChange={(e) => set("endTime", e.target.value)} className={inputClass} aria-invalid={endBeforeStart} />
          </fieldset>
          <div className="flex flex-wrap items-center gap-1.5 text-xs sm:col-span-2">
            <span className="text-fg-muted">Бърз избор:</span>
            {DURATIONS.map((d) => (
              <button
                key={d.minutes}
                type="button"
                onClick={() => values.startDate && values.startTime && setValues((v) => ({ ...v, ...range(v.startDate, v.startTime, d.minutes) }))}
                className={`rounded-full border px-2.5 py-1 ${length === d.minutes ? "border-accent text-accent" : "border-line text-fg-muted hover:border-accent/60 hover:text-fg"}`}
              >
                {d.label}
              </button>
            ))}
          </div>
          {endBeforeStart && (
            <p role="alert" className="text-sm text-error sm:col-span-2">Краят трябва да е след началото.</p>
          )}
          <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
            Бележка
            <textarea rows={2} maxLength={2000} value={values.note} onChange={(e) => set("note", e.target.value)} className={inputClass} />
          </label>
          {error && <p role="alert" className="text-sm text-error sm:col-span-2">{error}</p>}
        </div>

        <footer className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-4">
          <Button type="submit" size="sm" disabled={!valid || busy}>
            {busy ? <Loader2 aria-hidden="true" size={16} className="animate-spin" /> : <CalendarCheck aria-hidden="true" size={16} />}
            {state.mode === "edit" ? "Запази" : "Запиши"}
          </Button>
          {tel && (
            <a href={tel} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm hover:border-accent/60">
              <Phone aria-hidden="true" size={15} /> Обади се
            </a>
          )}
          {state.mode === "edit" && onStatus && (
            <>
              {state.row.status === "scheduled" ? (
                <>
                  <Button size="sm" variant="secondary" disabled={busy} onClick={() => onStatus("done")}>
                    <Check aria-hidden="true" size={16} /> Завършена
                  </Button>
                  <Button size="sm" variant="ghost" disabled={busy} onClick={() => onStatus("rejected")}>
                    <XCircle aria-hidden="true" size={16} /> Неуспешна
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="secondary" disabled={busy} onClick={() => onStatus("scheduled")}>
                  <RotateCcw aria-hidden="true" size={16} /> Не е завършена
                </Button>
              )}
              {state.row.source === "website" && state.row.status === "scheduled" && (
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => onStatus("new")}>
                  Към неразпределени
                </Button>
              )}
            </>
          )}
          {state.mode === "edit" && onDelete && (
            confirmDelete ? (
              <Button size="sm" variant="secondary" className="ml-auto border-error text-error" disabled={busy} onClick={onDelete}>
                <Trash2 aria-hidden="true" size={16} /> Потвърди
              </Button>
            ) : (
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setConfirmDelete(true)}>
                <Trash2 aria-hidden="true" size={16} /> Изтрий
              </Button>
            )
          )}
        </footer>
      </form>
    </dialog>
  );
}
