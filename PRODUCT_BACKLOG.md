# Product Backlog

## Low Priority - Polish

- [ ] Domain canonicalization cleanup (post-launch polish)
  - Keep both `bostonpartyvan.com` and `www.bostonpartyvan.com` working.
  - [x] Add permanent Worker-level redirect handling so apex (`bostonpartyvan.com`) resolves to `https://www.bostonpartyvan.com`.
  - [x] Update technical SEO URLs to canonical `.com` host:
    - `robots.txt` sitemap URL
    - `sitemap.xml` URLs
    - Homepage and guide page canonical/OG/schema URLs
  - [ ] Verify post-deploy that apex 301 redirect is active, then confirm only one canonical host is indexed.
