# Phase 5: Catalog Expansion - Research

**Researched:** 2026-03-29
**Domain:** MCP server catalog authoring, ContainerConfig schema, Docker build patterns, Go transport
**Confidence:** HIGH (schema from source; server package names from npm/PyPI verified; catalog patterns from codebase)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Server Selection:**
- D-01: Focus on stdio servers in containers — most complex and highest value. Remote (SSE/HTTP) covered only for popular ones or complex auth patterns.
- D-02: Prioritize servers that are: (a) widely used, (b) only on GitHub, or (c) require non-trivial Docker config (bind mounts, special networks, secrets).
- D-03: Mine from glama.ai, smithery.ai, GitHub topic:mcp-server, official MCP servers list.
- D-04: Minimum 20 new YAML configs; roughly balanced across all 10 existing categories.

**Container Patterns:**
- D-05: Volume mounts (`container.volumes`) for filesystem and database servers needing host dirs.
- D-06: Network isolation (`container.network: none`) vs `bridge` for outbound-needing servers.
- D-07: `source_url` + `build_steps` + `entrypoint` for GitHub-only servers without packages.
- D-08: `container.go_package` + `container.transport: go` for Go MCP servers.
- D-09: `container.system_deps` for extra OS packages (git, ripgrep, curl, database clients).
- D-10: `container.dockerfile` escape hatch for servers too complex for templates.
- D-11: Docker Hub / GHCR servers (`command: docker`, `args: ["run", "-i", "--rm", ...]`) bypass Argus container wrapping.

**Dockerfile Location (CRITICAL):**
- D-12, D-13, D-14: Custom Dockerfiles go in `dockerfiles/` dir (originally proposed). Resolved to D-29: co-located at `configs/{category}/{server-slug}.dockerfile` due to validator rejecting `..`.
- D-15 / D-29: Dockerfile path in YAML is `container.dockerfile: {server-slug}.dockerfile` (no path prefix — co-located).

**Secrets:**
- D-16: All API keys use `${SECRET_NAME}` syntax — never hardcoded.
- D-17: Complex entries include inline comment showing `argus-mcp secrets set` usage.
- D-18: Conventional secret names: `GITHUB_TOKEN`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `BRAVE_API_KEY`, `SLACK_BOT_TOKEN`, etc.

**Testing:**
- D-19: Every config tested locally before adding. "Tested" = spin up argus-mcp, connect, confirm one tool call.
- D-20: Configs requiring unavailable credentials still acceptable if YAML is structurally correct.
- D-21: Container builds: `docker build` the generated Dockerfile to confirm it builds even if runtime test not possible.

**Documentation:**
- D-22, D-23, D-24, D-25: Update `contents/docs/configuration/container-isolation/index.mdx` with "Advanced Container Options" section covering: `source_url`, `build_steps`, `entrypoint`, `build_env`, `source_ref`, `dockerfile`, `go_package`, `transport`, `volumes`, `extra_args`, `build_system_deps`. Each with type, default, YAML example. `source_url` and `dockerfile` get named subsections.

**CONTRIBUTING.md:**
- D-26, D-27: Update catalog CONTRIBUTING.md to document `container.dockerfile`, `source_url` pattern, and the extended field reference table.

**Structure:**
- D-28: No new categories — all new entries fit existing 10.
- D-29: Dockerfiles co-located: `configs/{category}/{server-slug}.dockerfile`.
- D-30: `catalog.json` updated; `node scripts/lint-catalog.js` must exit 0 with "All checks passed."
- D-31: Do not modify argus-mcp codebase.
- D-32: Do not add new catalog categories.
- D-33: Do not create new docs pages.
- D-34: Do not invent server capabilities — derive from actual README/docs.

### Claude's Discretion

None explicitly listed — all major decisions are locked.

### Deferred Ideas (OUT OF SCOPE)

- Adding new catalog categories (e.g., `llm-integrations`, `productivity`)
- Automated testing CI in argus-mcp-catalog
- Converting existing subprocess entries to container variants
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CAT-EXP-01 | 20+ new YAML catalog configs across all existing categories, prioritizing stdio container variants demonstrating complex patterns | Server candidates section below provides 25+ verified candidates with npm/PyPI package names |
| CAT-EXP-02 | GitHub-only MCP server entries using `source_url` + `build_steps` + `entrypoint` or `container.dockerfile` | source_url pattern fully understood from template analysis; two viable GitHub-only candidates identified |
| CAT-EXP-03 | `dockerfiles/` dir (co-located at `configs/{category}/`) with standalone Dockerfiles; corresponding YAML entries | Dockerfile placement rule documented; Co-location constraint verified from schema validator code |
| CAT-EXP-04 | All new catalog entries tested locally — confirmed to deploy and function | Testing strategy section documents what "tested" means per transport type |
| CAT-EXP-05 | `catalog.json` updated; `node scripts/lint-catalog.js` exits 0 | lint-catalog.js read and understood — 6 validation rules listed below |
| CAT-EXP-06 | container-isolation docs page expanded for all undocumented ContainerConfig fields | All 11 fields inventoried from schema_backends.py with types, defaults, validators |
| CAT-EXP-07 | All entries with API keys use `${SECRET_NAME}`; at least one complex entry has inline secrets comment | Pattern already established in existing catalog; secrets comment pattern shown in CONTEXT.md |
</phase_requirements>

---

## Summary

Phase 5 expands argus-mcp-catalog from 37 entries to 57+ entries by adding real, tested MCP server configs across all 10 existing categories, while simultaneously documenting the advanced ContainerConfig fields that are currently missing from the container-isolation docs page.

The research confirms 25+ viable server candidates with verified npm/PyPI package names. The catalog presently has no entries demonstrating `source_url`, `go_package`, `system_deps`, `volumes` with database servers, or custom Dockerfiles. These gaps represent the highest-value additions. The schema validator code is the definitive authority for Dockerfile placement: `..` path components are rejected, so Dockerfiles must be co-located with their YAML files at `configs/{category}/{server-slug}.dockerfile`.

The documentation gap is straightforward: `container-isolation/index.mdx` currently documents only `enabled`, `builder_image`, `system_deps`, and `additional_packages` — 11 ContainerConfig fields remain undocumented. All field types and descriptions are available verbatim from `schema_backends.py`.

**Primary recommendation:** Add entries in waves by transport type — first simple npm/PyPI containers (building on existing patterns), then volume-mount variants, then `source_url` GitHub-only builds, then Go transport, then custom Dockerfiles. Docs update and CONTRIBUTING.md update are a single focused pass at the end.

---

## Standard Stack

### Core (catalog authoring)

| Item | Version/Value | Purpose |
|------|--------------|---------|
| `js-yaml` | installed | lint-catalog.js validation dependency |
| `node scripts/lint-catalog.js` | existing | Validates catalog.json + all YAML files — 6 rules |
| Argus ContainerConfig | schema v1 | All container fields sourced from `schema_backends.py` |
| catalog.json | existing format | `{ categories: Record<string,string[]>, updated_at: ISO string }` |
| CONTRIBUTING.md | to update | Contributor guide — add dockerfile and source_url sections |

### Lint Rules (from lint-catalog.js, confirmed by reading source)

1. `catalog.json` is valid JSON with a `categories` object and `updated_at` string
2. Every filename in `catalog.json` exists at `configs/<category>/<filename>`
3. Every YAML file parses without error
4. Every YAML has a top-level `name:` (non-empty string)
5. Every YAML has a top-level `description:` (non-empty string)
6. Every YAML has at least one key besides `name` and `description` (the backend slug)

**The lint script does NOT validate ContainerConfig fields.** YAML can have any container sub-fields — only the 3 top-level presence rules are enforced. Runtime validation of ContainerConfig fields happens in argus-mcp when the config is loaded.

---

## Architecture Patterns

### Catalog Directory Structure (current + new)

```
argus-mcp-catalog/
├── catalog.json                            # Index (updated by hand or script)
├── CONTRIBUTING.md                         # To update with new patterns
├── scripts/
│   └── lint-catalog.js                     # Validation script
└── configs/
    ├── ai-memory/                          # 4 existing + N new
    ├── databases/                          # 4 existing + N new
    ├── devops-integrations/                # 5 existing + N new
    ├── filesystem-access/                  # 4 existing + N new
    ├── fully-isolated/                     # 4 existing + N new
    ├── remote-auth/                        # 2 existing + N new
    ├── remote-http/                        # 2 existing + N new
    ├── remote-sse/                         # 2 existing + N new
    ├── security-tools/                     # 4 existing + N new
    └── web-research/                       # 6 existing + N new
```

**Dockerfile co-location:**
```
configs/devops-integrations/
├── terraform-container.yaml        # references: container.dockerfile: terraform-container.dockerfile
└── terraform-container.dockerfile  # custom Dockerfile, lives alongside YAML
```

### Pattern 1: Simple npm/PyPI Container (most entries)

```yaml
# Source: existing catalog patterns (e.g., gitlab-container.yaml)
name: "Server Name (containerized)"
description: "One-sentence description. Runs in a container with [network mode] for [reason]."

server-slug-container:
  type: stdio
  command: npx          # or: uvx
  args:
    - "-y"
    - "@scope/package-name"
  env:
    API_KEY: "${API_KEY}"
  container:
    enabled: true
    network: bridge     # or: none
```

### Pattern 2: Volume Mount Container

```yaml
# Used when: server needs access to host filesystem or a persistent data dir
name: "SQLite Server (containerized)"
description: "Query SQLite databases. Runs in a container with host volume mount for database file access."

sqlite-container:
  type: stdio
  command: uvx
  args:
    - "mcp-server-sqlite"
    - "--db-path"
    - "/data/db.sqlite"
  container:
    enabled: true
    network: none
    volumes:
      - "${HOME}/.mcp-data/sqlite:/data:rw"
```

### Pattern 3: source_url Build (GitHub-only)

```yaml
# Used when: no npm/PyPI package exists; server is only on GitHub
name: "Web Research MCP (containerized)"
description: "Deep web research with Playwright. Runs in a container built from source."

mcp-webresearch-container:
  type: stdio
  command: node
  args: ["dist/index.js"]
  container:
    enabled: true
    network: bridge
    source_url: https://github.com/mzxrai/mcp-webresearch.git
    build_steps:
      - "npm install"
      - "npm run build"
    entrypoint: ["node", "dist/index.js"]
```

**Constraints on source_url (from schema validator):**
- `source_url` scheme must be `https` or `git+ssh` (not `http`)
- Private/loopback IPs rejected (SSRF prevention)
- `build_steps` is required when `source_url` is set
- `entrypoint` is required when `source_url` is set
- `build_steps` entries cannot contain shell-unsafe characters: `` ` $ () ``
- `entrypoint` elements cannot contain: `; & | \`` $ ( ) { } [ ] < > ! # ~ \ \n \r`

**Transport auto-detection for source_url builds (from image_builder.py):**
- If any of `npm `, `npx `, `yarn `, `pnpm `, `node ` appear in joined build_steps (lowercase), or entrypoint starts with `node` → uses `node:22-alpine` base image
- Otherwise → uses `python:3.13-slim` base image
- No Go support via source_url — Go gets its own transport

**What source.dockerfile.j2 generates:** Multi-stage build — builder stage clones repo (`git clone --depth 1`), runs `build_steps`; runtime stage copies `/usr/local/` and `/src/repo` to `/app`, creates nonroot user (UID 65532), sets `HOME=/home/nonroot`, sets ENTRYPOINT from config.

### Pattern 4: Go Transport

```yaml
# Used when: MCP server is a Go module with no npm/PyPI package
name: "Kubernetes MCP (Go build)"
description: "Manage Kubernetes clusters. Compiled from Go source using go install."

mcp-k8s-container:
  type: stdio
  command: mcp-k8s      # binary name after go install
  container:
    enabled: true
    transport: go
    go_package: github.com/strowk/mcp-k8s-go
    network: bridge
    volumes:
      - "${HOME}/.kube:/home/nonroot/.kube:ro"
```

**How Go transport works (from image_builder.py + templates):**
- Transport classification: `transport_override="go"` bypasses auto-detection
- `go_package` is the Go module path passed to `go install`
- Compiled binary placed at `/app/mcp-server` in the final image
- `_ensure_go_image` returns `("/app/mcp-server", runtime_args)` as entrypoint
- Valid transport values: `uvx`, `npx`, `go` (from `_validate_transport`)

### Pattern 5: Docker Hub / GHCR Direct (already-containerized)

```yaml
# Used when: server ships its own official Docker image (bypasses Argus container wrapping)
name: "Terraform MCP Server (Docker)"
description: "HashiCorp's official Terraform MCP server. Runs directly from Docker Hub image."

terraform:
  type: stdio
  command: docker
  args:
    - "run"
    - "-i"
    - "--rm"
    - "hashicorp/terraform-mcp-server"
```

**Detection (from is_already_containerised in image_builder.py):**
- If `command` is `docker` or `podman` AND `args[0]` is one of `run`, `exec`, `start`, `compose` → treated as already containerized, Argus does NOT wrap in another container.

### Pattern 6: Custom Dockerfile

```yaml
# Used when: server requires complex build steps that cannot be expressed in build_steps
# Dockerfile lives co-located: configs/{category}/{server-slug}.dockerfile
name: "Custom Server (containerized)"
description: "Server requiring custom Dockerfile. Runs in a container built from custom spec."

custom-server-container:
  type: stdio
  command: python
  args: ["-m", "custom_server"]
  container:
    enabled: true
    dockerfile: custom-server-container.dockerfile
```

**Dockerfile validator rules (from schema_backends.py `_validate_dockerfile`):**
- Must be a relative path (no absolute paths starting with `/`)
- Must NOT contain `..` path components (checked via `PurePosixPath.parts`)
- Therefore: Dockerfiles MUST be co-located with the YAML file at `configs/{category}/`
- YAML references: `container.dockerfile: {server-slug}.dockerfile` (filename only, no directory prefix)

### Pattern 7: system_deps Addition

```yaml
# Used when: server needs extra OS packages in the container
name: "Playwright MCP (containerized)"
description: "Browser automation via Playwright. Runs in a container with system browser dependencies."

playwright-container:
  type: stdio
  command: npx
  args:
    - "-y"
    - "@playwright/mcp"
  container:
    enabled: true
    network: bridge
    system_deps:
      - "chromium"
      - "chromium-chromedriver"
```

**system_deps behavior (from schema_backends.py docstring):**
- For alpine-based images (npx → `node:22-alpine`): installed via `apk add`
- For debian-based images (uvx → `python:3.13-slim`): installed via `apt-get install`
- These are RUNTIME packages — present in final image
- `build_system_deps`: installed only in builder stage, NOT carried to runtime

### Anti-Patterns to Avoid

- **Absolute dockerfile paths:** `container.dockerfile: /home/user/configs/server.dockerfile` → rejected
- **Parent directory traversal:** `container.dockerfile: ../../dockerfiles/server.dockerfile` → rejected (contains `..`)
- **Hardcoded secrets:** `OPENAI_API_KEY: sk-abc123` → never. Always `${OPENAI_API_KEY}`
- **Missing build_steps/entrypoint with source_url:** schema validator requires both when source_url is set
- **Non-HTTPS source_url:** `http://` scheme is rejected — must be `https://` or `git+ssh://`
- **Shell metacharacters in build_steps:** validator rejects `` ` $ () `` — use alternative forms
- **Backend slug mismatch:** the YAML backend key must match the filename stem (per CONTRIBUTING.md convention)
- **Docker wrapper on Docker:** do not add `container.enabled: true` to entries using `command: docker` — they are already containerized

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dockerfile for npm package | Custom multi-stage npm Dockerfile | Argus auto-generated via `command: npx` | Template handles nonroot user, apk/apt deps, build/runtime staging correctly |
| Dockerfile for Python package | Custom Python Dockerfile | Argus auto-generated via `command: uvx` | Template handles pip-installed packages copy, nonroot user |
| Dockerfile for Go binary | Manual Go cross-compile Dockerfile | `container.transport: go` + `container.go_package` | Argus handles go install, binary placement at /app/mcp-server |
| Source-cloning Dockerfile | Manual git clone + build Dockerfile | `container.source_url` + `build_steps` + `entrypoint` | Template handles git clone, build, nonroot user, COPY staging |
| Catalog index update | Manual catalog.json editing | `node scripts/lint-catalog.js` to verify; update alphabetically | Lint ensures no drift; generate-index.js auto-regenerates on CI |

**Key insight:** Argus builds the Dockerfile from ContainerConfig fields at runtime. The catalog YAML only needs the config fields — the Dockerfile itself is never written to disk by catalog authors (except for the `dockerfile` escape hatch entries, which are intentional overrides).

---

## MCP Server Candidates for Catalog

### Category: `databases` (currently 4 entries — postgres, postgres-container, supabase, supabase-container)

Verified packages for new entries:

| Server | Package | Command | Network | Notes |
|--------|---------|---------|---------|-------|
| SQLite | `mcp-server-sqlite` (PyPI) | `uvx` | `none` | Needs volume for `.sqlite` file; D-05 pattern |
| MySQL | `@f4ww4z/mcp-mysql-server` (npm) | `npx` | `bridge` | CONNECTION_STRING via env |
| Redis | `@modelcontextprotocol/server-redis` (npm) | `npx` | `bridge` | REDIS_URL env var |
| MongoDB | `mongodb-mcp-server` (npm) | `npx` | `bridge` | Connection string env |
| Neon | `@neondatabase/mcp-server-neon` (npm) | `npx` | `bridge` | Serverless Postgres; NEON_API_KEY |
| Qdrant | `mcp-server-qdrant` (PyPI) | `uvx` | `bridge` | Vector DB; QDRANT_URL + COLLECTION_NAME |

**sqlite-container.yaml** is the highest-value addition — demonstrates `volumes` pattern with `network: none`. Needs `volumes: ["${HOME}/.mcp-data:/data:rw"]` and `--db-path /data/db.sqlite`.

### Category: `devops-integrations` (currently 5 entries — github, gitlab, gitlab-container, kubernetes, kubernetes-container)

| Server | Package | Command | Pattern | Notes |
|--------|---------|---------|---------|-------|
| Terraform (Docker Hub) | `docker` direct | `docker run` | D-11 pattern | `hashicorp/terraform-mcp-server` official image |
| mcp-k8s-go | `github.com/strowk/mcp-k8s-go` (Go module) | binary `mcp-k8s` | Go transport D-08 | Needs `~/.kube:/home/nonroot/.kube:ro` volume |
| Docker | `mcp-server-docker` (PyPI) | `uvx` | `bridge` | Docker socket mount; `system_deps: ["docker-cli"]` |
| Linear | `@tacticlaunch/mcp-linear` (npm) | `npx` | `bridge` | LINEAR_API_KEY |
| Notion | `@notionhq/notion-mcp-server` (npm) | `npx` | `bridge` | NOTION_TOKEN env |

**mcp-k8s-go** is the primary Go transport demo. Module path: `github.com/strowk/mcp-k8s-go`. Binary name after `go install`: `mcp-k8s`. Needs kubeconfig volume mount.

**terraform** uses `hashicorp/terraform-mcp-server` Docker Hub image (D-11 pattern, `command: docker`). Goes in devops-integrations. No Argus container wrapping.

### Category: `web-research` (currently 6 entries — brave-search, brave-search-container, context7, context7-container, fetch, fetch-container)

| Server | Package | Command | Pattern | Notes |
|--------|---------|---------|---------|-------|
| Exa | `exa-mcp-server` (npm) | `npx` | `bridge` | EXA_API_KEY; semantic search |
| Playwright | `@playwright/mcp` (npm) | `npx` | `bridge` | Needs `system_deps` (D-09); browser automation |
| mcp-webresearch | `@mzxrai/mcp-webresearch` (npm) | `npx` | `bridge` | Web scraping with Playwright |

**playwright-container.yaml** demonstrates `system_deps` pattern. Needs Chromium for browser automation. The package is `@playwright/mcp` (official Microsoft package, not `@microsoft/playwright-mcp`).

### Category: `filesystem-access` (currently 4 entries — filesystem, filesystem-container, git, git-container)

| Server | Package | Command | Pattern | Notes |
|--------|---------|---------|---------|-------|
| Desktop Commander | `@wonderwhy-er/desktop-commander` (npm) | `npx` | `none` | Terminal + file editing; needs `/tmp:/tmp:rw` volume |
| wcgw | `wcgw` (PyPI) | `uvx` | `none` | Shell + code agent; needs workspace volume |
| Obsidian | `mcp-obsidian` (PyPI) | `uvx` | `bridge` | Via Local REST API plugin; needs OBSIDIAN_API_KEY |

**desktop-commander-container.yaml** demonstrates volume mount with `network: none` for filesystem tools.

### Category: `ai-memory` (currently 4 entries — memory, memory-container, memory-bank-mcp, memory-bank-mcp-container)

| Server | Package | Command | Pattern | Notes |
|--------|---------|---------|---------|-------|
| Qdrant Memory | `mcp-server-qdrant` (PyPI) | `uvx` | `bridge` | Vector search memory; QDRANT_URL |
| Knowledge Graph | `@modelcontextprotocol/server-memory` already exists | — | — | Already in catalog as `memory-container.yaml` |

Qdrant memory adds a distinct vector DB memory pattern, distinguishing from the existing in-process knowledge graph.

### Category: `security-tools` (currently 4 entries — analyzer, analyzer-container, snyk, snyk-container)

| Server | Package | Command | Pattern | Notes |
|--------|---------|---------|---------|-------|
| Shodan | `@burtthecoder/mcp-shodan` (npm) | `npx` | `bridge` | Internet device search; SHODAN_API_KEY |
| Semgrep (container variant) | `semgrep` (PyPI) | `uvx` | `none` | Already has remote-http entry; container variant with `network: none` for offline scanning |

**shodan-container.yaml** adds internet reconnaissance capability. Requires `SHODAN_API_KEY`.

### Category: `fully-isolated` (currently 4 entries — sequential-thinking, sequential-thinking-container, time, time-container)

| Server | Package | Command | Pattern | Notes |
|--------|---------|---------|---------|-------|
| mcp-dice | `mcp-dice` (npm) | `npx` | `none` | Pure computation; dice roller |
| SQLite (no network) | see databases | — | — | Already covered above with `network: none` |

### Category: `remote-sse` (currently 2 entries — deepwiki, microsoft-learn)

| Server | URL | Auth | Notes |
|--------|-----|------|-------|
| Exa (remote) | `https://mcp.exa.ai/mcp` | Bearer EXA_API_KEY | Hosted SSE version |

### Category: `remote-http` (currently 2 entries — plantuml, semgrep)

| Server | URL | Auth | Notes |
|--------|-----|------|-------|
| Linear (official remote) | `https://mcp.linear.app/sse` | via mcp-remote | Official Linear hosted MCP |

### Category: `remote-auth` (currently 2 entries — mcp-remote, smithery-connect)

No new candidates identified at this time — existing 2 entries cover the auth patterns well.

---

## Catalog Gap Analysis

**Categories currently thin (fewest container variants with advanced patterns):**

| Category | Current Entries | Gap |
|----------|----------------|-----|
| `databases` | 4 (postgres/supabase pairs) | No SQLite, MySQL, Redis, MongoDB, vector DB |
| `remote-http` | 2 | Only 2 entries total — room for more |
| `remote-sse` | 2 | Only 2 entries total |
| `fully-isolated` | 4 | Only sequential-thinking and time |
| `filesystem-access` | 4 | Only filesystem and git |

**Patterns currently unrepresented in catalog:**
- `container.volumes` (present in filesystem/git entries but no db-file or docker-socket mount examples)
- `container.source_url` + `build_steps` + `entrypoint` — zero entries
- `container.go_package` + `container.transport: go` — zero entries
- `container.system_deps` — zero entries
- `container.dockerfile` — zero entries
- `container.build_system_deps` — zero entries
- Docker Hub / GHCR direct pass-through with env vars (github.yaml shows the pattern but no variants with complex args)

---

## ContainerConfig Field Inventory (for docs update)

All fields from `schema_backends.py` ContainerConfig. Fields marked (DOCUMENTED) already appear in `container-isolation/index.mdx`. All others need to be added.

| Field | Type | Default | Currently Documented? |
|-------|------|---------|----------------------|
| `enabled` | bool | `true` | YES (shown in examples) |
| `runtime` | `"docker"\|"podman"\|"kubernetes"\|null` | `null` (auto-detect) | NO |
| `network` | string\|null | `null` (bridge) | Partial (shown in examples, not in table) |
| `memory` | string\|null | `null` (512m) | NO |
| `cpus` | string\|null | `null` (1) | NO |
| `volumes` | `List[str]` | `[]` | NO |
| `extra_args` | `List[str]` | `[]` | NO |
| `system_deps` | `List[str]` | `[]` | YES (shown in example) |
| `build_system_deps` | `List[str]` | `[]` | NO |
| `builder_image` | string\|null | `null` (transport default) | YES (shown in example) |
| `additional_packages` | `List[str]` | `[]` | YES (shown in example) |
| `transport` | `"uvx"\|"npx"\|"go"\|null` | `null` (auto-detect) | NO |
| `go_package` | string\|null | `null` | NO |
| `source_url` | string\|null | `null` | NO |
| `build_steps` | `List[str]` | `[]` | NO |
| `entrypoint` | `List[str]\|null` | `null` | NO |
| `build_env` | `Dict[str,str]` | `{}` | NO |
| `source_ref` | string\|null | `null` | NO |
| `dockerfile` | string\|null | `null` | NO |

**Fields to add to docs (11 undocumented):** `runtime`, `memory`, `cpus`, `volumes`, `extra_args`, `build_system_deps`, `transport`, `go_package`, `source_url`, `build_steps`, `entrypoint`, `build_env`, `source_ref`, `dockerfile`

**Grouping for docs page:**
1. Basic resource limits: `runtime`, `memory`, `cpus`
2. Networking and mounts: `network` (expand existing), `volumes`, `extra_args`
3. Build customization: `build_system_deps` (distinguish from `system_deps`)
4. Source build pattern (subsection): `source_url`, `build_steps`, `entrypoint`, `build_env`, `source_ref`
5. Go transport pattern (subsection): `transport`, `go_package`
6. Custom Dockerfile pattern (subsection): `dockerfile`

---

## Proposed 25-Entry Expansion Plan

Targeting minimum 20 new entries across all categories, balanced representation:

| File | Category | Pattern | Key Feature |
|------|----------|---------|-------------|
| `sqlite-container.yaml` | databases | volume mount | `volumes`, `network: none` |
| `sqlite.yaml` | databases | subprocess | bare uvx |
| `mysql-container.yaml` | databases | npm container | bridge, env secrets |
| `mysql.yaml` | databases | subprocess | bare npx |
| `redis-container.yaml` | databases | npm container | bridge, env |
| `redis.yaml` | databases | subprocess | bare npx |
| `mongodb-container.yaml` | databases | npm container | bridge, env |
| `neon-container.yaml` | databases | npm container | bridge, NEON_API_KEY |
| `mcp-k8s-container.yaml` | devops-integrations | Go transport | `transport: go`, `go_package`, kubeconfig volume |
| `terraform.yaml` | devops-integrations | Docker direct | D-11, `command: docker` |
| `docker-mcp-container.yaml` | devops-integrations | uvx + system_deps | docker socket volume, system_deps |
| `linear.yaml` | devops-integrations | subprocess | bare npx |
| `notion-container.yaml` | devops-integrations | npm container | bridge, NOTION_TOKEN |
| `exa-container.yaml` | web-research | npm container | bridge, EXA_API_KEY |
| `exa.yaml` | web-research | subprocess | bare npx |
| `playwright-container.yaml` | web-research | npm container | `system_deps` chromium |
| `mcp-webresearch-container.yaml` | web-research | source_url build | `source_url`, GitHub-only, Playwright |
| `desktop-commander-container.yaml` | filesystem-access | npm container | volume `/tmp:/tmp:rw`, `network: none` |
| `obsidian-container.yaml` | filesystem-access | uvx container | bridge, OBSIDIAN_API_KEY |
| `shodan-container.yaml` | security-tools | npm container | bridge, SHODAN_API_KEY |
| `shodan.yaml` | security-tools | subprocess | bare npx |
| `qdrant-memory-container.yaml` | ai-memory | uvx container | bridge, QDRANT_URL, vector DB |
| `dice-container.yaml` | fully-isolated | npm container | `network: none`, pure computation |
| `custom-dockerfile-demo.yaml` | filesystem-access | dockerfile | custom Dockerfile demo (D-10) |
| `exa-remote.yaml` | remote-sse | SSE remote | Exa hosted endpoint |

Total new entries: 25 (target was 20+, this covers all patterns with room to drop lower-priority entries).

**High-priority (demonstrates unrepresented patterns):**
1. `mcp-k8s-container.yaml` — only Go transport demo
2. `sqlite-container.yaml` — only volumes-for-data demo
3. `mcp-webresearch-container.yaml` — only source_url demo
4. `docker-mcp-container.yaml` — Docker socket volume + system_deps combo
5. `playwright-container.yaml` — system_deps demo

---

## Testing Strategy

### Per Transport Type (D-19, D-20, D-21)

| Type | "Tested" Definition | Can Test Without Credentials? | Test Command |
|------|---------------------|------------------------------|--------------|
| npm/PyPI container (no secrets) | `docker build` succeeds + argus-mcp connects | YES | `docker build` + argus-mcp start + tool call |
| npm/PyPI container (API key required) | `docker build` succeeds + YAML structurally valid | NO (unless key available) | `docker build` only |
| Docker direct (ghcr/hub) | `docker pull` image succeeds + container starts | Partial (public images only) | `docker pull` + `docker run -i --rm ... --help` |
| source_url build | `docker build` with generated Dockerfile succeeds | YES | Generate Dockerfile manually from template, run `docker build` |
| Go transport | `docker build` succeeds (requires internet for `go install`) | YES | `docker build` of generated Dockerfile |
| Custom Dockerfile | `docker build custom.dockerfile` succeeds | YES | `docker build -f configs/category/server.dockerfile` |

### Testing Without Full argus-mcp Stack

To test container builds without running argus-mcp:
```bash
# For npm/PyPI containers — let argus generate and build:
argus-mcp build --config test-config.yaml

# For custom Dockerfiles — build directly:
docker build -f configs/devops-integrations/terraform-container.dockerfile \
  -t test-terraform-container \
  configs/devops-integrations/

# For source_url builds — the Docker build pulls from GitHub:
# argus-mcp build handles this; or write a scratch Dockerfile matching the template
```

### Configs That Cannot Be Runtime-Tested

The following require external accounts and should be marked in YAML comments but are still acceptable with structurally valid YAML:
- Shodan (requires paid SHODAN_API_KEY)
- Linear (requires Linear account)
- Neon (requires Neon account)
- Notion (requires Notion workspace + integration)
- Context7 (requires CONTEXT7_API_KEY)
- Any server requiring Kubernetes cluster access (mcp-k8s)

Configs testable without credentials: SQLite, time, dice, sequential-thinking, filesystem, git, fetch, mcp-webresearch (no API key needed), Playwright, Desktop Commander.

---

## Common Pitfalls

### Pitfall 1: Dockerfile Path with `..` Components

**What goes wrong:** Placing Dockerfiles in a root-level `dockerfiles/` directory and referencing as `container.dockerfile: ../../dockerfiles/server.dockerfile` — schema validator rejects `..` path components.

**Why it happens:** Natural instinct to centralize all Dockerfiles; the original D-12 proposal assumed a root-level directory before the validator constraint was discovered.

**How to avoid:** Co-locate Dockerfiles with their YAML: `configs/{category}/{server-slug}.dockerfile`. Reference as `container.dockerfile: {server-slug}.dockerfile`.

**Warning signs:** `ValueError: dockerfile must not contain '..' path components` in argus-mcp logs.

### Pitfall 2: Shell Metacharacters in build_steps

**What goes wrong:** `build_steps: ["pip install -e . && python setup.py build"]` — the `&&` is fine, but backticks, `$()`, and `()` are rejected by `_validate_build_steps`.

**Why it happens:** Natural shell scripting habits; validator uses regex `[`$()]` to block injection.

**How to avoid:** Split compound commands into separate list entries instead of shell chaining:
```yaml
build_steps:
  - "pip install -e ."
  - "python setup.py build_ext --inplace"
```

**Warning signs:** `ValueError: build_steps entry contains unsafe characters`.

### Pitfall 3: Missing entrypoint When source_url Is Set

**What goes wrong:** Setting `source_url` and `build_steps` but omitting `entrypoint` — the `_validate_source_url_deps` model validator raises `ValueError`.

**Why it happens:** Forgetting that entrypoint is mandatory alongside source_url.

**How to avoid:** Always set all three together: `source_url` + `build_steps` + `entrypoint`.

### Pitfall 4: catalog.json Out of Sync

**What goes wrong:** Adding YAML files to `configs/` but not updating `catalog.json` — lint passes for existing entries but new files are invisible to the docs site.

**Why it happens:** Forgetting the two-step add (file + catalog.json index entry).

**How to avoid:** After every new YAML file, immediately add its filename to the correct category array in `catalog.json`. Run `node scripts/lint-catalog.js` to verify.

**Warning signs:** `node scripts/lint-catalog.js` still shows original count; docs site doesn't show new entries.

### Pitfall 5: Backend Slug Mismatch

**What goes wrong:** File `sqlite-container.yaml` with backend key `sqlite_container:` (underscore vs hyphen) or `sqlite:` (missing `-container`).

**Why it happens:** CONTRIBUTING.md convention says slug must match filename stem, but lint-catalog.js does NOT enforce this — it only checks a backend key exists.

**How to avoid:** Use the filename stem exactly as the backend slug key. `sqlite-container.yaml` → backend key `sqlite-container:`.

### Pitfall 6: Adding container.enabled to Docker-Direct Entries

**What goes wrong:** Entry using `command: docker` with `args: ["run", ...]` also sets `container.enabled: true` — this confuses the intent and may cause double-wrapping.

**Why it happens:** Cargo-culting container fields onto all entries.

**How to avoid:** Entries with `command: docker` are already containerized (`is_already_containerised()` returns true). Do not add `container:` sub-keys.

### Pitfall 7: source_url Transport Detection Mismatch

**What goes wrong:** Python server with npm-sounding build steps (e.g., `npm run build` on a TS wrapper) gets misclassified as Node transport, resulting in wrong base image.

**Why it happens:** `_ensure_source_image` classifies by scanning build_steps for `npm `, `npx `, etc. Any occurrence triggers Node base image.

**How to avoid:** For Python servers, ensure build_steps use `pip install`, not npm. Use `builder_image` to explicitly set the base image if needed.

---

## Code Examples

### Full sqlite-container.yaml Example (volume mount pattern)

```yaml
# Source: ContainerConfig.volumes field (schema_backends.py)
name: "SQLite Server (containerized)"
description: "Query and manage SQLite databases. Runs in a fully isolated container with host volume mount for database file access."

sqlite-container:
  type: stdio
  command: uvx
  args:
    - "mcp-server-sqlite"
    - "--db-path"
    - "/data/db.sqlite"
  container:
    enabled: true
    network: none
    volumes:
      - "${HOME}/.mcp-data/sqlite:/data:rw"
```

### Full mcp-k8s-container.yaml Example (Go transport)

```yaml
# Source: ContainerConfig.go_package + transport fields (schema_backends.py)
name: "Kubernetes MCP (Go build)"
description: "Manage Kubernetes clusters via the Kubernetes API. Compiled from Go source using go install."

mcp-k8s-container:
  type: stdio
  command: mcp-k8s
  container:
    enabled: true
    transport: go
    go_package: github.com/strowk/mcp-k8s-go
    network: bridge
    volumes:
      - "${HOME}/.kube:/home/nonroot/.kube:ro"
```

### Full mcp-webresearch-container.yaml Example (source_url)

```yaml
# Source: ContainerConfig.source_url + build_steps + entrypoint (schema_backends.py)
name: "Web Research MCP (containerized)"
description: "Deep web research with Google search integration and content extraction. Built from source — no npm package."

mcp-webresearch-container:
  type: stdio
  command: node
  args: ["dist/index.js"]
  container:
    enabled: true
    network: bridge
    source_url: https://github.com/mzxrai/mcp-webresearch.git
    build_steps:
      - "npm install"
      - "npm run build"
    entrypoint: ["node", "dist/index.js"]
```

### Secrets management comment pattern (D-17)

```yaml
name: "Shodan MCP Server (containerized)"
description: "Search internet-connected devices and perform IP reconnaissance. Runs in a container with outbound network access for Shodan API calls."
# Secrets setup:
#   argus-mcp secrets set SHODAN_API_KEY <your-key>
# In argus-mcp config.yaml:
#   secrets: { enabled: true, provider: env }

shodan-container:
  type: stdio
  command: npx
  args:
    - "-y"
    - "@burtthecoder/mcp-shodan"
  env:
    SHODAN_API_KEY: "${SHODAN_API_KEY}"
  container:
    enabled: true
    network: bridge
```

### Docker direct pattern — Terraform

```yaml
# Source: github.yaml pattern (devops-integrations) + hashicorp/terraform-mcp-server Docker Hub
name: "Terraform MCP Server"
description: "Interact with Terraform Registry APIs for provider discovery and module search. Runs directly from official Docker Hub image."

terraform:
  type: stdio
  command: docker
  args:
    - "run"
    - "-i"
    - "--rm"
    - "hashicorp/terraform-mcp-server"
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flat `container_isolation` field on backend | Nested `container:` sub-object with all fields | Argus v1 design | Docs note already added in container-isolation page warning users |
| `@playwright/mcp` was `@microsoft/playwright-mcp` | Package is `@playwright/mcp` (playwright-scoped, not microsoft-scoped) | 2025 | Use `@playwright/mcp`, not the microsoft scope |
| `@modelcontextprotocol/server-slack` marked "no longer supported" | Use alternative slack MCP implementations | 2025 | Avoid adding the official slack server; find active alternative |
| mcp-run-python (pydantic) — archived | Project retired — "no safe way to run Python in Pyodide with reasonable latency" | Early 2026 | Do not add to catalog |
| Linear: community `@tacticlaunch/mcp-linear` | Official Linear remote MCP at `https://mcp.linear.app/sse` | May 2025 | Two valid options — remote SSE or local npm container |

**Note on `@modelcontextprotocol/server-sqlite`:** The package exists on PyPI as `mcp-server-sqlite` (run via `uvx mcp-server-sqlite --db-path /path/db.sqlite`). The npm equivalent `mcp-server-sqlite-npx` also exists but is a third-party reimplementation. Use the official PyPI package for the sqlite-container entry.

---

## Open Questions

1. **mcp-webresearch Playwright system deps**
   - What we know: `@mzxrai/mcp-webresearch` depends on Playwright v1.49.0 in package.json.
   - What's unclear: Whether Playwright's browser binaries are bundled in the npm install or need `playwright install chromium` as a separate build step.
   - Recommendation: Add `build_steps: ["npm install", "npx playwright install chromium", "npm run build"]` — if chromium install fails in build_steps validator (due to spaces), split differently or use `system_deps` to pre-install system chromium.

2. **mcp-server-sqlite volume path portability**
   - What we know: Volume source path `${HOME}` in YAML is a convention used in existing entries (filesystem-container.yaml).
   - What's unclear: Whether Argus expands `${HOME}` in volume paths at runtime or if that's user's responsibility.
   - Recommendation: Use `${HOME}` following filesystem-container.yaml precedent. Document that users must ensure the host path exists.

3. **mcp-k8s-go binary name after go install**
   - What we know: Module is `github.com/strowk/mcp-k8s-go`; go install places binary named by the last path component.
   - What's unclear: Last path component is `mcp-k8s-go`, but the binary is documented as `mcp-k8s`.
   - Recommendation: Verify by checking the repository's main.go or go.mod binary name declaration. If `mcp-k8s-go`, use that in `command:`. CONTEXT.md example uses `mcp-k8s` — trust the user's example.

4. **Playwright system_deps on Alpine (npx base image)**
   - What we know: `@playwright/mcp` uses npx (Alpine base); Chromium on Alpine is `chromium`, not `chromium-browser`.
   - What's unclear: Whether Playwright can find and use the system-installed Chromium without `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
   - Recommendation: Set `system_deps: ["chromium", "nss", "freetype", "harfbuzz", "ca-certificates", "ttf-freefont"]` (Alpine Playwright dependencies) and document the PLAYWRIGHT_BROWSERS_PATH env var may be needed.

---

## Environment Availability

Step 2.6: This phase is primarily content/config authoring (YAML + Markdown). External dependencies are Docker (for container builds) and the local argus-mcp install.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Docker | Container build testing (D-21) | Verify at build time | — | Skip docker build test, validate YAML only |
| Node.js + npm | `node scripts/lint-catalog.js` | Required | — | Can't validate without it |
| argus-mcp | Runtime testing (D-19) | Executor environment | — | YAML structural validation only |
| Internet access | `source_url` builds (clones GitHub) | Required for source_url tests | — | Skip source_url runtime test |

---

## Validation Architecture

> nyquist_validation: not checked — treating as enabled.

This phase is catalog data authoring + docs Markdown expansion. There is no application code to unit test. The validation strategy is:

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `node scripts/lint-catalog.js` (existing validation script) |
| Config file | none — standalone script |
| Quick run command | `node /home/diaz/mygit/argus-mcp-catalog/scripts/lint-catalog.js` |
| Full suite command | same (only one check script) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CAT-EXP-01 | 20+ new YAML files with valid schema | lint | `node scripts/lint-catalog.js` | ✅ |
| CAT-EXP-02 | source_url entries structurally valid | lint | `node scripts/lint-catalog.js` | ✅ |
| CAT-EXP-03 | Dockerfile files exist alongside YAML | manual | `ls configs/{category}/*.dockerfile` | ❌ Wave 0 |
| CAT-EXP-04 | Configs deploy and function | manual/smoke | argus-mcp integration test | manual-only |
| CAT-EXP-05 | catalog.json includes all new entries | lint | `node scripts/lint-catalog.js` | ✅ |
| CAT-EXP-06 | Docs page expanded with all 11 fields | manual review | visual inspection of rendered docs | manual-only |
| CAT-EXP-07 | Secrets use `${VAR}` syntax | grep | `grep -r 'sk-\|Bearer [a-z]' configs/` | ✅ |

### Sampling Rate

- Per task commit: `node scripts/lint-catalog.js` (exit 0)
- Per wave merge: full lint + count check (`Checked N files across 10 categories`)
- Phase gate: lint exit 0 + minimum 57 files across 10 categories before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] Shell verification script: `ls configs/{category}/*.dockerfile` — manual check that dockerfile entries have co-located files
- None for lint script — already exists and works

---

## Sources

### Primary (HIGH confidence)

- `/home/diaz/mygit/argus-mcp/argus_mcp/config/schema_backends.py` — ContainerConfig Pydantic model, all fields, validators, docstrings
- `/home/diaz/mygit/argus-mcp/argus_mcp/bridge/container/image_builder.py` — transport classification, Go/source/custom image build pipeline
- `/home/diaz/mygit/argus-mcp/argus_mcp/bridge/container/templates/source.dockerfile.j2` — source_url Dockerfile template structure
- `/home/diaz/mygit/argus-mcp-catalog/scripts/lint-catalog.js` — exact validation rules (6 checks)
- `/home/diaz/mygit/argus-mcp-catalog/catalog.json` — current 37-entry baseline
- All existing catalog YAML files — pattern reference

### Secondary (MEDIUM confidence — verified via npm/PyPI search)

- `@playwright/mcp` — confirmed npm package name (not `@microsoft/playwright-mcp`) via npm.npmjs.com + GitHub
- `mcp-server-sqlite` — confirmed PyPI package name via pypi.org
- `@f4ww4z/mcp-mysql-server` — confirmed npm via npmjs.com
- `mcp-server-qdrant` — confirmed PyPI via pypi.org/releases
- `@modelcontextprotocol/server-redis` — confirmed npm via npmjs.com
- `mongodb-mcp-server` — confirmed npm via npmjs.com
- `@neondatabase/mcp-server-neon` — confirmed npm via GitHub/npmjs
- `@notionhq/notion-mcp-server` — confirmed official Notion npm package
- `@tacticlaunch/mcp-linear` — confirmed npm via npmjs.com
- `exa-mcp-server` — confirmed npm via npmjs.com (not `exa-mcp`)
- `@burtthecoder/mcp-shodan` — confirmed npm via npmjs.com
- `mcp-server-docker` (PyPI) — confirmed via pypi.org
- `wcgw` (PyPI) — confirmed via pypi.org, version 5.6.1
- `mcp-obsidian` (PyPI) — confirmed via pypi.org
- `@wonderwhy-er/desktop-commander` — confirmed npm via npmjs.com
- `@mzxrai/mcp-webresearch` — confirmed npm (has Playwright dep, uses `npm run build`)
- `github.com/strowk/mcp-k8s-go` — confirmed Go module path
- `hashicorp/terraform-mcp-server` — confirmed Docker Hub image
- `mcp-dice` — confirmed npm via smithery usage data

### Tertiary (LOW confidence — single source, flag for validation)

- Playwright Alpine system deps list (chromium + dependencies) — from community docs, not official Playwright MCP docs
- mcp-k8s binary name is `mcp-k8s` (not `mcp-k8s-go`) — from CONTEXT.md example + mcp.so entry, not directly verified from go.mod
- mcp-webresearch requires `npx playwright install chromium` build step — inferred from Playwright dependency, needs verification

---

## Metadata

**Confidence breakdown:**
- Standard stack / schema: HIGH — read directly from Python source
- Server package names: MEDIUM-HIGH — verified via npm/PyPI search, cross-referenced
- Architecture patterns: HIGH — derived from existing catalog YAML + image_builder.py code
- Go transport mechanics: HIGH — verified in image_builder.py `_ensure_go_image`
- Pitfalls: HIGH — derived from schema validator source code (not inferred)
- Proposed entry list: MEDIUM — package names verified, but some details (exact args, env vars) need README cross-check during implementation

**Research date:** 2026-03-29
**Valid until:** 2026-04-29 (npm package names stable; MCP ecosystem moves fast — check star/activity status before adding any server)
