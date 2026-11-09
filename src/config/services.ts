import type { Service } from "./schema";

/**
 * Service catalogue. Rendered dynamically by ServicesSection, PricingSection
 * and (from Sprint 4) the inquiry form's service select.
 *
 * To add a service: append an entry, fill in both languages, set `enabled: true`.
 * No component changes are needed (SRS §8.3).
 *
 * ⚠️ TO CONFIRM WITH THE BUSINESS before launch:
 *   - `features`: list only operations actually offered (SRS §5.3).
 *   - `price` / `durationMinutes`: left as null — never invent prices.
 *   - Do not add UV coating, guarantees or durability claims unless confirmed.
 */
export const services = [
  {
    id: "interior-cleaning",
    title: {
      bg: "Пране на интериор",
      en: "Interior Deep Cleaning",
    },
    shortDescription: {
      bg: "Дълбоко почистване на тапицерия, мокети и вътрешни повърхности.",
      en: "Deep cleaning of upholstery, carpets and interior surfaces.",
    },
    description: {
      bg: "Почистване с професионална техника и препарати, подбрани според вида на материала. Работим внимателно с всяка повърхност в купето.",
      en: "Cleaning with professional equipment and products chosen for each type of material. Every surface in the cabin is treated with care.",
    },
    features: [
      { bg: "Пране на текстилни седалки", en: "Fabric seat cleaning" },
      { bg: "Пране на мокети и стелки", en: "Carpet and mat cleaning" },
      { bg: "Почистване на пода", en: "Floor cleaning" },
      { bg: "Почистване на багажника", en: "Trunk cleaning" },
      { bg: "Почистване на тавана", en: "Headliner cleaning" },
    ],
    image: "/images/services/interior-cleaning.svg", // illustration — replace with a real photo
    price: null,
    durationMinutes: null,
    enabled: true,
    order: 1,
  },
  {
    id: "headlight-restoration",
    title: {
      bg: "Възстановяване на фарове",
      en: "Headlight Restoration",
    },
    shortDescription: {
      bg: "Полиране на помътнели и пожълтели фарове.",
      en: "Polishing of cloudy and yellowed headlights.",
    },
    description: {
      bg: "Възстановяваме прозрачността на пластмасовите стъкла на фаровете чрез поетапна обработка на повърхността.",
      en: "We restore the clarity of plastic headlight lenses through step-by-step surface treatment.",
    },
    features: [
      { bg: "Подготовка на повърхността", en: "Surface preparation" },
      { bg: "Шлайфане, когато е необходимо", en: "Sanding, where appropriate" },
      { bg: "Полиране", en: "Polishing" },
    ],
    image: "/images/services/headlight-restoration.svg", // illustration — replace with a real photo
    price: null,
    durationMinutes: null,
    enabled: true,
    order: 2,
  },
] satisfies Service[];
