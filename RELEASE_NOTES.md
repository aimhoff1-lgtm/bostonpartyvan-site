# Release Notes

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

