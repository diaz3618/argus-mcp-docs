---
phase: 01-catalog-automation
plan: 02
subsystem: infra
tags: [github-actions, ci, workflow-dispatch, git-auto-commit, catalog-automation]

# Dependency graph
requires:
  - phase: 01-catalog-automation/01-01
    provides: scripts/generate-index.js committed to argus-mcp-catalog, ready for CI wiring
provides:
  - generate-index.yml: fires on configs/**/*.yaml push, runs generate-index.js, commits catalog.json back via GITHUB_TOKEN with [skip ci] and concurrency serialization
  - notify-docs.yml: chains off generate-index success via workflow_run, dispatches deploy.yml on argus-mcp-docs using DOCS_DISPATCH_TOKEN
  - DOCS_DISPATCH_TOKEN PAT setup instructions co-located as comment block at top of notify-docs.yml
affects:
  - phase 02 end-to-end build verification (automation loop now active once DOCS_DISPATCH_TOKEN secret is set)

# Tech tracking
tech-stack:
  added:
    - stefanzweifel/git-auto-commit-action@v7 (CI commit-back for catalog.json)
    - gh CLI workflow_dispatch (cross-repo dispatch to argus-mcp-docs)
  patterns:
    - Auto-commit generated file via GITHUB_TOKEN + git-auto-commit-action (loop-safe by design)
    - Cross-repo workflow chain via workflow_run + gh workflow run (PAT-scoped to target repo)
    - Concurrency group with cancel-in-progress: false to serialize concurrent merges

key-files:
  created:
    - /home/diaz/mygit/argus-mcp-catalog/.github/workflows/generate-index.yml
    - /home/diaz/mygit/argus-mcp-catalog/.github/workflows/notify-docs.yml
  modified: []

key-decisions:
  - "GITHUB_TOKEN used for catalog.json commit-back — guaranteed not to retrigger workflows, breaking the infinite loop"
  - "cancel-in-progress: false on concurrency group — queues second run so it sees both merges' configs, not just the latest"
  - "permissions: contents: write at job level, not workflow level — scoped to the generation job only"
  - "DOCS_DISPATCH_TOKEN PAT setup instructions in notify-docs.yml as comment block — co-located with the workflow that requires it (D-01)"
  - "No concurrency group on notify-docs.yml — deploy.yml already has concurrency: group: pages, cancel-in-progress: false"

patterns-established:
  - "Auto-commit pattern: job-level permissions + git-auto-commit-action@v7 + [skip ci] in commit_message"
  - "Cross-repo dispatch pattern: workflow_run trigger + conclusion == 'success' guard + gh workflow run with GH_TOKEN env"

requirements-completed: [CATALOG-02, CATALOG-03, CATALOG-04, CATALOG-05]

# Metrics
duration: 1min
completed: 2026-03-29
---

# Phase 1 Plan 02: Catalog CI Workflows Summary

**Two GitHub Actions workflows wired in argus-mcp-catalog: generate-index.yml auto-commits catalog.json on config changes, notify-docs.yml chains via workflow_run to dispatch argus-mcp-docs rebuild using a fine-grained PAT**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-29T01:22:26Z
- **Completed:** 2026-03-29T01:23:29Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- `generate-index.yml` triggers on `configs/**/*.yaml` pushes to main, runs `generate-index.js`, commits `catalog.json` back via GITHUB_TOKEN (loop-safe) with `[skip ci]`, serialized by `catalog-index-generation` concurrency group with `cancel-in-progress: false`
- `notify-docs.yml` chains off `generate-index.yml` success via `workflow_run`, dispatches `deploy.yml` on `diaz3618/argus-mcp-docs` using `DOCS_DISPATCH_TOKEN` with a non-zero exit guard
- DOCS_DISPATCH_TOKEN PAT setup instructions embedded as comment block at the top of `notify-docs.yml` — co-located for discoverability

## Task Commits

Each task was committed atomically (both files in one atomic commit per D-03):

1. **Task 1+2: generate-index.yml and notify-docs.yml** - `7193112` (feat)

**Plan metadata:** (pending final docs commit)

## Files Created/Modified

- `/home/diaz/mygit/argus-mcp-catalog/.github/workflows/generate-index.yml` — CI workflow: configs/** path filter, git-auto-commit-action@v7, [skip ci], concurrency group, job-level contents:write
- `/home/diaz/mygit/argus-mcp-catalog/.github/workflows/notify-docs.yml` — Cross-repo dispatch workflow: workflow_run trigger on "Generate Catalog Index", success guard, DOCS_DISPATCH_TOKEN dispatch, PAT setup comment block at top

## Decisions Made

- Both workflow files committed in a single atomic commit (per D-03: one atomic commit per plan for the workflows plan)
- GITHUB_TOKEN used implicitly by git-auto-commit-action — no explicit `token:` key added (per RESEARCH.md anti-pattern: PAT commit-back re-triggers downstream workflows unnecessarily)
- `cancel-in-progress: false` chosen over `true` — ensures concurrent merges are queued, not dropped (per Pitfall 2 in RESEARCH.md)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**DOCS_DISPATCH_TOKEN must be manually created.** This secret cannot be automated. Instructions are embedded at the top of `notify-docs.yml` and repeated here:

1. Go to: GitHub.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token
2. Token name: `argus-mcp-docs-dispatch`
3. Resource owner: `diaz3618`
4. Repository access: Only select repositories → `argus-mcp-docs`
5. Permissions: Repository permissions → Actions: Read and Write (Metadata: Read auto-selected)
6. Generate token and copy the value
7. Store as: `argus-mcp-catalog` → Settings → Secrets and variables → Actions → New repository secret → Name: `DOCS_DISPATCH_TOKEN`

Until this secret is set, `notify-docs.yml` will fail at the dispatch step but `generate-index.yml` will function correctly.

## Next Phase Readiness

- `generate-index.yml` is fully functional once both workflow files are merged to main
- `notify-docs.yml` requires `DOCS_DISPATCH_TOKEN` secret to be set (user action)
- Full automation loop (config merge → catalog.json regen → docs rebuild) is ready pending the secret
- Phase 01 plan 03 (PR template) is independent of this secret and can proceed immediately
- Phase 02 (end-to-end build verification) depends on the full loop being active

## Self-Check: PASSED

- FOUND: `/home/diaz/mygit/argus-mcp-catalog/.github/workflows/generate-index.yml`
- FOUND: `/home/diaz/mygit/argus-mcp-catalog/.github/workflows/notify-docs.yml`
- FOUND: `.planning/phases/01-catalog-automation/01-02-SUMMARY.md`
- FOUND: commit `7193112` (feat(workflows): add generate-index and notify-docs workflows for catalog automation)

---
*Phase: 01-catalog-automation*
*Completed: 2026-03-29*
