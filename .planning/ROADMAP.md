# Roadmap: Argus MCP Documentation Site

## Overview

Two focused phases close the remaining gaps in an otherwise complete project. Phase 1 adds the missing catalog automation loop to `argus-mcp-catalog` — the CI that auto-generates `catalog.json` and triggers a docs rebuild when YAML configs change. Phase 2 verifies the full build works end-to-end with a real `CATALOG_READ_TOKEN`, confirming the static export produces all 10 YAML Cookbook category pages with actual content.

Both phases touch different repos: Phase 1 is entirely in `argus-mcp-catalog`, Phase 2 is in `argus-mcp-docs`. They are sequential — Phase 2's build verification is only meaningful after Phase 1's dispatch loop exists.

## Phases

- [x] **Phase 1: Catalog Automation** — `generate-index.yml`, `notify-docs.yml`, `DOCS_DISPATCH_TOKEN`, and PR template wired into `argus-mcp-catalog` (completed 2026-03-29)
- [ ] **Phase 2: End-to-End Build Verification** — Local build with real token confirms all 10 YAML Cookbook pages render with catalog data; any issues found and fixed

## Phase Details

### Phase 1: Catalog Automation
**Goal**: Every merge to `argus-mcp-catalog` that changes YAML configs automatically regenerates `catalog.json` and triggers an `argus-mcp-docs` rebuild — zero manual steps required
**Repo**: `argus-mcp-catalog` (at `/home/diaz/mygit/argus-mcp-catalog/`)
**Depends on**: Nothing (first phase)
**Requirements**: CATALOG-01, CATALOG-02, CATALOG-03, CATALOG-04, CATALOG-05, CONTRIB-01
**Success Criteria**:
  1. `scripts/generate-index.js` exists and produces correct `catalog.json` when run locally (`node scripts/generate-index.js`)
  2. `generate-index.yml` is present with correct path filter (`configs/**`), `contents: write` permission, concurrency group, and commits via `stefanzweifel/git-auto-commit-action@v7` with `[skip ci]`
  3. `notify-docs.yml` is present, triggers via `workflow_run` on `generate-index.yml` success, and dispatches `gh workflow run deploy.yml --repo diaz3618/argus-mcp-docs` with `DOCS_DISPATCH_TOKEN`
  4. `DOCS_DISPATCH_TOKEN` placeholder documented (secret must be created and stored in GitHub by user — cannot be automated)
  5. `.github/pull_request_template.md` exists with required YAML fields guidance

**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Write `scripts/generate-index.js` (pure Node.js, no deps) and verify it produces correct `catalog.json` locally
- [x] 01-02-PLAN.md — Write `generate-index.yml` (path filter, GITHUB_TOKEN, concurrency, auto-commit) and `notify-docs.yml` (workflow_run chain, gh dispatch)
- [x] 01-03-PLAN.md — Write `.github/pull_request_template.md`; document `DOCS_DISPATCH_TOKEN` setup instructions; push all changes to `argus-mcp-catalog`

### Phase 2: End-to-End Build Verification
**Goal**: `pnpm build` on `argus-mcp-docs` succeeds with real catalog data and the `out/` directory contains all 10 YAML Cookbook category pages with actual YAML content
**Repo**: `argus-mcp-docs` (current repo)
**Depends on**: Phase 1 (catalog must be populated and `catalog.json` accurate)
**Requirements**: BUILD-01, BUILD-02, BUILD-03
**Success Criteria**:
  1. `sh .husky/post-process.sh` exits 0 (search index generated, TypeScript OK)
  2. `CATALOG_READ_TOKEN=<real_token> pnpm run build` exits 0
  3. `find out/docs/yaml-cookbook -name "index.html" | wc -l` outputs `10`
  4. At least one category page HTML contains `language-yaml` (real YAML blocks, not empty-state fallback)
  5. Any build failures diagnosed and fixed

**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Run pre-build steps and `pnpm build` with token; capture output; verify `out/` structure
- [ ] 02-02-PLAN.md — Spot-check rendered category pages for YAML content; document verified state; fix any issues found

### Phase 3: Frontend UX Improvements
**Goal**: Improve the developer experience of the docs site — complete syntax highlighting coverage for all languages used in the project (YAML, Python, and others) and implement default-collapsed sidebar navigation with "Getting Started" always open
**Repo**: `argus-mcp-docs` (current repo)
**Depends on**: Phase 2
**Requirements**: FE-01, FE-02
**Success Criteria**:
  1. Code blocks render with visible token colors for YAML, Python, bash, JSON, and TypeScript
  2. Sidebar sections default to collapsed on initial page load; "Getting Started" is the only section open by default
  3. Active section (current page) auto-expands on navigation
  4. Changes are confined to extension points (no rubix-documents core modifications where avoidable)

**Plans**: 1 plan

Plans:
- [ ] 03-01-PLAN.md — Add 6 Prism token CSS rules to globals.css; change sublink.tsx to collapsed-default with Getting Started always open

### Phase 4: Documentation Accuracy
**Goal**: Every page in the argus-mcp-docs site accurately reflects the argus-mcp codebase — wrong information corrected, missing documented features added, and gaps in API/config reference filled
**Repo**: `argus-mcp-docs` (current repo), cross-referencing `argus-mcp` at `/home/diaz/mygit/argus-mcp/`
**Depends on**: Phase 3
**Requirements**: DOC-01, DOC-02, DOC-03
**Success Criteria**:
  1. All documented facts (command flags, config fields, API endpoints, plugin lists) match the actual codebase
  2. Undocumented API endpoints and config sections addressed per phase decisions
  3. No page references features, flags, or field names that don't exist in code
  4. Code is the source of truth — where docs and code conflict, docs are updated to match code

**Plans**: TBD — pending discuss-phase context

## Progress

**Execution Order:**
Phases execute sequentially: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Catalog Automation | 3/3 | Complete   | 2026-03-29 |
| 2. End-to-End Build Verification | 0/2 | Not started | — |
| 3. Frontend UX Improvements | 0/1 | Not started | — |
| 4. Documentation Accuracy | 0/? | Not started | — |
