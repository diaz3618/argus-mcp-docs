---
phase: "10-access-and-the-argus-mcp-main-repo-by-using-the-filesystem-m"
plan: "01"
subsystem: "docs-content"
tags: ["configuration", "security", "rate-limits", "new-pages"]
dependency_graph:
  requires: []
  provides:
    - "contents/docs/configuration/security/index.mdx"
    - "contents/docs/configuration/rate-limits/index.mdx"
  affects:
    - "settings/documents.ts (via Plan 03 nav wiring)"
tech_stack:
  added: []
  patterns: ["MDX field table format (Field | Type | Default | Description)", "YAML example + sub-section structure"]
key_files:
  created:
    - "contents/docs/configuration/security/index.mdx"
    - "contents/docs/configuration/rate-limits/index.mdx"
  modified: []
decisions:
  - "Used dotted path notation for nested fields (e.g., security.headers.enabled) in field tables"
  - "Documented AUTH-02 XFF spoofing protection in Trusted Proxies sub-section"
  - "Documented SEC-13 CSRF protection in Origin Validation sub-section"
metrics:
  duration: "~5 minutes"
  completed: "2026-04-18"
  tasks_completed: 2
  files_created: 2
---

# Phase 10 Plan 01: Security and Rate Limits Config Pages Summary

Created two missing configuration reference pages — SecurityConfig (9 fields) and RateLimitsConfig (6 fields) — both verified against live Pydantic schemas in argus-mcp source repo.

## What Was Built

### `contents/docs/configuration/security/index.mdx`
Documents the `security:` top-level config block with all 9 SecurityConfig fields:
- `security.headers.enabled` / `hsts_max_age` — response headers middleware
- `security.payload_limits.enabled` / `max_body_bytes` / `max_json_depth` — payload limits
- `security.allow_weak_tokens` — SEC-06 flag
- `security.require_origin` — strict/permissive CSRF protection (SEC-13)
- `security.trusted_proxies` — XFF trust with AUTH-02 explanation
- `security.redact_status` — SEC-17 management API redaction

Sub-sections cover: Security Headers (HSTS over TLS note, validator rule), Trusted Proxies (CIDR example, spoofing prevention), Origin Validation (strict vs permissive table).

### `contents/docs/configuration/rate-limits/index.mdx`
Documents the `rate_limits:` top-level config block with all 6 RateLimitsConfig fields:
- `rate_limits.enabled`
- `rate_limits.default.requests` / `window_seconds` — sliding window
- `rate_limits.auth_lockout_threshold` / `auth_lockout_window_seconds` / `auth_lockout_duration_seconds`

Sub-sections cover: Default Rate Limit (sliding window explanation, TTLCache bounded memory note), Auth Lockout (brute-force protection, default behavior: 5 failures in 5 min → 15-min lockout).

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `contents/docs/configuration/security/index.mdx` — FOUND ✓
- `contents/docs/configuration/rate-limits/index.mdx` — FOUND ✓
- `trusted_proxies`, `require_origin`, `redact_status` in security page — FOUND ✓
- `auth_lockout_threshold`, `auth_lockout_duration_seconds` in rate-limits page — FOUND ✓
- Commit `7860e9a` — FOUND ✓
