# ALX Internship Program — Community Growth Sprint

A modern, responsive web app for a 14-day, project-based ALX internship: program overview, an interactive two-week roadmap, deliverables, brand toolkit, FAQs, and a dedicated **Progress Dashboard** for daily activity logging and milestone tracking.

## Stack
Static HTML/CSS/JS — no build step. Light & dark mode, fully responsive, accessible. Built on the ALX brand (Poppins; Twilight Blue, Deep Navy, CTA Purple + secondary palette).

## Files
- `index.html` — landing page (overview, pillars, roadmap, deliverables, toolkit, FAQ)
- `dashboard.html` — progress tracking dashboard (statuses, notes, achievements, phase progress)
- `styles.css` — shared design system
- `app.js` — shared roadmap data + helpers (state, theme, metrics)

## Deploy on Vercel
No configuration needed — it's a static site.
1. Import this repo at vercel.com → **Add New… → Project**.
2. Framework preset: **Other**. No build command, no output dir.
3. **Deploy.** `index.html` serves at the root; `dashboard.html` at `/dashboard.html`.

Progress is stored per-browser via `localStorage`.
