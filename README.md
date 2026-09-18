# Tracking Lab

A custom Next.js Single Page Application built as a sandbox for testing and debugging dataLayer, Google Tag Manager, and GA4 implementations.

## Quick Start

### Local deployment

1. Copy [`.env.example`](.env.example) to `.env.local` and set `NEXT_PUBLIC_GTM_ID` to your own GTM container ID.
2. `npm install`
3. `npm run dev` — open [http://localhost:3000](http://localhost:3000).

That's it — no other setup or infrastructure is required. If `NEXT_PUBLIC_GTM_ID` isn't set, the app still runs and every event is still visible in the DataLayer Viewer; GTM itself just won't load.

Want the tags themselves wired up too, not just the dataLayer pushes? See [Ready-made GTM Container](#ready-made-gtm-container) below.

### Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/etolk/gtm-lab-playground&env=NEXT_PUBLIC_GTM_ID&envDescription=Your+GTM+container+ID&project-name=gtm-lab-playground&repository-name=gtm-lab-playground)

This deploys the app on **Vercel**. You'll need a Vercel account — if you don't have one, the button will prompt you to create one (e.g. by signing in with your GitHub account). The same flow also connects Vercel to your GitHub account and creates its own copy of this repo there, so future pushes to your copy auto-deploy. Enter your `NEXT_PUBLIC_GTM_ID` when prompted and it deploys immediately — no other config needed.

### Ready-made GTM Container

This repo ships a pre-built GTM container — [`gtm-container.json`](gtm-container.json) — with all the tags, triggers, and variables needed to send every event this app fires straight into GA4. No manual tag setup required.

**Import it:**

1. In [Google Tag Manager](https://tagmanager.google.com/), open the container you set as `NEXT_PUBLIC_GTM_ID` (or create a new one).
2. Go to **Admin → Import Container**.
3. Choose [`gtm-container.json`](gtm-container.json), pick your workspace, then choose **Merge** (or **Overwrite** for an empty container) → **Confirm**.
4. Replace the placeholder `G-REPLACE_ME` with your own GA4 Measurement ID (found in GA4 Admin → Data Streams). It appears on 14 tags — 2 GA4 Configuration tags plus 12 event tags — update the Measurement ID field on each.
5. **Submit** and publish the container version.

That's it — every event in [Pages & Tracking Scenarios](#pages--tracking-scenarios) and [Global Events](#global-events-any-page) below now flows into your GA4 property.

## Features

### Pages & Tracking Scenarios

Every route fires a virtual `vl_page_view` (with `page_location`, `page_path`, `page_title`, and a derived `page_referrer`) plus the scenario-specific events below.

| Page | Route | Events |
|---|---|---|
| **Home** | `/` | `vl_page_view` |
| **Shop** | `/shop` | `view_item_list`, `select_item` |
| **Product** | `/product/[id]` | `view_item`, `add_to_cart` |
| **Checkout** | `/checkout` | `begin_checkout`, `add_shipping_info`, `add_payment_info`, `purchase` |
| **Blog** | `/blog` | `scroll` (25/50/75/100%), `engaged_reader` |
| **Form** | `/form` | `form_start`, `form_interaction`, `form_error`, `form_submit` |
| **Media** | `/media` | `video_start`, `video_play`, `video_pause`, `video_progress` (10/25/50/75/90%), `video_complete` |
| **404** | any invalid route | `vl_page_view` (with `error_path` / `error_url`) |
| **Error** | runtime exception | `exception` |

### Global Events (any page)

Fired from shared chrome and consent UI:

| Source | Events |
|---|---|
| **Navigation** | `search`, `navigation_click`, `login`, `logout`, `ui_interaction` (theme & mobile-menu toggles) |
| **Consent Banner** | `consent:default`, `consent:update` (Consent Mode v2), `consent_update` (custom) |

### Components

- **DataLayer Viewer** — floating, draggable panel that intercepts `dataLayer.push()` in real-time. Shows event names, timestamps, expandable JSON payloads, and consent mode signals.
- **Consent Banner** — Google Consent Mode v2 implementation with `consent:default` and `consent:update` signals.
- **GTM Provider** — loads GTM (directly from `googletagmanager.com` by default, or via an optional server-side tagging endpoint) with SPA route change tracking. The container ID and SST path are configurable via env vars (see below).
- **Theme Toggle** — light/dark mode with persistent preference.

All dataLayer access goes through the helpers in [`lib/tracking.ts`](lib/tracking.ts) (`pushToDataLayer`, `pushPageView`, etc.) for a consistent payload shape.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Vanilla CSS with CSS variables
- **GTM**: Direct client-side load by default, with optional server-side tagging
- **Deployment**: Vercel

## Server-Side Tagging (SST) — optional

By default GTM loads directly from `googletagmanager.com` — nothing else to configure. If you run your own server-side tagging setup (e.g. a **Google Tag Gateway on Cloudflare**) and want to proxy the GTM loader and collection requests under your own origin, set `NEXT_PUBLIC_GTM_SST_PATH` to that path and the app will load GTM through it instead.

Because that gateway lives at the infrastructure layer (outside this repo), the SST path will only resolve on environments actually fronted by it — leave the variable unset unless you've set one up.

## Environment Variables

Copy [`.env.example`](.env.example) to `.env.local` to configure GTM:

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_GTM_ID` | Yes | GTM container ID loaded by the client. If unset, GTM never loads (the rest of the app and DataLayer Viewer still work) |
| `NEXT_PUBLIC_GTM_SST_PATH` | No | First-party SST loader path (Google Tag Gateway), if you have one. Must end with a trailing slash. Leave unset to load GTM directly |

## Build

```bash
npm run build
```

## Testing

Unit tests (Vitest) cover the tracking helpers and product catalog:

```bash
npm test        # run once
npm run test:watch
```

## Deployment

Deploys cleanly to Vercel connected to a GitHub repo — see [Deploy your own](#deploy-your-own) above. Once connected, pushes to `main` trigger automatic builds.

## License

[MIT](LICENSE)
