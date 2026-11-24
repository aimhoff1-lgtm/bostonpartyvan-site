# Boston Party Van Website

Static marketing website for Boston Party Van.

## Files

- `index.html` - page structure and content
- `style.css` - styling and responsive layout
- `script.js` - menu, animations, estimator, quote form UX

## Local Development

From this folder, run:

```bash
cd "/Users/andrewimhoff/Desktop/BOSTON PARTY BUS"
python3 -m http.server 5173
```

Open:

- <http://localhost:5173>

Stop the server with `Ctrl + C`.

## Archived Special Offers

The limited-time deals are paused with `SITE_CONFIG.specialOffersEnabled: false`
in `script.js`. The original four cards are preserved inside the inert
`archivedSpecialOffers` template in `index.html`, so they do not render even when
JavaScript is disabled. Promotional sports/airport pricing, the wedding bonus,
and old promotional quote links are disabled by the same flag. Regular trip
options and ongoing shuttle volume pricing are unchanged.

To restore the deals, review the retained copy and pricing, set the flag to `true`,
and bump the homepage's script version before publishing. The template mounts
before the card interactions are initialized. Keep the FAQ and its structured
data consistent with any newly approved offer terms.

## Inquiry Availability

The site accepts inquiries immediately, including same-day requests. The former
30-day affiliate-assistance warning has been removed. Past dates remain invalid,
using Boston's calendar date.
Public copy accepts inquiries rather than guaranteeing immediate service.
Andrew confirms availability and transportation arrangements before booking;
the van's DPU inspection must be cleared before operating regulated trips.
December 25, 2026 through January 4, 2027 is a one-time, inclusive blackout:
inquiries cannot be submitted for pickup dates in that period or multi-day service
that overlaps it. The rules are in `getQuoteDateAvailability` in `script.js`.

## One-Time Setup for Auto Deploy (GitHub + Cloudflare Pages)

1. Create a new empty GitHub repo (for example: `bostonpartyvan-site`).
2. Run these commands in this folder:

```bash
cd "/Users/andrewimhoff/Desktop/BOSTON PARTY BUS"
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/bostonpartyvan-site.git
git push -u origin main
```

3. In Cloudflare:
   - Go to `Workers & Pages` -> `Create application` -> `Pages` -> `Import an existing Git repository`.
   - Select your new GitHub repo.
   - Use:
     - Production branch: `main`
     - Build command: `exit 0`
     - Build output directory: `.`
   - Deploy.

4. Keep this new Git-integrated project as your main project.
   - Your current direct-upload project can stay live until this is working.

## Edit + Publish Workflow (After Setup)

Every time you want to update the site:

```bash
cd "/Users/andrewimhoff/Desktop/BOSTON PARTY BUS"
git add .
git commit -m "Describe the change"
git push
```

Cloudflare auto-deploys in 1-2 minutes after each push.

## Custom Domain Later

When ready:

1. Buy `bostonpartyvan.com`.
2. Add both domains in Pages custom domains:
   - `www.bostonpartyvan.com`
   - `bostonpartyvan.com`
3. Redirect apex to `www`.
   - The Cloudflare Worker deployment branch includes Worker-level redirect logic:
     - `bostonpartyvan.com` -> `https://www.bostonpartyvan.com` (301)
   - Push/deploy to activate.

## GA4 Conversion Tracking (Optional, Recommended)

1. Open [script.js](/Users/andrewimhoff/Desktop/BOSTON PARTY BUS/script.js).
2. Set `SITE_CONFIG.ga4MeasurementId` to your GA4 ID (example: `G-ABC123XYZ9`).
3. Push and wait for deploy.
4. Test:
   - Click call/text buttons (tracks `contact_click`)
   - Use estimator (tracks `estimate_calculated`)
   - Submit quote form successfully (tracks `generate_lead`)

### Inquiry Verification

Run `node --test tests/*.test.mjs` for the pricing, blackout, attribution, and
content checks. `tests/inquiry-flow.browser.cjs` uses Playwright with installed
Chrome, starts and closes its own local server, and checks desktop/mobile quote
flows. All intake/receipt requests and analytics are intercepted; it sends no
customer emails or real conversions. Set `BPV_TEST_ORIGIN` to test production
with the same interception safeguards.

Attribution is captured on every page that loads `script.js`, not only the form.
New campaigns replace previous campaign fields and ad click IDs, internal
navigation preserves them, and direct returns retain the last attributed source.
Owner notifications include landing-page context. Submission failures emit
`quote_form_error`; successful submissions alone emit the lead conversion.
