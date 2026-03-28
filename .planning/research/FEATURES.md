# Features Research — Cross-Repo Dispatch

**Domain:** GitHub Actions cross-repository workflow triggering
**Researched:** 2026-03-28
**Scope:** notify-docs.yml in argus-mcp-catalog triggering deploy.yml in argus-mcp-docs

---

## Recommended Approach (workflow_dispatch vs repository_dispatch)

**Use `workflow_dispatch` via the GitHub REST API. Do not use `repository_dispatch`.**

### Why workflow_dispatch wins here

| Factor | workflow_dispatch | repository_dispatch |
|--------|-------------------|---------------------|
| Target trigger | Calls a specific named workflow file | Fires a custom event; target must listen for that event type |
| Target repo change required | None — deploy.yml already has `on: workflow_dispatch:` | Requires adding `on: repository_dispatch:` to deploy.yml |
| Observability | Run appears in Actions tab as a normal triggered run | Also visible, but event-type indirection adds confusion |
| Input passing | Supports typed inputs | Passes arbitrary JSON payload |
| Fine-grained PAT scope | `actions: write` on target repo | `contents: write` on target repo |

The target repo's `deploy.yml` already has `on: workflow_dispatch:` configured. Using `workflow_dispatch` requires zero changes to the target workflow. Using `repository_dispatch` would require modifying deploy.yml, which is the wrong direction.

### Which mechanism to fire it

**Use the `gh` CLI inside the workflow step, not `curl` and not `peter-evans/repository-dispatch` (which only does `repository_dispatch`).**

The `gh workflow run` command maps directly to
`POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches`.

```bash
gh workflow run deploy.yml \
  --repo diaz3618/argus-mcp-docs \
  --ref main
```

Rationale for `gh` over raw `curl`:
- `gh` is pre-installed on all GitHub-hosted runners (ubuntu-latest). No setup step needed.
- Exit code is non-zero on HTTP errors — error handling is trivial.
- `gh` handles token auth from `GH_TOKEN` env var automatically.
- `curl` requires manual `-f` flag to fail on HTTP errors and manual JSON body construction.
- `actions/github-script` with `octokit.rest.actions.createWorkflowDispatch()` is also valid and avoids shell quoting issues, but adds a dependency on the action version.

**Verdict:** `gh workflow run` is the simplest, most portable choice for this exact use case.

---

## Exact Workflow Structure

The notify-docs.yml workflow should live at
`.github/workflows/notify-docs.yml` in `argus-mcp-catalog`.

```yaml
name: Notify Docs Rebuild

on:
  workflow_run:
    workflows: ["Generate Index"]   # must match the `name:` field in generate-index.yml exactly
    types: [completed]
    branches: [main]

jobs:
  dispatch:
    # Only run if the upstream workflow succeeded
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    steps:
      - name: Trigger argus-mcp-docs rebuild
        env:
          GH_TOKEN: ${{ secrets.DOCS_DISPATCH_TOKEN }}
        run: |
          gh workflow run deploy.yml \
            --repo diaz3618/argus-mcp-docs \
            --ref main
```

### Key points in this structure

- `workflows: ["Generate Index"]` must exactly match the `name:` field at the top of
  `generate-index.yml`. If generate-index.yml's name is different, update this string.
- `types: [completed]` fires on both success and failure; the `if:` guard on the job
  filters to success only.
- `branches: [main]` prevents spurious dispatches from feature branches.
- `GH_TOKEN` is the env var `gh` CLI reads automatically. No `--auth` flag needed.
- No `needs:` keyword — that is for same-workflow job sequencing only, not cross-repo
  or cross-workflow chaining.

---

## PAT Requirements (fine-grained scopes)

Create a **fine-grained personal access token** (not a classic PAT) scoped to
`diaz3618/argus-mcp-docs` only.

### Required permissions on the token

| Permission | Level | Reason |
|------------|-------|--------|
| Actions | Read and Write | Required to call `POST /repos/{owner}/{repo}/actions/workflows/{id}/dispatches` |
| Metadata | Read | Automatically included; GitHub requires this for all fine-grained tokens |

**Do not grant `contents: write`.** That scope is for `repository_dispatch`, not
`workflow_dispatch`. Granting it here would be over-privileged.

**Do not grant `workflows: write`** unless you also need to create/modify workflow
files. Triggering an existing workflow only requires `actions: write`.

### Token creation steps

1. GitHub.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Token name: `argus-mcp-docs-dispatch` (or similar)
3. Expiration: set a rotation schedule (90 days max recommended)
4. Resource owner: `diaz3618` (your account)
5. Repository access: **Only select repositories** → choose `argus-mcp-docs`
6. Permissions → Repository permissions → Actions: **Read and Write**
7. All other permissions: No access

### Store the token

In `argus-mcp-catalog` repository settings → Secrets and variables → Actions →
New repository secret → Name: `DOCS_DISPATCH_TOKEN`.

### Known gotcha: organization policy

If `diaz3618` is an organization (not a personal account), the org must have
"Allow access via fine-grained personal access tokens" enabled under
Organization Settings → Third-party access. Personal accounts do not have this
restriction.

---

## Error Handling

### What happens if the dispatch fails

The `gh workflow run` command exits non-zero on any HTTP error. GitHub Actions will
mark the step as failed and the job as failed. The workflow_run in argus-mcp-catalog
will show as failed in the Actions tab.

### Common failure modes and mitigations

| Failure | Cause | Detection | Fix |
|---------|-------|-----------|-----|
| HTTP 401 | Token is invalid, expired, or not set | Step log: `HTTP 401` | Rotate and re-store DOCS_DISPATCH_TOKEN |
| HTTP 403 | Token exists but lacks `actions: write` on target repo | Step log: `HTTP 403` | Recreate token with correct scope |
| HTTP 404 | Workflow file not found at specified path or branch | Step log: `HTTP 404` | Verify `deploy.yml` exists on `main` in argus-mcp-docs |
| HTTP 422 | Workflow does not have `on: workflow_dispatch:` | Step log: `HTTP 422` | Confirm target workflow has the trigger (it does — verified) |
| Secret not set | `DOCS_DISPATCH_TOKEN` secret missing | `GH_TOKEN: ` is empty string; `gh` fails with auth error | Add the secret in repo settings |

### Recommended addition: explicit failure messaging

```yaml
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

This does not change failure behavior (the job still fails) but writes a human-readable
message to the log that survives log truncation better than a bare `gh` error.

### No retry logic needed

`workflow_dispatch` via the REST API is synchronous for the queuing step. Either the
run is queued (success) or it is not (failure). There is no partial-success state.
Adding automatic retries risks duplicate deploys on transient errors; do not add them.
The correct response to a failure is a human investigating and re-running.

---

## Chaining Strategy (after generate-index)

### Use `workflow_run`, not `needs`

`needs:` is for jobs within the same workflow file. It cannot reference jobs in a
different workflow or repository.

`workflow_run` is the correct mechanism to fire `notify-docs.yml` after
`generate-index.yml` completes. It runs in the same repository (argus-mcp-catalog)
but is triggered by the completion event of the upstream workflow.

### Important constraint

`workflow_run` only triggers when the workflow file that defines it is on the
**default branch** (main). If notify-docs.yml is merged to a feature branch but not
yet to main, it will not fire. This is expected behavior, not a bug.

### Three-workflow chain limit

GitHub enforces a maximum of three levels of workflow chaining via `workflow_run`.
This chain is:

```
generate-index.yml (argus-mcp-catalog)
  -> notify-docs.yml (argus-mcp-catalog, via workflow_run)
    -> deploy.yml (argus-mcp-docs, via workflow_dispatch REST call)
```

That is two levels of chaining, well within the limit.

### Alternative: embed dispatch step in generate-index.yml directly

If you want to minimize the number of workflow files, you can skip notify-docs.yml
entirely and add the dispatch step as a final job in generate-index.yml:

```yaml
# Inside generate-index.yml
jobs:
  generate:
    # ... existing index generation job ...

  notify-docs:
    needs: generate
    runs-on: ubuntu-latest
    steps:
      - name: Trigger argus-mcp-docs rebuild
        env:
          GH_TOKEN: ${{ secrets.DOCS_DISPATCH_TOKEN }}
        run: |
          gh workflow run deploy.yml \
            --repo diaz3618/argus-mcp-docs \
            --ref main
```

**Recommendation:** Use a separate `notify-docs.yml` rather than embedding. Reasons:
- Separation of concerns: generate-index does catalog work; notify-docs does
  cross-repo signaling. Easier to disable or modify independently.
- The `workflow_run` approach makes the dependency explicit and inspectable in
  the Actions tab without reading generate-index.yml source.
- If generate-index.yml ever has multiple jobs, `workflow_run: types: [completed]`
  fires only after the whole workflow finishes, not after individual jobs.

---

## Confidence Level

| Area | Confidence | Basis |
|------|------------|-------|
| workflow_dispatch over repository_dispatch | HIGH | Official docs + community confirmation; target already has the trigger |
| `gh` CLI as dispatch mechanism | HIGH | Pre-installed on ubuntu-latest runners; official GitHub tooling |
| Fine-grained PAT scope (`actions: write`) | HIGH | GitHub community discussion #58868 explicitly maps this endpoint to `actions: write` |
| `workflow_run` for chaining | HIGH | Official GitHub docs; same-repo trigger does not need PAT |
| Three-workflow chain limit | HIGH | Documented in GitHub Actions official docs |
| `workflow_run` default-branch requirement | HIGH | Documented in GitHub Actions official docs |
| HTTP error codes for failure modes | MEDIUM | Based on REST API spec + community reports; exact response bodies may vary |

---

## Sources

- [Triggering a workflow — GitHub Docs](https://docs.github.com/en/actions/using-workflows/triggering-a-workflow)
- [Events that trigger workflows: workflow_run — GitHub Docs](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#workflow_run)
- [GitHub community discussion #58868 — fine-grained PAT scopes for workflow dispatch vs repository dispatch](https://github.com/orgs/community/discussions/58868)
- [Elio Struyf — Dispatch a GitHub Action via a fine-grained PAT](https://www.eliostruyf.com/dispatch-github-action-fine-grained-personal-access-token/)
- [Kris the Coding Unicorn — Trigger GitHub workflow in different repo](https://www.kristhecodingunicorn.com/post/trigger-github-workflow-in-different-repo/)
- [OneUptime — How to Set Up Cross-Repository Workflows in GitHub Actions (Dec 2025)](https://oneuptime.com/blog/post/2025-12-20-cross-repository-workflows-github-actions/view)
- [Workflow Dispatch action — GitHub Marketplace (benc-uk/workflow-dispatch)](https://github.com/marketplace/actions/workflow-dispatch)
- [peter-evans/repository-dispatch — GitHub](https://github.com/peter-evans/repository-dispatch)
- [runs-on.com — Triggering a workflow from another workflow](https://runs-on.com/github-actions/triggering-a-workflow-from-another-workflow/)
