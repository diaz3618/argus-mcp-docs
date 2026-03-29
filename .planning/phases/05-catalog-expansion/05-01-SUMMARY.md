---
phase: 05-catalog-expansion
plan: 01
subsystem: argus-mcp-catalog
tags: [catalog, yaml, databases, web-research, containers, volumes, system_deps, secrets]
dependency_graph:
  requires: []
  provides: [sqlite-container, sqlite, mysql-container, mysql, redis-container, redis, mongodb-container, neon-container, playwright-container, exa-container, exa]
  affects: [catalog.json update in 05-06]
tech_stack:
  added: []
  patterns: [container.volumes, container.system_deps, env secrets with ${SECRET_NAME}]
key_files:
  created:
    - /home/diaz/mygit/argus-mcp-catalog/configs/databases/sqlite-container.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/databases/sqlite.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/databases/mysql-container.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/databases/mysql.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/databases/redis-container.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/databases/redis.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/databases/mongodb-container.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/databases/neon-container.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/web-research/playwright-container.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/web-research/exa-container.yaml
    - /home/diaz/mygit/argus-mcp-catalog/configs/web-research/exa.yaml
  modified: []
decisions:
  - "sqlite-container uses uvx + network: none + volumes mount for fully isolated local DB access"
  - "mysql/redis/mongodb/neon container entries use npx + bridge network + ${SECRET_NAME} env pattern matching postgres-container reference"
  - "playwright-container uses system_deps list for chromium, chromedriver, dbus, xvfb — OS packages required for headless browser"
  - "catalog.json not updated here — deferred to plan 05-06 to avoid merge conflicts with parallel Wave 1 plans"
metrics:
  duration: 5min
  completed: "2026-03-29T19:54:54Z"
  tasks: 2
  files: 11
---

# Phase 05 Plan 01: Database and Web-Research Catalog Entries Summary

**One-liner:** 11 new YAML catalog entries across databases and web-research demonstrating volumes mount (sqlite), bridge network env secrets (mysql/redis/mongodb/neon), and system_deps for browser automation (playwright).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create database container entries | db90244 | 8 files in configs/databases/ |
| 2 | Create web-research container entries | c8f1fe6 | 3 files in configs/web-research/ |

## What Was Built

### Database entries (8 files)

- **sqlite-container.yaml** — uvx mcp-server-sqlite with `network: none` and `volumes: ["${HOME}/.mcp-data/sqlite:/data:rw"]`. Demonstrates container.volumes pattern for data persistence without network access.
- **sqlite.yaml** — subprocess variant; user specifies `--db-path` directly.
- **mysql-container.yaml** — npx @f4ww4z/mcp-mysql-server with bridge network, `MYSQL_CONNECTION_STRING` env secret.
- **mysql.yaml** — subprocess variant with same env secret.
- **redis-container.yaml** — npx @modelcontextprotocol/server-redis with bridge network, `REDIS_URL` as arg using `${REDIS_URL}` syntax.
- **redis.yaml** — subprocess variant.
- **mongodb-container.yaml** — npx mongodb-mcp-server with bridge network, `MDB_MCP_CONNECTION_STRING` env var injected as `${MONGODB_CONNECTION_STRING}`.
- **neon-container.yaml** — npx @neondatabase/mcp-server-neon with bridge network, `NEON_API_KEY` passed as CLI arg.

### Web-research entries (3 files)

- **playwright-container.yaml** — npx @playwright/mcp with bridge network and `system_deps: [chromium, chromium-chromedriver, dbus, dbus-x11, xvfb]`. First catalog entry demonstrating OS-level package installation.
- **exa-container.yaml** — npx exa-mcp-server with bridge network, `EXA_API_KEY` env secret.
- **exa.yaml** — subprocess variant.

## Patterns Demonstrated

All three high-priority unrepresented patterns are now present in the catalog:

1. **container.volumes** — `sqlite-container.yaml` shows `${HOME}/.mcp-data/sqlite:/data:rw` mount with `network: none`
2. **${SECRET_NAME} env secrets** — `mysql-container.yaml`, `redis-container.yaml`, `mongodb-container.yaml`, `neon-container.yaml` all use this pattern
3. **container.system_deps** — `playwright-container.yaml` lists 5 OS packages for headless browser automation

## Deviations from Plan

None — plan executed exactly as written. All YAML files created with exact content specified.

## Self-Check

All 11 files exist and are non-empty. Commits db90244 and c8f1fe6 verified. YAML parse verification confirmed all files parse without error. Slug keys match filename stems exactly.
---

## Self-Check: PASSED
