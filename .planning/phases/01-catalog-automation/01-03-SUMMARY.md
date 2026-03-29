---
phase: 01-catalog-automation
plan: 03
subsystem: infra
tags: [github-actions, pull-request-template, git, yaml-lint, contributor-workflow]

# Dependency graph
requires:
  - phase: 01-catalog-automation
    plan: 01
    provides: generate-index.js script for catalog.json automation
  - phase: 01-catalog-automation
    plan: 02
    provides: generate-index.yml and notify-docs.yml CI workflows
provides:
  - .github/pull_request_template.md with 4-item YAML field checklist for contributors
  - All three Phase 1 commits pushed to origin/main on argus-mcp-catalog
affects:
  - 02-end-to-end-build-verification
  - any future contributor to argus-mcp-catalog

# Tech tracking
tech-stack:
  added: []
  patterns:
    - GitHub PR template co-located with lint script to keep checklist requirements in sync
    - Inline one-line examples per checklist item (no multi-line YAML block)

key-files:
  created:
    - /home/diaz/mygit/argus-mcp-catalog/.github/pull_request_template.md
  modified: []

key-decisions:
  - "PR template format: checkboxes with one-line inline examples — no full YAML block (per D-02)"
  - "Checklist covers exactly the three lint rules: name:, description:, backend-slug key, plus configs/{category}/ directory placement"
  - "DOCS_DISPATCH_TOKEN cannot be automated — documented as checkpoint:human-verify with exact step-by-step instructions"

patterns-established:
  - "Template mirrors lint requirements: checklist items are derived from lint-catalog.js validation logic"

requirements-completed:
  - CONTRIB-01

# Metrics
duration: 5min
completed: 2026-03-28
---

# Phase 1 Plan 03: PR Template and Phase 1 Push Summary

**PR checklist template for argus-mcp-catalog contributors covering all three lint-catalog.js requirements, with all Phase 1 commits pushed to origin/main**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-28T00:00:00Z
- **Completed:** 2026-03-28
- **Tasks:** 2 of 3 completed (Task 3 awaits human action — DOCS_DISPATCH_TOKEN)
- **Files modified:** 1

## Accomplishments

- Created `.github/pull_request_template.md` with 4 checklist items covering name:, description:, backend-slug key presence, and configs/{category}/ directory placement — each with a one-line inline example
- Pushed all three Phase 1 commits (generate-index.js, generate-index.yml + notify-docs.yml, pull_request_template.md) to origin/main on argus-mcp-catalog
- Verified all 4 Phase 1 files are present on the remote: scripts/generate-index.js, .github/workflows/generate-index.yml, .github/workflows/notify-docs.yml, .github/pull_request_template.md

## Task Commits

Each task was committed atomically:

1. **Task 1: Write .github/pull_request_template.md** - `4a7fe37` (docs)
2. **Task 2: Push all Phase 1 commits to remote** - push only (no new commit)
3. **Task 3: Create DOCS_DISPATCH_TOKEN** - awaiting human action (checkpoint:human-verify)

## Files Created/Modified

- `/home/diaz/mygit/argus-mcp-catalog/.github/pull_request_template.md` - PR checklist with 4 items covering the three lint requirements plus category directory placement

## Decisions Made

- PR template uses inline one-line examples per checklist item (not a multi-line YAML block) per D-02 from CONTEXT.md
- Available categories listed at the bottom of the template to reduce directory placement errors
- No separate documentation file created — template is self-contained

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**DOCS_DISPATCH_TOKEN must be manually created** — this is CATALOG-05 and cannot be automated.

Steps:
1. Go to: https://github.com/settings/personal-access-tokens/new
2. Token name: `argus-mcp-docs-dispatch`
3. Resource owner: `diaz3618`
4. Repository access: "Only select repositories" — select `argus-mcp-docs` only
5. Permissions — Repository permissions — Actions: **Read and Write**
6. Generate token and copy the value
7. Go to: https://github.com/diaz3618/argus-mcp-catalog/settings/secrets/actions
8. Click "New repository secret"
9. Name: `DOCS_DISPATCH_TOKEN`
10. Value: paste the token
11. Click "Add secret"

After creating the secret, verify at:
- https://github.com/diaz3618/argus-mcp-catalog/actions — both "Generate Catalog Index" and "Notify Docs Rebuild" should be listed

## Next Phase Readiness

- Phase 1 automation loop fully wired: generate-index.js + generate-index.yml + notify-docs.yml + pull_request_template.md
- Only remaining Phase 1 item: user creates DOCS_DISPATCH_TOKEN (cannot be automated)
- Phase 2 (End-to-End Build Verification) can begin once DOCS_DISPATCH_TOKEN is configured and the notify-docs.yml workflow can dispatch to argus-mcp-docs

## Known Stubs

None — all checklist items are wired to lint-catalog.js requirements. No placeholder content.

---
*Phase: 01-catalog-automation*
*Completed: 2026-03-28*
