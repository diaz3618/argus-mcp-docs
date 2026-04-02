# Roadmap: Argus MCP Documentation Site

## Milestones

- ✅ **v1.0 — Argus MCP Documentation Site** — Phases 1-5 (shipped 2026-03-30)
- ✅ **v1.1 — Audit & Completion** — Phases 6-7 (shipped 2026-03-31)
- 🚧 **v1.2 — Catalog UX & Maintenance** — Phases 8-9 (in progress)

## Phases

<details>
<summary>✅ v1.0 — Argus MCP Documentation Site (Phases 1-5) — SHIPPED 2026-03-30</summary>

- [x] **Phase 1: Catalog Automation** (3/3 plans) — completed 2026-03-29
- [x] **Phase 2: End-to-End Build Verification** (2/2 plans) — completed 2026-03-29
- [x] **Phase 3: Frontend UX Improvements** (2/2 plans) — completed 2026-03-29
- [x] **Phase 4: Documentation Accuracy** (6/6 plans) — completed 2026-03-29
- [x] **Phase 5: Catalog Expansion** (6/6 plans) — completed 2026-03-29

Archive: `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>✅ v1.1 — Audit & Completion (Phases 6-7) — SHIPPED 2026-03-31</summary>

- [x] **Phase 6: YAML Cookbook Syntax Highlighting** (1/1 plans) — completed 2026-03-30
- [x] **Phase 7: Catalog Polish** (3/3 plans) — completed 2026-03-31

Archive: `.planning/milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>🚧 v1.2 — Catalog UX & Maintenance (Phases 8-9) — IN PROGRESS</summary>

- [ ] **Phase 8: Maintenance & Bug Fixes** (0/3 plans)
  - [x] 08-01-PLAN.md — Bump GitHub Actions to Node.js 24 in both `ci.yml` and `deploy.yml` atomically (MAINT-01)
  - [x] 08-02-PLAN.md — Run `pnpm audit` and resolve any high/critical CVEs; verify `pnpm build` passes (MAINT-02)
  - [x] 08-03-PLAN.md — Diagnose and fix container-isolation 404; regenerate search index (BUG-01, BUG-02)
- [ ] **Phase 9: Catalog Browser** (0/4 plans)
  - [ ] 09-01-PLAN.md — Extend lib/catalog.ts with fetchAllCatalogEntries(); verify YAML field names (CAT-13)
  - [ ] 09-02-PLAN.md — Build leaf components: Badge, FilterChip, SearchInput, CatalogEntryCard, CatalogPagination, CatalogGrid (CAT-02, CAT-04–CAT-09)
  - [ ] 09-03-PLAN.md — Build CatalogFilterBar and CatalogBrowser with URL-encoded filter state (CAT-03, CAT-04–CAT-07, CAT-10)
  - [ ] 09-04-PLAN.md — Create app/docs/catalog/page.tsx with Suspense boundary; wire navigation.ts (CAT-01, CAT-11, CAT-12)

Details: `.planning/milestones/v1.2-ROADMAP.md`

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Catalog Automation | v1.0 | 3/3 | Complete | 2026-03-29 |
| 2. End-to-End Build Verification | v1.0 | 2/2 | Complete | 2026-03-29 |
| 3. Frontend UX Improvements | v1.0 | 2/2 | Complete | 2026-03-29 |
| 4. Documentation Accuracy | v1.0 | 6/6 | Complete | 2026-03-29 |
| 5. Catalog Expansion | v1.0 | 6/6 | Complete | 2026-03-29 |
| 6. YAML Cookbook Syntax Highlighting | v1.1 | 1/1 | Complete | 2026-03-30 |
| 7. Catalog Polish | v1.1 | 3/3 | Complete | 2026-03-31 |
| 8. Maintenance & Bug Fixes | v1.2 | 3/3 | Complete   | 2026-04-02 |
| 9. Catalog Browser | v1.2 | 0/4 | Not started | - |
