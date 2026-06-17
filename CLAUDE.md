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

GitHub Actions (`.github/workflows/deploy-pages.yml`) deploys to GitHub Pages on push to `main` (or `claude/haircolorexperts-redesign-Osu5d`). The workflow assembles `_site/` by copying only `index.html`, `css/`, `js/`, `images/` — **any new top-level asset directory must be added to the `cp` step or it won't ship**.

A second workflow (`datadog-synthetics.yml`) handles Datadog synthetic test sync.

## Architecture

Only four files matter for the live site:

- `index.html` — entire page markup; all sections (`#home`, `#stats`, `#services`, `#about`, `#gallery`, `#workshop`, `#reviews`, `#contact`) live here. Includes `HairSalon` schema.org JSON-LD and Open Graph tags.
- `css/styles.css` — all styling, responsive rules, and reveal-animation classes (`.reveal`, `.is-visible`).
- `js/main.js` — one IIFE wired on `DOMContentLoaded`. Six responsibilities, each keyed off specific element IDs in `index.html`:
  1. Mobile nav toggle (`#navToggle` / `#nav`, class `is-open`)
  2. Sticky header scroll state + back-to-top (`#header`, `#toTop`)
  3. `IntersectionObserver` scroll-reveal for `.reveal` elements (respects `prefers-reduced-motion`)
  4. Scrollspy that toggles `.nav__link.is-active` based on which `<section>` is in view
  5. Client-side validation for the booking form (`#bookingForm`, status output in `#formStatus`)
  6. **Booking assistant** chatbot (`#chatFab` / `#chat`) — a scripted (not LLM) guided conversation that collects service → time → name → contact, then hands off via a pre-filled `sms:` link to `(239) 257-2243` or by populating `#bookingForm` and scrolling to it. All bubbles are built with `createElement`/`textContent` (no `innerHTML`) so it's XSS-safe by construction. The `SERVICES` array must stay in sync with the `<select id="service">` options for form pre-fill to match.
- `images/logo.jpg` — brand logo (fire-woman on black), used as header/footer mark, favicon, and OG image. **It's a JPEG with a baked-in black background** — appears as a rounded black tile in the cream header. A transparent PNG/SVG would blend better; ask the owner for the original.

The brand palette lives in `:root` CSS variables (`--copper` = fire red `#e3222c`, `--copper-soft` = flame orange, `--gold`, `--blue` = logo star blue, `--fire` = the signature gradient, `--ink` = logo black) — all sampled from the logo. Recolor the whole site by editing those variables.

The booking form is **front-end only** — no backend or email handler is wired. Before going live, point it at Formspree / Netlify Forms / a custom endpoint (README notes this). The chatbot's SMS hand-off works without any backend.

**Asset cache-busting:** `index.html` loads `css/styles.css?v=N` and `js/main.js?v=N`. Bump `N` when you change those files so browsers fetch the new version (a plain reload may serve a stale cached `main.js`).

## Other top-level content

Client deliverables and source assets that are **not** part of the deployed site (the Pages workflow only ships `index.html`, `css/`, `js/`, `images/`):

- `audit/` — the Website & AI Automation audit (`01_Audit_LIGHTER_COVER.pdf`) and the Google ad-spend solution one-pager (`01e_Google_Ad_Spend_Solution.pdf`).
- `assets/` — salon product photography (`product-photos/`) and the "Why Not Wednesday" networking flyer.
- `previews/` — rendered screenshots of the site (desktop hero, full desktop, full mobile).
- `Pitch_Kit/` — local-only sales/pitch materials, **not** deployed by the Pages workflow. Safe to ignore for site work.
- `website.rtf` — pre-existing local note, also not deployed.
- `.remember/` — session memory buffer for the `remember` skill, not site content.
