# Requirements — v1.2 Catalog UX & Maintenance

**Milestone:** v1.2
**Milestone name:** Catalog UX & Maintenance
**Written:** 2026-04-01
**Status:** Final — approved for roadmap

---

## Scope Summary

Three independent work streams with no shared code dependencies:

1. **GitHub Actions maintenance** — bump all action versions to Node.js 24 runtime; clean up CI matrix inconsistency
2. **Container-isolation 404 fix** — repair broken nav href; verify MDX content exists; regenerate search index
3. **Catalog Browser** — new additive page at `/docs/catalog` with category sidebar, text search, filter chips, paginated card grid, and URL-encoded filter state

---

## Maintenance & Security

### MAINT-01 — GitHub Actions Node.js 24 Bump

Both `.github/workflows/ci.yml` and `.github/workflows/deploy.yml` must be updated in a single atomic commit:

- `actions/checkout` → `@v6` (Node 24 runner; minimum runner v2.327.1)
- `actions/setup-node` → `@v6` (Node 24; v6 breaking change: automatic caching limited to npm only — `cache: 'pnpm'` must be removed from this action)
- `pnpm/action-setup` → `@v5` (Node 24; owns pnpm store caching after setup-node@v6 breaking change)
- `actions/upload-artifact` → `@v4` if not already at v4

The `strategy.matrix.node-version: [20]` in `ci.yml` is silently ignored (setup-node uses a hardcoded version string). Either:
  - Remove the matrix entirely (preferred — reduces confusion), or
  - Update to `[24]` and reference `${{ matrix.node-version }}` consistently in the setup-node step

After bump, CI must pass with no deprecation warnings and pnpm cache must hit (verified via workflow log).

**Acceptance criteria:**
- Both workflow files reference only Node.js 24 action versions
- No `cache: 'pnpm'` in `actions/setup-node` step
- `pnpm/action-setup@v5` present in both workflow files
- `matrix.node-version: [20]` removed or updated to `[24]` with consistent reference
- CI passes clean (no deprecation warnings)

---

### MAINT-02 — Dependency CVE Audit

- Run `pnpm audit` and resolve any high or critical CVEs in `package.json`
- Update affected packages; re-run `pnpm build` to confirm no regressions
- `pnpm audit` must exit 0 (or with acceptable low/moderate findings documented)

**Acceptance criteria:**
- `pnpm audit` exits 0 or documents accepted low/moderate findings
- `pnpm build` passes after any updates

---

## Bug Fixes

### BUG-01 — Container-Isolation 404 Fix

**Diagnosis required first:** Confirm whether `contents/docs/configuration/container-isolation/index.mdx` exists before making any changes. Research indicates the content exists (277 lines); the nav href in `settings/documents.ts` is the root cause.

- Fix nav href in `settings/documents.ts`: `href: '/container-isolation'` → `href: '/configuration/container-isolation'`
- Confirm the MDX file exists at `contents/docs/configuration/container-isolation/index.mdx`
- After fix: `pnpm build` must generate `out/docs/configuration/container-isolation/index.html`
- Run `pnpm dev` and confirm sidebar link navigates correctly

**Acceptance criteria:**
- `/docs/configuration/container-isolation/` loads without 404
- Sidebar link "Container Isolation" navigates to correct page
- `out/docs/configuration/container-isolation/index.html` present in static export

---

### BUG-02 — Search Index Stale Entry Cleanup

- After BUG-01 fix, regenerate search index: `sh .husky/post-process.sh`
- Commit updated `public/search-data/` files
- Search results must not surface any links that resolve to 404

**Acceptance criteria:**
- Search index regenerated after BUG-01 fix
- No 404 links appear in search results for "container isolation"

---

## Catalog Browser

### CAT-01 — New Catalog Page Route

- New route: `app/docs/catalog/page.tsx` (Server Component)
- Inherits `app/docs/layout.tsx` (docs sidebar, no layout changes needed)
- Follows the same standalone route escape pattern as `app/docs/yaml-cookbook/[category]/page.tsx`
- Must NOT be registered in `settings/documents.ts` as a rubix-documents MDX page
- Generates `out/docs/catalog/index.html` in the static export
- `generateMetadata` export with appropriate title and description

**Acceptance criteria:**
- `pnpm build` generates `out/docs/catalog/index.html`
- Page accessible at `/docs/catalog/` in production
- No `notFound()` errors at build time

---

### CAT-02 — Two-Panel Layout

- Left panel: category filter sidebar (visible on desktop; collapses to horizontal chip row on mobile)
- Right panel: paginated card grid
- Layout is responsive: 3-col card grid on desktop, 2-col on tablet, 1-col on mobile
- Category panel is inside the content area (not a second nav sidebar) — implemented as a left `flex` column on desktop

**Acceptance criteria:**
- Two-panel layout renders correctly on desktop (≥1024px)
- Category panel collapses / reflows correctly on mobile (<768px)

---

### CAT-03 — Category Sidebar Filter

- Left panel lists all categories derived from `catalog.json` index keys at build time (not hardcoded)
- "All" option shown first; selects all categories
- Exactly one category active at a time (mutually exclusive single-select)
- Active category visually indicated (distinct background/border)
- Category selection resets pagination to page 1

**Acceptance criteria:**
- All 10 categories appear in sidebar
- "All" is the default active state showing all 65 entries
- Selecting a category filters the card grid
- Category count badge optional (nice-to-have; not required in v1.2)

---

### CAT-04 — Text Search

- Search input in the filter bar (above or alongside the card grid)
- Filters by name and description using native `String.includes` (case-insensitive)
- Instant filtering on `onChange` (no submit button required)
- Clears on Escape key
- Search resets pagination to page 1 on any input change

**Acceptance criteria:**
- Typing in search box filters visible entries instantly
- Escape clears the search field
- Combines with category and other filters (AND logic)

---

### CAT-05 — Transport Type Filter

- Filter chips for transport type: `stdio` and `streamable-http`
- Derived from the transport field in YAML (exact field name to be verified against live YAML before implementation)
- Single-select or deselectable — selecting the active chip deselects it (returns to "all transports")
- Transport filter resets pagination to page 1

**Note:** YAML field name (`type:` vs `transport:` vs `metadata.transport`) must be confirmed against live YAML files before writing filter derivation code. This is the one MEDIUM-confidence item from research.

**Acceptance criteria:**
- Two transport chips render with correct labels
- Selecting a chip filters entries to matching transport only
- Deselecting returns to unfiltered state

---

### CAT-06 — Auth Required Toggle

- Toggle chip: "No API key required" — when active, shows only entries with no env vars
- Derived from `env:` key presence in YAML: `Object.keys(entry.env ?? {}).length === 0`
- Toggle resets pagination to page 1

**Acceptance criteria:**
- Toggle chip filters entries to those requiring no credentials
- Combines with other filters (AND logic)

---

### CAT-07 — Container vs Remote Toggle

- Toggle chip: "Containerized only" — when active, shows only entries with `container.enabled: true`
- Exact YAML field name (`container.enabled` vs `container_enabled`) must be verified before implementation
- Toggle resets pagination to page 1

**Acceptance criteria:**
- Toggle chip filters entries to containerized entries only
- Combines with other filters (AND logic)

---

### CAT-08 — Entry Cards

Each card displays:
- Entry name
- Description (line-clamped to 2–3 lines to keep grid uniform)
- Category badge
- Transport badge (`stdio` or `streamable-http`)
- Auth badge ("No API key" or "API key required")
- Container/remote badge ("Containerized" or "Remote")
- "View YAML" link → existing YAML Cookbook category page (`/docs/yaml-cookbook/${category}/`)

**One link per card only.** No "View on GitHub" link in v1.2 (backend_slug field availability unverified).

**Acceptance criteria:**
- All badge types render with correct derived values
- "View YAML" link navigates to the correct cookbook category page
- Cards do not overflow their grid columns at any breakpoint

---

### CAT-09 — Pagination

- 12 entries per page
- Prev/Next controls
- "Showing X of Y entries" count always visible (Y reflects active filter count, not total 65)
- "Page N of M" indicator
- Pagination resets to page 1 on any filter or search change

**Acceptance criteria:**
- With all filters cleared, 65 entries paginate across 6 pages (5 full pages of 12 + 1 of 5)
- Prev disabled on page 1; Next disabled on last page
- Filter change resets to page 1

---

### CAT-10 — URL-Encoded Filter State

- All filter state (category, query, transport, auth toggle, container toggle, page) encoded in URL search params
- State is bookmarkable and shareable — copying the URL preserves filter state
- Implementation uses `useSearchParams` (Next.js built-in) with a Suspense boundary wrapping the Client Component that calls it
- `app/docs/catalog/page.tsx` (Server Component) renders a `<Suspense fallback={...}>` wrapper around `<CatalogBrowser>`
- `CatalogBrowser` is a `'use client'` component; it reads/writes search params via `useSearchParams` + `useRouter` (or `nuqs` if adopted)

**This is the highest-risk coding pattern for static export.** Missing the Suspense boundary causes a build error or blank production page.

**Acceptance criteria:**
- Applying filters updates the URL search params
- Navigating to a filtered URL loads the page with correct filters applied
- `pnpm build` succeeds (no Suspense boundary errors)
- Filter state survives a page refresh

---

### CAT-11 — Existing YAML Cookbook Pages Unchanged

- No modifications to any existing `app/docs/yaml-cookbook/` routes
- No modifications to existing per-category cookbook pages
- Catalog browser is purely additive

**Acceptance criteria:**
- All 10 existing `out/docs/yaml-cookbook/*/index.html` files present and unchanged after catalog page is added

---

### CAT-12 — Navigation Wiring

- `settings/navigation.ts`: Update the existing external "Catalog" entry (currently links to `github.com/diaz3618/argus-mcp-catalog`) to point to `/docs/catalog` internally
- `settings/documents.ts`: Do NOT add catalog as a rubix-documents MDX page — this would cause `notFound()` at build time

**Note:** The `pagemenu.tsx` prepends `/docs` automatically for `documents.ts` entries; this is why `href: '/catalog'` in navigation.ts is correct (navigation.ts entries are used directly, not prepended).

**Acceptance criteria:**
- Top nav "Catalog" link navigates to `/docs/catalog/` (not GitHub)
- No build errors from incorrect `documents.ts` registration

---

### CAT-13 — Data Layer Extension

- Add `fetchAllCatalogEntries()` export to `lib/catalog.ts`
- Reuses existing `fetchCatalogIndex()` and `fetchCategoryConfigs()` — no new Octokit client, no double-fetching
- Returns `{ entries: CatalogEntry[], categories: string[], updatedAt: string }`
- No changes to existing exported functions

**Acceptance criteria:**
- Existing YAML Cookbook build behavior unchanged after `lib/catalog.ts` modification
- `fetchAllCatalogEntries()` returns all 65 entries across all 10 categories

---

## Out of Scope (v1.2)

| Item | Reason |
|------|--------|
| Runtime filter (uvx/npx/docker) | YAML field presence unverified; heuristic inference adds fragility; low narrowing power |
| Inline YAML expand / modal | Requires Prism in browser bundle; cookbook pages already serve this |
| "View on GitHub" link per card | `backend_slug` field availability unverified in live YAML |
| `nuqs` package for URL state | Use `useSearchParams` + `useRouter` directly; nuqs is an optional enhancement |
| Category entry counts in sidebar | Nice-to-have; easy v1.3 add |
| Copy config snippet button | Clipboard API + state complexity; good v1.3 differentiator |
| Popularity or recency sorting | No timestamps in catalog.json; fabricating data is not acceptable |
| Glama registry data integration | Research reference only; no integration in v1.2 |
| Restructuring existing YAML Cookbook pages | Additive only; cookbook pages untouched |
| End-to-end CI loop runtime test | GitHub billing spending limit still unresolved |

---

## Compound Filter Logic

All active filters combine with AND logic:
- A developer filtering "databases + containerized + no API key" sees only entries matching all three conditions
- Text search applies in addition to all active filter chips
- Any filter change resets pagination to page 1

---

## YAML Field Name Verification (Implementation Prerequisite)

Before writing any filter or badge derivation code, verify the following against live YAML files in `argus-mcp-catalog/configs/`:

| Filter / Badge | Expected field | Verify |
|---------------|---------------|--------|
| Transport chip | `type:` or `transport:`? | Inspect 2–3 YAML files from different categories |
| Container toggle | `container.enabled` or `container_enabled`? | Check nested vs flat key |
| Auth toggle | `env:` key presence | Confirm key name and structure |

**This verification step must happen at the start of the Catalog Browser phase — before any component code is written.**

---

## Future (v1.3+)

- Runtime filter chip (uvx/npx/go/docker) — after YAML field verification
- Inline YAML expand / detail modal
- "View on GitHub" link via `backend_slug` — after field verification
- Category entry counts in sidebar
- Copy config snippet button
- `nuqs` adoption for clean URL state API (if `useSearchParams` + `useRouter` pattern proves verbose)
- Popularity or recency sorting (requires new metadata in catalog)

---

## Requirement Summary Table

| ID | Area | Description | Priority |
|----|------|-------------|---------|
| MAINT-01 | CI/CD | GitHub Actions Node.js 24 bump (both workflow files, atomic) | High |
| MAINT-02 | Security | `pnpm audit` CVE resolution | Medium |
| BUG-01 | Bug fix | Container-isolation nav href fix | High |
| BUG-02 | Bug fix | Search index regeneration after BUG-01 | High |
| CAT-01 | Catalog | New route `app/docs/catalog/page.tsx` | High |
| CAT-02 | Catalog | Two-panel responsive layout | High |
| CAT-03 | Catalog | Category sidebar filter | High |
| CAT-04 | Catalog | Text search (name + description) | High |
| CAT-05 | Catalog | Transport type filter chips | High |
| CAT-06 | Catalog | Auth required toggle | Medium |
| CAT-07 | Catalog | Container vs remote toggle | Medium |
| CAT-08 | Catalog | Entry cards with badges and "View YAML" link | High |
| CAT-09 | Catalog | Pagination (12/page, prev/next, count) | High |
| CAT-10 | Catalog | URL-encoded filter state + Suspense boundary | High |
| CAT-11 | Catalog | Existing cookbook pages unchanged | High |
| CAT-12 | Catalog | Navigation wiring (nav.ts update) | High |
| CAT-13 | Catalog | `fetchAllCatalogEntries()` data layer | High |

## Traceability

| Requirement | Phase | Plan | Status |
|-------------|-------|------|--------|
| MAINT-01 | 8 | 08-01 | Pending |
| MAINT-02 | 8 | 08-02 | Pending |
| BUG-01 | 8 | 08-03 | Complete |
| BUG-02 | 8 | 08-03 | Complete |
| CAT-01 | 9 | 09-04 | Pending |
| CAT-02 | 9 | 09-02 | Pending |
| CAT-03 | 9 | 09-03 | Pending |
| CAT-04 | 9 | 09-02, 09-03 | Pending |
| CAT-05 | 9 | 09-02, 09-03 | Pending |
| CAT-06 | 9 | 09-02, 09-03 | Pending |
| CAT-07 | 9 | 09-02, 09-03 | Pending |
| CAT-08 | 9 | 09-02 | Pending |
| CAT-09 | 9 | 09-02 | Pending |
| CAT-10 | 9 | 09-03, 09-04 | Pending |
| CAT-11 | 9 | 09-04 | Pending |
| CAT-12 | 9 | 09-04 | Pending |
| CAT-13 | 9 | 09-01 | Pending |
