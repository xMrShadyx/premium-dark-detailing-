import { useEffect, useRef, useState, type FormEvent } from "react";
import { CalendarCheck, Check, Loader2, Phone, RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getEnabledServices } from "@/config";
import { telHref } from "@/lib/contact";
import type { InquiryRow } from "../api";
import { inputClass, serviceDuration, toLocalInputs } from "../ui";
import { DURATIONS } from "./model";

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
  date: string;
  time: string;
  duration: number;
  note: string;
};

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
    return { name: "", phone: "", serviceId, vehicle: "", date: state.date, time: "09:00", duration: serviceDuration(serviceId), note: "" };
  }
  const row = state.row;
  const when = state.mode === "edit" && row.scheduled_at ? toLocalInputs(new Date(row.scheduled_at)) : null;
  return {
    name: row.name,
    phone: row.phone,
    serviceId: row.service_id,
    vehicle: row.vehicle ?? "",
    date: state.mode === "assign" ? state.date : (when?.date ?? ""),
    time: when?.time ?? "09:00",
    duration: row.duration_minutes ?? serviceDuration(row.service_id),
    note: row.admin_note ?? "",
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

  const durationOptions = DURATIONS.some((d) => d.minutes === values.duration)
    ? DURATIONS
    : [...DURATIONS, { label: `${values.duration} мин`, minutes: values.duration }];

  const valid =
    values.name.trim().length >= 2 &&
    PHONE_RE.test(values.phone.trim()) &&
    !!values.serviceId &&
    /^\d{4}-\d{2}-\d{2}$/.test(values.date) &&
    /^\d{2}:\d{2}$/.test(values.time);

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
            Автомобил
            <input maxLength={100} value={values.vehicle} onChange={(e) => set("vehicle", e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Дата
            <input required type="date" value={values.date} onChange={(e) => set("date", e.target.value)} className={inputClass} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Час
              <input required type="time" step={900} value={values.time} onChange={(e) => set("time", e.target.value)} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Продължителност
              <select value={values.duration} onChange={(e) => set("duration", Number(e.target.value))} className={inputClass}>
                {durationOptions.map((d) => <option key={d.minutes} value={d.minutes}>{d.label}</option>)}
              </select>
            </label>
          </div>
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
            <a href={tel} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm hover:border-gold/60">
              <Phone aria-hidden="true" size={15} /> Обади се
            </a>
          )}
          {state.mode === "edit" && onStatus && (
            <>
              {state.row.status === "scheduled" ? (
                <Button size="sm" variant="secondary" disabled={busy} onClick={() => onStatus("done")}>
                  <Check aria-hidden="true" size={16} /> Завършена
                </Button>
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
