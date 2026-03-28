# Stack Research — Catalog Auto-Commit CI

**Project:** argus-mcp-catalog generate-index workflow
**Researched:** 2026-03-28
**Overall Confidence:** HIGH (primary claims verified against official GitHub docs and action source)

---

## Recommended Approach

Use `stefanzweifel/git-auto-commit-action@v7` with `GITHUB_TOKEN` (contents: write).
Do NOT use `peter-evans/create-pull-request` — that creates a PR for human review. This is
an internal index file with no ambiguity; direct commit to main is correct.
Do NOT use a PAT unless you specifically need the auto-commit to trigger downstream workflows
(the existing lint-catalog.yml runs on push to main, so a PAT would cause an extra run).
Stick with GITHUB_TOKEN; the auto-commit will NOT re-trigger workflows, which is the desired
behaviour to avoid loops.

---

## Exact Workflow Structure

```yaml
name: Generate Catalog Index

on:
  push:
    branches:
      - main
    paths:
      - "configs/**/*.yaml"

permissions:
  contents: write

jobs:
  generate-index:
    runs-on: ubuntu-latest
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

### Key structural decisions

| Decision | Rationale |
|----------|-----------|
| `paths: configs/**/*.yaml` | Triggers only on YAML changes, not on catalog.json commits themselves |
| `permissions: contents: write` at job level | Minimum necessary scope; do NOT set at workflow level to keep other jobs read-only |
| `file_pattern: catalog.json` | Tells git-auto-commit-action to only stage that one file, nothing else |
| `[skip ci]` in commit message | Belt-and-suspenders loop guard alongside GITHUB_TOKEN's no-retrigger behaviour |
| `actions/checkout@v4` (not v3) | Consistent with existing lint-catalog.yml; v4 is current major |
| `actions/setup-node@v4` | Consistent with existing lint-catalog.yml |

---

## Token & Permissions

### Use GITHUB_TOKEN (not a PAT)

Reason: GITHUB_TOKEN commits do NOT trigger new workflow runs on the same repo by GitHub
platform design. This prevents the generate-index workflow from retriggering lint-catalog,
which watches both `configs/**` and `catalog.json`.

A PAT WOULD retrigger downstream workflows. That is undesirable here because:
- lint-catalog.yml already runs on push to main when catalog.json changes
- An auto-generated catalog.json commit should not fire a second lint run via a separate token

### Exact permissions block

Place at the **job level**, not the workflow level:

```yaml
jobs:
  generate-index:
    runs-on: ubuntu-latest
    permissions:
      contents: write
```

This restricts write access to this job only. If additional jobs are added later they remain
read-only by default.

### What "contents: write" grants

- Ability to push commits to the repository
- Ability to create/update files via the git CLI or API
- Does NOT grant PR creation, issue writing, or any other scope

### Bot identity for git commits

Use the canonical GitHub Actions bot identity. These values are GitHub's official noreply
addresses for the actions bot (verified in GitHub community discussions):

```
user.name  = github-actions[bot]
user.email = 41898282+github-actions[bot]@users.noreply.github.com
```

`git-auto-commit-action@v7` accepts `commit_user_name`, `commit_user_email`, and
`commit_author` inputs directly, so no manual `git config` step is needed.

---

## Script Pattern (generate-index)

Create `scripts/generate-index.js` following the same conventions as the existing
`scripts/lint-catalog.js`:

- No npm dependencies needed (pure Node.js `fs` and `path`)
- Use `'use strict'` and `#!/usr/bin/env node`
- Resolve paths relative to `__dirname`
- Write output with `fs.writeFileSync` (synchronous, simple, consistent with lint script)

```js
#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT        = path.resolve(__dirname, '..');
const CONFIGS_DIR = path.join(ROOT, 'configs');
const OUTPUT_PATH = path.join(ROOT, 'catalog.json');

const categories = {};

// Each direct subdirectory of configs/ is a category
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

### Why Node.js over bash

- Consistent with the existing scripts/ convention (lint-catalog.js is already Node.js)
- No dependency on `find`, `jq`, or other shell utilities that vary by runner image
- Easy to extend (sort order, filtering, additional fields) without bash escaping hazards
- `fs.readdirSync` with `withFileTypes: true` is available from Node.js 10.10+; Node 20 is used

### Why no npm install step

`fs` and `path` are Node.js built-ins. No `package.json`, no `node_modules`, no install time.
The existing lint-catalog.js installs `js-yaml` because it actually parses YAML content.
generate-index.js only needs filenames — no YAML parsing required.

---

## Confidence Level

| Claim | Confidence | Basis |
|-------|------------|-------|
| `git-auto-commit-action@v7` is current latest | HIGH | GitHub Releases page confirmed v7.1.0 (Dec 2024) |
| GITHUB_TOKEN does not retrigger workflows | HIGH | GitHub official docs + action README both state this |
| `contents: write` is the only required permission | HIGH | Official GitHub docs on GITHUB_TOKEN scopes |
| Bot email `41898282+github-actions[bot]@users.noreply.github.com` | HIGH | GitHub community canonical answer |
| `[skip ci]` honoured by GitHub Actions | HIGH | GitHub Changelog announcement (Feb 2021), still active |
| `paths: configs/**/*.yaml` correctly filters YAML-only pushes | HIGH | GitHub Actions workflow syntax docs |
| Node.js `fs.readdirSync` with `withFileTypes` in Node 20 | HIGH | Node.js built-in, no external source needed |
| create-pull-request is wrong tool for this use case | HIGH | Tool README and description confirm it creates PRs, not direct commits |

---

## Sources

- [stefanzweifel/git-auto-commit-action — GitHub](https://github.com/stefanzweifel/git-auto-commit-action)
- [git-auto-commit-action releases (v7.1.0)](https://github.com/stefanzweifel/git-auto-commit-action/releases)
- [Controlling permissions for GITHUB_TOKEN — GitHub Docs](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/controlling-permissions-for-github_token)
- [GitHub Actions bot email address — GitHub Community](https://github.com/orgs/community/discussions/26560)
- [Skipping workflow runs — GitHub Docs](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/skipping-workflow-runs)
- [Workflow syntax — paths filter — GitHub Docs](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions)
- [peter-evans/create-pull-request — GitHub](https://github.com/peter-evans/create-pull-request)
