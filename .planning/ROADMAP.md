# Roadmap: Argus MCP Documentation Site

## Overview

Two focused phases close the remaining gaps in an otherwise complete project. Phase 1 adds the missing catalog automation loop to `argus-mcp-catalog` — the CI that auto-generates `catalog.json` and triggers a docs rebuild when YAML configs change. Phase 2 verifies the full build works end-to-end with a real `CATALOG_READ_TOKEN`, confirming the static export produces all 10 YAML Cookbook category pages with actual content.

Both phases touch different repos: Phase 1 is entirely in `argus-mcp-catalog`, Phase 2 is in `argus-mcp-docs`. They are sequential — Phase 2's build verification is only meaningful after Phase 1's dispatch loop exists.

## Phases

- [x] **Phase 1: Catalog Automation** — `generate-index.yml`, `notify-docs.yml`, `DOCS_DISPATCH_TOKEN`, and PR template wired into `argus-mcp-catalog` (completed 2026-03-29)
- [x] **Phase 2: End-to-End Build Verification** — Local build with real token confirms all 10 YAML Cookbook pages render with catalog data; any issues found and fixed (completed 2026-03-29)

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
- [x] 02-01-PLAN.md — Run pre-build steps and `pnpm build` with token; capture output; verify `out/` structure
- [x] 02-02-PLAN.md — Spot-check rendered category pages for YAML content; document verified state; fix any issues found

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
- [x] 03-01-PLAN.md — Add 6 Prism token CSS rules to globals.css; change sublink.tsx to collapsed-default with Getting Started always open

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

**Plans**: 6 plans

Plans:
- [x] 04-01-PLAN.md — Verify plugin count (8 builtins confirmed), fix built-in-plugins page; add 3 missing timeout fields (startup, retries, retry_delay) to backends config docs
- [x] 04-02-PLAN.md — Add 9 missing API endpoints to endpoints/index.mdx (GET /ready, GET /batch, POST /reauth/{name}, GET /registry/search, GET /skills, skills enable/disable, POST /tools/call, POST /resources/read)
- [x] 04-03-PLAN.md — Create 7 new config sub-pages: session-pool, http-pool, retry, sse-resilience, plugins-config, skills-config, workflows-config
- [x] 04-04-PLAN.md — Expand Skills and Workflows overviews to full reference depth (manifest.json reference, DAG step field reference)
- [x] 04-05-PLAN.md — Expand Optimizer, Registry, and TUI overviews to full reference depth (meta-tool schemas, registries config, TUI screens/keybindings)
- [x] 04-06-PLAN.md — Wire 7 new config sub-pages into settings/documents.ts navigation (depends on 04-03)

### Phase 5: Catalog Expansion
**Goal**: Significantly expand argus-mcp-catalog with 20+ real, tested MCP server configs covering complex stdio containers (volume mounts, network configs, GitHub-only sources, custom Dockerfiles), and update argus-mcp-docs to document all advanced ContainerConfig fields currently missing from the container-isolation page
**Repo**: Primary: `argus-mcp-catalog` (`/home/diaz/mygit/argus-mcp-catalog/`); Secondary: `argus-mcp-docs` (current repo for docs updates)
**Depends on**: Phase 3, Phase 4
**Requirements**: CAT-EXP-01, CAT-EXP-02, CAT-EXP-03, CAT-EXP-04, CAT-EXP-05, CAT-EXP-06, CAT-EXP-07
**Success Criteria**:
  1. 20+ new YAML configs added across all catalog categories, prioritizing complex stdio container variants
  2. At least 5 entries demonstrating advanced patterns: volume mounts, custom networks, `source_url` builds, Go transport, `system_deps`
  3. GitHub-only MCP server entries added using `source_url` + `build_steps` + `entrypoint` or `container.dockerfile` pattern
  4. `dockerfiles/` directory created in argus-mcp-catalog with Dockerfile examples; corresponding YAML entries use `container.dockerfile`
  5. All new configs tested locally with argus-mcp before merging — confirmed to deploy and work correctly
  6. `catalog.json` updated with all new entries, validated with `node scripts/lint-catalog.js`
  7. argus-mcp-docs `container-isolation` page documents all advanced ContainerConfig fields: `source_url`, `build_steps`, `entrypoint`, `build_env`, `source_ref`, `dockerfile`, `go_package`, `transport`, `volumes`, `extra_args`, `build_system_deps`
  8. All secrets use `${SECRET_NAME}` syntax with Argus secrets management examples

**Plans**: 6 plans

Plans:
- [x] 05-01-PLAN.md — Database + web-research containers: sqlite (volumes), mysql, redis, mongodb, neon (bridge+secrets), playwright (system_deps), exa — 11 entries
- [ ] 05-02-PLAN.md — Devops + web-research advanced: mcp-k8s (Go transport), terraform (Docker Hub direct), docker-mcp (socket volume), linear, notion, mcp-webresearch (source_url) — 6 entries
- [x] 05-03-PLAN.md — Filesystem + security + memory + isolated: desktop-commander (volumes), obsidian, wcgw, custom-dockerfile-demo (.dockerfile escape hatch), shodan, qdrant-memory, dice — 9 YAML + 1 Dockerfile
- [x] 05-04-PLAN.md — Remote servers: exa-remote (HTTP), linear-remote (HTTP), exa-sse (SSE) — 3 remote entries
- [x] 05-05-PLAN.md — Docs: expand container-isolation/index.mdx with all 11 undocumented ContainerConfig fields (source_url, build_steps, entrypoint, build_env, source_ref, dockerfile, go_package, transport, volumes, extra_args, build_system_deps)
- [ ] 05-06-PLAN.md — Finalize: update catalog.json with all 25 new entries + lint validation; update CONTRIBUTING.md with advanced patterns (depends on 05-01 through 05-05)

## Progress

**Execution Order:**
Phases execute sequentially: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Catalog Automation | 3/3 | Complete   | 2026-03-29 |
| 2. End-to-End Build Verification | 2/2 | Complete    | 2026-03-29 |
| 3. Frontend UX Improvements | 1/1 | Complete   | 2026-03-29 |
| 4. Documentation Accuracy | 6/6 | Complete   | 2026-03-29 |
| 5. Catalog Expansion | 4/6 | In Progress|  |
