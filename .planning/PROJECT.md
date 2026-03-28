# Argus MCP Documentation Site

## What This Is

A static Next.js documentation site for Argus MCP — a programmable MCP gateway — deployed to GitHub Pages at `diaz3618.github.io/argus-mcp-docs`. Built on the rubix-documents template with MDX content, a B1 catalog integration that fetches YAML configs from `diaz3618/argus-mcp-catalog` at build time, and a YAML Cookbook section that renders live catalog entries per category.

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
- ✓ Catalog repo populated with 37 YAML configs across 10 categories — existing

### Active

- [ ] `generate-index.yml` in `argus-mcp-catalog` — auto-regenerates `catalog.json` when YAML files change
- [ ] `notify-docs.yml` in `argus-mcp-catalog` — dispatches `workflow_dispatch` to `argus-mcp-docs` after catalog index regenerates
- [ ] `DOCS_DISPATCH_TOKEN` secret set in `argus-mcp-catalog` — fine-grained PAT for `argus-mcp-docs` actions write
- [ ] End-to-end build verification — `pnpm build` succeeds locally with `CATALOG_READ_TOKEN` set, confirming all catalog pages generate correctly
- [ ] PR template in `argus-mcp-catalog` (`.github/pull_request_template.md`) — contributor workflow

### Out of Scope

- Modifying the main branch to match the catalog repo — catalog adapts to main, not vice versa
- docuowl branch work — separate evaluation effort, tracked in `argus-mcp-docs-docuowl/.planning/`
- New documentation content — existing content is complete; no new docs sections
- Replacing or modifying rubix-documents core files — extension points only per modification policy

## Context

**Stack:** Next.js 16 App Router, TypeScript, React 19, Tailwind CSS 4, Radix UI, MDX via next-mdx-remote, static export to `out/`, deployed via GitHub Actions artifact to GitHub Pages.

**Catalog B1 architecture:** At build time, `lib/catalog.ts` fetches `catalog.json` (category index) from the catalog repo via `@octokit/rest`, then fetches each individual YAML file per category page. `generateStaticParams()` in the cookbook route drives which pages are pre-rendered. The `CATALOG_READ_TOKEN` secret authenticates the GitHub API calls.

**Catalog automation gap:** The catalog repo currently has only `lint-catalog.yml`. It has no CI to auto-regenerate `catalog.json` when YAML files are added (manual process), and no dispatch to trigger a docs rebuild. The docs site falls back to a daily cron rebuild as a safety net.

**Catalog data contract:** `catalog.json` format is `{ categories: Record<string, string[]>, updated_at: string }`. The YAML files live at `configs/{category}/{filename}.yaml`. This is fully compatible with `lib/catalog.ts` — no changes needed to main.

**rubix-documents modification policy:** Core files (`lib/markdown.ts`, `lib/pageroutes.ts`, `components/`, `providers/`, `styles/`) must not be modified. Extension points: `settings/`, `contents/docs/`, `next.config.mjs`, `.github/workflows/`, `package.json`, `lib/catalog.ts` (new file), `app/docs/yaml-cookbook/` (new route).

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
| Daily cron safety net in deploy.yml | Covers catalog changes until notify workflow is built | — Pending (replace with dispatch) |
| Catalog adapts to main, not vice versa | Main is production; docuowl is evaluation | ✓ Good |

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
*Last updated: 2026-03-28 after initialization*
