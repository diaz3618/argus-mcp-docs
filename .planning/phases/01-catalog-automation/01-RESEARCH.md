# Phase 1: Catalog Automation - Research

**Researched:** 2026-03-28
**Domain:** GitHub Actions — auto-commit CI, cross-repo workflow dispatch, Node.js file scanning
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CATALOG-01 | `scripts/generate-index.js` scans `configs/` subdirs and produces `catalog.json` with `{ categories: Record<string, string[]>, updated_at: string }` | STACK.md provides verified Node.js script pattern using `fs.readdirSync`; existing `catalog.json` confirms exact output shape |
| CATALOG-02 | `generate-index.yml` runs on push to main when `configs/**` changes, commits back via `GITHUB_TOKEN` + `stefanzweifel/git-auto-commit-action@v7` with `[skip ci]` | STACK.md provides exact workflow YAML; PITFALLS.md confirms GITHUB_TOKEN loop-prevention behaviour |
| CATALOG-03 | `generate-index.yml` has `concurrency: group: catalog-index-generation, cancel-in-progress: false` | PITFALLS.md documents the race condition and the `cancel-in-progress: false` rationale |
| CATALOG-04 | `notify-docs.yml` triggers via `workflow_run` after `generate-index.yml` succeeds and dispatches to `argus-mcp-docs` using `DOCS_DISPATCH_TOKEN` | FEATURES.md provides exact workflow YAML and confirms `deploy.yml` already has `on: workflow_dispatch:` |
| CATALOG-05 | `DOCS_DISPATCH_TOKEN` fine-grained PAT with `actions: write` on `argus-mcp-docs` stored as secret in `argus-mcp-catalog` | FEATURES.md documents exact PAT scope; PITFALLS.md documents the two-token separation |
| CONTRIB-01 | `.github/pull_request_template.md` guides contributors on required YAML fields and category placement | Existing `lint-catalog.js` defines the required fields (`name`, `description`, backend-slug key) |
</phase_requirements>

---

## Summary

Phase 1 adds three things to `argus-mcp-catalog`: a Node.js index-generation script, two GitHub Actions workflows (generate-index and notify-docs), and a PR template. The target repo already has a working Node.js script pattern (`scripts/lint-catalog.js`) and a workflow pattern (`.github/workflows/lint-catalog.yml`) to match exactly — no new conventions are being introduced.

The automation loop has two distinct parts. First, `generate-index.yml` fires on `push` to `main` when `configs/**` changes, runs `scripts/generate-index.js`, and commits `catalog.json` back to main using `stefanzweifel/git-auto-commit-action@v7`. The GITHUB_TOKEN commit-back is the key design choice: GitHub's platform guarantees that GITHUB_TOKEN pushes do not re-trigger workflows, breaking any infinite loop by design. Second, `notify-docs.yml` chains off `generate-index.yml` via `workflow_run` and dispatches `deploy.yml` on `argus-mcp-docs` using a fine-grained PAT (`DOCS_DISPATCH_TOKEN`) — required because GITHUB_TOKEN is scoped to a single repo and cannot authenticate against a different one.

The one manual step that cannot be automated is creating the `DOCS_DISPATCH_TOKEN` fine-grained PAT and storing it as a secret in `argus-mcp-catalog`. This must be documented as explicit instructions for the user to follow after the workflow files are merged.

**Primary recommendation:** Follow the exact workflow YAML from STACK.md and FEATURES.md verbatim. Every structural decision is already researched and confirmed against official GitHub docs. The generate-index.js script pattern is also specified in STACK.md; write it to match lint-catalog.js conventions (`'use strict'`, `#!/usr/bin/env node`, `__dirname`-relative paths, `fs.writeFileSync`).

---

## Standard Stack

### Core

| Library / Tool | Version | Purpose | Why Standard |
|----------------|---------|---------|--------------|
| `stefanzweifel/git-auto-commit-action` | v7 (v7.1.0, Dec 2024) | Commit generated `catalog.json` back to main in CI | Official action with loop-safe GITHUB_TOKEN support; current major |
| `actions/checkout` | v4 | Checkout repo in all workflow jobs | Current major; matches existing `lint-catalog.yml` |
| `actions/setup-node` | v4 | Node.js 20 runtime for script execution | Current major; matches existing `lint-catalog.yml` |
| `gh` CLI | pre-installed on `ubuntu-latest` | Fire `workflow_dispatch` to argus-mcp-docs | Pre-installed, handles auth from `GH_TOKEN` env var, exits non-zero on HTTP errors |
| Node.js built-ins (`fs`, `path`) | Node 20 | Scan configs/ and write catalog.json | No npm install step; matches lint-catalog.js convention |

### Supporting

| Library / Tool | Version | Purpose | When to Use |
|----------------|---------|---------|-------------|
| Fine-grained PAT (`DOCS_DISPATCH_TOKEN`) | n/a | Authenticate cross-repo `workflow_dispatch` call | Required — GITHUB_TOKEN cannot authenticate to a different repo |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `stefanzweifel/git-auto-commit-action@v7` | `peter-evans/create-pull-request` | Creates a PR for human review instead of direct commit; wrong for an internal generated file |
| `gh workflow run` (CLI) | `curl` + REST API | `curl` requires manual `-f` flag, manual JSON body; `gh` is simpler and pre-installed |
| `gh workflow run` (CLI) | `actions/github-script` + octokit | Valid but adds action version dependency; `gh` is simpler for this single call |
| Separate `notify-docs.yml` | Embed dispatch job in `generate-index.yml` | Embedding works but conflates catalog generation with cross-repo signaling; separate file is easier to disable independently |

**Installation:** No new dependencies. `generate-index.js` uses only Node.js built-ins. Workflow actions reference existing pinned major versions.

---

## Architecture Patterns

### Recommended Project Structure (additions to argus-mcp-catalog)

```
argus-mcp-catalog/
├── scripts/
│   ├── lint-catalog.js           # existing
│   └── generate-index.js         # NEW — pure Node.js, no deps
├── .github/
│   ├── workflows/
│   │   ├── lint-catalog.yml      # existing
│   │   ├── generate-index.yml    # NEW — auto-commit on configs/** push
│   │   └── notify-docs.yml       # NEW — dispatch deploy.yml after generate
│   └── pull_request_template.md  # NEW — contributor YAML field guide
└── catalog.json                  # existing, now auto-generated
```

### Pattern 1: Auto-Commit Generated File

**What:** Workflow runs a generation script, then commits the output file back to the same branch using `git-auto-commit-action`.
**When to use:** Generated files that must live in the repo (for downstream API consumers), with no human review needed.

```yaml
# Source: STACK.md (verified against stefanzweifel/git-auto-commit-action README)
name: Generate Catalog Index

on:
  push:
    branches:
      - main
    paths:
      - "configs/**/*.yaml"

concurrency:
  group: catalog-index-generation
  cancel-in-progress: false

jobs:
  generate-index:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Generate catalog.json
        run: node scripts/generate-index.js

      - uses: stefanzweifel/git-auto-commit-action@v7
        with:
          commit_message: "chore: regenerate catalog.json [skip ci]"
          file_pattern: "catalog.json"
          commit_user_name: "github-actions[bot]"
          commit_user_email: "41898282+github-actions[bot]@users.noreply.github.com"
          commit_author: "github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>"
```

### Pattern 2: Cross-Repo Workflow Dispatch via workflow_run

**What:** A second workflow triggers after the first completes, then calls `gh workflow run` to dispatch a workflow in a different repo.
**When to use:** Chaining across repos where the target already has `on: workflow_dispatch:`.

```yaml
# Source: FEATURES.md (verified against GitHub Actions docs)
name: Notify Docs Rebuild

on:
  workflow_run:
    workflows: ["Generate Catalog Index"]  # must match name: field in generate-index.yml exactly
    types: [completed]
    branches: [main]

jobs:
  dispatch:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    steps:
      - name: Trigger argus-mcp-docs rebuild
        env:
          GH_TOKEN: ${{ secrets.DOCS_DISPATCH_TOKEN }}
        run: |
          if ! gh workflow run deploy.yml \
               --repo diaz3618/argus-mcp-docs \
               --ref main; then
            echo "ERROR: Failed to dispatch deploy.yml on argus-mcp-docs" >&2
            echo "Check that DOCS_DISPATCH_TOKEN has actions:write on diaz3618/argus-mcp-docs" >&2
            exit 1
          fi
          echo "Dispatch succeeded — deploy.yml queued on argus-mcp-docs"
```

### Pattern 3: generate-index.js Script

**What:** Pure Node.js script scanning `configs/` subdirectories for `.yaml` files and writing `catalog.json`.
**When to use:** Whenever the catalog directory structure changes; run locally with `node scripts/generate-index.js`.

```javascript
// Source: STACK.md — follows lint-catalog.js conventions exactly
#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT        = path.resolve(__dirname, '..');
const CONFIGS_DIR = path.join(ROOT, 'configs');
const OUTPUT_PATH = path.join(ROOT, 'catalog.json');

const categories = {};

for (const entry of fs.readdirSync(CONFIGS_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const category = entry.name;
  const categoryDir = path.join(CONFIGS_DIR, category);
  const files = fs.readdirSync(categoryDir)
    .filter(f => f.endsWith('.yaml'))
    .sort();
  if (files.length > 0) {
    categories[category] = files;
  }
}

const catalog = {
  categories,
  updated_at: new Date().toISOString(),
};

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(catalog, null, 2) + '\n');
console.log(
  `Generated catalog.json: ${Object.keys(categories).length} categories, ` +
  Object.values(categories).reduce((n, v) => n + v.length, 0) + ' files.'
);
```

### Anti-Patterns to Avoid

- **Using a PAT for the generate-index commit-back:** A PAT push triggers downstream workflows (including `lint-catalog.yml`), creating an unnecessary re-lint on an auto-generated file. Use GITHUB_TOKEN only.
- **Placing `permissions: contents: write` at workflow level:** Grants write access to all jobs including any future read-only jobs. Place at the job level.
- **Using `cancel-in-progress: true` on the concurrency group:** Cancels the in-progress run when a second merge arrives, losing the first merge's configs from the generated catalog. Use `false` to queue.
- **Omitting `[skip ci]` from the commit message:** Belt-and-suspenders protection against the rare edge case where GITHUB_TOKEN loop prevention behaves unexpectedly. Always include it.
- **Using `repository_dispatch` instead of `workflow_dispatch`:** Requires modifying `deploy.yml` to add a new trigger. `deploy.yml` already has `on: workflow_dispatch:` — use it directly.
- **Scoping `DOCS_DISPATCH_TOKEN` to `argus-mcp-catalog` instead of `argus-mcp-docs`:** The token authenticates against the target repo. A token scoped to the source repo will return 404 or 403 silently.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Committing generated files back to main in CI | Custom `git config` + `git add` + `git commit` + `git push` steps | `stefanzweifel/git-auto-commit-action@v7` | Handles no-diff gracefully (exits 0 when nothing changed), uses correct bot identity, battle-tested with GITHUB_TOKEN |
| Cross-repo workflow trigger | `curl` with manual JSON body + `-f` flag | `gh workflow run` CLI | Pre-installed, handles auth from env, exits non-zero on HTTP errors, one line |

**Key insight:** The commit-back step is the one place where hand-rolling is most tempting (just a few git commands) but most hazardous — a bare `git push` fails silently if there's nothing to commit, and getting the bot identity wrong creates authorship noise in the git log.

---

## Common Pitfalls

### Pitfall 1: Infinite Loop from Auto-Commit

**What goes wrong:** The generate-index workflow commits `catalog.json` back to main. If that push re-triggers the same workflow, the loop runs indefinitely.
**Why it happens:** Workflows watching `push` on `main` fire on every push to main, including bot commits.
**How to avoid:** Use `GITHUB_TOKEN` for the commit-back. GitHub guarantees GITHUB_TOKEN pushes do not trigger workflow runs. Also include `[skip ci]` in the commit message as belt-and-suspenders protection.
**Warning signs:** `generate-index.yml` appearing multiple times in rapid succession in the Actions tab after a single merge.

### Pitfall 2: Race Condition on Concurrent Merges

**What goes wrong:** Two PRs merge within seconds. Both runs checkout main, generate `catalog.json`, and attempt to push. The second push fails with a non-fast-forward rejection. The second merge's configs are lost from the catalog.
**Why it happens:** No serialization between workflow runs by default.
**How to avoid:** Add `concurrency: group: catalog-index-generation` with `cancel-in-progress: false`. The second run queues, then checks out the latest main (including the first run's commit) and regenerates from the full `configs/` state.
**Warning signs:** `generate-index.yml` runs showing "push rejected" errors in the git-auto-commit step.

### Pitfall 3: DOCS_DISPATCH_TOKEN Scoped to Wrong Repo

**What goes wrong:** Token is created with repository access scoped to `argus-mcp-catalog` (where the secret lives) instead of `argus-mcp-docs` (the target). The `gh workflow run` call returns 404 or 403.
**Why it happens:** Fine-grained PATs are repo-scoped. It's easy to select the repo you're currently working in.
**How to avoid:** During token creation, explicitly select `argus-mcp-docs` as the repository. Verify the scope before storing the secret.
**Warning signs:** `notify-docs.yml` failing with HTTP 404 or "Resource not accessible" in the step log.

### Pitfall 4: workflow_run Not Firing (Wrong Branch)

**What goes wrong:** `notify-docs.yml` is present but never triggers even after `generate-index.yml` completes successfully.
**Why it happens:** `workflow_run` only fires when the workflow file that defines it is on the **default branch** (main). If `notify-docs.yml` exists only on a feature branch, it won't fire.
**How to avoid:** Merge `notify-docs.yml` to main before testing the full chain.
**Warning signs:** `generate-index.yml` completing successfully but no `notify-docs.yml` run appearing in the Actions tab.

### Pitfall 5: workflow_run Name Mismatch

**What goes wrong:** `notify-docs.yml` has `workflows: ["Generate Index"]` but `generate-index.yml` has `name: Generate Catalog Index`. The `workflow_run` trigger never fires.
**Why it happens:** The `workflows:` list in `workflow_run` must match the `name:` field of the upstream workflow exactly, character for character.
**How to avoid:** Copy the `name:` value from `generate-index.yml` verbatim into `notify-docs.yml`'s `workflows:` list.
**Warning signs:** `generate-index.yml` completing but `notify-docs.yml` never queuing.

### Pitfall 6: GITHUB_TOKEN Missing `contents: write` Permission

**What goes wrong:** The `git-auto-commit-action` step fails with `Permission denied` or HTTP 403.
**Why it happens:** Many repos default to `contents: read` for GITHUB_TOKEN. The action needs `contents: write` to push a commit.
**How to avoid:** Add `permissions: contents: write` at the job level (not workflow level) on the `generate-index` job.
**Warning signs:** Step log shows `403` or `remote: Permission to ... denied to github-actions[bot]`.

---

## Code Examples

### catalog.json Output Shape (from existing file)

```json
{
  "categories": {
    "filesystem-access": ["filesystem.yaml", "filesystem-container.yaml", "git.yaml", "git-container.yaml"],
    "web-research": ["context7.yaml", "context7-container.yaml", "fetch.yaml", "fetch-container.yaml", "brave-search.yaml", "brave-search-container.yaml"]
  },
  "updated_at": "2026-03-28T00:00:00Z"
}
```

The `updated_at` field in the hand-maintained file uses a static timestamp. The script will produce a live `new Date().toISOString()` value — this is correct and expected by `lib/catalog.ts`.

### PR Template Required Fields (from lint-catalog.js validation)

The lint script enforces three requirements per YAML file:
1. `name:` — non-empty string
2. `description:` — non-empty string
3. At least one backend-slug key (any key besides `name` and `description`)

The PR template must surface these as the required fields checklist.

### Fine-Grained PAT Setup (DOCS_DISPATCH_TOKEN)

```
GitHub.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens
  Token name: argus-mcp-docs-dispatch
  Resource owner: diaz3618
  Repository access: Only select repositories → argus-mcp-docs
  Permissions:
    Repository permissions → Actions: Read and Write
    (Metadata: Read — auto-selected)
    All other: No access

Store as:
  argus-mcp-catalog → Settings → Secrets and variables → Actions → DOCS_DISPATCH_TOKEN
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Classic PATs (no expiry, broad scope) | Fine-grained PATs (repo-scoped, GA March 2025) | March 2025 GA | Fine-grained are now the default recommendation for new tokens |
| `actions/checkout@v3` | `actions/checkout@v4` | 2023 | v3 still works but v4 is current major |

**Deprecated / outdated:**
- `peter-evans/repository-dispatch`: Creates `repository_dispatch` events, not `workflow_dispatch`. Requires modifying the target workflow. Wrong tool for this use case.
- Classic PATs for cross-repo dispatch: Still work but over-privileged (account-wide scope). Fine-grained PATs are the correct choice.

---

## Open Questions

1. **`notify-docs.yml` name field for workflow_run**
   - What we know: `workflow_run: workflows:` must exactly match the `name:` field of `generate-index.yml`
   - What's unclear: Nothing — the name `"Generate Catalog Index"` is the intended value and must be used consistently
   - Recommendation: Define `name: Generate Catalog Index` in `generate-index.yml` first, then copy it verbatim into `notify-docs.yml`

2. **Concurrency group name in `notify-docs.yml`**
   - What we know: No concurrency group is required on `notify-docs.yml` itself — `deploy.yml` already has `concurrency: group: pages, cancel-in-progress: false` which serializes docs deploys
   - What's unclear: Nothing — no concurrency block needed on the notify workflow
   - Recommendation: Omit concurrency from `notify-docs.yml`; rely on `deploy.yml`'s existing concurrency group

---

## Environment Availability

Step 2.6: SKIPPED — Phase 1 is entirely code/config additions to `argus-mcp-catalog`. All tooling (`gh` CLI, `actions/checkout`, `actions/setup-node`) runs on GitHub-hosted `ubuntu-latest` runners. Local execution of `generate-index.js` requires only Node.js (already available: used by existing `lint-catalog.js`). No new local environment dependencies.

---

## Validation Architecture

No automated test framework applies to this phase. The deliverables are:
- A Node.js script (validated by running it locally)
- Two YAML workflow files (validated by GitHub Actions on first push)
- A Markdown template file (validated by inspection)

### Phase Gate Checklist (manual verification)

| Req ID | Verification Command / Check | Pass Criteria |
|--------|------------------------------|---------------|
| CATALOG-01 | `node scripts/generate-index.js` from catalog repo root | Exits 0, prints category/file count, `catalog.json` updated with current timestamp |
| CATALOG-01 | `node scripts/lint-catalog.js` after generate | Exits 0 (generated file passes existing lint) |
| CATALOG-02 | Inspect `generate-index.yml` | Has `paths: configs/**/*.yaml`, `stefanzweifel/git-auto-commit-action@v7`, `[skip ci]` in commit message |
| CATALOG-03 | Inspect `generate-index.yml` | Has `concurrency: group: catalog-index-generation, cancel-in-progress: false` |
| CATALOG-04 | Inspect `notify-docs.yml` | Has `workflow_run` on `"Generate Catalog Index"`, `if: conclusion == 'success'`, `gh workflow run deploy.yml --repo diaz3618/argus-mcp-docs` |
| CATALOG-05 | Manual step — user creates PAT | Token scoped to `argus-mcp-docs`, `Actions: Read and Write`, stored as `DOCS_DISPATCH_TOKEN` secret in `argus-mcp-catalog` |
| CONTRIB-01 | Inspect `.github/pull_request_template.md` | Contains checklist for `name:`, `description:`, backend-slug key, category directory placement |

**Wave 0 Gaps:** None — no test framework install or fixture files needed. All verification is local script execution or file inspection.

---

## Sources

### Primary (HIGH confidence)
- `.planning/research/STACK.md` — Exact `generate-index.yml` workflow YAML, `git-auto-commit-action@v7` configuration, GITHUB_TOKEN loop-prevention behaviour, generate-index.js script pattern
- `.planning/research/FEATURES.md` — Exact `notify-docs.yml` workflow YAML, `workflow_dispatch` vs `repository_dispatch` decision, fine-grained PAT scope requirements, `workflow_run` chaining constraints
- `.planning/research/PITFALLS.md` — Infinite loop prevention, race condition + concurrency group rationale, two-token separation (DOCS_DISPATCH_TOKEN vs CATALOG_READ_TOKEN), PAT expiry strategy
- `/home/diaz/mygit/argus-mcp-catalog/scripts/lint-catalog.js` — Existing script conventions to match (`'use strict'`, `#!/usr/bin/env node`, `__dirname`-relative paths)
- `/home/diaz/mygit/argus-mcp-catalog/.github/workflows/lint-catalog.yml` — Existing workflow conventions to match (`actions/checkout@v4`, `actions/setup-node@v4`, `node-version: "20"`)
- `/home/diaz/mygit/argus-mcp-catalog/catalog.json` — Confirmed output shape: 10 categories, 37 files, `updated_at` field
- `/home/diaz/mygit/argus-mcp-docs/.github/workflows/deploy.yml` — Confirmed `on: workflow_dispatch:` present; `concurrency: group: pages, cancel-in-progress: false` confirmed

### Secondary (MEDIUM confidence)
- [GitHub Actions docs — GITHUB_TOKEN](https://docs.github.com/en/actions/concepts/security/github_token)
- [GitHub Actions docs — workflow_run](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#workflow_run)
- [stefanzweifel/git-auto-commit-action releases](https://github.com/stefanzweifel/git-auto-commit-action/releases)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All tools verified against official sources in prior research; versions confirmed against GitHub releases
- Architecture: HIGH — Exact workflow YAML verified; existing repo patterns inspected directly
- Pitfalls: HIGH — All loop/race/token pitfalls verified against official GitHub docs in prior research

**Research date:** 2026-03-28
**Valid until:** 2026-06-28 (stable tooling — `git-auto-commit-action`, GitHub Actions workflow syntax; re-verify if GitHub announces changes to GITHUB_TOKEN behaviour)
