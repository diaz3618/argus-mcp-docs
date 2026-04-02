---
phase: 08-maintenance-and-bug-fixes
plan: 03
subsystem: content, docs
tags: [mdx, next-mdx-remote, remarkGfm, search-index, 404-fix]

# Dependency graph
requires:
  - phase: 05-catalog-expansion
    provides: container-isolation/index.mdx expanded with all ContainerConfig fields (277 lines)
provides:
  - Working /docs/configuration/container-isolation/ page rendering full content (212KB HTML)
  - Regenerated public/search-data/documents.json with correct container-isolation entry
affects: [08-catalog-browser, deploy, ci]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "MDX-safe table cell content: avoid bold+backtick nesting and raw <> chars with remarkGfm"
    - "Inline code inside GFM table cells must not contain < or > (MDX parses as JSX tags)"
    - "Backtick inside **bold** in GFM tables causes remarkGfm→MDX template literal parse failure"

key-files:
  created: []
  modified:
    - contents/docs/configuration/container-isolation/index.mdx
    - public/search-data/documents.json

key-decisions:
  - "D-09 preserved: settings/documents.ts href='/container-isolation' not changed"
  - "Root cause: line 184 had **backtick-in-bold** pattern; line 185 had <> in inline code inside GFM table — both cause remarkGfm+MDX compilation failure"
  - "Fix: rewrite descriptions to prose without problematic patterns (no code change to routes, settings, or framework)"
  - "Both fixes in single commit alongside regenerated search index (BUG-01 + BUG-02 atomic)"

patterns-established:
  - "MDX table cells: do not use backtick inside **bold** text — use plain text or reword"
  - "MDX table cells: do not use < or > inside inline code spans — use HTML entities or prose"
  - "Diagnosis approach: compileMDX with remarkGfm plugin to reproduce build-time errors locally"

requirements-completed: [BUG-01, BUG-02]

# Metrics
duration: 35min
completed: 2026-04-02
---

# Phase 08 Plan 03: Container-Isolation 404 Fix Summary

**MDX compilation failure in GFM table cells (bold+backtick and angle brackets) caused getDocument() to return null and trigger Next.js 404; fixed by rewriting two table cell descriptions, regenerating search index**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-04-02T16:30:00Z
- **Completed:** 2026-04-02T17:06:47Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Diagnosed root cause: `remarkGfm` plugin causes MDX to interpret `` `$()` `` inside `**bold**` as a JSX template literal (build error suppressed by Next.js, silently returning `null` from `getDocument()` → `notFound()` → 404)
- Fixed two MDX-unsafe table cell patterns in `container-isolation/index.mdx` (lines 184, 185)
- Verified all 48 MDX files compile without errors with `remarkGfm` enabled
- Container-isolation page now renders at 212KB with full content (was 34KB error page with `NEXT_HTTP_ERROR_FALLBACK;404`)
- Regenerated `public/search-data/documents.json` with correct container-isolation entry (48 docs total)
- Confirmed `settings/documents.ts` href NOT changed (D-09 preserved)

## Task Commits

Each task was committed atomically:

1. **Task 1: Diagnose — run pnpm build and check static export output** — diagnosis complete, root cause identified (MDX compilation failure), fix applied
2. **Task 2: Regenerate search index and commit (BUG-02)** — search index regenerated

**Combined commit (BUG-01 + BUG-02):** `b65fab3` (fix: fix container-isolation 404 and regenerate search index)

## Files Created/Modified

- `contents/docs/configuration/container-isolation/index.mdx` — Fixed 2 MDX-unsafe table cell descriptions (lines 184, 185): removed bold+backtick nesting and raw `<`/`>` chars inside inline code spans within GFM table cells
- `public/search-data/documents.json` — Regenerated search index; container-isolation entry has full page content

## Root Cause Diagnosis

**Case C** from plan: The page IS generated in `out/` but rendered as an error page.

Full diagnosis chain:
1. `out/docs/configuration/container-isolation/index.html` existed (34KB) — page was being pre-rendered
2. HTML content was `id="__next_error__"` with `"digest":"NEXT_HTTP_ERROR_FALLBACK;404"` — server component threw during render
3. `getDocument()` catches all errors and returns `null` → `notFound()` called → Next.js 404 page rendered
4. Running `compileMDX({ remarkPlugins: [remarkGfm] })` against the MDX file locally confirmed the compilation error
5. Binary search narrowed error to line 184: `**Cannot contain backticks, `$()`, or `()`**`
6. `remarkGfm` converts `**...**` to strong element; MDX then parses `` `$()` `` inside strong as a JSX template literal with `$()` expression — invalid syntax
7. After fixing line 184, error moved to line 185: backtick code spans containing `<` and `>` inside GFM table cell — MDX parses angle brackets as JSX tags

## Decisions Made

- D-09 preserved: `href: '/container-isolation'` in settings/documents.ts not touched
- Fix approach: reword table cell descriptions to avoid MDX-unsafe patterns (no structural changes)
- Single atomic commit for BUG-01 fix + BUG-02 search index (as specified in plan)
- Diagnosis confirmed build exits 0 after fix with no MDX errors (previously 2 silent MDX errors)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed MDX compilation error on line 185 (entrypoint row)**
- **Found during:** Task 1 (diagnosis bisect)
- **Issue:** After fixing line 184, binary search found line 185 also had MDX-unsafe patterns: angle brackets `<`, `>` inside inline code within GFM table cell
- **Fix:** Rewrote the description to use prose ("angle brackets" instead of `` `<` `` and `` `>` ``), removed bold+backtick nesting
- **Files modified:** `contents/docs/configuration/container-isolation/index.mdx`
- **Verification:** `compileMDX({ remarkPlugins: [remarkGfm] })` passes for all 48 MDX files
- **Committed in:** `b65fab3` (combined with Task 1 fix and Task 2 search index)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug, sequential issue found during bisect)  
**Impact on plan:** Auto-fix was essential — same root cause as primary fix, discovered via same diagnostic approach.

## Issues Encountered

- The build output's MDX error message (`Unexpected character U+0060 before name`) did not include the file/line number — required `compileMDX` + binary search to pinpoint the exact offending line
- The error was previously suppressed (build exits 0 with 2 MDX warnings in stderr) because Next.js catches rendering errors and outputs a 404 HTML fallback — no fatal build exit, making it easy to miss

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- container-isolation page at `/docs/configuration/container-isolation/` now renders correctly with all 14 ContainerConfig fields
- Search index updated and correct
- BUG-01 and BUG-02 satisfied; Phase 08 maintenance plans complete
- Phase 09 (Catalog Browser) can proceed

## Self-Check

- `out/docs/configuration/container-isolation/index.html` — EXISTS, 212KB, full content ✓
- Commit `b65fab3` — EXISTS in git log ✓
- `public/search-data/documents.json` has container-isolation entry with slug `/configuration/container-isolation` ✓
- `settings/documents.ts` href unchanged ✓

---
*Phase: 08-maintenance-and-bug-fixes*
*Completed: 2026-04-02*
