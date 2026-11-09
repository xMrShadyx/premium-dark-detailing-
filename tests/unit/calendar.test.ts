import { describe, expect, it } from "vitest";
import { barsForMonth, buildMonths, overlappingIds } from "@/admin/calendar/model";
import type { InquiryRow } from "@/admin/api";

const row = (id: string, start: Date, minutes: number): InquiryRow => ({
  id,
  created_at: start.toISOString(),
  updated_at: start.toISOString(),
  name: id,
  phone: "+359881234567",
  email: null,
  service_id: "interior-cleaning",
  vehicle: null,
  preferred_date: null,
  message: null,
  lang: "bg",
  status: "scheduled",
  scheduled_at: start.toISOString(),
  duration_minutes: minutes,
  admin_note: null,
  source: "admin",
});

describe("calendar model", () => {
  it("builds month rows with the right number of days", () => {
    const months = buildMonths(new Date(2026, 10, 15), 4); // Nov 2026 → Feb 2027
    expect(months.map((m) => m.days)).toEqual([30, 31, 31, 28]);
    expect(months[3]!.year).toBe(2027);
  });

  it("places a same-day job on one day and stacks overlapping jobs in lanes", () => {
    const nov = buildMonths(new Date(2026, 10, 1), 1)[0]!;
    const a = row("a", new Date(2026, 10, 12, 9), 120);
    const b = row("b", new Date(2026, 10, 12, 10), 60);
    const bars = barsForMonth([a, b], nov, overlappingIds([a, b]));
    expect(bars.map((x) => [x.startDay, x.endDay, x.lane, x.overlap])).toEqual([
      [12, 12, 0, true],
      [12, 12, 1, true],
    ]);
  });

  it("spans multi-day jobs and clips them at month boundaries", () => {
    const [nov, dec] = buildMonths(new Date(2026, 10, 1), 2);
    const job = row("m", new Date(2026, 10, 29, 9), 2 * 1440 + 480); // 3 days: 29, 30, Dec 1
    const inNov = barsForMonth([job], nov!, new Set())[0]!;
    const inDec = barsForMonth([job], dec!, new Set())[0]!;
    expect([inNov.startDay, inNov.endDay, inNov.continuesAfter]).toEqual([29, 30, true]);
    expect([inDec.startDay, inDec.endDay, inDec.continuesBefore]).toEqual([1, 1, true]);
  });

  it("does not flag jobs that only touch end-to-start", () => {
    const a = row("a", new Date(2026, 10, 12, 9), 60);
    const b = row("b", new Date(2026, 10, 12, 10), 60);
    expect(overlappingIds([a, b]).size).toBe(0);
  });
});
