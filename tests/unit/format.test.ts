import { describe, expect, it } from "vitest";
import { createI18n } from "@/lib/i18n";
import { formatDuration, formatPrice } from "@/lib/format";

const bgT = createI18n("bg").getFixedT("bg");
const enT = createI18n("en").getFixedT("en");
// Intl may use non-breaking spaces; normalise for readable assertions.
const norm = (s: string | null) => s?.replace(/[\u00a0\u202f]/g, " ");

describe("formatPrice", () => {
  it("shows a localized 'price on request' label for null", () => {
    expect(formatPrice(null, "bg", bgT)).toBe("Цена по запитване");
    expect(formatPrice(null, "en", enT)).toBe("Price on request");
  });

  it("formats a fixed price per locale", () => {
    const price = { amount: 120, currency: "EUR" as const, type: "fixed" as const };
    expect(norm(formatPrice(price, "bg", bgT))).toBe("120 €");
    expect(norm(formatPrice(price, "en", enT))).toBe("€120");
  });

  it("prefixes starting prices with От / From", () => {
    const price = { amount: 49.5, currency: "EUR" as const, type: "starting_from" as const };
    expect(norm(formatPrice(price, "bg", bgT))).toBe("От 49,50 €");
    expect(norm(formatPrice(price, "en", enT))).toBe("From €49.50");
  });
});

describe("formatDuration", () => {
  it("hides unconfigured durations", () => {
    expect(formatDuration(null, bgT)).toBeNull();
  });

  it("formats minutes and hours", () => {
    expect(formatDuration(45, bgT)).toBe("45 мин");
    expect(formatDuration(120, bgT)).toBe("2 ч");
    expect(formatDuration(90, bgT)).toBe("1 ч 30 мин");
    expect(formatDuration(90, enT)).toBe("1 h 30 min");
  });
});
