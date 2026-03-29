---
phase: 03-frontend-ux-improvements
plan: 01
subsystem: ui
tags: [prism, syntax-highlighting, css, sidebar, react, nextjs]

# Dependency graph
requires: []
provides:
  - 6 new Prism token CSS rules in globals.css (.class-name, .operator, .variable, .important, .atrule, .null-keyword/.null.token) with light/dark variants
  - Default-collapsed sidebar with Getting Started section permanently open via isGettingStarted constant in sublink.tsx
affects: [03-frontend-ux-improvements]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Prism token CSS: bare .class-name { color: hsl(...); } + .dark .class-name { color: hsl(...); } pairs in globals.css"
    - "SubLink open state: derive initial state from href identity (isGettingStarted) rather than hardcoded boolean"

key-files:
  created: []
  modified:
    - styles/globals.css
    - components/sidebar/sublink.tsx

key-decisions:
  - "D-01/D-04: Extended globals.css with Prism token CSS rather than swapping rehype-prism-plus — continues the existing hand-coded token rules pattern"
  - "D-05/D-06: Sidebar default-collapsed implemented via useState(isGettingStarted) — Getting Started opens automatically, all others collapse"
  - "D-06: Getting Started identified by href === '/docs/getting-started' (not title string) — pagemenu.tsx prepends /docs so this matches correctly"
  - "D-07: Existing useEffect for active-path auto-expand unchanged — no modification needed"

patterns-established:
  - "Prism token CSS pattern: match bare class selector + .dark variant, insert after existing .dark .constant block"
  - "Sidebar section identity: use href constant, not title string, for section identity checks"

requirements-completed: [FE-01, FE-02]

# Metrics
duration: 8min
completed: 2026-03-29
---

# Phase 3 Plan 01: Frontend UX Improvements Summary

**6 Prism token CSS rules for YAML/bash/JSON/Python syntax highlighting and default-collapsed sidebar with Getting Started always open**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-29T07:15:00Z
- **Completed:** 2026-03-29T07:23:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `.class-name`, `.operator`, `.variable`, `.important`, `.atrule`, `.null-keyword`/`.null.token` CSS rules with light/dark variants to globals.css — Python class names, bash operators, bash `$VAR` expansions, YAML anchors/aliases, YAML directives, and JSON null now render with distinct visible colors
- Changed `sublink.tsx` line 17 from `useState(true)` to `useState(isGettingStarted)` — all sidebar sections collapse by default, Getting Started section stays permanently open
- Confirmed `pagemenu.tsx` prepends `/docs` so the `props.href === '/docs/getting-started'` identifier correctly matches the Getting Started section

## Task Commits

Each task was committed atomically:

1. **Task 1: Add missing Prism token CSS rules to globals.css** - `b798396` (feat)
2. **Task 2: Implement default-collapsed sidebar with Getting Started always open** - `589537c` (feat)

## Files Created/Modified

- `styles/globals.css` - Added 42 lines: 6 new Prism token classes with light and dark color variants, inserted after `.dark .constant` block at line 263
- `components/sidebar/sublink.tsx` - Changed line 17: added `isGettingStarted` constant and replaced `useState(true)` with `useState(isGettingStarted)`

## Decisions Made

- **D-06 href identifier**: Used `/docs/getting-started` as the identifier (not `/getting-started` from documents.ts) because `pagemenu.tsx` prepends `/docs` before passing hrefs to SubLink. This was confirmed by reading pagemenu.tsx.
- **Color assignments**: Followed UI-SPEC exactly — `.class-name` → blue matching `.function`, `.operator` → gray matching `.punctuation`, `.variable`/`.atrule` → pink matching `.keyword`, `.important` → amber (distinctive new hue for YAML anchors), `.null-keyword`/`.null.token` → gray matching `.constant`.
- **No hardcoded false**: Used derived `isGettingStarted` constant rather than `useState(false)` — cleaner intent, explicit which section stays open.

## Deviations from Plan

None - plan executed exactly as written.

## Verification

```
grep -n "class-name|.operator|.variable|.important|.atrule|null-keyword|null.token" styles/globals.css
# Returns: lines 265, 269, 273, 277, 281, 285, 289, 293, 297, 298, 302, 303

grep -n "katex-display|dark .constant|class-name" styles/globals.css
# Returns: 259 (dark .constant), 265 (class-name), 307 (katex-display)
# Confirms insertion is between the two existing anchors

grep "useState(isGettingStarted)" components/sidebar/sublink.tsx
# Returns 1 match

grep "useState(true)" components/sidebar/sublink.tsx
# Returns 0 matches (PASS)

pnpm tsc --noEmit
# Exits 0 (no TypeScript errors — only node engine version warning)
```

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Both FE-01 and FE-02 requirements satisfied
- Syntax highlighting improvements visible immediately in existing YAML/bash/JSON/Python code blocks
- Sidebar behavior changed site-wide — both desktop Sidebar and mobile Sheet inherit the same change via shared SubLink component
- No build verification needed for these CSS/component changes (TypeScript clean)

---
*Phase: 03-frontend-ux-improvements*
*Completed: 2026-03-29*

## Self-Check: PASSED

- styles/globals.css: FOUND
- components/sidebar/sublink.tsx: FOUND
- .planning/phases/03-frontend-ux-improvements/03-01-SUMMARY.md: FOUND
- Commit b798396 (feat: Prism CSS token rules): FOUND
- Commit 589537c (feat: sidebar collapse): FOUND
