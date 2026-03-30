# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Argus MCP Documentation Site

**Shipped:** 2026-03-30
**Phases:** 5 | **Plans:** 19 | **Sessions:** ~5 sessions over 5 days

### What Was Built
- Full CI loop: YAML config push → `generate-index.yml` → `catalog.json` auto-commit → `notify-docs.yml` → `argus-mcp-docs` rebuild dispatch
- End-to-end build verified with real `CATALOG_READ_TOKEN` — 11 YAML Cookbook pages, zero empty-state fallbacks
- Prism syntax highlighting for YAML/Python/bash/JSON + default-collapsed sidebar with Getting Started always open
- Complete API reference (11→20 endpoints) + 7 new config sub-pages + Skills/Workflows/Optimizer/Registry/TUI at full reference depth, all sourced from live codebase
- Catalog expanded from 37 to 65 entries (28 new) across 9 categories, covering advanced patterns: volume mounts, bridge networking, `source_url` builds, Go transport, `system_deps`, remote HTTP/SSE
- All 14 ContainerConfig fields documented; CONTRIBUTING.md updated with advanced patterns

### What Worked
- Parallel wave execution in Phase 5 (5 independent catalog plans ran simultaneously) — dramatically reduced wall-clock time
- Plans referencing concrete file paths from RESEARCH.md meant executors had zero ambiguity about what to create
- Argus MCP catalog skill (`argus-catalog-management`) enforced YAML field requirements consistently across all 28 new entries — no lint failures
- Splitting documentation accuracy (Phase 4) into 6 focused plans made it parallelizable and kept each agent context-lean
- Phase verifications catching the DOC-01/02/03 traceability gap early (before milestone audit) — prevented orphaned requirements

### What Was Inefficient
- ROADMAP.md top-level `## Phases` checklist was not auto-updated when phases 3-5 were added — required manual fix at milestone audit time
- Phase 5 progress table showed "5/6 In Progress" because the 05-06 SUMMARY landed in a worktree and the orchestrator spot-check missed the worktree boundary
- `gsd-tools find-phase` returned empty directory when run from inside a worktree — milestone audit had to work around this with absolute paths
- DOC-01/02/03 were never registered in REQUIREMENTS.md despite being cited in 6 SUMMARY files — bookkeeping debt accumulated silently

### Patterns Established
- YAML catalog entries: always use `${SECRET_NAME}` syntax; `source_url` + `build_steps` + `entrypoint` are co-required; `system_deps` for OS packages; `network: bridge` for any env-secret injection
- Documentation accuracy phases: source all field names directly from Pydantic models and router source — never infer from existing docs
- Remote server entries: always use streamable-HTTP (`transport: http`) for Smithery/hosted endpoints; Bearer token pattern with `Authorization: Bearer ${TOKEN_NAME}`

### Key Lessons
1. **Phase checklist hygiene:** When adding phases via `gsd:add-phase`, the top-level `## Phases` checklist must be updated simultaneously — the CLI doesn't do this automatically, creating a `roadmap_complete=False` drift
2. **Worktree path awareness:** When the orchestrator spawns executor agents in worktrees, all subsequent path checks must use absolute paths from the project root — relative paths silently fail
3. **Billing gates are not wiring failures:** The CATALOG-05 E2E test was blocked by GitHub Actions billing, not a code defect. Separation of "wired correctly" vs "can execute in current environment" prevents false gaps_found classification
4. **Parallel catalogs plans need strong YAML conventions:** With 5 agents writing catalog YAML simultaneously, shared lint rules + the catalog-management skill prevented divergent field usage patterns
5. **Docs-only is a valid resolution for CAT-EXP-03:** When no real server requires a custom Dockerfile, documenting the pattern without a demo entry is correct — demo configs violate the "real servers only" principle

### Cost Observations
- Model mix: ~100% Sonnet 4.6 (executor agents inherited orchestrator model)
- Sessions: ~5 sessions
- Notable: Wave 1 of Phase 5 (5 parallel agents) completed in ~4 minutes wall-clock — 5× faster than sequential execution would have been

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~5 | 5 | First milestone using parallel wave execution for catalog expansion |

### Cumulative Quality

| Milestone | Lint Checks | Coverage | Catalog Entries |
|-----------|-------------|----------|-----------------|
| v1.0 | lint-catalog.js: 65/65 pass | Manual browser testing deferred | 65 YAML configs |

### Top Lessons (Verified Across Milestones)

1. Billing gates and manual user steps (secret creation) should be classified as "pending user action" not "verification failure" — they are inherently outside automated verification scope
2. Plan frontmatter requirement IDs must be registered in REQUIREMENTS.md at plan creation time — deferred registration creates orphaned references
