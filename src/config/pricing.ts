import type { Offer } from "./schema";

/**
 * Price list — taken from the owners' M&M Garage ad (TikTok, Nov 2026).
 * Rendered by PricingSection. To change a price, edit `amount`; to pause a
 * promotion, set `enabled: false`. The gift line is seasonal: remove `gift`
 * when the washer-fluid promotion ends.
 */
const washerFluidGift = {
  bg: "5 л зимна течност за чистачки",
  en: "5 L of winter screen wash",
};

export const offers = [
  {
    id: "car-interior",
    serviceId: "interior-cleaning",
    icon: "car",
    title: { bg: "Пране на лек автомобил", en: "Car interior wash" },
    gift: washerFluidGift,
    price: { amount: 40, currency: "EUR", type: "fixed" },
    enabled: true,
    order: 1,
  },
  {
    id: "van-interior",
    serviceId: "interior-cleaning",
    icon: "van",
    title: { bg: "Пране на пътнически бус", en: "Passenger van interior wash" },
    gift: washerFluidGift,
    price: { amount: 60, currency: "EUR", type: "fixed" },
    enabled: true,
    order: 2,
  },
  {
    id: "headlights",
    serviceId: "headlight-restoration",
    icon: "headlight",
    title: { bg: "Полиране на фарове", en: "Headlight polishing" },
    note: { bg: "без покритие", en: "without coating" },
    price: { amount: 20, currency: "EUR", type: "fixed" },
    enabled: true,
    order: 3,
  },
  {
    id: "headlights-coated",
    serviceId: "headlight-restoration",
    icon: "headlight-coated",
    title: { bg: "Полиране на фарове", en: "Headlight polishing" },
    note: { bg: "с покритие", en: "with coating" },
    price: { amount: 35, currency: "EUR", type: "fixed" },
    enabled: true,
    order: 4,
  },
  {
    id: "promo-package",
    serviceId: "interior-cleaning",
    icon: "package",
    title: { bg: "Промо пакет", en: "Promo package" },
    note: {
      bg: "Пране на салон + полиране на фарове (без покритие)",
      en: "Interior wash + headlight polishing (without coating)",
    },
    gift: washerFluidGift,
    price: { amount: 50, currency: "EUR", type: "fixed" },
    bundles: ["car-interior", "headlights"],
    promo: true,
    enabled: true,
    order: 5,
  },
] satisfies Offer[];
