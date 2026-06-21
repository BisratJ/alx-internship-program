# ALX Internship Program & Intern Manager

A complete, free, lightweight platform for the ALX Community Growth Sprint, in two connected parts:

1. **Program landing page** (`index.html`) - the public-facing program overview: roadmap, pillars, deliverables, brand toolkit, and FAQ. Its calls-to-action open the management app.
2. **Intern Manager** (`manager/`) - a multi-user internship management system:
   - `manager/index.html` - sign in (choose profile; production = one-tap Google sign-in)
   - `manager/admin.html` - Program Manager cockpit: cohort KPIs, at-risk surfacing, intern cards/table, individual profile drawer, feedback + weekly evaluation, CSV export
   - `manager/intern.html` - personalized intern dashboard: roadmap, daily log, journal, deliverables, achievements, feedback
   - `manager/data.js` - seed data + `Store` API (swap to a free Supabase tier later without touching the UI)

## Tech stack (100% free, no paid services)
Vanilla HTML / CSS / JavaScript (no framework, no build step), Google Fonts, client-side `localStorage` data layer. Deploys free on Vercel or GitHub Pages. Light + dark mode, responsive, accessible.

## Roles & privacy
Each intern sees only their own data; the admin sees the whole cohort. All access flows through one `Store` API, so moving to a real backend (free Supabase tier: Postgres + Row-Level Security) only means reimplementing `Store`, not the UI. Full design in `Multi-User-Platform-Architecture.md`.

## Deploy
Static site, no config needed. Import on Vercel (framework: Other) and deploy. `index.html` serves at root; the app at `/manager/`.

Note: localStorage is per-browser, so the current build is single-device (great for demo). For true cross-device multi-user, wire `Store` to the free Supabase tier (next phase).
