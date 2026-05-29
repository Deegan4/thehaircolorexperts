# The Hair Color Experts — Website

A redesigned marketing site for **The Hair Color Experts**, a boutique hair-color
salon and signature workshop in Cape Coral, Florida, serving the community since 2014.

## Overview

A fast, fully responsive, single-page static site built with plain HTML, CSS, and
vanilla JavaScript — no build step or dependencies required.

### Sections

- **Hero** — brand introduction and primary booking call-to-action
- **Stats** — at-a-glance trust signals
- **Services** — hair color, balayage & ombré, highlights, corrective color, cuts &
  styling, Brazilian blowout, treatments & perms, bridal & updos, facial waxing
- **About** — the salon's story and approach
- **Gallery** — a showcase of color work
- **Workshop** — the Education Salon for industry stylists
- **Reviews** — client testimonials
- **Contact** — address, hours, phone, embedded map, and a booking request form

### Features

- Sticky header with scroll state and animated mobile navigation
- Scroll-reveal animations (respects `prefers-reduced-motion`)
- Scrollspy active-section highlighting
- Client-side booking-form validation with friendly feedback
- `HairSalon` schema.org structured data and Open Graph metadata for SEO/sharing
- Accessible markup (semantic landmarks, ARIA labels, keyboard-friendly nav)

## File structure

- `index.html` — page markup and content
- `css/styles.css` — all styling and responsive rules
- `js/main.js` — interactions (nav, reveal, scrollspy, form)
- `images/logo.svg` — brand monogram, also used as the favicon

## Running locally

It's a static site — open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deployment (GitHub Pages)

The site is published to GitHub Pages by `.github/workflows/deploy-pages.yml`,
which runs on every push to `main` (and can be run manually from the Actions tab).

One-time setup: in the repo, go to **Settings → Pages → Build and deployment →
Source** and select **GitHub Actions**. To use a custom domain, set it under the
same Pages settings page (this writes a `CNAME` file and tells you which DNS
records to add at your registrar).

## Business details

- **Address:** 3306 Del Prado Blvd S, Cape Coral, FL 33904
- **Phone:** (239) 257-2243
- **Hours:** Mon/Wed/Fri/Sat 9–5 · Tue/Thu 9–7 · Sun closed

> Note: the booking form is a front-end demo and is not yet wired to a backend or
> email service. Connect it to a form handler (e.g. Formspree, Netlify Forms, or a
> custom endpoint) before going live.
