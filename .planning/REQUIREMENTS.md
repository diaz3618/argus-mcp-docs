# Requirements: Argus MCP Documentation Site

**Defined:** 2026-03-28
**Core Value:** The docs site always reflects the current state of the catalog — when a YAML config is merged to argus-mcp-catalog, the docs site rebuilds and reflects it automatically with no manual intervention.

## v1 Requirements

### Catalog Automation (argus-mcp-catalog repo)

- [ ] **CATALOG-01**: `scripts/generate-index.js` scans `configs/` subdirectories and produces a correct `catalog.json` with `{ categories: Record<string, string[]>, updated_at: string }`
- [ ] **CATALOG-02**: `generate-index.yml` runs on push to main when `configs/**` changes, executes the script, and commits `catalog.json` back using `GITHUB_TOKEN` + `stefanzweifel/git-auto-commit-action@v7` with `[skip ci]` in the commit message
- [ ] **CATALOG-03**: `generate-index.yml` has `concurrency: group: catalog-index-generation` (cancel-in-progress: false) to prevent race conditions from simultaneous merges
- [ ] **CATALOG-04**: `notify-docs.yml` triggers via `workflow_run` after `generate-index.yml` completes successfully and dispatches `workflow_dispatch` to `diaz3618/argus-mcp-docs` using `gh workflow run` with `DOCS_DISPATCH_TOKEN`
- [ ] **CATALOG-05**: `DOCS_DISPATCH_TOKEN` fine-grained PAT created with `actions: write` on `argus-mcp-docs` and stored as a secret in `argus-mcp-catalog`

### Build Verification (argus-mcp-docs repo)

- [ ] **BUILD-01**: `sh .husky/post-process.sh` runs without error (search index generated, TypeScript compiles)
- [ ] **BUILD-02**: `CATALOG_READ_TOKEN=<token> pnpm run build` completes successfully with real catalog data — `out/docs/yaml-cookbook/` contains 10 category `index.html` files with actual YAML content
- [ ] **BUILD-03**: Build output verified: `find out/docs/yaml-cookbook -name "index.html" | wc -l` equals 10, and at least one category page contains `language-yaml` (real YAML blocks rendered, not empty-state fallback)

### Contributor Workflow (argus-mcp-catalog repo)

- [ ] **CONTRIB-01**: `.github/pull_request_template.md` guides contributors on required YAML fields and category placement

## v2 Requirements

### Observability

- **OBS-01**: GitHub Actions workflow badges in catalog README showing generate-index and lint status
- **OBS-02**: Token expiry monitoring — a scheduled workflow validates `DOCS_DISPATCH_TOKEN` is still valid

## Out of Scope

| Feature | Reason |
|---------|--------|
| Modifying main branch to match catalog | Catalog adapts to main; main is production |
| docuowl branch work | Separate evaluation effort, tracked independently |
| New documentation content | Existing content complete; no new docs sections in this milestone |
| github.com/diaz3618 org migration | Personal account; fine-grained PATs work without org admin action |
| Retry logic on dispatch | Duplicate dispatches cause duplicate deploys; daily cron is the safety net |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CATALOG-01 | Phase 1 | Pending |
| CATALOG-02 | Phase 1 | Pending |
| CATALOG-03 | Phase 1 | Pending |
| CATALOG-04 | Phase 1 | Pending |
| CATALOG-05 | Phase 1 | Pending |
| BUILD-01 | Phase 2 | Pending |
| BUILD-02 | Phase 2 | Pending |
| BUILD-03 | Phase 2 | Pending |
| CONTRIB-01 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after initial definition*
