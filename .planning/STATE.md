---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: — Catalog UX & Maintenance
current_plan: 1
status: Executing Phase 08
last_updated: "2026-04-02T17:08:12.586Z"
progress:
  total_phases: 9
  completed_phases: 8
  total_plans: 26
  completed_plans: 26
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-01)

**Core value:** The docs site always reflects the current state of the catalog — when a YAML config is merged to argus-mcp-catalog, the docs site rebuilds and reflects it automatically with no manual intervention.
**Current focus:** Phase 08 — maintenance-and-bug-fixes

## Current Status

**Active phase:** Phase 8 — Maintenance & Bug Fixes
**Current Plan:** 1
**Next action:** Execute plan 08-01

## Phase History

| Phase | Status | Completed |
|-------|--------|-----------|
| 1. Catalog Automation | Complete | 2026-03-28 |
| 2. End-to-End Build Verification | Complete | 2026-03-29 |
| 3. Frontend UX Improvements | Complete | 2026-03-29 |
| 4. Documentation Accuracy | Complete | 2026-03-29 |
| 5. Catalog Expansion | Complete | 2026-03-29 |
| 6. YAML Cookbook Syntax Highlighting | Complete | 2026-03-30 |
| 7. Catalog Polish | Complete | 2026-03-31 |

## Decisions

- **01-01**: Script writes catalog.json atomically via writeFileSync — no partial output risk
- **01-01**: Categories with zero YAML files are silently skipped — no empty arrays in output
- **01-01**: Files sorted alphabetically within each category for deterministic output
- **01-02**: GITHUB_TOKEN used for catalog.json commit-back — guaranteed not to retrigger workflows, breaking the infinite loop
- **01-02**: cancel-in-progress: false on concurrency group — queues second run so it sees both merges' configs, not just the latest
- **01-02**: permissions: contents: write at job level, not workflow level — scoped to the generation job only
- **01-02**: DOCS_DISPATCH_TOKEN PAT setup instructions in notify-docs.yml as comment block — co-located with the workflow that requires it
- [Phase 01-catalog-automation]: PR template format: checkboxes with one-line inline examples — no full YAML block (per D-02)
- [Phase 01-catalog-automation]: Checklist covers exactly the three lint rules: name:, description:, backend-slug key, plus configs/{category}/ directory placement
- [Phase 01-catalog-automation]: workflow_dispatch added to generate-index.yml for manual trigger capability during testing
- [Phase 03-frontend-ux-improvements]: Prism tokens extended in globals.css: .class-name (blue), .operator (gray), .variable/.atrule (pink), .important (amber), .null-keyword/.null.token (gray) — all with dark variants
- [Phase 03-frontend-ux-improvements]: Sidebar default-collapsed via useState(isGettingStarted); Getting Started identified by href==='/docs/getting-started' (pagemenu.tsx prepends /docs)
- [Phase Phase 03-frontend-ux-improvements]: Gap closure plan 03-02: FE-01 and FE-02 registered in REQUIREMENTS.md — administrative fix, no code changes needed since implementations were already complete
- [Phase 04-documentation-accuracy]: GET /batch documented with note that sub-object schemas match individual endpoints, not duplicated inline
- [Phase 04-documentation-accuracy]: All response field names verified against schemas.py Pydantic models — no invented fields used in endpoint docs
- [Phase 04-documentation-accuracy]: Plugin setting names corrected to match Python source: window_seconds, cooldown_seconds, backoff_factor, ttl_seconds, max_entries
- [Phase 04-documentation-accuracy]: All 6 TimeoutConfig fields now documented in backends/index.mdx: init, cap_fetch, sse_startup, startup, retries, retry_delay
- [Phase 04-documentation-accuracy]: 04-03: Field names, types, defaults sourced from Pydantic models — no invented fields. Constraint ranges in Description column.
- [Phase 04-documentation-accuracy]: Skills and Workflows overview pages already met reference depth — only additive changes made for missing pieces
- [Phase 04-documentation-accuracy]: Added management API routes (/manage/v1/skills/{name}/enable|disable) to skills lifecycle section — verified in router.py
- [Phase 04-documentation-accuracy]: Optimizer 'high-risk, opt-in, default off' phrasing mirrors feature_flags description in schema.py
- [Phase 04-documentation-accuracy]: Management API search endpoint documented as distinct from external registry API to avoid confusion
- [Phase 04-documentation-accuracy]: 04-06: 7 new config nav items appended after Secrets Management in Configuration items array — href values match directory names exactly
- [Phase 02-end-to-end-build-verification]: Callout component does not exist in rubix-documents MDX registry — Note with type=warning is the correct replacement
- [Phase 02-end-to-end-build-verification]: CATALOG_READ_TOKEN=$(gh auth token) pnpm run build is the correct local build invocation — token injected inline, no .env.local, no exported var
- [Phase 02-end-to-end-build-verification]: rm -rf dist/scripts before running post-process.sh guarantees no stale incremental TypeScript output
- [Phase 02-end-to-end-build-verification]: find out/docs/yaml-cookbook -name index.html | wc -l outputs 11 (not 10) — landing page counts but BUILD-03 intent (10 category pages with real YAML) is fully satisfied
- [Phase 05-catalog-expansion]: 05-04: exa-remote and linear-remote use type: streamable-http matching existing catalog pattern; exa-sse uses type: sse for explicit SSE-with-auth pattern
- [Phase 05-catalog-expansion]: 05-04: All remote entries use ${SECRET_NAME} inline env var syntax — no hardcoded credentials; YAML comments document secret name and key acquisition URL
- [Phase 05-catalog-expansion]: 05-05: All new container-isolation sections appended after existing content — no deletions (D-25 append-only rule). build_steps + entrypoint required when source_url set (validation behavior). build_system_deps vs system_deps comparison table documents builder-only vs runtime stage distinction.
- [Phase 05-catalog-expansion]: sqlite-container uses uvx + network: none + volumes mount for fully isolated local DB access
- [Phase 05-catalog-expansion]: playwright-container uses system_deps list for chromium, chromedriver, dbus, xvfb — OS packages required for headless browser
- [Phase 05-catalog-expansion]: catalog.json not updated in 05-01 — deferred to plan 05-06 to avoid merge conflicts with parallel Wave 1 plans
- [Phase 05-catalog-expansion]: desktop-commander-container uses /tmp:/tmp:rw volume + network: none for minimal filesystem tool isolation
- [Phase 05-catalog-expansion]: shodan paired pattern (subprocess + container) consistent with existing filesystem/git pairs in catalog
- [Phase 05-catalog-expansion]: dice-container uses network: none — pure computation tool categorized in fully-isolated per D-06
- [Phase 05-catalog-expansion]: terraform.yaml uses Docker direct pass-through (command: docker, no container: key) — server is already Docker-based, Argus wrapping not applicable
- [Phase 05-catalog-expansion]: mcp-webresearch-container.yaml uses source_url + build_steps because no npm package exists for mcp-webresearch — GitHub-only server
- [Phase 05-catalog-expansion]: mcp-k8s-container.yaml uses Go transport (transport: go, go_package) — binary compiled from Go module path via go install into /app/mcp-server
- [Phase 05-catalog-expansion]: 05-06: custom-dockerfile-demo.yaml excluded from catalog.json — file not created by Wave 1 plans; 65 total entries not 62 as projected
- [Phase 05-catalog-expansion]: 05-06: CONTRIBUTING.md additions are append-only with three advanced examples (source_url, Go transport, custom Dockerfile) and 13 new container.* field reference rows
- [Phase 07-catalog-polish]: 07-03: js-yaml pinned to ^4 in package.json — lint-catalog.js uses yaml.load() which is v4 API; .gitignore added to exclude node_modules/
- [Phase 07-catalog-polish]: examples/ files not registered in catalog.json — lint validates only registered entries, count stays 65
- [Phase 07-catalog-polish]: container.dockerfile value is filename only (no path, no ..) — YAML and Dockerfile co-located in examples/
- [Phase 07-catalog-polish]: 07-02: remote-sse description uses backtick-quoted YAML field names (type: sse / type: streamable-http) to reference actual contributor-facing fields; 'Despite the directory name' note clarifies streamable-http entries belong in remote-sse directory
- [Phase 08-maintenance-and-bug-fixes]: setup-node@v6 drops pnpm cache support — pnpm/action-setup@v5 owns cache after upgrade; cache: 'pnpm' removed from deploy.yml
- [Phase 08-maintenance-and-bug-fixes]: ci.yml matrix.node-version [20] → [24] and setup-node wired to matrix variable — matrix now controls version, not hardcoded string
- [Phase 08-maintenance-and-bug-fixes]: pnpm.overrides used to fix transitive CVEs without waiting for upstream dep updates
- [Phase 08-maintenance-and-bug-fixes]: next updated 16.1.6 → 16.1.7 fixing 4 moderate CVEs (HTTP smuggling, DoS, CSRF)
- [Phase 08-maintenance-and-bug-fixes]: lodash-es HIGH CVE resolved via override to >=4.18.0 — semver-compatible with mermaid's ^4.17.23
- [Phase 08-maintenance-and-bug-fixes]: 08-03: MDX-unsafe bold+backtick and angle-bracket patterns in GFM table cells cause remarkGfm+compileMDX failure; fix by rewriting descriptions to prose
- [Phase 08-maintenance-and-bug-fixes]: 08-03: root cause diagnosis: compileMDX+remarkGfm binary search is the correct local reproduction method for build-time MDX compilation errors

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 01-catalog-automation | 01 | 5min | 1 | 2 |
| 01-catalog-automation | 02 | 1min | 2 | 2 |
| Phase 01-catalog-automation P03 | 5min | 2 tasks | 1 files |
| Phase 03-frontend-ux-improvements P01 | 8min | 2 tasks | 2 files |
| Phase 03-frontend-ux-improvements P02 | 2min | 1 tasks | 1 files |
| Phase 04-documentation-accuracy P02 | 2min | 2 tasks | 1 files |
| Phase 04-documentation-accuracy P01 | 2min | 2 tasks | 2 files |
| Phase 04-documentation-accuracy P03 | 6min | 2 tasks | 7 files |
| Phase 04-documentation-accuracy P04 | 10min | 2 tasks | 2 files |
| Phase 04-documentation-accuracy P05 | 7min | 2 tasks | 3 files |
| Phase 04-documentation-accuracy P06 | 3min | 1 tasks | 1 files |
| Phase 02-end-to-end-build-verification P01 | 10min | 2 tasks | 4 files |
| Phase 02-end-to-end-build-verification P02 | 5min | 2 tasks | 2 files |
| Phase 05-catalog-expansion P04 | 3min | 1 tasks | 3 files |
| Phase 05-catalog-expansion P05 | 2min | 1 tasks | 1 files |
| Phase 05-catalog-expansion P01 | 5min | 2 tasks | 11 files |
| Phase 05-catalog-expansion P03 | 2min | 2 tasks | 8 files |
| Phase 05-catalog-expansion P02 | 2min | 2 tasks | 6 files |
| Phase 05-catalog-expansion P06 | 10min | 2 tasks | 2 files |
| Phase 06-yaml-cookbook-syntax-highlighting P01 | 25min | 4 tasks | 4 files |
| Phase 07-catalog-polish P03 | < 1 min | 1 tasks | 2 files |
| Phase 07-catalog-polish P01 | 2min | 1 tasks | 2 files |
| Phase 07-catalog-polish P02 | 3min | 2 tasks | 1 files |
| Phase 08-maintenance-and-bug-fixes P01 | 5min | 2 tasks | 2 files |
| Phase 08-maintenance-and-bug-fixes P02 | 5min | 2 tasks | 2 files |
| Phase 08-maintenance-and-bug-fixes P03 | 37min | 2 tasks | 2 files |

## Key Context

- **Catalog repo location**: `/home/diaz/mygit/argus-mcp-catalog/`
- **DOCS_DISPATCH_TOKEN**: Configured — fine-grained PAT (actions:write on argus-mcp-docs) stored as secret in argus-mcp-catalog
- **CATALOG_READ_TOKEN**: Already configured in argus-mcp-docs repo secrets for CI; needed locally for build verification
- **GitHub billing**: Spending limit blocking Actions workflow execution — must resolve before Phase 2 end-to-end testing
- **Research**: Available in `.planning/research/` — STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md
- **generate-index.js**: Committed to argus-mcp-catalog@f829868 — wired to CI in plan 01-02
- **generate-index.yml + notify-docs.yml**: Committed to argus-mcp-catalog@7193112 — automation loop fully wired; workflow_dispatch added at 70794e3
- **pull_request_template.md**: Committed to argus-mcp-catalog@4a7fe37 and pushed to origin/main — all Phase 1 files live on remote
- **Workflow test**: Run 23698777042 confirmed chain logic correct — Notify Docs Rebuild skipped (correctly) when Generate Catalog Index failed
- **v1.1 Phase 6**: Changes to `argus-mcp-docs` only — install prismjs, modify `app/docs/yaml-cookbook/[category]/page.tsx`
- **v1.1 Phase 7**: Changes to `argus-mcp-catalog` only — Dockerfile example, CONTRIBUTING.md fixes (count + remote-sse description), package.json

- **[Phase 06-yaml-cookbook-syntax-highlighting]**: Import prism-tomorrow.css at page.tsx (route level) not globals.css — Next.js production bundle places route CSS before layout CSS, so globals.css token overrides win cascade
- **[Phase 06-yaml-cookbook-syntax-highlighting]**: @types/prismjs installed explicitly because pnpm did not auto-hoist the transitive dep from rehype-prism-plus
- **[Phase 06-yaml-cookbook-syntax-highlighting]**: Use Prism.highlight() (pure string API) not Prism.highlightAll()/highlightElement() — DOM methods crash server-side
- **[Phase 06-yaml-cookbook-syntax-highlighting]**: globals.css pre > code { display: grid } causes Prism token spans to stack vertically — override with style={{ display: 'block' }} on the code element when adding Prism to any new page context
- **[Phase 06-yaml-cookbook-syntax-highlighting]**: globals.css pre > code { padding: 14px 0 !important } requires either inline style or pre[class*='language-'] > code higher-specificity rule to restore horizontal padding for Prism blocks
- **[Phase 06-yaml-cookbook-syntax-highlighting]**: Copy button uses existing Copy component wrapped in relative div at absolute top-3 right-2.5 z-10 hidden sm:block — consistent with Pre component pattern in MDX pages

---
*Last session: 2026-04-02 — Phase 8 + Phase 9 context gathered; all decisions finalized; resume at .planning/phases/09-catalog-browser/09-CONTEXT.md*
