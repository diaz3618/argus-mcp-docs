# Pitfalls Research — Catalog Automation

**Project:** argus-mcp-docs catalog automation loop
**Researched:** 2026-03-28
**Scope:** generate-index.yml (commit-back) + notify-docs.yml (cross-repo dispatch)

---

## Infinite Loop Prevention

### The Risk

`generate-index.yml` will commit `catalog.json` back to `argus-mcp-catalog` on the `main` branch. If that push re-triggers the same workflow, you get an infinite loop: generate → commit → push → generate → ...

### What actually happens with GITHUB_TOKEN (HIGH confidence)

**GITHUB_TOKEN pushes do NOT trigger other workflows.** This is a documented GitHub safeguard:

> "events triggered by the GITHUB_TOKEN, with the exception of workflow_dispatch and repository_dispatch, will not create a new workflow run. If a workflow run pushes code using the repository's GITHUB_TOKEN, a new workflow will not run even when the repository contains a workflow configured to run when push events occur."

Source: [GITHUB_TOKEN — GitHub Docs](https://docs.github.com/en/actions/concepts/security/github_token)

This means: if `generate-index.yml` uses `GITHUB_TOKEN` for the commit-back step, the push will **not** re-trigger `generate-index.yml`. The loop is broken by design.

### The exception: if you switch to a PAT for the commit-back

If you later use a PAT (classic or fine-grained) instead of `GITHUB_TOKEN` for the commit-back push — for example, to bypass branch protections — the loop protection disappears. The PAT push **will** trigger workflows.

**Prevention options for PAT-based commits:**

1. **`[skip ci]` in the commit message** — GitHub natively skips `push` and `pull_request` workflows when the HEAD commit message contains `[skip ci]`, `[ci skip]`, `[no ci]`, `[skip actions]`, or `[actions skip]`. Source: [GitHub Changelog 2021-02-08](https://github.blog/changelog/2021-02-08-github-actions-skip-pull-request-and-push-workflows-with-skip-ci/)

2. **Path filter exclusion** — `generate-index.yml` could exclude `catalog.json` from its own `push` trigger:
   ```yaml
   on:
     push:
       branches: [main]
       paths:
         - 'configs/**'   # only trigger on config changes, not catalog.json changes
   ```
   This is fragile if someone hand-edits `catalog.json`.

3. **Actor check** — Add a job-level condition:
   ```yaml
   if: github.actor != 'github-actions[bot]'
   ```
   Works but relies on the bot username remaining stable.

**Recommendation:** Use `GITHUB_TOKEN` for the commit-back step to get loop prevention for free. Only switch to a PAT if branch protection rules require it, and then use `[skip ci]` in the commit message.

### Existing lint-catalog.yml interaction

`lint-catalog.yml` also runs on `push` to `main` with `paths: configs/** catalog.json`. A GITHUB_TOKEN-based commit of `catalog.json` will **not** trigger lint-catalog either. This is the correct behavior — there is nothing to lint on an auto-generated file. No special handling needed.

---

## Token & Permissions Gotchas

### GITHUB_TOKEN permissions required for commit-back (HIGH confidence)

The default token permission in many repos is `read` for `contents`. You must explicitly grant `contents: write` in the workflow:

```yaml
permissions:
  contents: write
```

Without this, the `git push` step will fail with a `403` or `Permission denied` error. Set the permission at the job level (not workflow level) so that only the commit-back job has elevated rights.

### DOCS_DISPATCH_TOKEN permissions required (HIGH confidence)

`notify-docs.yml` calls `workflow_dispatch` on `diaz3618/argus-mcp-docs`. The fine-grained PAT stored as `DOCS_DISPATCH_TOKEN` needs:

| Permission | Level | Why |
|------------|-------|-----|
| Contents | Read & Write | Required to call the dispatch API endpoint |
| Metadata | Read | Auto-selected when Contents is chosen |
| Actions | Read (possibly Write) | Some sources report this needed for `workflow_dispatch` specifically |

Source: [Dispatch a GitHub Action via a fine-grained PAT — Elio Struyf](https://www.eliostruyf.com/dispatch-github-action-fine-grained-personal-access-token/)

The token must be scoped to the **target** repository (`argus-mcp-docs`), not the source. Fine-grained PATs are per-repository or per-organization, not global.

**Failure mode to watch for:** If the token is accidentally scoped only to `argus-mcp-catalog` (the repo where the secret lives), the dispatch call to `argus-mcp-docs` will return `404` or `403` silently. Always verify the token's repository scope at creation time.

### CATALOG_READ_TOKEN in deploy.yml

`deploy.yml` already uses `CATALOG_READ_TOKEN` at build time to fetch YAML files from `argus-mcp-catalog`. This is a separate concern from `DOCS_DISPATCH_TOKEN`. Both tokens must be present and not expired for the full pipeline to work. They serve different purposes:

| Secret | Used In | Purpose | Minimum Permission |
|--------|---------|---------|-------------------|
| `DOCS_DISPATCH_TOKEN` | notify-docs.yml (catalog repo) | Trigger deploy.yml on docs repo | Contents R/W on argus-mcp-docs |
| `CATALOG_READ_TOKEN` | deploy.yml (docs repo) | Read YAML files from catalog repo at build time | Contents Read on argus-mcp-catalog |

---

## Race Conditions

### The scenario

Two PRs merge to `argus-mcp-catalog` within seconds of each other. `generate-index.yml` fires twice. Both runs:
1. Checkout `main`
2. Scan `configs/`
3. Generate `catalog.json`
4. Attempt to commit and push `catalog.json` back to `main`

The second push will fail with a non-fast-forward rejection because the first run already moved `HEAD`.

### Consequence

The second run fails at the push step. Its `catalog.json` is lost. `notify-docs.yml` (if it only runs on successful completion of `generate-index.yml`) will only fire once. The docs deploy will use the first run's catalog — which may be missing the configs from the second PR.

### Mitigation: concurrency group (HIGH confidence)

Add a concurrency block to `generate-index.yml`:

```yaml
concurrency:
  group: catalog-index-generation
  cancel-in-progress: false
```

With `cancel-in-progress: false`, the second run queues instead of cancelling. It will execute after the first completes, at which point it checks out the latest `main` (including the first run's commit) and regenerates from the full state of `configs/`. Both sets of configs end up in the final `catalog.json`.

**Important:** Use `cancel-in-progress: false` here, not `true`. Cancelling the in-progress run means you lose the first merge's configs from the generated catalog. Queuing preserves both.

Source: [Control concurrency of workflows — GitHub Docs](https://docs.github.com/actions/writing-workflows/choosing-what-your-workflow-does/control-the-concurrency-of-workflows-and-jobs)

### Concurrency also prevents duplicate notify-docs.yml dispatches

If `notify-docs.yml` triggers on `workflow_run: completed` from `generate-index.yml`, and two runs of `generate-index.yml` complete in quick succession, two dispatches will fire at `argus-mcp-docs`. Since `deploy.yml` already has:

```yaml
concurrency:
  group: pages
  cancel-in-progress: false
```

...the second deploy will queue behind the first. The docs site will be built twice, but not corrupted. The second build will always have the freshest catalog because it runs later.

---

## API Rate Limits

### Current catalog size and call count

From `catalog.json`, the current state is:

| Category | Files |
|----------|-------|
| filesystem-access | 4 |
| web-research | 6 |
| databases | 4 |
| ai-memory | 4 |
| devops-integrations | 5 |
| security-tools | 4 |
| remote-sse | 2 |
| remote-http | 2 |
| remote-auth | 2 |
| fully-isolated | 4 |
| **Total** | **37** |

Plus 1 call to fetch `catalog.json` itself = **38 API calls per build**.

### Rate limit headroom (HIGH confidence)

Authenticated requests using `CATALOG_READ_TOKEN` (a PAT) are subject to:

- **Primary limit:** 5,000 requests/hour per user (standard accounts)
- **Secondary limit:** 900 points/minute, where GET requests = 1 point each

38 GET requests per build = 38 points. At 5,000/hour, you could run the full build **131 times per hour** before hitting the primary limit. The secondary limit (900 points/minute) is not a concern at 38 requests.

Source: [Rate limits for the REST API — GitHub Docs](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)

### Where rate limits become a concern

Rate limits are **not** a concern at the current scale. They would only become relevant at approximately:
- 100+ categories with 10+ files each (1,000+ API calls per build)
- Multiple concurrent builds in the same minute (shared PAT exhausted)

**Practical concern at current scale:** If the PAT used for `CATALOG_READ_TOKEN` is a shared token (e.g., also used by developers locally), its 5,000 req/hour budget is shared. Each scheduled daily build at 06:00 UTC burns 38 of those requests — negligible.

### Recommendation for future growth

If the catalog grows past ~200 files, consider switching from individual file API calls to fetching the repo tree once (`GET /repos/{owner}/{repo}/git/trees/{sha}?recursive=1`) and then doing targeted fetches. This collapses N+1 category-list calls into 1 tree call plus N file fetches.

---

## PAT Expiry Strategy

### Fine-grained PAT expiry (HIGH confidence, as of March 2025 GA)

Fine-grained PATs became generally available in March 2025. Key expiry rules:

- **Personal accounts:** Can set "No expiration" for tokens accessing only personal repos. This is now officially supported.
- **Organization-owned repos:** Subject to organization policy. Default maximum is 366 days. The organization admin can set stricter limits (down to 1 day) or relax them.
- **No organization policy in effect:** Token creator chooses expiry up to the org maximum.

Source: [Fine-grained PATs are now generally available — GitHub Changelog](https://github.blog/changelog/2025-03-18-fine-grained-pats-are-now-generally-available/), [New PAT rotation policies — GitHub Changelog](https://github.blog/changelog/2024-10-18-new-pat-rotation-policies-preview-and-optional-expiration-for-fine-grained-pats/)

### Practical expiry strategy for DOCS_DISPATCH_TOKEN

Both `argus-mcp-catalog` and `argus-mcp-docs` appear to be personal repos (not org-owned), so "no expiration" is available.

**Recommended approach:**

1. **Short-term (now):** Create the token with a 90-day expiry. GitHub sends expiry warning emails 7 days before expiry. Treat this as a forcing function to audit token scope.

2. **Long-term:** If both repos remain personal, set "no expiration". Monitor via GitHub's token list under Settings → Developer settings → Personal access tokens.

3. **If repos move to an org:** The org's PAT policy will override. Plan for a service account or GitHub App at that point.

### GitHub App as the permanent solution

For a long-lived automation that crosses repo boundaries, a GitHub App is the correct solution over a PAT:

- App installation tokens are short-lived (1 hour) and auto-rotated
- App identity is distinct from a personal account — rotation doesn't depend on one person
- Permissions are explicit and auditable

This is out of scope for initial implementation but worth planning for if this automation becomes critical infrastructure.

### Secret expiry detection in CI

There is no built-in GitHub Actions mechanism to detect an expired token before the workflow fails. The failure mode is:

1. `notify-docs.yml` runs
2. `curl` or `octokit` call to dispatch returns `401 Bad credentials`
3. Workflow fails
4. No deploy happens
5. No alert unless you have workflow failure notifications configured

**Mitigation:** Enable email notifications for workflow failures (GitHub Settings → Notifications → Actions). Optionally add a step that validates the token before use:

```yaml
- name: Validate dispatch token
  run: |
    status=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Authorization: Bearer ${{ secrets.DOCS_DISPATCH_TOKEN }}" \
      https://api.github.com/repos/diaz3618/argus-mcp-docs)
    if [ "$status" != "200" ]; then
      echo "DOCS_DISPATCH_TOKEN is invalid or expired (HTTP $status)"
      exit 1
    fi
```

This surfaces token failure as an explicit error message rather than a cryptic API error buried in logs.

---

## Dispatch + Push Interaction

### The setup

`deploy.yml` in `argus-mcp-docs` has three triggers:

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
  schedule:
    - cron: '0 6 * * *'
```

`notify-docs.yml` will trigger it via `workflow_dispatch`.

### Do the two triggers interfere? (HIGH confidence)

No, they do not interfere in a correctness sense. Both triggers create independent workflow runs. The `concurrency` group in `deploy.yml`:

```yaml
concurrency:
  group: pages
  cancel-in-progress: false
```

...serializes all runs regardless of trigger source. If a push-triggered run and a dispatch-triggered run arrive simultaneously, one queues behind the other. Neither is cancelled (`cancel-in-progress: false`). Both will eventually complete and deploy.

### The practical risk: double deploy

If someone pushes to `main` on `argus-mcp-docs` around the same time that `notify-docs.yml` fires a dispatch, two deploys will queue. Both will succeed. The second deploy will overwrite the first on GitHub Pages. This is harmless — the catalog content in the dispatched build is what matters, and if both builds finish, the last one wins.

### The subtle risk: stale catalog in push-triggered deploy

When a regular `push` to `argus-mcp-docs` triggers `deploy.yml`, it fetches the catalog from `argus-mcp-catalog` at build time using `CATALOG_READ_TOKEN`. If the push happens before `generate-index.yml` has finished and committed an updated `catalog.json`, the push-triggered deploy may build against a slightly stale catalog.

This is only a problem if:
1. A new MCP config is added to `argus-mcp-catalog`
2. `generate-index.yml` is in flight
3. A simultaneous push to `argus-mcp-docs` triggers a deploy

The window is narrow and the consequence is minor (one build uses the pre-update catalog). The next scheduled daily build or the dispatch-triggered build will have the correct catalog.

**Verdict:** No action required. This is an acceptable eventual-consistency window.

### workflow_dispatch cannot be triggered by GITHUB_TOKEN

One important boundary: `workflow_dispatch` events **can** be triggered by a PAT or GitHub App token, even though GITHUB_TOKEN-based pushes do not trigger `push` workflows. This is the documented exception:

> "events triggered by the GITHUB_TOKEN, with the exception of workflow_dispatch and repository_dispatch, will not create a new workflow run"

So `notify-docs.yml` using `DOCS_DISPATCH_TOKEN` (a PAT) to fire `workflow_dispatch` on `argus-mcp-docs` is the correct and only viable pattern. Using `GITHUB_TOKEN` from `argus-mcp-catalog` to dispatch to `argus-mcp-docs` would fail anyway because `GITHUB_TOKEN` is scoped to a single repository and cannot authenticate against a different repo.

---

## Confidence Level

| Area | Confidence | Basis |
|------|------------|-------|
| GITHUB_TOKEN loop prevention | HIGH | Official GitHub docs, confirmed by multiple community discussions |
| GITHUB_TOKEN contents: write requirement | HIGH | Official GitHub docs on controlling GITHUB_TOKEN permissions |
| Fine-grained PAT scopes for workflow_dispatch | MEDIUM | Official docs + one practitioner article; "Actions" permission requirement has some ambiguity |
| Race condition / concurrency behavior | HIGH | Official GitHub docs on concurrency groups, confirmed behavior of cancel-in-progress |
| API rate limits (38 calls) | HIGH | Official rate limit docs; math is straightforward |
| PAT no-expiration for personal repos | HIGH | GA announcement March 2025, GitHub docs |
| Double deploy harmlessness | MEDIUM | Follows from concurrency group behavior and Pages overwrite semantics; no explicit doc confirms "last write wins" for Pages |

---

## Sources

- [GITHUB_TOKEN — GitHub Docs](https://docs.github.com/en/actions/concepts/security/github_token)
- [Controlling permissions for GITHUB_TOKEN — GitHub Docs](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/controlling-permissions-for-github_token)
- [Skip CI in GitHub Actions — GitHub Changelog](https://github.blog/changelog/2021-02-08-github-actions-skip-pull-request-and-push-workflows-with-skip-ci/)
- [Control concurrency of workflows and jobs — GitHub Docs](https://docs.github.com/actions/writing-workflows/choosing-what-your-workflow-does/control-the-concurrency-of-workflows-and-jobs)
- [Rate limits for the REST API — GitHub Docs](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
- [Fine-grained PATs are now generally available — GitHub Changelog](https://github.blog/changelog/2025-03-18-fine-grained-pats-are-now-generally-available/)
- [New PAT rotation policies and optional expiration — GitHub Changelog](https://github.blog/changelog/2024-10-18-new-pat-rotation-policies-preview-and-optional-expiration-for-fine-grained-pats/)
- [Dispatch a GitHub Action via a fine-grained PAT — Elio Struyf](https://www.eliostruyf.com/dispatch-github-action-fine-grained-personal-access-token/)
- [Push from Action does not trigger subsequent action — GitHub Community](https://github.com/orgs/community/discussions/25702)
- [Workflow infinite loop — GitHub Community](https://github.com/orgs/community/discussions/26970)
