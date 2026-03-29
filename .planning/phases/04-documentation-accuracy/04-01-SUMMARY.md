---
phase: 04-documentation-accuracy
plan: "01"
subsystem: documentation
tags: [docs, plugins, backends, accuracy]
dependency_graph:
  requires: []
  provides: [accurate-plugin-settings, complete-timeout-fields]
  affects: [contents/docs/plugins/built-in-plugins/index.mdx, contents/docs/configuration/backends/index.mdx]
tech_stack:
  added: []
  patterns: [code-as-source-of-truth]
key_files:
  created: []
  modified:
    - contents/docs/plugins/built-in-plugins/index.mdx
    - contents/docs/configuration/backends/index.mdx
decisions:
  - Plugin setting names corrected to match Python source (window_seconds, cooldown_seconds, backoff_factor, ttl_seconds, max_entries)
  - All 6 TimeoutConfig fields now documented including startup, retries, retry_delay
metrics:
  duration: "2min"
  completed: "2026-03-29"
  tasks_completed: 2
  files_modified: 2
---

# Phase 4 Plan 01: Documentation Accuracy Fixes Summary

## One-Liner

Fixed 4 wrong plugin setting names (window_seconds, cooldown_seconds, backoff_factor, ttl_seconds/max_entries) and added 3 missing TimeoutConfig fields (startup, retries, retry_delay) to match Python source code.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Verify plugin count and update plugins pages | 81ca087 | contents/docs/plugins/built-in-plugins/index.mdx |
| 2 | Add 3 missing timeout fields to backends config docs | b08db19 | contents/docs/configuration/backends/index.mdx |

## What Was Done

### Task 1: Plugin pages

Confirmed 8 plugins in `argus_mcp/plugins/builtins/` (circuit_breaker, markdown_cleaner, output_length_guard, pii_filter, rate_limiter, response_cache_by_prompt, retry_with_backoff, secrets_detection). The count claims "eight" were already correct.

Found and fixed 4 setting name mismatches between docs and source:

| Plugin | Doc (wrong) | Source (correct) |
|--------|-------------|------------------|
| `rate_limiter` | `window` | `window_seconds` |
| `circuit_breaker` | `cooldown` | `cooldown_seconds` |
| `retry_with_backoff` | `backoff` | `backoff_factor` |
| `response_cache_by_prompt` | `ttl`, `max` | `ttl_seconds`, `max_entries` |

Updated both per-plugin sections and the Combined Example block.

### Task 2: Backends timeout fields

Added 3 missing fields from `TimeoutConfig` in `schema_backends.py`:
- `startup` (float, ge=0): overall per-backend connection timeout covering subprocess spawn
- `retries` (int, ge=0, le=10): automatic retries for failed backend connections
- `retry_delay` (float, ge=0, le=120): seconds between retry attempts

Both the YAML example block and the field reference table now cover all 6 fields: init, cap_fetch, sse_startup, startup, retries, retry_delay.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed 4 wrong plugin setting names**
- **Found during:** Task 1 (plan said "verify settings match" — they didn't)
- **Issue:** Docs used wrong key names that would silently fail to configure the plugins
- **Fix:** Corrected window->window_seconds, cooldown->cooldown_seconds, backoff->backoff_factor, ttl/max->ttl_seconds/max_entries
- **Files modified:** contents/docs/plugins/built-in-plugins/index.mdx
- **Commit:** 81ca087

## Verification Results

1. `grep "eight\|8" contents/docs/plugins/index.mdx` — matches (accurate count language)
2. `grep -c "^## " contents/docs/plugins/built-in-plugins/index.mdx` — returns 9 (8 plugins + Combined Example)
3. Each plugin name appears as section header: secrets_detection, pii_filter, rate_limiter, circuit_breaker, retry_with_backoff, response_cache_by_prompt, output_length_guard, markdown_cleaner
4. `startup`, `retries`, `retry_delay` each appear 2+ times in backends/index.mdx (YAML + table row)
5. `retries` constraint "(0–10)" present; `retry_delay` constraint "(0–120)" present

## Known Stubs

None. All documented settings are wired to actual source code values.

## Self-Check: PASSED
