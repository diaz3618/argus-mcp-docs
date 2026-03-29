---
phase: 05-catalog-expansion
plan: 03
subsystem: catalog
tags: [yaml, mcp-catalog, filesystem-access, security-tools, ai-memory, fully-isolated, container, volumes, secrets]

# Dependency graph
requires:
  - phase: 05-catalog-expansion
    provides: catalog repo structure with configs/ layout and category directories

provides:
  - 8 new YAML catalog entries across 4 categories
  - Volume mount pattern for filesystem tools (desktop-commander-container.yaml, wcgw-container.yaml)
  - Secret management pattern with ${SECRET_NAME} syntax (shodan, obsidian, qdrant)
  - Fully isolated network: none entries for pure computation tools (dice-container.yaml)

affects: [05-catalog-expansion, catalog-json-update]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "container.volumes with network: none for terminal/filesystem tool isolation"
    - "${SECRET_NAME} placeholder syntax for all API key environment variables"
    - "Paired YAML pattern: {server}.yaml (subprocess) + {server}-container.yaml (containerized)"

key-files:
  created:
    - /home/diaz/mygit/argus-mcp-catalog/configs/filesystem-access/desktop-commander-container.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/filesystem-access/obsidian-container.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/filesystem-access/wcgw-container.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/filesystem-access/wcgw.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/security-tools/shodan-container.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/security-tools/shodan.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/ai-memory/qdrant-memory-container.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/fully-isolated/dice-container.yaml
  modified: []

key-decisions:
  - "desktop-commander-container.yaml uses /tmp:/tmp:rw volume mount + network: none — isolates file ops without host home dir exposure"
  - "wcgw-container.yaml uses ${HOME}/projects:/workspace:rw — workspace mount with network: none for shell agent safety"
  - "obsidian-container.yaml uses network: bridge — must reach local Obsidian REST API plugin on host"
  - "qdrant-memory-container.yaml requires QDRANT_URL + COLLECTION_NAME — both configurable for local or cloud Qdrant"
  - "shodan paired pattern: shodan.yaml (subprocess) + shodan-container.yaml (containerized) — consistent with filesystem, git pairs"
  - "dice-container.yaml network: none — pure computation, no outbound needed, fits fully-isolated category"

patterns-established:
  - "Volume mount + network: none: filesystem tools mount only what they need, deny all network"
  - "Secret syntax: always ${SECRET_NAME} in env: block, never hardcoded values"

requirements-completed: [CAT-EXP-01, CAT-EXP-03, CAT-EXP-07]

# Metrics
duration: 2min
completed: 2026-03-29
---

# Phase 5 Plan 3: Catalog Expansion — Filesystem, Security, Memory, Isolated Summary

**8 real MCP server YAML entries added across 4 categories — volume mount + network: none patterns, secrets via ${SECRET_NAME}, no demo configs**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-29T19:53:33Z
- **Completed:** 2026-03-29T19:54:54Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- 4 filesystem-access entries: desktop-commander-container (volume + network: none), obsidian-container (API key + bridge), wcgw-container (workspace volume), wcgw (subprocess)
- 2 security-tools entries: shodan-container and shodan subprocess pair — both use SHODAN_API_KEY secret
- 1 ai-memory entry: qdrant-memory-container with QDRANT_URL and COLLECTION_NAME secrets, network: bridge for Qdrant access
- 1 fully-isolated entry: dice-container with network: none for pure offline dice computation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create filesystem-access entries** - `9da5c04` (feat)
2. **Task 2: Create security-tools, ai-memory, and fully-isolated entries** - `cae133d` (feat)

## Files Created/Modified

- `configs/filesystem-access/desktop-commander-container.yaml` - Terminal/file tool with /tmp volume mount, network: none
- `configs/filesystem-access/obsidian-container.yaml` - Obsidian vault access with OBSIDIAN_API_KEY, network: bridge
- `configs/filesystem-access/wcgw-container.yaml` - Shell agent with workspace volume, network: none
- `configs/filesystem-access/wcgw.yaml` - WCGW subprocess variant (no container)
- `configs/security-tools/shodan-container.yaml` - Shodan internet search with SHODAN_API_KEY, network: bridge
- `configs/security-tools/shodan.yaml` - Shodan subprocess variant
- `configs/ai-memory/qdrant-memory-container.yaml` - Qdrant vector memory with QDRANT_URL + COLLECTION_NAME, network: bridge
- `configs/fully-isolated/dice-container.yaml` - Dice roller, network: none, no secrets

## Decisions Made

- desktop-commander-container uses `/tmp:/tmp:rw` — minimal volume scope for terminal tool
- wcgw-container uses `${HOME}/projects:/workspace:rw` — workspace-scoped access pattern
- obsidian-container requires `network: bridge` because it must reach the local Obsidian REST API plugin running on the host
- shodan follows paired file pattern (subprocess + container variant) consistent with existing filesystem and git entries
- dice-container categorized as fully-isolated (network: none, pure computation) — matches category intent

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required for catalog YAML files themselves. Users who deploy these servers will need to configure secrets (SHODAN_API_KEY, OBSIDIAN_API_KEY, QDRANT_URL, COLLECTION_NAME) via `argus-mcp secrets set`.

## Next Phase Readiness

- 8 new YAML entries ready for catalog.json update (handled by plan 05-06, Wave 2)
- catalog.json is NOT updated in this plan per plan spec — Wave 2 handles index regeneration

---
*Phase: 05-catalog-expansion*
*Completed: 2026-03-29*
