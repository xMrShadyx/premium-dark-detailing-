import type { InquiryRow, InquiryStatus } from "./api";

export type Counts = Record<InquiryStatus, number> & {
  total: number;
  /** Sum of prices of completed entries (EUR). */
  revenue: number;
  /** Sum of prices of entries still scheduled (EUR). */
  expected: number;
  /** Completed entries that have a price — the base for the average. */
  priced: number;
  /** Completed entries without a price (revenue is understated by these). */
  unpriced: number;
};

export type ServiceStats = Counts & { serviceId: string };
export type MonthStats = Counts & { key: string; year: number; month: number };

export type Stats = Counts & {
  byService: ServiceStats[];
  byMonth: MonthStats[];
};

export type PeriodId = "this-month" | "last-month" | "last-3-months" | "this-year" | "last-year" | "all";

export const PERIODS: { id: PeriodId; label: string }[] = [
  { id: "this-month", label: "Този месец" },
  { id: "last-month", label: "Миналия месец" },
  { id: "last-3-months", label: "Последните 3 месеца" },
  { id: "this-year", label: "Тази година" },
  { id: "last-year", label: "Миналата година" },
  { id: "all", label: "Цялото време" },
];

/** [from, to) in local time, or null for all time. */
export function periodRange(id: PeriodId, now = new Date()): { from: Date; to: Date } | null {
  const y = now.getFullYear();
  const m = now.getMonth();
  switch (id) {
    case "this-month":
      return { from: new Date(y, m, 1), to: new Date(y, m + 1, 1) };
    case "last-month":
      return { from: new Date(y, m - 1, 1), to: new Date(y, m, 1) };
    case "last-3-months":
      return { from: new Date(y, m - 2, 1), to: new Date(y, m + 1, 1) };
    case "this-year":
      return { from: new Date(y, 0, 1), to: new Date(y + 1, 0, 1) };
    case "last-year":
      return { from: new Date(y - 1, 0, 1), to: new Date(y, 0, 1) };
    case "all":
      return null;
  }
}

/** The day an entry counts for: its appointment, else the date the customer asked for, else when it came in. */
export function entryDate(row: InquiryRow): Date {
  if (row.scheduled_at) return new Date(row.scheduled_at);
  if (row.preferred_date) return new Date(`${row.preferred_date}T00:00:00`);
  return new Date(row.created_at);
}

function empty(): Counts {
  return { total: 0, new: 0, scheduled: 0, done: 0, rejected: 0, revenue: 0, expected: 0, priced: 0, unpriced: 0 };
}

function add(c: Counts, row: InquiryRow): void {
  // PostgREST may send numeric columns as strings; normalise.
  const price = row.price === null || row.price === undefined ? null : Number(row.price);
  c.total++;
  c[row.status]++;
  if (row.status === "done") {
    if (price === null || Number.isNaN(price)) c.unpriced++;
    else {
      c.revenue += price;
      c.priced++;
    }
  } else if (row.status === "scheduled" && price !== null && !Number.isNaN(price)) {
    c.expected += price;
  }
}

export function computeStats(rows: InquiryRow[], range: { from: Date; to: Date } | null): Stats {
  const total = empty();
  const services = new Map<string, ServiceStats>();
  const months = new Map<string, MonthStats>();

  for (const row of rows) {
    const when = entryDate(row);
    if (range && (when < range.from || when >= range.to)) continue;
    add(total, row);

    let s = services.get(row.service_id);
    if (!s) services.set(row.service_id, (s = { ...empty(), serviceId: row.service_id }));
    add(s, row);

    const key = `${when.getFullYear()}-${String(when.getMonth() + 1).padStart(2, "0")}`;
    let m = months.get(key);
    if (!m) months.set(key, (m = { ...empty(), key, year: when.getFullYear(), month: when.getMonth() }));
    add(m, row);
  }

  return {
    ...total,
    byService: [...services.values()].sort((a, b) => b.revenue - a.revenue || b.total - a.total),
    byMonth: [...months.values()].sort((a, b) => a.key.localeCompare(b.key)),
  };
}

/** Completed share of decided entries (done + rejected), or null when nothing is decided yet. */
export function successRate(c: Counts): number | null {
  const decided = c.done + c.rejected;
  return decided ? c.done / decided : null;
}

export function averagePrice(c: Counts): number | null {
  return c.priced ? c.revenue / c.priced : null;
}
