import { describe, expect, it } from "vitest";
import {
  allServices,
  getEnabledServices,
  hasBusinessName,
  parseServices,
  parseSiteConfig,
  siteConfig,
} from "@/config";
import { siteConfig as rawSite } from "@/config/site";
import type { Service } from "@/config/schema";

const base = allServices[0]!;
const make = (overrides: Partial<Service>): Service => ({ ...base, ...overrides });

describe("configuration", () => {
  it("project config is valid", () => {
    expect(siteConfig.defaultLanguage).toBe("bg");
    expect(allServices.length).toBeGreaterThanOrEqual(2);
  });

  it("supports an empty business name", () => {
    expect(hasBusinessName({ ...siteConfig, businessName: "" })).toBe(false);
    expect(hasBusinessName({ ...siteConfig, businessName: "  " })).toBe(false);
    expect(hasBusinessName({ ...siteConfig, businessName: "Studio" })).toBe(true);
  });

  it("rejects duplicate service ids", () => {
    expect(() => parseServices([base, { ...base }])).toThrow(/Duplicate service id/);
  });

  it("rejects missing translations", () => {
    const broken = { ...base, title: { bg: "Заглавие", en: "" } };
    expect(() => parseServices([broken])).toThrow(/title\.en/);
  });

  it("rejects invented currencies and negative prices", () => {
    expect(() =>
      parseServices([{ ...base, price: { amount: 10, currency: "USD", type: "fixed" } }]),
    ).toThrow();
    expect(() =>
      parseServices([{ ...base, price: { amount: -5, currency: "EUR", type: "fixed" } }]),
    ).toThrow();
  });

  it("rejects malformed contact values but allows empty ones", () => {
    expect(() =>
      parseSiteConfig({ ...rawSite, contact: { phone: "", email: "not-an-email", viber: "" } }),
    ).toThrow(/contact\.email/);
    expect(() => parseSiteConfig(rawSite)).not.toThrow();
  });

  it("returns only enabled services, sorted by order", () => {
    const list = [
      make({ id: "c", order: 3 }),
      make({ id: "a", order: 1 }),
      make({ id: "off", order: 0, enabled: false }),
      make({ id: "b", order: 2 }),
    ];
    expect(getEnabledServices(list).map((s) => s.id)).toEqual(["a", "b", "c"]);
  });
});
