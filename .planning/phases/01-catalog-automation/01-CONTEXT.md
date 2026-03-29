# Phase 1: Catalog Automation - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Add `scripts/generate-index.js`, `.github/workflows/generate-index.yml`, `.github/workflows/notify-docs.yml`, and `.github/pull_request_template.md` to `argus-mcp-catalog`. Zero changes to `argus-mcp-docs`. The goal: every merge to `argus-mcp-catalog` that touches `configs/**` automatically regenerates `catalog.json` and triggers an `argus-mcp-docs` rebuild — no manual steps.

</domain>

<decisions>
## Implementation Decisions

### DOCS_DISPATCH_TOKEN Documentation
- **D-01:** Document the manual PAT setup instructions as a comment block at the top of `notify-docs.yml`. No separate file or README section — keep it co-located with the workflow that requires it. The comment must include: token name, resource owner, repository access scope (argus-mcp-docs only), required permission (Actions: Read and Write), and where to store the secret (argus-mcp-catalog → Settings → Secrets → DOCS_DISPATCH_TOKEN).

### PR Template
- **D-02:** Format: checklist items with one-line inline examples. Each required field (`name:`, `description:`, backend-slug key, category directory placement) gets a checkbox and a one-line example (e.g., `name: My Tool`). No full YAML block — concise and actionable.

### Commit Strategy
- **D-03:** One atomic commit per plan — three commits total:
  1. Script commit: adds `scripts/generate-index.js`
  2. Workflows commit: adds `generate-index.yml` and `notify-docs.yml`
  3. Template + docs commit: adds `.github/pull_request_template.md`
- **D-04:** Commit messages must describe the additions plainly — no GSD-specific phrasing ("plan", "phase", "wave", etc.). Use conventional commits style if appropriate, but focus on what was added/changed.

### Claude's Discretion
- Error handling edge cases in `generate-index.js` (e.g., completely empty `configs/` directory — emit empty categories object, still write `catalog.json`)
- Exact wording and tone of the PR template prose
- Whether to push each commit individually or batch at plan end (one commit per plan, timing is executor's call)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing catalog repo patterns (match exactly)
- `/home/diaz/mygit/argus-mcp-catalog/scripts/lint-catalog.js` — Script conventions to match: `'use strict'`, `#!/usr/bin/env node`, `__dirname`-relative paths, `fs.writeFileSync`
- `/home/diaz/mygit/argus-mcp-catalog/.github/workflows/lint-catalog.yml` — Workflow conventions to match: `actions/checkout@v4`, `actions/setup-node@v4`, `node-version: "20"`
- `/home/diaz/mygit/argus-mcp-catalog/catalog.json` — Confirmed output shape: `{ categories: Record<string, string[]>, updated_at: string }`

### Docs repo deploy workflow (dispatch target)
- `/home/diaz/mygit/argus-mcp-docs/.github/workflows/deploy.yml` — Confirmed `on: workflow_dispatch:` present; `concurrency: group: pages, cancel-in-progress: false`

### Phase research (primary source of truth)
- `.planning/phases/01-catalog-automation/01-RESEARCH.md` — Exact YAML for all three workflows, script implementation, pitfalls, and anti-patterns. **Use this verbatim.**

### Supporting research
- `.planning/research/STACK.md` — generate-index.yml YAML, git-auto-commit-action@v7 configuration
- `.planning/research/FEATURES.md` — notify-docs.yml YAML, fine-grained PAT scope requirements
- `.planning/research/PITFALLS.md` — Infinite loop prevention, race condition + concurrency group, two-token separation

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lint-catalog.js`: Use as the style reference for `generate-index.js` — same shebang, `'use strict'`, path resolution pattern
- `lint-catalog.yml`: Use as the template for `generate-index.yml` job structure — already uses correct action versions

### Established Patterns
- Node.js built-ins only (no `npm install` step in scripts) — `generate-index.js` must follow this
- `actions/checkout@v4` + `actions/setup-node@v4` with `node-version: "20"` — match this in all new workflows
- `configs/{category}/{filename}.yaml` directory structure — `generate-index.js` scans this exactly

### Integration Points
- `generate-index.yml` fires on `push` to `main` filtered to `configs/**/*.yaml`
- `notify-docs.yml` chains off `generate-index.yml` via `workflow_run` — name must match exactly: `"Generate Catalog Index"`
- `deploy.yml` on `argus-mcp-docs` is the dispatch target — already has `on: workflow_dispatch:` confirmed

</code_context>

<specifics>
## Specific Ideas

- The RESEARCH.md already contains verbatim workflow YAML and script code — planner should copy these directly, not reconstruct them
- `DOCS_DISPATCH_TOKEN` comment block location: top of `notify-docs.yml`, before the `on:` key, as a YAML block comment
- PR template checklist items with one-line examples: e.g., `- [ ] name: My Tool`, `- [ ] description: What it does`, `- [ ] backend-slug key present (e.g., \`stdio:\`)`, `- [ ] file placed in correct \`configs/{category}/\` directory`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-catalog-automation*
*Context gathered: 2026-03-28*
