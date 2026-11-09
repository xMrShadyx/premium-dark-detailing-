# Premium Dark Auto Detailing — SPA

Bilingual (BG/EN), configuration-driven single-page website for a car detailing business:
interior deep cleaning and headlight restoration.

**Status:** Admin panel (inquiries, schedule, gallery uploads) on Supabase. Header, Hero, Services, Pricing, Gallery (empty state / simple pairs), Contact with
the inquiry form (Zod validation, copy-to-clipboard, Viber flow, demo mode) and Footer are
implemented. Still to do: About (Sprint 2), the draggable before/after slider and full-screen
viewer (Sprint 3), the serverless email endpoint (Sprint 4), full prerendering (Phase 5).

Illustrations in `public/images/` are placeholders; replace them with real photographs.

## Stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · i18next / react-i18next · Zod ·
Lucide React · Vitest + React Testing Library · Playwright.

Motion for React and React Hook Form are part of the approved stack but are added in the
sprints that use them (animations — Sprint 2, inquiry form — Sprint 4) to keep the bundle lean.

## Getting started

Requires Node.js 20.19+ (22 LTS recommended).

```bash
npm install
npm run dev            # http://localhost:5173 → redirects to /bg/
```

Open `/bg/` or `/en/`. `/` redirects to the remembered language, or `/bg/` by default.

| Script                    | Purpose                                                |
| ------------------------- | ------------------------------------------------------ |
| `npm run dev`             | Development server                                     |
| `npm run build`           | Validates config + translations, type-checks, builds   |
| `npm run preview`         | Serves the production build                            |
| `npm test`                | Unit and component tests (Vitest)                      |
| `npm run test:e2e`        | Playwright smoke tests (run `npx playwright install` once) |
| `npm run lint` / `format` | ESLint / Prettier                                      |

> No lockfile is committed yet: dependency versions are caret ranges. Run `npm install` once,
> verify, and commit the generated `package-lock.json`.

## Editing content — no component changes needed

All business data lives in `src/config/`. Every file is validated with Zod at startup, in tests
and during `npm run build`; an invalid value stops the build with a readable message.

| File                    | What it holds                                               |
| ----------------------- | ----------------------------------------------------------- |
| `src/config/site.ts`    | Business name, logo, contact, location, hours, hero image   |
| `src/config/services.ts`| Services, features, prices, durations, enabled/order        |
| `src/config/sections.ts`| Which sections appear in navigation                         |
| `src/locales/bg.json` / `en.json` | All interface text                                |

Rules the UI follows:

- **Empty business name** (`businessName: ""`) → no brand element, no empty logo slot.
- **Empty contact values** → that channel is hidden, never shown as a placeholder.
- **`price: null`** → "Цена по запитване" / "Price on request".
  `type: "starting_from"` → "От 120 €" / "From €120". Never invent prices.
- **`durationMinutes: null`** → duration is hidden.
- **`hero.image: null`** → a built-in abstract CSS visual is used (no stock photo).

### Adding a service

1. Append an entry to `src/config/services.ts` with a unique kebab-case `id`.
2. Fill in `bg` and `en` for title, descriptions and features.
3. Optionally set `image` (a file in `public/images/services/`), `price`, `durationMinutes`.
4. Set `enabled: true` and an `order`.

It appears automatically in Services and Pricing (and in the inquiry form from Sprint 4).

### Before launch — confirm with the business

- The feature lists in `services.ts` are taken from the SRS's *potential* operations. Keep only
  what is actually offered.
- No UV coating, guarantees, durability or experience claims unless verified.
- Real photographs for the hero and services (AVIF/WebP, correct dimensions).

## Internationalisation

- Routes: `/bg/` and `/en/`; switching keeps the section (`/bg/#pricing` → `/en/#pricing`).
- The chosen language is remembered in `localStorage` (best-effort).
- In development there is no fallback language: a missing key renders as the raw key and logs
  `[i18n] Missing translation …`. `tests/unit/locales.test.ts` fails if the two files differ in
  keys or placeholders.
- `<html lang>`, title, description, canonical, hreflang and Open Graph tags are updated per
  language. Set `VITE_SITE_URL` (or `siteConfig.siteUrl`) to the production origin.

## Design tokens

Defined once in `src/styles/index.css` (`@theme`) and used as Tailwind utilities:
`bg-bg`, `bg-bg-2`, `bg-surface`, `bg-surface-hover`, `text-fg`, `text-fg-muted`, `border-line`,
`text-gold` / `bg-gold` / `bg-gold-hover`, `text-error`, `text-success`, `font-display` (Manrope),
`font-sans` (Inter), fluid sizes `text-hero`, `text-section`, `text-card`.
Fonts are self-hosted via Fontsource (WOFF2, Cyrillic + Latin subsets).

## Project structure

```
src/
  app/            App shell, LocaleProvider (routing + i18n + <head>)
  components/     layout/ (Header, Navigation, MobileMenu, Footer), ui/, services/
  sections/       Hero, Services, Pricing, Contact
  features/       inquiries/ (service-intent context; form in Sprint 4)
  config/         schema.ts (Zod) + site.ts, services.ts, sections.ts
  locales/        bg.json, en.json
  lib/            i18n, locale, format, seo, contact helpers
  hooks/          useScrolled, useLockBodyScroll
tests/
  unit/ component/ e2e/
```

## Inquiry form

- With `VITE_INQUIRY_ENDPOINT` empty the form runs in a clearly labelled **demo mode**: nothing is
  sent and the UI says so. Visitors can still copy the formatted inquiry or open Viber.
- With an endpoint set, the form POSTs JSON (`name, phone, email, serviceId, vehicle,
  preferredDate, message, consent, website, lang`). Success is shown only on a 2xx response;
  on failure the typed data is kept. `website` is a honeypot — reject submissions where it is filled.
- The endpoint must validate again, rate-limit, and hold the email API key server-side.
- Viber: shown only when `contact.viber` is configured. The inquiry is copied first, then the
  chat opens; the UI never claims a Viber message was sent.

## Admin panel (`/admin/`)

A private panel for the owner, served at `<site>/admin/` (not linked from the site, `noindex`).
It is a separate lazy-loaded chunk, so public visitors never download it.

- **Заявки** — every inquiry from the website form. Filter by status (Нова / Насрочена /
  Завършена / Отказана), call or open Viber, set date, time and duration, mark done or rejected,
  keep a private note, delete.
- **График** — upcoming appointments grouped by day; overlapping jobs are flagged.
- **Галерия** — upload a before/after pair (photos are resized to 1600 px WebP and stripped of
  location metadata in the browser), publish/hide, reorder, delete. Once at least one uploaded
  pair is published, the public gallery shows uploaded pairs instead of the demo pairs.

The customer is notified manually (phone / Viber); no automatic emails.

### One-time setup (Supabase, free plan)

1. Create a project at supabase.com (region: Frankfurt / EU).
2. **SQL Editor** → paste and run `supabase/migrations/20261109000000_admin_panel.sql`.
3. **Authentication → Sign In / Providers** → turn **off** "Allow new users to sign up".
4. **Authentication → Users → Add user** → your email and a strong password.
5. **SQL Editor** → make that user the admin:
   ```sql
   insert into public.admins (user_id)
     select id from auth.users where email = 'YOUR-EMAIL@example.com';
   ```
6. **Project Settings → API** → copy *Project URL* and the *anon public* key.
7. GitHub repo → **Settings → Secrets and variables → Actions → Variables** → add
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then re-run the deploy workflow.
   (Locally: put them in `.env.local`.)

The anon key is public by design: Row Level Security only lets visitors insert inquiries and read
published gallery items; everything else requires the admin login. **Never** use the
`service_role` key in the frontend.

### Data and privacy

Inquiries contain personal data (name, phone, optional email). Delete finished or rejected
inquiries you no longer need (e.g. after 12 months) from the panel, and mention the retention
period in the privacy notice. The database also rate-limits submissions (3 per phone per hour,
60 per hour in total) and rejects the form's honeypot field.

## Deployment

### GitHub Pages (configured)

`.github/workflows/deploy.yml` builds on every push to `main` and publishes `dist/` to Pages
(Settings → Pages → Source: **GitHub Actions**). The workflow sets `BASE_PATH=/<repo-name>/`.
`scripts/postbuild.mjs` writes `dist/bg/index.html`, `dist/en/index.html` (English `lang`, title,
description) and `dist/404.html`, so deep links and refreshes of `/en/` work on a static host.
`.github/workflows/ci.yml` runs lint and tests on pushes and pull requests.

### Other hosts

`npm run build` outputs static files to `dist/`. For a root deployment leave `BASE_PATH` unset.
`public/_redirects` contains Netlify-style rules. Never put secrets in `VITE_*` variables.
