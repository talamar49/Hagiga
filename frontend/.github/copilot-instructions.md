Purpose
-------
This repo is a small Next.js frontend for an event planner. These instructions give immediate, actionable context to an AI coding agent so it can make safe, high-value changes quickly.

High-level architecture (big picture)
-------------------------------------
- Next.js app (pages/ routing). Top-level bootstrap is `pages/_app.tsx` which wraps every page with `ThemeProvider` from `lib/theme.tsx`.
- UI primitives: `styles/globals.css` defines lightweight utility classes used across pages: `.container`, `.card`, `.row`, `.col`, and `.btn`.
- i18n: simple keyed translator in `lib/i18n.ts` with `t(key, lang)` and language toggles performed at page-level (see `pages/events/[id]/import.tsx`).
- API proxy: client-side calls that need to reach the backend are routed via `pages/api/proxy/[...path].ts` which forwards requests to `http://localhost:4000/api/v1/...`. Use this when wiring frontend -> backend calls.
- Important pages: `pages/login.tsx`, `pages/register.tsx` (Hebrew RTL added), `pages/events/[id]/import.tsx` (CSV parsing + upload flow). Use these as canonical examples.

Project-specific conventions and patterns
----------------------------------------
- Language handling: pages set `dir` and `lang` attributes on the root element (e.g. `dir="rtl" lang="he"` for Hebrew). When updating/creating pages, ensure:
  - UI copy uses `t(key, 'en'|'he')` for strings that appear in the import flow.
  - For inputs that expect left-to-right text (email, password, numeric fields), set `dir="ltr"` on the input element so caret/placeholder behave correctly.
- Layout primitives: prefer `.container` and `.card` for consistent spacing. Use `.row` + `.col` for responsive horizontal layouts. There are minimal media queries in `globals.css` — prefer adding small component-scoped styles rather than heavy refactors.
- Theme: `lib/theme.tsx` exposes `useTheme()`; toggling sets `data-theme` on `<html>` so CSS variables change. Keep color choices aligned with `:root` variables.
- API: use the proxy endpoint to forward Authorization headers. When adding new client API helpers, put them under `lib/` and follow the shape used by `lib/api` (see usage in `pages/events/[id]/import.tsx`).

Build / dev / debug workflows
-----------------------------
- Install & dev server:
  - npm install
  - npm run dev (runs `next dev`)
- Production build:
  - npm run build
  - npm run start
- Type checks: repo uses TypeScript — run `npx tsc --noEmit` to catch type errors quickly.
- Linting: `npm run lint` maps to `next lint` (ESLint is a devDependency). If ESLint is not installed, running lint will attempt to install dev dependencies.

Integration points / external dependencies
----------------------------------------
- Backend: proxied at `http://localhost:4000/api/v1/` via `pages/api/proxy/[...path].ts`. Any frontend change that calls the backend should use the proxy to keep auth forwarding behavior.
- OAuth / Auth: Google sign-in buttons are present as placeholders in `pages/login.tsx` and `pages/register.tsx`. There is no integrated provider; wire to your auth solution (next-auth, Firebase, or custom) and update the buttons to call real flows.
- CSV upload: `pages/events/[id]/import.tsx` contains a small CSV parser and client-side validation — use it as the reference for handling file input, parsing, preview, and upload.

Editing conventions for UI and i18n
---------------------------------
- When adding new pages, always provide both `en` and `he` strings in `lib/i18n.ts` (or add a local fallback to `t()`), and set the root element's `dir` attribute appropriately.
- Prefer small, self-contained CSS additions in `styles/globals.css` or component inline styles for this codebase rather than introducing a new CSS framework without alignment with the team.
- Responsiveness: reuse `.container`, `.row`, `.col` and the existing media query at the bottom of `globals.css`. New components should be mobile-first and test in narrow widths.

Quick examples (what to do in common edits)
-----------------------------------------
- Add a bilingual string:
  - Add key to `lib/i18n.ts` under both `en` and `he`.
  - Use it: `import { t } from '../lib/i18n'; t('myKey', lang)` where `lang` is `'en'|'he'`.
- Add a page with RTL support:
  - In the page root element: `<main dir={lang === 'he' ? 'rtl' : 'ltr'} lang={lang === 'he' ? 'he' : 'en'}>`
  - For email/password inputs: `<input dir="ltr" />` to avoid RTL caret issues.
- Call backend from client code:
  - POST to `/api/proxy/your/path` instead of calling the backend host directly so the Authorization header forwarding works.

Safety and code review notes for agents
--------------------------------------
- Avoid committing secrets (OAuth client secrets, API keys). If you need to wire auth, add placeholder env var names and document required values in `README.md`.
- Keep edits small and test UI behavior at mobile widths. Prefer incremental PRs rather than large refactors.

If anything here is unclear or you'd like stricter rules (e.g., preferred React components, design tokens, or a UI library), tell me which area to expand and I will update this file.

for every new general instruction you receive update this file with it

Additional rule (added per user request):
- For every new general instruction or guideline provided by the project maintainers during development, append that instruction to this file so the repository's agent guidance record stays up to date.

- Use constants when needed (new rule requested):
  - Prefer values from the `constants/` folder for shared application data such as language keys (Lang), route paths (Routes), storage/local keys (StorageKeys), i18n keys, API base paths, and UI tokens (sizes, paddings).
  - Prefer enums or named constants over string literals. When updating or adding pages/components, check `constants/` first and add to it when a value will be reused across the app.