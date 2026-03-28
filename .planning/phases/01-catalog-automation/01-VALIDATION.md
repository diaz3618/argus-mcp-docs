---
phase: 1
slug: catalog-automation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no automated test framework applies |
| **Config file** | none |
| **Quick run command** | `node scripts/generate-index.js` (from catalog repo root) |
| **Full suite command** | `node scripts/generate-index.js && node scripts/lint-catalog.js` |
| **Estimated runtime** | ~2 seconds |

**Note:** All deliverables in this phase are GitHub Actions workflow files and a Node.js script. Validation is: (1) local script execution, (2) file inspection for required fields, (3) GitHub Actions on first push. No unit test framework is needed.

---

## Sampling Rate

- **After every task commit:** Run `node scripts/generate-index.js` (from `/home/diaz/mygit/argus-mcp-catalog/`)
- **After final plan commit:** Full verification checklist below

---

## Phase Gate Checklist

| Req ID | Verification Command / Check | Pass Criteria |
|--------|------------------------------|---------------|
| CATALOG-01 | `node scripts/generate-index.js` | Exits 0, prints category/file count, `catalog.json` contains 10 categories with correct filenames, `updated_at` is a valid ISO timestamp |
| CATALOG-01 | `node scripts/lint-catalog.js` after generate | Exits 0 (generated file passes existing lint) |
| CATALOG-02 | `grep -E "stefanzweifel/git-auto-commit-action@v7" .github/workflows/generate-index.yml` | Match found |
| CATALOG-02 | `grep "[skip ci]" .github/workflows/generate-index.yml` | Match found |
| CATALOG-02 | `grep "configs/\*\*" .github/workflows/generate-index.yml` | Path filter present |
| CATALOG-03 | `grep "catalog-index-generation" .github/workflows/generate-index.yml` | Concurrency group present |
| CATALOG-03 | `grep "cancel-in-progress: false" .github/workflows/generate-index.yml` | `false` (not `true`) |
| CATALOG-04 | `grep "workflow_run" .github/workflows/notify-docs.yml` | Trigger type present |
| CATALOG-04 | `grep "conclusion == 'success'" .github/workflows/notify-docs.yml` | Guard condition present |
| CATALOG-04 | `grep "gh workflow run deploy.yml" .github/workflows/notify-docs.yml` | Dispatch command present |
| CATALOG-05 | Manual — user creates PAT | `DOCS_DISPATCH_TOKEN` secret stored in `argus-mcp-catalog` repo settings |
| CONTRIB-01 | `grep -E "name:|description:" .github/pull_request_template.md` | Required fields documented |

---

## Wave 0

No test infrastructure setup needed — validation is script execution and file inspection only.
