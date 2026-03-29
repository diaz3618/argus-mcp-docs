# Phase 4: Documentation Accuracy — Discussion Log

**Date:** 2026-03-29
**Workflow:** discuss-phase

---

## Phase Routing

**Q:** Phase 4 doesn't exist in the roadmap. How to handle documentation accuracy?

**Options:** Add Phase 4 (Recommended) / Replace Phase 2 / Skip roadmap update

**Selected:** Add Phase 4 (Recommended)

**Notes:** Phase 2 (Build Verification) and Phase 3 (Frontend UX) stay as-is. Documentation accuracy added as Phase 4, depends on Phase 3. ROADMAP.md updated.

---

## Audit Summary (Pre-Discussion Findings)

Prior to discussing gray areas, a codebase vs. docs audit was run. Key findings:

**Accurate:** CLI commands/flags, backend types, server config, middleware list, feature flags, quick-start example

**Inaccurate:**
- Plugin count claims "eight built-in plugins" — code has 10+
- 3 backend timeout fields undocumented: `startup`, `retries`, `retry_delay`

**Missing:**
- 9 of 20 API endpoints undocumented: `/ready`, `/batch`, `/reauth/{name}`, `/registry/search`, `/skills`, `/skills/{name}/enable`, `/skills/{name}/disable`, `/tools/call`, `/resources/read`
- 7 config sections with no docs pages: `session_pool`, `http_pool`, `retry`, `sse_resilience`, `plugins`, `skills`, `workflows`

**Sparse (overview only):** Skills, Workflows, Optimizer, Registry, TUI

---

## Areas Discussed

**Q:** Which gray areas to discuss?

**Selected (all three):** Scope: errors vs. gaps, API reference gaps, Config sections gaps

---

## Scope

**Q:** What should Phase 4 cover?

**Options:** Errors + high-impact gaps (Recommended) / Errors only / Full accuracy + completeness

**Selected:** Full accuracy + completeness

---

## API Reference Gaps

**Q:** How to handle 9 undocumented API endpoints?

**Options:** Document all 20 (Recommended) / Document user-facing only / Add stubs only

**Selected:** Document all 20 endpoints

---

## Config Sections Gaps

**Q:** How to handle 7 undocumented config sections?

**Options:** New sub-pages per section (Recommended) / Single reference table / Inline additions

**Selected:** New sub-pages per section

---

## Sparse Sections

**Q:** How detailed should expanded Skills/Workflows/Optimizer/Registry/TUI docs be?

**Options:** Full reference depth (Recommended) / Intermediate depth / Overview + examples only

**Selected:** Full reference depth

---

## Decisions Captured

| ID | Decision |
|----|----------|
| D-01 | Full accuracy + completeness scope — fix errors AND fill all gaps |
| D-02 | Code is single source of truth; docs updated to match code |
| D-03 | Content changes only — no new routes or structural site changes |
| D-04 | Fix plugin count claim; list all built-in plugins by name |
| D-05 | Add 3 missing timeout fields to backends config docs |
| D-06 | All other documented content verified accurate — no changes needed |
| D-07 | Document all 20 API endpoints (9 new entries to add) |
| D-08 | 9 specific endpoints to add: /ready, /batch, /reauth, /registry/search, /skills*, /tools/call, /resources/read |
| D-09 | New API entries go into existing api-reference/endpoints/ section |
| D-10 | Each of 7 undocumented config sections gets its own sub-page under configuration/ |
| D-11 | 7 new config pages: session-pool, http-pool, retry, sse-resilience, plugins-config, skills-config, workflows-config |
| D-12 | New config pages wired into settings/documents.ts navigation |
| D-13 | Skills, Workflows, Optimizer, Registry, TUI expanded to full reference depth |
| D-14 | Expanded content derived entirely from codebase — no speculative content |
| D-15 | Existing overview pages updated in-place; new sub-pages added for detail |
