# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Response style

At the end of every response, include a short **Next steps** section suggesting concrete follow-up actions the user could take.

## Project

Single-page marketing site for **The Hair Color Experts** salon in Cape Coral, FL. Plain HTML/CSS/vanilla JS — no build step, no package manager, no dependencies.

## Commands

```bash
# Serve locally (any static server works)
python3 -m http.server 8000   # then visit http://localhost:8000
```

There is no build, lint, or test tooling. Edits to `index.html`, `css/styles.css`, `js/main.js`, or `images/` take effect on reload.

## Deployment

The site is served from `main` two ways, and **both serve the whole repo root** — so every top-level folder ships (including `assets/`, which the live shop depends on for product photos):

- **GitHub Pages** — the built-in `pages-build-deployment` (with `.nojekyll`); **current canonical URL: https://deegan4.github.io/thehaircolorexperts/**. There is *no* custom `deploy-pages.yml` workflow (it was removed; older docs referencing it are stale).
- **Vercel** — project `glaciersedgemedia-com` auto-deploys `main` to production and builds a preview for each PR. **PR preview URLs are login-protected (HTTP 401)**, so use the GitHub Pages URL (after merge) to review changes.

`og:url` and the schema.org `url` currently point at the GitHub Pages URL "for now"; switch them to `https://www.thehaircolorexperts.com/` once that domain is pointed at the deployment.

The `datadog-synthetics.yml` workflow runs Datadog synthetic tests on every PR to `main`. It **fails without the `DD_API_KEY`/`DD_APP_KEY` repo secrets** — a known, pre-existing failure unrelated to site changes; safe to ignore until the secrets are added.

## Architecture

Only four files matter for the live site:

- `index.html` — entire page markup; all sections (`#home`, `#stats`, `#services`, `#about`, `#gallery`, `#shop`, `#workshop`, `#events`, `#reviews`, `#contact`) live here. Includes `HairSalon` schema.org JSON-LD and Open Graph tags.
- `css/styles.css` — all styling, responsive rules, and reveal-animation classes (`.reveal`, `.is-visible`).
- `js/main.js` — one IIFE wired on `DOMContentLoaded`. Seven responsibilities, each keyed off specific element IDs in `index.html`:
  1. Mobile nav toggle (`#navToggle` / `#nav`, class `is-open`)
  2. Sticky header scroll state + back-to-top (`#header`, `#toTop`)
  3. `IntersectionObserver` scroll-reveal for `.reveal` elements (respects `prefers-reduced-motion`)
  4. Scrollspy that toggles `.nav__link.is-active` based on which `<section>` is in view
  5. Client-side validation for the booking form (`#bookingForm`, status output in `#formStatus`)
  6. **Booking assistant** chatbot (`#chatFab` / `#chat`) — a scripted (not LLM) guided conversation that collects service → time → name → contact, then hands off via a pre-filled `sms:` link to `(239) 257-2243` or by populating `#bookingForm` and scrolling to it. All bubbles are built with `createElement`/`textContent` (no `innerHTML`) so it's XSS-safe by construction. The `SERVICES` array must stay in sync with the `<select id="service">` options for form pre-fill to match.
  7. **Shop / reservation cart + product detail** (`#shop` section + `#cart` drawer + header `#cartToggle` + `#productModal`) — a `PRODUCTS` array is the single source of truth for the storefront; the grid (`#shopGrid`) and brand filters (`#shopFilters`) render from it. There is **no online payment** — customers add items to a cart (persisted in `localStorage` under `thce-cart`), then "reserve for in-store pickup", which hands off via a pre-filled `sms:` link to `(239) 257-2243` listing the items. Each product card is **clickable** (whole card + keyboard) and opens a detail modal (`#productModal`); the quick **Add** button uses `stopPropagation` so it adds without opening the modal. Cart rows and modal content are built with `createElement`/`textContent`, XSS-safe like the chat. **Edit products in the `PRODUCTS` array** — each entry has `id`, `brand`, `name`, `size`, `price` (number or `null` → "Ask in salon"), `desc`, `img` (local in-salon shelf photo under `assets/product-photos/`), and optional `image` (official packshot URL). `setImgWithFallback()` prefers `image` and falls back to `img` if it's unset or fails to load. **The official `image` URLs are manufacturer photos hotlinked from brand CDNs — replace with licensed/locally-hosted assets before pointing the real domain at the site.**
- `images/logo.jpg` — brand logo (fire-woman on black), used as header/footer mark, favicon, and OG image. **It's a JPEG with a baked-in black background** — appears as a rounded black tile in the cream header. A transparent PNG/SVG would blend better; ask the owner for the original.

The brand palette lives in `:root` CSS variables (`--copper` = fire red `#e3222c`, `--copper-soft` = flame orange, `--gold`, `--blue` = logo star blue, `--fire` = the signature gradient, `--ink` = logo black) — all sampled from the logo. Recolor the whole site by editing those variables.

The booking form is **front-end only** — no backend or email handler is wired. Before going live, point it at Formspree / Netlify Forms / a custom endpoint (README notes this). The chatbot's SMS hand-off works without any backend.

**Asset cache-busting:** `index.html` loads `css/styles.css?v=N` and `js/main.js?v=N`. Bump `N` when you change those files so browsers fetch the new version (a plain reload may serve a stale cached `main.js`). Current versions: `styles.css?v=22`, `main.js?v=7`.

## Other top-level content

Both deploys serve the whole repo root, so these folders DO ship. `assets/product-photos/` is **used by the live shop** (product card fallback images); the rest are client/reference materials not linked from the site:

- `assets/` — salon product photography (`product-photos/`, referenced by the shop as fallback images) and the "Why Not Wednesday" networking flyer.
- `audit/` — the Website & AI Automation audit (`01_Audit_LIGHTER_COVER.pdf`) and the Google ad-spend solution one-pager (`01e_Google_Ad_Spend_Solution.pdf`).
- `previews/` — rendered screenshots of the site (desktop hero, full desktop, full mobile).
- `Pitch_Kit/` — local-only sales/pitch materials, **not** deployed by the Pages workflow. Safe to ignore for site work.
- `website.rtf` — pre-existing local note, also not deployed.
- `.remember/` — session memory buffer for the `remember` skill, not site content.
