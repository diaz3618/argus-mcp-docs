# Milestones

## v1.0 Argus MCP Documentation Site (Shipped: 2026-03-30)

**Phases completed:** 5 phases, 19 plans, 32 tasks

**Key accomplishments:**

- Pure Node.js catalog index generator that scans configs/ subdirectories and writes catalog.json with live ISO timestamp and 10 categories / 37 files
- Two GitHub Actions workflows wired in argus-mcp-catalog: generate-index.yml auto-commits catalog.json on config changes, notify-docs.yml chains via workflow_run to dispatch argus-mcp-docs rebuild using a fine-grained PAT
- PR checklist template for argus-mcp-catalog contributors covering all three lint-catalog.js requirements, with all Phase 1 commits pushed to origin/main
- Full pnpm build verified exit 0 with live CATALOG_READ_TOKEN — 11 YAML Cookbook pages rendered, 7 Phase 4 config sub-pages present, search index regenerated with 48 Phase 4 entries
- All 10 YAML Cookbook category pages confirmed with real language-yaml content — zero empty-state fallbacks — BUILD-01/02/03 marked complete
- 6 Prism token CSS rules for YAML/bash/JSON/Python syntax highlighting and default-collapsed sidebar with Getting Started always open
- FE-01 and FE-02 registered in REQUIREMENTS.md with traceability to Phase 3, closing administrative gap where implementations existed but requirements were undocumented
- 1. [Rule 1 - Bug] Fixed 4 wrong plugin setting names
- Complete API reference expanded from 11 to 20 endpoints using exact Pydantic field names from schemas.py and request shapes from router.py
- 7 new MDX config reference pages covering all undocumented config sections — session-pool, http-pool, retry, sse-resilience, plugins-config, skills-config, workflows-config — with field tables sourced from Pydantic models
- Skills lifecycle management API routes added and workflows module map added — both overviews verified at reference depth against manifest.py, manager.py, dsl.py, steps.py, executor.py
- Optimizer, Registry, and TUI overviews expanded to full reference depth — meta-tool schemas, management API search endpoint, RegistryEntryConfig type field, and hidden keybindings all derived from source
- 7 new configuration sub-pages (session-pool, http-pool, retry, sse-resilience, plugins-config, skills-config, workflows-config) wired into the sidebar nav tree in settings/documents.ts
- One-liner:
- 6 YAML catalog entries added covering Go transport (mcp-k8s), Docker Hub direct pass-through (terraform), Docker socket volume (docker-mcp), subprocess (linear), containerized (notion), and source_url GitHub-only build (mcp-webresearch) patterns
- 8 real MCP server YAML entries added across 4 categories — volume mount + network: none patterns, secrets via ${SECRET_NAME}, no demo configs
- 3 new remote server YAML configs added to argus-mcp-catalog: Exa Search (streamable-HTTP), Linear (streamable-HTTP), and Exa Search (SSE) — all with Bearer token auth patterns using ${SECRET_NAME} syntax
- container-isolation/index.mdx expanded with 6 new sections covering all 11 previously undocumented ContainerConfig fields (runtime, memory, cpus, volumes, extra_args, build_system_deps, source_url, build_steps, entrypoint, build_env, source_ref, transport, go_package, dockerfile)
- catalog.json expanded from 37 to 65 entries across 10 categories; CONTRIBUTING.md gains source_url, Go transport, and custom Dockerfile advanced patterns with 13 new container field reference rows

---
