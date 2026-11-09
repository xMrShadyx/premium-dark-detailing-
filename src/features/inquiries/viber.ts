import type { TFunction } from "i18next";
import type { Language } from "@/config/schema";
import { LOCALE_TAGS } from "@/lib/locale";
import type { InquiryValues } from "./inquiry.schema";

export function formatPreferredDate(value: string, lang: Language): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(LOCALE_TAGS[lang], { dateStyle: "long" }).format(date);
}

/**
 * Plain-text inquiry for copying into Viber (or any messenger).
 * A Viber link cannot reliably prefill text on every platform (SRS §6.4),
 * so the visitor pastes this message themselves.
 */
export function buildInquiryMessage(
  values: InquiryValues,
  serviceTitle: string,
  lang: Language,
  t: TFunction,
): string {
  const lines: string[] = [
    t("inquiry.messageHeader"),
    "",
    `${t("form.name")}: ${values.name.trim()}`,
    `${t("form.phone")}: ${values.phone.trim()}`,
  ];
  if (values.email.trim()) lines.push(`${t("form.email")}: ${values.email.trim()}`);
  lines.push(`${t("form.service")}: ${serviceTitle}`);
  if (values.vehicle.trim()) lines.push(`${t("form.vehicle")}: ${values.vehicle.trim()}`);
  if (values.preferredDate) {
    lines.push(`${t("form.date")}: ${formatPreferredDate(values.preferredDate, lang)}`);
  }
  lines.push("", values.message.trim());
  return lines.join("\n");
}
