# Release Notes

## V1.2 - 2026-04-27

### Changed
- Quote-request destination email updated to `aimhoff1@gmail.com`
- Footer contact email updated to `aimhoff1@gmail.com`
- On-page version badge bumped to `V1.2`
- Hero headline tightened to: `Skip the commute. Start the party.`
- Completed originality scrub to remove derivative-feel artifacts:
  - Replaced promo-style hero card with neutral quote-explanation card
  - Rewrote service section copy and headings
  - Replaced explicit hourly fleet pricing with `Custom quote`
  - Removed customer-testimonial language and replaced it with neutral trip-planning content
  - Adjusted top-strip and footer claim language to safer neutral wording
- Structural uniqueness pass (layout-level, not only copy):
  - Replaced standard 4-card services grid with a custom `Trip menu` layout
    (one spotlight panel + stacked service tiles)
  - Replaced generic 3-step cards with a `Booking map` operations board
    using four step rows and route-planning language
- Added mobile-only sticky action bar with:
  - `Call (617) 515-3702`
  - `Get Pricing` quick-jump button
- Removed quote-style testimonial/blockquote markup entirely and replaced it with
  neutral `Trip templates` cards (non-customer content)
- Expanded local offer mix across the site:
  - Added `Golf Outings`, `Cape Cod Trips`, and `Local Day Routes` to services
  - Updated trip templates to Golf Day Circuit, Cape Escape Route, and Boston Local Loop
  - Added estimator trip types: `Golf Outing`, `Cape Cod Trip`, `Local Day Route`
  - Added FAQ entry for golf and Cape trips
  - Expanded service footprint list with Salem, Foxborough, Plymouth, and Hyannis
- Added bachelor/bachelorette offerings across booking flow:
  - Added `Bachelor / Bachelorette` to service tiles
  - Added `Bachelor/Bachelorette` option to estimator trip type
  - Added `Bachelor/Bachelorette Night Plan` trip template
  - Added quote form event types: `Bachelor Party` and `Bachelorette Party`
  - Added FAQ entry for bachelor/bachelorette routes
- Intake form now sends directly to inbox via FormSubmit AJAX endpoint
  (`https://formsubmit.co/ajax/902c76a22ec98900ac487ed64bc69c35`) with:
  - Loading/sending UI state
  - Error handling and fallback mailto link
  - Hidden honeypot field for basic spam reduction
  - First-submit activation handling with user-friendly prompt

### Test Checklist
- Version badge shows `V1.2` in top-left
- Footer email displays `aimhoff1@gmail.com`
- Submitting quote form opens an email draft addressed to `aimhoff1@gmail.com`
- Hero headline reads `Skip the commute. Start the party.`
- Hero card now says `How We Build Your Quote` (no weekend discount promo)
- Fleet cards show `Custom quote` instead of fixed hourly prices
- Section title reads `Trip templates` with non-customer route structures
- Services section now uses spotlight + tile layout (no simple 4-card template)
- Booking process section now reads `Booking map` with four rows (Step 01-04)
- No “what customers say” section exists; replaced with non-testimonial `Trip templates`
- On mobile widths, sticky bottom bar appears with call + pricing actions
- Services stack includes golf, Cape, and local route offerings
- Estimator dropdown includes Golf Outing, Cape Cod Trip, and Local Day Route
- FAQ includes “Do you offer golf outings and Cape trips?”
- Services include `Bachelor / Bachelorette`
- Estimator includes `Bachelor/Bachelorette`
- Quote form event type includes both `Bachelor Party` and `Bachelorette Party`
- Quote form shows “Sending...” and returns success message on submit
- If auto-submit fails, quote form shows backup “Send via email instead” link
- First successful FormSubmit use may trigger an inbox confirmation step to activate submissions
- If activation is required, the form displays a direct “check inbox and activate” message

### Rollback
- Revert full release commit:
  - `git revert <commit_hash>`
- Revert only one file:
  - `git restore --source=<commit_hash> -- <file_path>`

## V1.1 - 2026-04-27

### Added
- Top-left on-page version badge: `V1.1`
- Quote form fields:
  - Best contact method
  - Best time to reach you
- Email-draft fallback flow on quote submit (opens prefilled email draft)

### Changed
- Brand text updated from "Boston Party Bus" to "Boston Party Van" in key locations
- Main nav CTA changed from "Get Quote" to "Get Pricing"
- Business phone number updated to `(617) 515-3702`
- Contact email updated to `info@bostonpartyvan.com`

### Test Checklist
- Version badge shows `V1.1` in top-left
- Header and footer display `(617) 515-3702`
- Brand displays "Boston Party Van"
- Submitting quote form opens prefilled email draft

### Rollback
- Revert full release commit:
  - `git revert <commit_hash>`
- Revert only one file:
  - `git restore --source=<commit_hash> -- <file_path>`
