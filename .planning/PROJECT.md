# Argus MCP Documentation Site

## What This Is

A static Next.js documentation site for Argus MCP — a programmable MCP gateway — deployed to GitHub Pages at `diaz3618.github.io/argus-mcp-docs`. Built on the rubix-documents template with MDX content, a B1 catalog integration that fetches YAML configs from `diaz3618/argus-mcp-catalog` at build time, and a YAML Cookbook section that renders 65 live catalog entries across 10 categories. The full CI loop is now wired: YAML config merges to `argus-mcp-catalog` auto-regenerate `catalog.json` and dispatch a `argus-mcp-docs` rebuild.

## Core Value

The docs site always reflects the current state of the catalog — when a YAML config is merged to `argus-mcp-catalog`, the docs site rebuilds and reflects it automatically with no manual intervention.

## Requirements

### Validated

- ✓ Static Next.js site exported and deployed to GitHub Pages at `/argus-mcp-docs` — existing
- ✓ MDX-based documentation content in `contents/docs/` (13+ sections with real content) — existing
- ✓ Settings-driven navigation tree (`settings/documents.ts`, `settings/navigation.ts`) — existing
- ✓ B1 catalog integration via `lib/catalog.ts` + `@octokit/rest` (`diaz3618/argus-mcp-catalog`) — existing
- ✓ YAML Cookbook dynamic route (`app/docs/yaml-cookbook/[category]/page.tsx`) — existing
- ✓ GitHub Actions deploy workflow (`deploy.yml`) — push to main + daily cron + `workflow_dispatch` — existing
- ✓ `CATALOG_READ_TOKEN` wired into build env — existing
- ✓ Catalog repo populated with 65 YAML configs across 10 categories — v1.0
- ✓ `generate-index.yml` in `argus-mcp-catalog` — Validated in Phase 1: Catalog Automation
- ✓ `notify-docs.yml` in `argus-mcp-catalog` — Validated in Phase 1: Catalog Automation
- ✓ `DOCS_DISPATCH_TOKEN` secret instructions documented in workflow — Validated in Phase 1: Catalog Automation
- ✓ PR template in `argus-mcp-catalog` — Validated in Phase 1: Catalog Automation
- ✓ End-to-end build verified — `pnpm build` exits 0 with real token; 11 YAML Cookbook pages with live catalog data — Validated in Phase 2
- ✓ Prism token CSS for complete syntax highlighting (YAML, Python, bash, JSON) — Validated in Phase 3
- ✓ Default-collapsed sidebar with "Getting Started" always open — Validated in Phase 3
- ✓ API reference expanded to 20 endpoints matching Pydantic schemas — Validated in Phase 4
- ✓ 7 new config reference pages (session-pool, http-pool, retry, sse-resilience, plugins-config, skills-config, workflows-config) — Validated in Phase 4
- ✓ Skills, Workflows, Optimizer, Registry, TUI overviews at full reference depth — Validated in Phase 4
- ✓ 28 new YAML catalog entries across 9 categories (65 total, lint passes) — Validated in Phase 5
- ✓ All 14 ContainerConfig fields documented in container-isolation page — Validated in Phase 5
- ✓ CONTRIBUTING.md updated with advanced patterns (source_url, Go transport, custom Dockerfile) — Validated in Phase 5

### Active

_(v1.0 complete — no active requirements; use /gsd:new-milestone for v1.1)_

### Out of Scope

- Modifying the main branch to match the catalog repo — catalog adapts to main, not vice versa
- docuowl branch work — separate evaluation effort, tracked in `argus-mcp-docs-docuowl/.planning/`
- Replacing or modifying rubix-documents core files — extension points only per modification policy
- Working `container.dockerfile` catalog example — no suitable real server found; docs-only coverage accepted (CAT-EXP-03)
- Automated runtime container testing — structural validation via lint-catalog.js is the automated gate

## Context

**Stack:** Next.js 16 App Router, TypeScript, React 19, Tailwind CSS 4, Radix UI, MDX via next-mdx-remote, static export to `out/`, deployed via GitHub Actions artifact to GitHub Pages.

**Catalog B1 architecture:** At build time, `lib/catalog.ts` fetches `catalog.json` (category index) from the catalog repo via `@octokit/rest`, then fetches each individual YAML file per category page. `generateStaticParams()` in the cookbook route drives which pages are pre-rendered. The `CATALOG_READ_TOKEN` secret authenticates the GitHub API calls.

**Catalog automation (v1.0 complete):** `argus-mcp-catalog` now has `generate-index.yml` (auto-commits `catalog.json` on config changes with concurrency guard) and `notify-docs.yml` (chains to dispatch `deploy.yml` on `argus-mcp-docs` via `DOCS_DISPATCH_TOKEN`). The daily cron remains as safety net. E2E runtime test blocked by GitHub billing spending limit — wiring is correct.

**Catalog state:** 65 YAML configs across 10 categories. All entries use `${SECRET_NAME}` syntax. Advanced patterns documented: volume mounts, bridge networking, `source_url` builds, Go transport, `system_deps`, remote HTTP/SSE servers.

**Documentation state:** All API endpoints (20), config sections (7 new pages), and plugin reference match the argus-mcp codebase. All 14 ContainerConfig fields documented.

**rubix-documents modification policy:** Core files (`lib/markdown.ts`, `lib/pageroutes.ts`, `components/`, `providers/`, `styles/`) must not be modified. Extension points: `settings/`, `contents/docs/`, `next.config.mjs`, `.github/workflows/`, `package.json`, `lib/catalog.ts`, `app/docs/yaml-cookbook/`.

## Constraints

- **Catalog priority**: main branch is the primary effort; docuowl branch is secondary — never modify main to accommodate docuowl
- **Catalog read-only**: `lib/catalog.ts` consumes the catalog repo as-is; data contract must not be broken
- **rubix-documents policy**: extension points only — no modifications to core template files
- **Deploy target**: GitHub Pages at `diaz3618.github.io/argus-mcp-docs` — `basePath: '/argus-mcp-docs'` fixed

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| B1 catalog (build-time fetch) | Static site constraint — no server runtime available | ✓ Good |
| `@octokit/rest` over raw GitHub URLs | Auth support + better error handling | ✓ Good |
| New route for YAML Cookbook | Keeps rubix-documents `[[...slug]]` untouched | ✓ Good |
| Daily cron safety net in deploy.yml | Covers gaps if notify workflow is delayed | ✓ Good (retained as belt+suspenders) |
| Catalog adapts to main, not vice versa | Main is production; docuowl is evaluation | ✓ Good |
| CAT-EXP-03 docs-only for dockerfile pattern | No real server requires custom Dockerfile; demo configs violate D-35 | ✓ Good |
| lint-catalog.js as automated gate for catalog entries | Runtime container testing requires live Docker — impractical in CI | ✓ Good |
| `workflow_dispatch` trigger on generate-index.yml | Allows manual trigger once billing spending limit resolved | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-30 after v1.0 milestone — all 5 phases complete, CI loop wired, docs at reference depth, catalog expanded to 65 entries*
