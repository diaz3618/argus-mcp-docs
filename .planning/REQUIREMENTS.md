# Requirements: Argus MCP Documentation Site

**Defined:** 2026-03-28
**Core Value:** The docs site always reflects the current state of the catalog — when a YAML config is merged to argus-mcp-catalog, the docs site rebuilds and reflects it automatically with no manual intervention.

## v1 Requirements

### Catalog Automation (argus-mcp-catalog repo)

- [x] **CATALOG-01**: `scripts/generate-index.js` scans `configs/` subdirectories and produces a correct `catalog.json` with `{ categories: Record<string, string[]>, updated_at: string }`
- [x] **CATALOG-02**: `generate-index.yml` runs on push to main when `configs/**` changes, executes the script, and commits `catalog.json` back using `GITHUB_TOKEN` + `stefanzweifel/git-auto-commit-action@v7` with `[skip ci]` in the commit message
- [x] **CATALOG-03**: `generate-index.yml` has `concurrency: group: catalog-index-generation` (cancel-in-progress: false) to prevent race conditions from simultaneous merges
- [x] **CATALOG-04**: `notify-docs.yml` triggers via `workflow_run` after `generate-index.yml` completes successfully and dispatches `workflow_dispatch` to `diaz3618/argus-mcp-docs` using `gh workflow run` with `DOCS_DISPATCH_TOKEN`
- [ ] **CATALOG-05**: `DOCS_DISPATCH_TOKEN` fine-grained PAT created with `actions: write` on `argus-mcp-docs` and stored as a secret in `argus-mcp-catalog` _(workflow wired + instructions documented; secret creation is a manual user step)_

### Build Verification (argus-mcp-docs repo)

- [x] **BUILD-01**: `sh .husky/post-process.sh` runs without error (search index generated, TypeScript compiles)
- [x] **BUILD-02**: `CATALOG_READ_TOKEN=<token> pnpm run build` completes successfully with real catalog data — `out/docs/yaml-cookbook/` contains 10 category `index.html` files with actual YAML content
- [x] **BUILD-03**: Build output verified: `find out/docs/yaml-cookbook -name "index.html" | wc -l` equals 10, and at least one category page contains `language-yaml` (real YAML blocks rendered, not empty-state fallback)

### Contributor Workflow (argus-mcp-catalog repo)

- [x] **CONTRIB-01**: `.github/pull_request_template.md` guides contributors on required YAML fields and category placement

### Frontend UX (argus-mcp-docs repo)

- [x] **FE-01**: `styles/globals.css` extended with Prism token CSS rules for `.class-name`, `.operator`, `.variable`, `.important`, `.atrule`, `.null-keyword`, and `.null.token` — each with light and dark variants — providing complete syntax highlighting coverage for YAML, Python, bash, and JSON code blocks
- [x] **FE-02**: `components/sidebar/sublink.tsx` modified so all sidebar sections default to collapsed on initial page load; "Getting Started" section (`href === '/docs/getting-started'`) initializes open unconditionally; the existing `useEffect` auto-expand for the active section is preserved unchanged

### Catalog Expansion (argus-mcp-catalog + argus-mcp-docs repos)

- [x] **CAT-EXP-01**: 20+ new YAML catalog configs across all existing categories, prioritizing stdio container variants that demonstrate complex patterns (volume mounts, network modes, `system_deps`, env injection with secrets)
- [ ] **CAT-EXP-02**: GitHub-only MCP server entries — servers not published to npm/PyPI, built from source using `container.source_url` + `container.build_steps` + `container.entrypoint`, or via `container.dockerfile` pointing to a custom Dockerfile in `dockerfiles/`
- [ ] **CAT-EXP-03**: If a real MCP server genuinely requires a custom Dockerfile (not expressible via `system_deps`, `source_url`, or `go_package`), add that server's `.dockerfile` co-located in `configs/{category}/` with a paired YAML using `container.dockerfile`. No demo Dockerfiles — real servers only; docs-only coverage is acceptable if no suitable candidate exists
- [ ] **CAT-EXP-04**: All new catalog entries tested locally — each config confirmed to deploy and function correctly with argus-mcp before being added to the catalog
- [ ] **CAT-EXP-05**: `catalog.json` updated to include all new entries across all affected categories; validated with `node scripts/lint-catalog.js` (exits 0)
- [ ] **CAT-EXP-06**: argus-mcp-docs `container-isolation` page (`contents/docs/configuration/container-isolation/index.mdx`) expanded to document all advanced `ContainerConfig` fields currently missing: `source_url`, `build_steps`, `entrypoint`, `build_env`, `source_ref`, `dockerfile`, `go_package`, `transport`, `volumes`, `extra_args`, `build_system_deps` — each with type, description, and YAML example
- [x] **CAT-EXP-07**: All catalog entries that require API keys or tokens use `${SECRET_NAME}` syntax; at least one complex entry includes an inline comment or YAML example showing how to configure Argus secrets management for that secret

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
| CATALOG-01 | Phase 1 | Complete |
| CATALOG-02 | Phase 1 | Complete |
| CATALOG-03 | Phase 1 | Complete |
| CATALOG-04 | Phase 1 | Complete |
| CATALOG-05 | Phase 1 | Pending (user action required) |
| BUILD-01 | Phase 2 | Complete |
| BUILD-02 | Phase 2 | Complete |
| BUILD-03 | Phase 2 | Complete |
| CONTRIB-01 | Phase 1 | Complete |
| FE-01 | Phase 3 | Complete |
| FE-02 | Phase 3 | Complete |
| CAT-EXP-01 | Phase 5 | Complete |
| CAT-EXP-02 | Phase 5 | Pending |
| CAT-EXP-03 | Phase 5 | Pending |
| CAT-EXP-04 | Phase 5 | Pending |
| CAT-EXP-05 | Phase 5 | Pending |
| CAT-EXP-06 | Phase 5 | Pending |
| CAT-EXP-07 | Phase 5 | Complete |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-29 — Phase 5 (Catalog Expansion) requirements added (CAT-EXP-01 through CAT-EXP-07)*
