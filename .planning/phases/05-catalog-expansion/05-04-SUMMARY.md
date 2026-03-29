---
phase: 05-catalog-expansion
plan: "04"
subsystem: catalog
tags: [yaml, remote-http, remote-sse, bearer-token, exa, linear, mcp-catalog]

# Dependency graph
requires:
  - phase: 05-catalog-expansion
    provides: existing remote-http and remote-sse categories with semgrep/plantuml/deepwiki patterns
provides:
  - exa-remote.yaml — Exa Search streamable-HTTP entry with Bearer EXA_API_KEY
  - linear-remote.yaml — Linear streamable-HTTP entry with Bearer LINEAR_API_KEY
  - exa-sse.yaml — Exa Search SSE entry with Bearer EXA_API_KEY
affects: [05-catalog-expansion-plan-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "remote-http: streamable-http type with Bearer ${SECRET_NAME} in headers.Authorization"
    - "remote-sse: sse type with Bearer ${SECRET_NAME} in headers.Authorization"
    - "Comments in YAML for secret setup instructions and key acquisition URL"

key-files:
  created:
    - /home/diaz/mygit/argus-mcp-catalog/configs/remote-http/exa-remote.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/remote-http/linear-remote.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/remote-sse/exa-sse.yaml
  modified: []

key-decisions:
  - "exa-remote uses type: streamable-http matching existing catalog pattern (semgrep, plantuml, deepwiki all use streamable-http)"
  - "exa-sse uses type: sse per plan spec — explicit SSE category entry for Exa endpoint"
  - "linear-remote points to https://mcp.linear.app/sse as specified despite streamable-http type — URL is the Linear hosted MCP endpoint"
  - "All ${SECRET_NAME} inline env var syntax used — no hardcoded credentials"

patterns-established:
  - "Bearer token pattern for remote-http: headers.Authorization: Bearer ${SECRET_NAME}"
  - "Bearer token pattern for remote-sse: headers.Authorization: Bearer ${SECRET_NAME}"
  - "YAML comments document secret name, setup command, and key acquisition URL inline"

requirements-completed: [CAT-EXP-01, CAT-EXP-07]

# Metrics
duration: 3min
completed: 2026-03-29
---

# Phase 05 Plan 04: Catalog Expansion — Remote HTTP/SSE Entries Summary

**3 new remote server YAML configs added to argus-mcp-catalog: Exa Search (streamable-HTTP), Linear (streamable-HTTP), and Exa Search (SSE) — all with Bearer token auth patterns using ${SECRET_NAME} syntax**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-29T19:53:52Z
- **Completed:** 2026-03-29T19:56:30Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments
- Created `configs/remote-http/exa-remote.yaml` — Exa Search via streamable-HTTP with `Authorization: Bearer ${EXA_API_KEY}`
- Created `configs/remote-http/linear-remote.yaml` — Linear issue management via streamable-HTTP with `Authorization: Bearer ${LINEAR_API_KEY}`
- Created `configs/remote-sse/exa-sse.yaml` — Exa Search via SSE with `Authorization: Bearer ${EXA_API_KEY}`
- All files pass js-yaml parse validation with name, description, and backend slug key present

## Task Commits

Each task was committed atomically:

1. **Task 1: Create remote-http and remote-sse entries (Exa, Linear)** - `eaed343` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `configs/remote-http/exa-remote.yaml` — Exa Search streamable-HTTP with Bearer EXA_API_KEY
- `configs/remote-http/linear-remote.yaml` — Linear streamable-HTTP with Bearer LINEAR_API_KEY
- `configs/remote-sse/exa-sse.yaml` — Exa Search SSE with Bearer EXA_API_KEY

## Decisions Made
- `exa-remote` uses `type: streamable-http` matching existing catalog entries (semgrep, plantuml, deepwiki all use `streamable-http`)
- `exa-sse` uses `type: sse` as specified — provides explicit SSE category entry demonstrating SSE-with-auth pattern
- `linear-remote` URL is `https://mcp.linear.app/sse` as specified in plan — Linear's hosted MCP endpoint uses SSE protocol but served via HTTP type
- Inline YAML comments document secret name, argus-mcp setup command, and key acquisition URL per established catalog pattern

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required in the docs site. Catalog YAML files are static configs for Argus MCP users. Users needing Exa or Linear integration must obtain API keys separately (URLs documented in the YAML comments).

## Next Phase Readiness
- 3 remote entries ready; remote-http now has 4 entries, remote-sse has 4 entries
- catalog.json is NOT updated in this plan — handled by plan 05-06 (Wave 2) per plan spec
- Files will be picked up by plan 05-06 catalog.json regeneration

---
*Phase: 05-catalog-expansion*
*Completed: 2026-03-29*
