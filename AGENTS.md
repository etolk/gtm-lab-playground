# AGENTS.md

Guidance for AI agents working in this repository.

## Project

Tracking Lab is a Next.js 16 (App Router, Turbopack) Single Page Application used as a sandbox for testing and debugging `dataLayer`, Google Tag Manager (GTM), and GA4 implementations. It is written in TypeScript with vanilla CSS, and deployed via Vercel.

Each route fires a virtual `vl_page_view` plus scenario-specific events (see `README.md` for the full event matrix). Global events come from shared navigation chrome and the consent banner.

## Core conventions

- All `dataLayer` access MUST go through the helpers in `lib/tracking.ts` (`pushToDataLayer`, `pushPageView`, etc.). Do NOT call `window.dataLayer.push(...)` directly anywhere else, so payload shapes stay consistent.
- Keep event names and payload fields aligned with the event matrix documented in `README.md`. If you add or change an event, update `README.md` in the same change.
- Consent uses Google Consent Mode v2 (`consent:default` / `consent:update`). Preserve consent signals when touching the consent banner or GTM provider.
- GTM loads directly from `googletagmanager.com` by default. An optional first-party server-side tagging (SST) path can be set via env var if the deployment has its own tagging gateway.

## Environment variables

- `NEXT_PUBLIC_GTM_ID` — GTM container ID loaded by the client. Required; if unset, GTM never loads (rest of the app and DataLayer Viewer still work).
- `NEXT_PUBLIC_GTM_SST_PATH` — optional first-party SST loader path; must end with a trailing slash. Leave unset to load GTM directly from `googletagmanager.com`.

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_GTM_ID` to get started locally.

## Verification

Run these before proposing or committing changes; they mirror CI (`.github/workflows/ci.yml`):

```bash
npm run lint        # ESLint
npx tsc --noEmit    # TypeScript type check
npm test            # Vitest unit tests
npm run build       # Next.js production build
```
