import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { getEnabledServices } from "@/config";
import type { InquiryRow } from "./api";
import { MONTHS_BG_LONG } from "./calendar/model";
import { S } from "./strings";
import {
  averagePrice,
  computeStats,
  periodRange,
  PERIODS,
  successRate,
  type Counts,
  type PeriodId,
} from "./stats";
import { inputClass, serviceTitle } from "./ui";

const eur = new Intl.NumberFormat("bg-BG", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const pct = new Intl.NumberFormat("bg-BG", { style: "percent", maximumFractionDigits: 0 });
const money = (n: number | null) => (n === null ? "—" : eur.format(n));

function Tile({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: "good" | "bad" }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-line bg-surface p-4">
      <span className="flex items-center gap-1.5 text-sm text-fg-muted">
        {tone === "good" && <CheckCircle2 aria-hidden="true" size={15} className="text-success" />}
        {tone === "bad" && <XCircle aria-hidden="true" size={15} className="text-error" />}
        {label}
      </span>
      <strong className="font-display text-2xl font-semibold tabular-nums">{value}</strong>
      {note && <span className="text-xs text-fg-muted">{note}</span>}
    </div>
  );
}

function CountCells({ c }: { c: Counts }) {
  const rate = successRate(c);
  return (
    <>
      <td className="px-3 py-2 text-right tabular-nums">{c.total}</td>
      <td className="px-3 py-2 text-right tabular-nums">{c.done}</td>
      <td className="px-3 py-2 text-right tabular-nums">{c.rejected}</td>
      <td className="px-3 py-2 text-right tabular-nums">{c.scheduled}</td>
      <td className="px-3 py-2 text-right tabular-nums">{rate === null ? "—" : pct.format(rate)}</td>
    </>
  );
}

const th = "px-3 py-2 text-right font-medium";

export function StatsPanel({ inquiries }: { inquiries: InquiryRow[] | null }) {
  const [period, setPeriod] = useState<PeriodId>("this-month");
  const stats = useMemo(
    () => (inquiries ? computeStats(inquiries, periodRange(period)) : null),
    [inquiries, period],
  );

  if (!stats) {
    return (
      <p className="flex items-center gap-2 text-fg-muted">
        <Loader2 aria-hidden="true" size={18} className="animate-spin" /> {S.loading}
      </p>
    );
  }

  const rate = successRate(stats);
  const maxRevenue = Math.max(0, ...stats.byMonth.map((m) => m.revenue));
  // Show every enabled service, even with no entries in the period, so zeros are visible.
  const serviceRows = [
    ...stats.byService,
    ...getEnabledServices()
      .filter((s) => !stats.byService.some((b) => b.serviceId === s.id))
      .map((s) => ({ ...computeStats([], null), serviceId: s.id })),
  ];

  return (
    <section aria-label="Статистика" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-xl font-semibold">Статистика</h2>
        <label className="ml-auto flex items-center gap-2 text-sm text-fg-muted">
          Период
          <select value={period} onChange={(e) => setPeriod(e.target.value as PeriodId)} className={`${inputClass} w-auto`}>
            {PERIODS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Изкарани пари" value={money(stats.revenue)} note={`от ${stats.done} завършени`} />
        <Tile label="Очаквани приходи" value={money(stats.expected)} note={`от ${stats.scheduled} насрочени`} />
        <Tile label="Средна цена" value={money(averagePrice(stats))} note="на завършен запис" />
        <Tile label="Успеваемост" value={rate === null ? "—" : pct.format(rate)} note="завършени от решените" />
        <Tile label="Записи общо" value={String(stats.total)} />
        <Tile label="Успешни" value={String(stats.done)} tone="good" note="завършени" />
        <Tile label="Неуспешни" value={String(stats.rejected)} tone="bad" note="отказани" />
        <Tile label="Предстоящи" value={String(stats.scheduled)} note={`+ ${stats.new} нови заявки`} />
      </div>

      {stats.unpriced > 0 && (
        <p role="note" className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm">
          {stats.unpriced === 1 ? "1 завършен запис няма" : `${stats.unpriced} завършени записа нямат`} въведена цена,
          затова приходите може да са по-високи. Отворете записа в календара и попълнете „Цена“.
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[40rem] text-sm">
          <caption className="px-4 pt-4 pb-2 text-left font-display text-lg font-semibold">По услуги</caption>
          <thead className="border-b border-line text-fg-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Услуга</th>
              <th className={th}>Записи</th>
              <th className={th}>Успешни</th>
              <th className={th}>Неуспешни</th>
              <th className={th}>Предстоящи</th>
              <th className={th}>Успеваемост</th>
              <th className={th}>Изкарани</th>
              <th className={th}>Средна цена</th>
            </tr>
          </thead>
          <tbody>
            {serviceRows.map((s) => (
              <tr key={s.serviceId} className="border-b border-line/60 last:border-0">
                <th scope="row" className="px-3 py-2 text-left font-medium">{serviceTitle(s.serviceId)}</th>
                <CountCells c={s} />
                <td className="px-3 py-2 text-right font-semibold tabular-nums">{money(s.revenue)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{money(averagePrice(s))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stats.byMonth.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[40rem] text-sm">
            <caption className="px-4 pt-4 pb-2 text-left font-display text-lg font-semibold">По месеци</caption>
            <thead className="border-b border-line text-fg-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Месец</th>
                <th className={th}>Записи</th>
                <th className={th}>Успешни</th>
                <th className={th}>Неуспешни</th>
                <th className={th}>Предстоящи</th>
                <th className={th}>Успеваемост</th>
                <th className="w-[30%] px-3 py-2 text-left font-medium">Изкарани</th>
              </tr>
            </thead>
            <tbody>
              {stats.byMonth.map((m) => (
                <tr key={m.key} className="border-b border-line/60 last:border-0">
                  <th scope="row" className="px-3 py-2 text-left font-medium whitespace-nowrap">
                    {MONTHS_BG_LONG[m.month]} {m.year}
                  </th>
                  <CountCells c={m} />
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-3 rounded-r bg-gold"
                        style={{ width: maxRevenue ? `${(m.revenue / maxRevenue) * 70}%` : 0, minWidth: m.revenue ? 4 : 0 }}
                      />
                      <span className="whitespace-nowrap font-semibold tabular-nums">{money(m.revenue)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-fg-muted">
        Записите се броят към датата на часа (или желаната дата за нови заявки). „Успешни“ са завършените,
        „Неуспешни“ — отказаните. Изкараните пари са сборът от цените на завършените записи.
      </p>
    </section>
  );
}
