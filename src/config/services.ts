import type { Service } from "./schema";

/**
 * Service catalogue. Rendered dynamically by ServicesSection, the footer
 * and (from Sprint 4) the inquiry form's service select.
 *
 * To add a service: append an entry, fill in both languages, set `enabled: true`.
 * No component changes are needed (SRS §8.3).
 *
 * ⚠️ TO CONFIRM WITH THE BUSINESS before launch:
 *   - `features`: list only operations actually offered (SRS §5.3).
 *   - `price`: the lowest price from the price list (src/config/pricing.ts).
 *   - Do not add UV coating, guarantees or durability claims unless confirmed.
 */
export const services = [
  {
    id: "headlight-restoration",
    title: {
      bg: "Полиране на фарове",
      en: "Headlight Polishing",
    },
    shortDescription: {
      bg: "Полиране и възстановяване на помътнели и пожълтели фарове.",
      en: "Polishing and restoration of cloudy and yellowed headlights.",
    },
    description: {
      bg: "Възстановяваме прозрачността на пластмасовите стъкла на фаровете чрез поетапна обработка на повърхността.",
      en: "We restore the clarity of plastic headlight lenses through step-by-step surface treatment.",
    },
    features: [
      { bg: "Премахване на замъгляване и пожълтяване", en: "Removes haze and yellowing" },
      { bg: "Възстановяване на прозрачността", en: "Restores clarity" },
      { bg: "По-добра видимост и безопасност", en: "Better visibility and safety" },
      { bg: "По-стилен външен вид", en: "A sharper look" },
    ],
    image: "/images/site/service-headlight.webp", // from the design mock-up — replace with a real photo
    price: { amount: 20, currency: "EUR", type: "starting_from" },
    durationMinutes: null,
    enabled: true,
    order: 1,
  },
  {
    id: "interior-cleaning",
    title: {
      bg: "Пране на интериор",
      en: "Interior Cleaning",
    },
    shortDescription: {
      bg: "Дълбоко почистване на седалки, тапицерия и таван.",
      en: "Deep cleaning of seats, upholstery and headliner.",
    },
    description: {
      bg: "Почистване с професионална техника и препарати, подбрани според вида на материала. Работим внимателно с всяка повърхност в купето.",
      en: "Cleaning with professional equipment and products chosen for each type of material. Every surface in the cabin is treated with care.",
    },
    features: [
      { bg: "Дълбоко почистване на седалки, тапицерия и таван", en: "Deep cleaning of seats, upholstery and headliner" },
      { bg: "Премахване на петна и неприятни миризми", en: "Removes stains and bad odours" },
      { bg: "Освежаване и хигиена на купето", en: "Fresh, hygienic cabin" },
      { bg: "Подходящо за всички видове интериор", en: "Suitable for every type of interior" },
    ],
    image: "/images/site/service-interior.webp", // from the design mock-up — replace with a real photo
    price: { amount: 40, currency: "EUR", type: "starting_from" },
    durationMinutes: null,
    enabled: true,
    order: 2,
  },
] satisfies Service[];
