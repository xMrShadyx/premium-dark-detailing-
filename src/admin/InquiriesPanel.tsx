import { useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CalendarCheck, Check, Loader2, MessageCircle, Phone, RefreshCw, RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { telHref, viberHref } from "@/lib/contact";
import { cn } from "@/lib/cn";
import { deleteInquiry, updateInquiry, type InquiryPatch, type InquiryRow, type InquiryStatus } from "./api";
import { S } from "./strings";
import { fmt, inputClass, serviceDuration, serviceTitle, toLocalInputs } from "./ui";

const STATUS_STYLE: Record<InquiryStatus, string> = {
  new: "bg-gold text-bg",
  scheduled: "bg-success/15 text-success",
  done: "bg-surface-hover text-fg-muted",
  rejected: "bg-error/10 text-error",
};

type Filter = InquiryStatus | "all";

function ScheduleForm({
  row,
  onSave,
  onCancel,
  busy,
}: {
  row: InquiryRow;
  onSave: (patch: InquiryPatch) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const initial = row.scheduled_at
    ? toLocalInputs(new Date(row.scheduled_at))
    : { date: row.preferred_date ?? toLocalInputs(new Date()).date, time: "09:00" };
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [duration, setDuration] = useState(String(row.duration_minutes ?? serviceDuration(row.service_id)));

  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(time) && Number(duration) >= 15;

  return (
    <form
      className="mt-4 grid gap-3 rounded-xl border border-line bg-bg p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onSave({
          status: "scheduled",
          scheduled_at: new Date(`${date}T${time}`).toISOString(),
          duration_minutes: Math.round(Number(duration)),
        });
      }}
    >
      <label className="flex flex-col gap-1.5 text-xs font-medium text-fg-muted">
        {S.date}
        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-xs font-medium text-fg-muted">
        {S.time}
        <input type="time" required step={900} value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-xs font-medium text-fg-muted">
        {S.duration}
        <input type="number" required min={15} max={1440} step={15} value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass} />
      </label>
      <div className="flex items-end gap-2">
        <Button type="submit" size="sm" disabled={!valid || busy}>
          {busy ? <Loader2 aria-hidden="true" size={16} className="animate-spin" /> : <CalendarCheck aria-hidden="true" size={16} />}
          {S.save}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>{S.cancel}</Button>
      </div>
    </form>
  );
}

function InquiryCard({ row, sb, onChanged }: { row: InquiryRow; sb: SupabaseClient; onChanged: () => Promise<void> }) {
  const [scheduling, setScheduling] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [note, setNote] = useState(row.admin_note ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(false);
    try {
      await action();
      await onChanged();
      setScheduling(false);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };
  const patch = (p: InquiryPatch) => run(() => updateInquiry(sb, row.id, p));

  const tel = telHref(row.phone);
  const viber = viberHref(row.phone);

  return (
    <article className="rounded-2xl border border-line bg-surface p-5" aria-labelledby={`inq-${row.id}`}>
      <header className="flex flex-wrap items-start gap-x-3 gap-y-1">
        <h3 id={`inq-${row.id}`} className="font-display text-lg font-semibold">{row.name}</h3>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_STYLE[row.status])}>
          {S.status[row.status]}
        </span>
        <span className="ml-auto text-xs text-fg-muted">{S.received}: {fmt.dateTime(row.created_at)}</span>
      </header>

      <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        <div className="flex gap-2"><dt className="text-fg-muted">{S.service}:</dt><dd>{serviceTitle(row.service_id)}</dd></div>
        <div className="flex gap-2"><dt className="text-fg-muted">Телефон:</dt><dd className="tabular-nums">{row.phone}</dd></div>
        {row.vehicle && <div className="flex gap-2"><dt className="text-fg-muted">{S.vehicle}:</dt><dd>{row.vehicle}</dd></div>}
        {row.email && <div className="flex gap-2"><dt className="text-fg-muted">{S.email}:</dt><dd className="break-all">{row.email}</dd></div>}
        {row.preferred_date && <div className="flex gap-2"><dt className="text-fg-muted">{S.preferredDate}:</dt><dd>{fmt.date(row.preferred_date)}</dd></div>}
        {row.scheduled_at && row.status === "scheduled" && (
          <div className="flex gap-2 font-semibold text-success">
            <dt>{S.scheduledFor}:</dt>
            <dd>{fmt.dateTime(row.scheduled_at)}{row.duration_minutes ? ` · ${row.duration_minutes} мин` : ""}</dd>
          </div>
        )}
      </dl>

      <p className="mt-3 rounded-xl bg-bg px-4 py-3 text-sm whitespace-pre-line">{row.message}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {tel && (
          <a href={tel} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm hover:border-gold/60">
            <Phone aria-hidden="true" size={16} /> {S.call}
          </a>
        )}
        {viber && (
          <a href={viber} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm hover:border-gold/60">
            <MessageCircle aria-hidden="true" size={16} /> {S.viber}
          </a>
        )}
        {(row.status === "new" || row.status === "scheduled") && (
          <Button size="sm" onClick={() => setScheduling((v) => !v)} aria-expanded={scheduling}>
            <CalendarCheck aria-hidden="true" size={16} />
            {row.status === "scheduled" ? S.reschedule : S.schedule}
          </Button>
        )}
        {row.status === "scheduled" && (
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => void patch({ status: "done" })}>
            <Check aria-hidden="true" size={16} /> {S.markDone}
          </Button>
        )}
        {row.status !== "rejected" && row.status !== "done" && (
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => void patch({ status: "rejected" })}>
            <X aria-hidden="true" size={16} /> {S.reject}
          </Button>
        )}
        {(row.status === "rejected" || row.status === "done") && (
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => void patch({ status: "new", scheduled_at: null, duration_minutes: null })}>
            <RotateCcw aria-hidden="true" size={16} /> {S.reopen}
          </Button>
        )}
      </div>

      {scheduling && <ScheduleForm row={row} busy={busy} onCancel={() => setScheduling(false)} onSave={(p) => void patch(p)} />}

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-fg-muted hover:text-fg">{S.note}</summary>
        <div className="mt-2 flex flex-col gap-2">
          <textarea rows={3} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} aria-label={S.note} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" disabled={busy || note === (row.admin_note ?? "")} onClick={() => void patch({ admin_note: note.trim() || null })}>
              {S.saveNote}
            </Button>
            {confirmDelete ? (
              <Button size="sm" variant="secondary" className="border-error text-error" disabled={busy} onClick={() => void run(() => deleteInquiry(sb, row.id))}>
                <Trash2 aria-hidden="true" size={16} /> {S.confirmDelete}
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
                <Trash2 aria-hidden="true" size={16} /> {S.deleteInquiry}
              </Button>
            )}
          </div>
        </div>
      </details>

      {error && <p role="alert" className="mt-3 text-sm text-error">{S.errorGeneric}</p>}
    </article>
  );
}

export function InquiriesPanel({
  sb,
  inquiries,
  onChanged,
}: {
  sb: SupabaseClient;
  inquiries: InquiryRow[] | null;
  onChanged: () => Promise<void>;
}) {
  const [filter, setFilter] = useState<Filter>("new");
  const [refreshing, setRefreshing] = useState(false);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: 0, new: 0, scheduled: 0, done: 0, rejected: 0 };
    for (const i of inquiries ?? []) {
      c.all += 1;
      c[i.status] += 1;
    }
    return c;
  }, [inquiries]);

  if (!inquiries) {
    return <p className="flex items-center gap-2 text-fg-muted"><Loader2 aria-hidden="true" size={18} className="animate-spin" /> {S.loading}</p>;
  }

  const filters: Filter[] = ["new", "scheduled", "done", "rejected", "all"];
  const visible = filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);
  const sorted =
    filter === "scheduled"
      ? [...visible].sort((a, b) => (a.scheduled_at ?? "").localeCompare(b.scheduled_at ?? ""))
      : visible;

  return (
    <section aria-label={S.tabs.inquiries} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Филтър" className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "min-h-11 rounded-full border px-4 text-sm font-medium transition-colors",
                filter === f ? "border-gold bg-gold text-bg" : "border-line text-fg-muted hover:text-fg",
              )}
            >
              {f === "all" ? S.filterAll : S.status[f]} <span className="tabular-nums opacity-80">({counts[f]})</span>
            </button>
          ))}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto"
          disabled={refreshing}
          onClick={async () => {
            setRefreshing(true);
            await onChanged();
            setRefreshing(false);
          }}
        >
          <RefreshCw aria-hidden="true" size={16} className={refreshing ? "animate-spin" : undefined} /> {S.refresh}
        </Button>
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-6 py-10 text-center text-fg-muted">{S.noInquiries}</p>
      ) : (
        sorted.map((row) => <InquiryCard key={`${row.id}-${row.updated_at}`} row={row} sb={sb} onChanged={onChanged} />)
      )}
    </section>
  );
}
