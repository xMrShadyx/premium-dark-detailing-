import type { TFunction } from "i18next";
import type { Language, Price } from "@/config/schema";
import { LOCALE_TAGS } from "./locale";

export function formatCurrency(amount: number, currency: string, lang: Language): string {
  return new Intl.NumberFormat(LOCALE_TAGS[lang], {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * SRS §5.3 pricing rules:
 *  null            → "Price on request"
 *  fixed           → "120 €"
 *  starting_from   → "From 120 €"
 */
export function formatPrice(price: Price | null, lang: Language, t: TFunction): string {
  if (!price) return t("pricing.onRequest");
  const amount = formatCurrency(price.amount, price.currency, lang);
  return price.type === "starting_from" ? t("pricing.from", { price: amount }) : amount;
}

/** 45 → "45 мин", 120 → "2 ч", 90 → "1 ч 30 мин". null → null (hide the field). */
export function formatDuration(minutes: number | null, t: TFunction): string | null {
  if (minutes === null || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return t("duration.minutes", { value: rest });
  if (rest === 0) return t("duration.hours", { value: hours });
  return t("duration.hoursMinutes", { hours, minutes: rest });
}
