import { describe, expect, it } from "vitest";
import type { InquiryRow } from "@/admin/api";
import { parsePrice } from "@/admin/calendar/model";
import { averagePrice, computeStats, periodRange, successRate } from "@/admin/stats";

const row = (
  id: string,
  service_id: string,
  status: InquiryRow["status"],
  when: Date,
  price: number | string | null,
): InquiryRow => ({
  id,
  created_at: when.toISOString(),
  updated_at: when.toISOString(),
  name: id,
  phone: "+359881234567",
  email: null,
  service_id,
  vehicle: null,
  preferred_date: null,
  message: null,
  lang: "bg",
  status,
  scheduled_at: status === "new" ? null : when.toISOString(),
  duration_minutes: 60,
  admin_note: null,
  source: "admin",
  price: price as number | null,
});

const nov = (d: number) => new Date(2026, 10, d, 10);

describe("admin statistics", () => {
  const rows = [
    row("a", "interior-cleaning", "done", nov(2), 80),
    row("b", "interior-cleaning", "done", nov(3), "120.50"), // numeric as string from the API
    row("c", "interior-cleaning", "done", nov(4), null), // no price entered
    row("d", "headlight-restoration", "done", nov(5), 60),
    row("e", "headlight-restoration", "rejected", nov(6), null),
    row("f", "headlight-restoration", "scheduled", nov(20), 70),
    row("g", "interior-cleaning", "new", nov(21), null),
    row("old", "interior-cleaning", "done", new Date(2026, 9, 30, 10), 999), // October
  ];

  it("counts and sums entries in the period", () => {
    const s = computeStats(rows, periodRange("this-month", nov(15)));
    expect([s.total, s.done, s.rejected, s.scheduled, s.new]).toEqual([7, 4, 1, 1, 1]);
    expect(s.revenue).toBeCloseTo(260.5);
    expect(s.expected).toBe(70);
    expect(s.unpriced).toBe(1);
    expect(averagePrice(s)).toBeCloseTo(260.5 / 3);
    expect(successRate(s)).toBeCloseTo(4 / 5);
  });

  it("splits by service and by month", () => {
    const s = computeStats(rows, null);
    const interior = s.byService.find((x) => x.serviceId === "interior-cleaning")!;
    expect([interior.done, interior.revenue]).toEqual([4, 80 + 120.5 + 999]);
    expect(s.byMonth.map((m) => [m.key, m.done])).toEqual([
      ["2026-10", 1],
      ["2026-11", 4],
    ]);
  });

  it("parses prices typed with a comma, and rejects junk", () => {
    expect(parsePrice("80")).toBe(80);
    expect(parsePrice(" 80,50 € ")).toBe(80.5);
    expect(parsePrice("")).toBeNull();
    expect(parsePrice("-5")).toBeNaN();
    expect(parsePrice("abc")).toBeNaN();
  });
});
