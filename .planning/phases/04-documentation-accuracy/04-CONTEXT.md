# Phase 4: Documentation Accuracy - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Ensure every page in the argus-mcp-docs site accurately reflects the actual argus-mcp codebase. Code at `/home/diaz/mygit/argus-mcp/` is the source of truth — where documentation and code conflict, documentation is updated to match code. This phase covers three categories: (1) fix demonstrably wrong content, (2) document missing API endpoints and config sections, (3) expand sparse feature sections to full reference depth. No new features, no new routes, no changes to the argus-mcp codebase itself.

</domain>

<decisions>
## Implementation Decisions

### Scope
- **D-01:** Full accuracy + completeness — fix all demonstrably wrong content AND fill all gaps (missing API endpoints, missing config sections, sparse feature sections). Not limited to error fixes only.
- **D-02:** Code is the single source of truth. When docs and code conflict, docs are corrected to match code — not the other way around.
- **D-03:** No new features, routes, or structural changes to the docs site. Only content changes inside existing `contents/docs/` pages and new MDX files within existing section directories.

### Error Fixes (Known Inaccuracies)
- **D-04:** Plugin count claim "eight built-in plugins" is wrong — code at `argus_mcp/plugins/builtins/` has 10+ plugins. Fix the count and list all built-in plugins by name with one-sentence descriptions.
- **D-05:** Three undocumented timeout fields in backend config: `startup`, `retries`, `retry_delay`. Add these to the configuration/backends documentation alongside the existing `init`, `cap_fetch`, `sse_startup` fields.
- **D-06:** All other content verified as accurate (CLI commands/flags, backend types, server config, middleware list, feature flags, quick-start example) — no changes needed to those sections.

### API Reference Gaps
- **D-07:** Document all 20 API endpoints — not just the 11 currently documented. All 9 missing endpoints get full entries with method, path, description, request parameters, and response schema derived from the code.
- **D-08:** The 9 missing endpoints to add: `GET /ready`, `GET /batch`, `POST /reauth/{name}`, `GET /registry/search`, `GET /skills`, `POST /skills/{name}/enable`, `POST /skills/{name}/disable`, `POST /tools/call`, `POST /resources/read`.
- **D-09:** All endpoints go into the existing `contents/docs/api-reference/endpoints/` section. No new top-level routes.

### Config Sections Gaps
- **D-10:** Each of the 7 undocumented config sections gets its own documentation sub-page under `contents/docs/configuration/`, matching the depth of existing config pages (field reference with types/defaults/descriptions + at least one YAML example).
- **D-11:** The 7 new config pages to create: `session-pool.mdx`, `http-pool.mdx`, `retry.mdx`, `sse-resilience.mdx`, `plugins-config.mdx`, `skills-config.mdx`, `workflows-config.mdx`.
- **D-12:** All new config pages must be wired into `settings/documents.ts` navigation under the Configuration section.

### Sparse Feature Sections
- **D-13:** Skills, Workflows, Optimizer, Registry, and TUI sections are expanded to full reference depth — complete config options with types/defaults, practical examples, and how-to usage. Same depth as the existing `configuration/backends` page.
- **D-14:** Content for each section is derived entirely from the codebase (`argus_mcp/skills/`, `argus_mcp/workflows/`, `argus_mcp/bridge/optimizer/`, `argus_mcp/registry/`, `argus_mcp/tui/`). No speculative content.
- **D-15:** Existing overview pages are updated in-place — not replaced. New sub-pages are added for detail pages (e.g., `skills/reference.mdx`, `workflows/reference.mdx`).

### Claude's Discretion
- Organization of the expanded API reference (grouped by feature area vs. alphabetical vs. current flat list) — match existing style.
- Whether to add a "configuration reference" index page linking all 7 new config section pages.
- Exact wording and examples for expanded sections — derived from code, reasonable prose.
- MDX component choices (Note, Warning, etc.) for callouts within new pages.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Source of Truth — Codebase
- `/home/diaz/mygit/argus-mcp/argus_mcp/cli/__init__.py` — All CLI commands and flags (verified accurate, read as baseline)
- `/home/diaz/mygit/argus-mcp/argus_mcp/config/` — Config schema definitions; key files: `schema.py`, `schema_backends.py`, `flags.py`
- `/home/diaz/mygit/argus-mcp/argus_mcp/api/` — API endpoint implementations; read all route files to derive request/response schemas
- `/home/diaz/mygit/argus-mcp/argus_mcp/plugins/builtins/` — All built-in plugins (10+ files); derive accurate plugin list and descriptions
- `/home/diaz/mygit/argus-mcp/argus_mcp/skills/` — Skills implementation; derive config schema and capabilities
- `/home/diaz/mygit/argus-mcp/argus_mcp/workflows/` — Workflows implementation; derive config schema and DAG structure
- `/home/diaz/mygit/argus-mcp/argus_mcp/bridge/optimizer/` — Optimizer implementation; derive config options and meta-tool behavior
- `/home/diaz/mygit/argus-mcp/argus_mcp/registry/` — Registry implementation; derive API contract and caching behavior
- `/home/diaz/mygit/argus-mcp/argus_mcp/tui/` — TUI implementation; derive usage patterns and configuration

### Docs Site — Files to Modify
- `contents/docs/plugins/` — Fix plugin count, add complete built-in plugin list
- `contents/docs/configuration/backends/index.mdx` — Add 3 missing timeout fields (startup, retries, retry_delay)
- `contents/docs/api-reference/endpoints/` — Add 9 missing endpoint entries
- `contents/docs/skills/` — Expand to full reference depth
- `contents/docs/workflows/` — Expand to full reference depth
- `contents/docs/optimizer/` — Expand to full reference depth
- `contents/docs/registry/` — Expand to full reference depth
- `contents/docs/tui/` — Expand to full reference depth

### Docs Site — Navigation
- `settings/documents.ts` — Must be updated to wire new config sub-pages into the sidebar navigation tree

### Existing Config Pages (Pattern Reference)
- `contents/docs/configuration/backends/index.mdx` — Canonical example of config documentation depth to match for new pages
- `contents/docs/configuration/authentication/index.mdx` — Auth config pattern

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Existing MDX components (`Note`, `Warning`, `Tabs`, `TabsContent`) — available for use in new/updated pages; follow patterns in existing config docs
- `settings/documents.ts` navigation tree — extension point for adding new config sub-pages; follow existing pattern

### Established Patterns
- Config documentation pattern: field name, type, default value, description, then YAML example block — follow this exactly for all new config pages
- API endpoint documentation pattern: HTTP method badge, endpoint path, description, parameters table, response schema — follow existing endpoints format
- MDX frontmatter format: `title` and `description` fields — required for all new pages

### Integration Points
- New config pages must be added to the Configuration section in `settings/documents.ts`
- New API endpoint entries go into existing endpoints file(s) in `contents/docs/api-reference/endpoints/`
- Expanded feature section pages can be added as sub-pages (new `.mdx` files in the section directory) or as in-place updates to existing `index.mdx` files

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. The user confirmed "full accuracy + completeness" covers everything raised. No new features were suggested.

</deferred>

---

*Phase: 04-documentation-accuracy*
*Context gathered: 2026-03-29*
