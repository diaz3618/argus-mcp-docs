# Phase 3: Frontend UX Improvements — Discussion Log

**Date:** 2026-03-28
**Workflow:** discuss-phase

---

## Phase Routing

**Q:** Phase 2 is currently scoped as build verification. How do you want to handle the frontend improvements?

**Options:** Add Phase 3 for frontend (Recommended) / Replace Phase 2 with frontend / Skip build verification

**Selected:** Add Phase 3 for frontend (Recommended)

**Notes:** Phase 2 (End-to-End Build Verification / BUILD-01/02/03) stays as-is. Frontend improvements added as Phase 3. ROADMAP.md updated.

---

## Areas Discussed

**Q:** Which gray areas do you want to discuss for Phase 3?

**Selected (all three):** Syntax highlighting approach, Nav collapse behavior, Any other frontend improvements

---

## Syntax Highlighting

**Q:** Extend globals.css (existing Prism pipeline, add missing token classes) vs swap to rehype-shiki (richer themes, touches lib/markdown.ts core file)?

**Selected:** Extend globals.css (Recommended)

---

## Nav Collapse Behavior

**Q:** Getting Started — always open regardless of current page, or default open and collapses on navigate?

**Selected:** Always open (Recommended)

**Q:** sublink.tsx is in components/ (core file per rubix-documents policy). Modify it anyway?

**Selected:** Yes, modify it (Recommended)

---

## Other Frontend Improvements

**Q:** Site already has search, TOC, dark mode, copy buttons, prev/next nav. Any other improvements in mind?

**Selected:** No, just those two

---

## Decisions Captured

| ID | Decision |
|----|----------|
| D-01 | Extend globals.css with missing Prism token CSS — do not swap library |
| D-02 | Languages in scope: YAML, bash, JSON, Python |
| D-03 | Missing tokens: .class-name, .operator, .variable, .important, .atrule, .null-keyword |
| D-04 | globals.css modification accepted (already has custom Prism CSS) |
| D-05 | sublink.tsx: useState(true) → useState(false) |
| D-06 | Getting Started (href: '/getting-started') always stays open |
| D-07 | Active section useEffect logic unchanged |
| D-08 | sublink.tsx modification accepted |
