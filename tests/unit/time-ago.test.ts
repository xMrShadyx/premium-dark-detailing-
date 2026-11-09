import { describe, expect, it } from "vitest";
import { timeAgo } from "@/admin/ui";

describe("timeAgo (request cards)", () => {
  const now = new Date(2026, 10, 9, 21, 0);
  const at = (d: number, h: number, m = 0) => new Date(2026, 10, d, h, m).toISOString();

  it("speaks in minutes, hours, yesterday and days", () => {
    expect(timeAgo(at(9, 21), now)).toBe("току-що");
    expect(timeAgo(at(9, 20, 45), now)).toMatch(/15 минути/);
    expect(timeAgo(at(9, 19), now)).toMatch(/2 часа/);
    expect(timeAgo(at(8, 15), now)).toBe("вчера");
    expect(timeAgo(at(6, 10), now)).toMatch(/3 дни/);
  });

  it("falls back to the date after a week", () => {
    expect(timeAgo(at(1, 10), now)).toMatch(/1\.11\.2026|1 ное/);
  });
});
