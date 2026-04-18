---
phase: "10-access-and-the-argus-mcp-main-repo-by-using-the-filesystem-m"
plan: "02"
subsystem: "docs-content"
tags: ["configuration", "authentication", "overview", "edits"]
dependency_graph:
  requires: []
  provides:
    - "auth_mode field documentation in authentication page"
    - "OIDC SSRF note in authentication page"
    - "security + rate_limits keys in overview Config Structure block"
  affects:
    - "contents/docs/configuration/authentication/index.mdx"
    - "contents/docs/configuration/overview/index.mdx"
tech_stack:
  added: []
  patterns: ["targeted MDX edits — insert new sections without touching existing content"]
key_files:
  created: []
  modified:
    - "contents/docs/configuration/authentication/index.mdx"
    - "contents/docs/configuration/overview/index.mdx"
decisions:
  - "Inserted Auth Mode section before Auth Types (not after) to match logical flow: mode first, then type"
  - "OIDC SSRF note placed immediately after the oidc section description paragraph"
metrics:
  duration: "~4 minutes"
  completed: "2026-04-18"
  tasks_completed: 2
  files_modified: 2
---

# Phase 10 Plan 02: Authentication Page Updates and Overview Config Structure Summary

Closed two remaining drift gaps: added missing `auth_mode` field with both values explained to authentication page, added OIDC SSRF protection note, and added `security:` + `rate_limits:` keys to Config Structure block on overview page.

## What Was Changed

### `contents/docs/configuration/authentication/index.mdx`
Two additions:
1. **Auth Mode section** — new `## Auth Mode` section inserted before `## Auth Types` heading. Documents `auth_mode: "strict"` (default, global 401 rejection) vs `"permissive"` (pass-through for selectively protected resources). Includes YAML example and behavior table.
2. **OIDC SSRF protection note** — appended after the oidc section paragraph. Documents RFC 1918 private IP blocking (10.x, 172.16-31.x, 192.168.x), loopback blocking, `follow_redirects=False` behavior.

### `contents/docs/configuration/overview/index.mdx`
- Added `security: { ... }` and `rate_limits: { ... }` to Config Structure YAML block, matching existing inline comment style.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `auth_mode` in authentication page — FOUND ✓
- `permissive` in authentication page — FOUND ✓
- `SSRF` in authentication page — FOUND ✓
- `security: { ... }` in overview page — FOUND ✓
- `rate_limits: { ... }` in overview page — FOUND ✓
- Commit `f20662e` — FOUND ✓
