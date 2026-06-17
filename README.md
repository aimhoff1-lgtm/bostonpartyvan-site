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
   - This repo includes `_redirects` rules for:
     - `http://bostonpartyvan.com/*` -> `https://www.bostonpartyvan.com/:splat` (301)
     - `https://bostonpartyvan.com/*` -> `https://www.bostonpartyvan.com/:splat` (301)
   - Push/deploy to activate.

## GA4 Conversion Tracking (Optional, Recommended)

1. Open [script.js](/Users/andrewimhoff/Desktop/BOSTON PARTY BUS/script.js).
2. Set `SITE_CONFIG.ga4MeasurementId` to your GA4 ID (example: `G-ABC123XYZ9`).
3. Push and wait for deploy.
4. Test:
   - Click call/text buttons (tracks `contact_click`)
   - Use estimator (tracks `estimate_calculated`)
   - Submit quote form successfully (tracks `generate_lead`)
