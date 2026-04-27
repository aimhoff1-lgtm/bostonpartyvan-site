# Release Notes

## Unreleased (next after V1.3)

### Changed
- Quote form phone validation is now conditional:
  - `Phone` remains optional by default
  - If preferred contact method is `Text me first`, `Phone` becomes required
- Added dynamic inline hint text:
  - `Phone (optional)` by default
  - Changes to `Phone (required for text)` when text preference is selected
- Header brand now uses uploaded logo asset:
  - Added `assets/images/PartyvanLogo.jpeg` in nav brand area
  - Added responsive logo sizing and styling for desktop/mobile
- Hero splash now uses your uploaded skyline image:
  - Hero background points to `assets/images/skyline.webp`
  - Added readability overlay so headline/buttons remain clear over photo
- Replaced static trip-template cards with interactive package gallery:
  - Added click-to-expand cards with text-over-image treatment and animated flare
  - Added package categories: Sporting Events, Golf Trips, Cape Trips, Weddings,
    Bachelor/Bachelorette, Concert Nights, and Local City Loops
  - Wired real image backgrounds for:
    - `assets/images/td-garden-exterior.jpg` (sporting events)
    - `assets/images/skyline.webp` (Cape + local)
  - Added one-open-at-a-time expand/collapse behavior with updated CTA text
- Fleet section repositioned to a sourced-vehicle model:
  - Updated language to `Potential fleet` and clarified that final assignment
    depends on route/date availability
  - Added uploaded example-vehicle photos:
    - `assets/images/MBenzSprinter14PAX-Exterior0.jpg`
    - `assets/images/ford-van.webp`
  - Removed hard-assigned fleet promise style in favor of flexible sourcing language
- Package image map expanded with your new uploads:
  - `assets/images/golfgroup.jpg` now powers Golf Trips card
  - `assets/images/cape.png` now powers Cape Trips card
  - Added new Weddings package card using `assets/images/weddings.jpg`
- Merged `Trip menu` and `Packages` into one unified section:
  - Removed the separate `Popular packages` block to avoid repetition
  - Kept interactive package cards and moved them directly into the Trip menu area
  - Added concise helper line guiding users to open package cards for route examples
- Package card interaction refined:
  - Clicking anywhere on a package card (not just text/button area) now toggles expand/collapse
  - Expanded package cards now grow by approximately 50% for stronger visual focus
- Package card sizing made responsive-safe across devices:
  - Switched to standardized `min-height` sizing with `clamp()` values
  - Kept a consistent collapsed footprint while allowing safer expansion on smaller screens
  - Increased detail panel max height to reduce text clipping risk on iPhone
- Golf + Cape builder moved out of the top of Trip menu:
  - Removed the featured Golf + Cape block from above package cards
  - Removed the standalone `Featured route flow` section per latest direction
- Added remaining package photography:
  - `assets/images/showtime.jpg` now powers the `Showtime Shuttle` card
  - `assets/images/nightlife.jpg` now powers the `Bachelor / bachelorette` card
- Added new event offerings:
  - New package card: `White Mountains / Northern NH` (`Mountain Weekend Run`)
  - New package card: `Corporate outings` (`Team Offsite Transit`)
  - Estimator `Trip type` now includes `White Mountains / Northern NH`
  - Quote form `Event type` now includes `White Mountains / Northern NH`
  - Updated labels to `Corporate Outing` in estimator and quote flow
  - Service footprint now explicitly includes `White Mountains / Northern NH`

### Test Checklist
- Version badge remains `V1.3` until this release is pushed and confirmed
- With preferred contact = `Call me first` or `Email me first`, form submits with phone blank
- With preferred contact = `Text me first`, blank phone shows validation error
- Entering a phone number with `Text me first` allows submission
- Header shows your uploaded Party Van logo next to brand text
- Hero/splash section shows skyline photo behind the headline content
- Trip menu now includes nine interactive package cards
- Clicking a package expands its details, and clicking it again collapses it
- Opening one package closes the others automatically
- Sporting Events card uses TD Garden image background
- Fleet section heading reads `Potential fleet` and includes availability disclaimer
- Fleet cards show your two uploaded van photos as example vehicles
- Golf Trips package uses the uploaded golf group photo
- Cape Trips package uses the uploaded Cape harbor photo
- Weddings package appears and expands like the other package cards
- Only one section now covers both trip menu and package cards (no redundant second section)
- Clicking any area of a package image/card toggles the card details
- Expanded package cards visibly grow by about 50%
- Package card text remains visible without clipping on narrow mobile widths
- Trip menu now starts directly with the package cards (no Golf + Cape block above)
- No separate `Featured route flow` section appears on the page
- `Showtime Shuttle` card now shows the uploaded showtime photo
- `Bachelor / bachelorette` card now shows the uploaded nightlife photo
- `White Mountains / Northern NH` package card appears and expands correctly
- `Corporate outings` package card appears and expands correctly
- Estimator includes `White Mountains / Northern NH` and `Corporate Outing`
- Quote form event type includes `White Mountains / Northern NH` and `Corporate Outing`

### Rollback
- Revert full release commit:
  - `git revert <commit_hash>`
- Revert only one file:
  - `git restore --source=<commit_hash> -- <file_path>`

## V1.3 - 2026-04-27

### Changed
- On-page version badge bumped to `V1.3`
- Quote intake field updated from required `Phone` to `Phone (optional)`

### Test Checklist
- Version badge shows `V1.3` in top-left
- Quote form can submit successfully without entering a phone number

### Rollback
- Revert full release commit:
  - `git revert <commit_hash>`
- Revert only one file:
  - `git restore --source=<commit_hash> -- <file_path>`

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
