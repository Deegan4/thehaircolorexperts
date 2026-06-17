# Project Memory — The Hair Color Experts

Durable notes, decisions, and open items for this repo. (The remote dev
container is ephemeral — only committed files survive between sessions, so
keep lasting context here.) See `CLAUDE.md` for architecture and conventions.

## Snapshot

- **What:** single-page marketing site + take-home product storefront for The
  Hair Color Experts, a boutique salon in Cape Coral, FL.
- **Live URL (current):** https://deegan4.github.io/thehaircolorexperts/ (GitHub
  Pages, built-in `pages-build-deployment`).
- **Also deployed:** Vercel project `glaciersedgemedia-com` (auto-deploys `main`
  to production; PR previews are HTTP 401 login-protected — not viewable).
- **Salon phone (all SMS/booking hand-offs):** (239) 257-2243.
- **Dev branch convention:** work on `claude/repo-overview-0mtz7a`, open a PR
  into `main`, then merge (Pages/Vercel deploy from `main`).

## Key decisions

- **Storefront = reserve-for-pickup, no online payment.** Customers build a
  cart (localStorage `thce-cart`) and send the list via a pre-filled `sms:`
  link; they pay in-salon at pickup. In-store pickup only (no shipping). Chosen
  to match the site's existing no-backend, SMS-handoff pattern.
- **Products live in the `PRODUCTS` array in `js/main.js`** — single source of
  truth. Each card is clickable into a detail modal (`#productModal`).
- **Prices** are typical US retail MSRP from official brand sites; confirmed
  in-salon at pickup. Three are approximate (no clean published US MSRP):
  Leave-In Conditioner 1L (~$48), Dream Coat Extra Strength (~$32), Extra
  Mist-ical Shine Spray (~$28).
- **Product images** are official manufacturer packshots hotlinked from brand
  CDNs (Shopify), with automatic fallback to in-salon shelf photos in
  `assets/product-photos/` via `setImgWithFallback()`.
- **Site URL** (`og:url` + schema `url`) points at the GitHub Pages URL "for
  now," pending the real domain.

## Open items / TODO

- [ ] **Verify the 3 approximate prices** against distributor cost; check
      margins on all 18 before real launch.
- [ ] **Sensorial Mint Shampoo** — no official US image; the product appears to
      be out of milk_shake's current US catalog. Confirm it's still stocked, or
      remove it / use a third-party image.
- [ ] **Replace hotlinked manufacturer images** with licensed / locally-hosted
      assets (e.g. from the SalonCentric/distributor portal, dropped into
      `assets/`) before pointing the real domain at the site. Set each
      product's local image to swap.
- [ ] **Custom domain:** when `thehaircolorexperts.com` is pointed at the
      deployment, switch `og:url` + schema `url` back from the github.io URL.
- [ ] **Booking form is front-end only** — wire to Formspree/Netlify Forms/an
      endpoint before launch (the chatbot SMS hand-off already works).
- [ ] **Datadog CI** (`datadog-synthetics.yml`) fails on every PR — add
      `DD_API_KEY`/`DD_APP_KEY` repo secrets to make it green (or remove the
      workflow). Pre-existing; unrelated to site changes.

## Gotchas

- **Bump cache-busting versions** (`css/styles.css?v=N`, `js/main.js?v=N` in
  `index.html`) whenever you edit those files.
- All cart/chat/modal DOM is built with `createElement`/`textContent` (never
  `innerHTML`) — keep it XSS-safe.
- The brand logo `images/logo.jpg` is a JPEG with a baked-in black background
  (shows as a black tile); a transparent PNG/SVG would blend better.
