import { describe, expect, it } from "vitest";
import { emptyInquiry, validateInquiry, type InquiryValues } from "@/features/inquiries/inquiry.schema";
import { buildInquiryMessage } from "@/features/inquiries/viber";
import { submitInquiry } from "@/features/inquiries/inquiry.service";
import { createI18n } from "@/lib/i18n";

const ids = ["interior-cleaning", "headlight-restoration"];
const valid: InquiryValues = {
  ...emptyInquiry,
  name: "Иван Петров",
  phone: "+359 88 123 4567",
  serviceId: "interior-cleaning",
  message: "Петна по задната седалка.",
  consent: true,
};

describe("validateInquiry", () => {
  it("accepts a complete inquiry", () => {
    expect(validateInquiry(valid, ids).ok).toBe(true);
  });

  it("reports every invalid field with an i18n key", () => {
    const result = validateInquiry(
      { ...emptyInquiry, name: "И", phone: "abc", email: "x@", serviceId: "nope", message: "кратко" },
      ids,
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toMatchObject({
      name: "validation.name",
      phone: "validation.phone",
      email: "validation.email",
      serviceId: "validation.service",
      message: "validation.message",
      consent: "validation.consent",
    });
  });

  it("allows an empty optional email and date", () => {
    expect(validateInquiry({ ...valid, email: "", preferredDate: "" }, ids).ok).toBe(true);
  });

  it("rejects a disabled or unknown service", () => {
    expect(validateInquiry({ ...valid, serviceId: "interior-cleaning" }, ["headlight-restoration"]).ok).toBe(false);
  });
});

describe("buildInquiryMessage", () => {
  const t = createI18n("bg").getFixedT("bg");

  it("includes filled fields and skips empty optional ones", () => {
    const text = buildInquiryMessage({ ...valid, vehicle: "Škoda Octavia" }, "Пране на интериор", "bg", t);
    expect(text).toContain("Запитване от уебсайта");
    expect(text).toContain("Име: Иван Петров");
    expect(text).toContain("Услуга: Пране на интериор");
    expect(text).toContain("Марка и модел: Škoda Octavia");
    expect(text).not.toContain("Имейл:");
    expect(text).not.toContain("Предпочитана дата:");
    expect(text.endsWith("Петна по задната седалка.")).toBe(true);
  });
});

describe("submitInquiry", () => {
  it("runs in demo mode without an endpoint and never reports success", async () => {
    expect(await submitInquiry(valid, "bg")).toEqual({ status: "demo" });
  });
});
