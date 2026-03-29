---
phase: 05-catalog-expansion
plan: 02
subsystem: catalog
tags: [yaml, mcp, kubernetes, terraform, docker, linear, notion, web-research, go-transport, source-url]

# Dependency graph
requires:
  - phase: 05-catalog-expansion-01
    provides: "initial catalog entries (ai-tools, code-assistants categories) as structural reference"
provides:
  - "mcp-k8s-container.yaml: Go transport pattern (transport: go, go_package)"
  - "terraform.yaml: Docker Hub direct pass-through pattern (no container: key)"
  - "docker-mcp-container.yaml: Docker socket volume + system_deps pattern"
  - "linear.yaml: subprocess entry with API key secret"
  - "notion-container.yaml: containerized entry with OPENAPI_MCP_HEADERS"
  - "mcp-webresearch-container.yaml: source_url + build_steps + entrypoint for GitHub-only servers"
affects:
  - "05-catalog-expansion-06: catalog.json update (Wave 2)"
  - "05-catalog-expansion docs site rebuild"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Go transport: container.transport: go + container.go_package installs binary via go install"
    - "Docker direct pass-through: command: docker with no container: key — no Argus wrapping"
    - "source_url build: source_url + build_steps + entrypoint required together for GitHub-only servers"
    - "Docker socket volume: /var/run/docker.sock:/var/run/docker.sock:rw with system_deps: [docker-cli]"

key-files:
  created:
    - /home/diaz/mygit/argus-mcp-catalog/configs/devops-integrations/mcp-k8s-container.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/devops-integrations/terraform.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/devops-integrations/docker-mcp-container.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/devops-integrations/linear.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/devops-integrations/notion-container.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/web-research/mcp-webresearch-container.yaml
  modified: []

key-decisions:
  - "terraform.yaml uses Docker direct pass-through (command: docker, no container: key) — server is already Docker-based, Argus wrapping not applicable"
  - "mcp-webresearch-container.yaml uses source_url + build_steps because no npm package exists for mcp-webresearch — GitHub-only server"
  - "mcp-k8s-container.yaml uses Go transport (transport: go, go_package) — binary compiled from Go module path via go install into /app/mcp-server"
  - "notion-container OPENAPI_MCP_HEADERS uses NOTION_TOKEN variable in JSON string — correct pattern for @notionhq/notion-mcp-server"
  - "build_steps entries use plain npm commands with no backticks, $(), () — satisfies schema validator constraints"

patterns-established:
  - "Go transport pattern: container.transport: go + container.go_package (github.com/owner/repo)"
  - "Docker direct: command: docker, args[0]=run, no container: key — no Argus isolation needed"
  - "source_url build: source_url (https://), build_steps (no metacharacters), entrypoint (array) all required together"
  - "Docker socket: volumes [/var/run/docker.sock:...] + system_deps: [docker-cli]"

requirements-completed: [CAT-EXP-01, CAT-EXP-02, CAT-EXP-07]

# Metrics
duration: 2min
completed: 2026-03-29
---

# Phase 5 Plan 02: Catalog Expansion (6 New Entries) Summary

**6 YAML catalog entries added covering Go transport (mcp-k8s), Docker Hub direct pass-through (terraform), Docker socket volume (docker-mcp), subprocess (linear), containerized (notion), and source_url GitHub-only build (mcp-webresearch) patterns**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-29T19:53:41Z
- **Completed:** 2026-03-29T19:54:57Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Created 5 devops-integrations entries demonstrating Go transport, Docker direct, Docker socket, subprocess, and containerized patterns
- Created 1 web-research entry demonstrating source_url + build_steps + entrypoint for GitHub-only servers (no npm package)
- All entries use `${SECRET_NAME}` syntax — no hardcoded credentials
- terraform.yaml correctly omits container: key (Docker direct pass-through per D-11)
- mcp-k8s-container.yaml demonstrates the only Go transport entry in the catalog (per D-08)

## Task Commits

Each task was committed atomically in argus-mcp-catalog:

1. **Task 1: Create devops-integrations entries** - `cd48011` (feat) — mcp-k8s-container, terraform, docker-mcp-container, linear, notion-container
2. **Task 2: Create mcp-webresearch source_url entry** - `c97e129` (feat) — mcp-webresearch-container

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `configs/devops-integrations/mcp-k8s-container.yaml` - Go transport: transport: go, go_package: github.com/strowk/mcp-k8s-go, kubeconfig volume
- `configs/devops-integrations/terraform.yaml` - Docker direct: command: docker, no container: key (hashicorp/terraform-mcp-server)
- `configs/devops-integrations/docker-mcp-container.yaml` - Docker socket volume + system_deps: [docker-cli], uvx mcp-server-docker
- `configs/devops-integrations/linear.yaml` - Subprocess: npx @tacticlaunch/mcp-linear, LINEAR_API_KEY
- `configs/devops-integrations/notion-container.yaml` - Containerized: npx @notionhq/notion-mcp-server, OPENAPI_MCP_HEADERS with NOTION_TOKEN
- `configs/web-research/mcp-webresearch-container.yaml` - source_url build: git clone + npm install + npm run build, entrypoint: ["node", "dist/index.js"]

## Decisions Made

- terraform.yaml uses Docker direct pass-through (command: docker, no container: key) — hashicorp/terraform-mcp-server is already a Docker image; Argus wrapping not applicable
- mcp-webresearch-container.yaml uses source_url because mzxrai/mcp-webresearch has no npm package — must be cloned and built from GitHub
- build_steps use plain npm commands (npm install, npm run build) — no backticks, $(), () — satisfies schema validator constraints
- notion-container uses OPENAPI_MCP_HEADERS with JSON string embedding NOTION_TOKEN — matches @notionhq/notion-mcp-server auth pattern

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all files created successfully, YAML validation passed, acceptance criteria met.

## User Setup Required

None - no external service configuration required. Catalog entries require user-specific secrets (NOTION_TOKEN, LINEAR_API_KEY, kubeconfig) but those are documented per-entry via comments.

## Next Phase Readiness

- 6 new patterns demonstrated across devops-integrations/ and web-research/ categories
- catalog.json NOT updated in this plan — handled by plan 05-06 (Wave 2)
- All YAML files structurally valid; backend slugs match filename stems

---
*Phase: 05-catalog-expansion*
*Completed: 2026-03-29*
