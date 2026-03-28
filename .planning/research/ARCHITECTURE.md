# Architecture Research — Next.js Static Build Verification

**Project:** argus-mcp-docs
**Researched:** 2026-03-28
**Next.js version:** 16.1.6 (exact, from package.json)
**Node.js requirement:** 24.x (engines field in package.json)
**Package manager:** pnpm@10.32.1

---

## Build Command & Environment Setup

### Pre-build step (required)

The GitHub Actions workflow runs a `post-process.sh` script before `pnpm run build`. This script compiles TypeScript scripts to CommonJS, patches import paths, and executes `scripts/content.ts` to generate search/content JSON. It must run locally too:

```bash
sh .husky/post-process.sh
```

This requires `tsx` and `tsc` to be available (both are devDependencies). If this step is skipped, the build may succeed but content indexes will be stale or missing.

### Build command with token

```bash
CATALOG_READ_TOKEN=ghp_your_token_here pnpm run build
```

Single-line inline env prefix is the correct approach for local testing. Do not export the token into the shell session if you can avoid it, to prevent it leaking to subprocesses or shell history. Alternatively:

```bash
# Write a local .env.local (Next.js loads this automatically at build time)
echo "CATALOG_READ_TOKEN=ghp_your_token_here" > .env.local
pnpm run build
# Remove afterward
rm .env.local
```

Next.js loads `.env.local` during `next build` for server-side code, so this works. The `.env.local` file should already be in `.gitignore` by Next.js convention — verify before writing it.

### Full local sequence matching CI exactly

```bash
cd /home/diaz/mygit/argus-mcp-docs
pnpm install --frozen-lockfile
sh .husky/post-process.sh
CATALOG_READ_TOKEN=ghp_your_token_here pnpm run build
```

The `post-process.sh` step compiles to `dist/scripts/` and then runs `node dist/scripts/scripts/content.mjs`. If TypeScript compilation fails (non-zero exit), the script exits early via `|| exit 1`.

---

## Expected Output Structure

With `output: 'export'`, `basePath: '/argus-mcp-docs'`, and `trailingSlash: true`, a successful build produces an `out/` directory. The basePath affects the HTML/JS references inside files but does NOT change the directory layout inside `out/`.

Expected directory tree (representative, not exhaustive):

```
out/
  index.html                          # root page
  404.html                            # not-found page
  docs/
    yaml-cookbook/
      filesystem-access/
        index.html                    # one file per category
      web-research/
        index.html
      databases/
        index.html
      ai-memory/
        index.html
      devops-integrations/
        index.html
      security-tools/
        index.html
      remote-sse/
        index.html
      remote-http/
        index.html
      remote-auth/
        index.html
      fully-isolated/
        index.html
    [[...slug]]/                      # catch-all docs routes
      ...
  _next/
    static/
      chunks/           # JS bundles
      css/              # Stylesheets
  sitemap.xml           # from app/sitemap.ts
  robots.txt            # from app/robots.ts
```

The `trailingSlash: true` setting means each route becomes `route/index.html` rather than `route.html`. This is correct for GitHub Pages serving.

The `start` script in package.json (`ln -sfn . out/argus-mcp-docs && npx serve@latest out -l 3000`) creates a symlink inside `out/` so that the `basePath` prefix resolves correctly when serving locally. Run it after a successful build to preview.

### Signs of a successful build in terminal output

```
Route (app)                              Size     First Load JS
┌ ○ /                                    ...
├ ○ /docs/yaml-cookbook/[category]       ...
│   ├ /docs/yaml-cookbook/filesystem-access
│   ├ /docs/yaml-cookbook/web-research
│   └ ... (all 10 categories)
└ ...
✓ Generating static pages (N/N)
✓ Collecting build traces
✓ Finalizing page optimization
```

Every route symbol should be `○` (static), never `ƒ` (dynamic/server). Any `ƒ` in the output means a route is not being statically exported and the build will likely error.

---

## Catalog Fetch Behavior (Success vs Failure)

### How the fetch chain works

`lib/catalog.ts` is the sole entrypoint for all catalog data. It is marked `import 'server-only'`, which means Next.js will throw a build error if it is ever imported in a Client Component — this is intentional and correct.

**Fetch chain at build time:**

1. `generateStaticParams()` in `[category]/page.tsx` calls `fetchCatalogIndex()`
2. `fetchCatalogIndex()` calls `octokit.repos.getContent({ path: 'catalog.json' })`
3. Octokit is initialized with `auth: process.env.CATALOG_READ_TOKEN` at module load time
4. If the token is missing or invalid, the GitHub API returns a 401/403, which Octokit throws as an error
5. The `try/catch` in `fetchCatalogIndex()` catches any thrown error and returns `{ categories: {}, updated_at: '' }`

**Success path:** `generateStaticParams()` returns the categories from `catalog.json`. The build generates one HTML file per category with real YAML configs rendered in.

**Failure path (token missing or API error):** `fetchCatalogIndex()` returns the empty fallback object. `generateStaticParams()` checks `categories.length > 0` — since it's 0, it falls through to the hardcoded `categoryLabels` keys and returns all 10 categories anyway. The build completes. Each category page renders with `configs = []` and shows the "No configurations available" empty state UI.

### Critical detail about token-absent behavior

When `CATALOG_READ_TOKEN` is not set, `process.env.CATALOG_READ_TOKEN` is `undefined`. Octokit is initialized with `auth: undefined`. GitHub's REST API requires authentication to access private repos. Without a token, the request to the private `argus-mcp-catalog` repo will receive a 404 (not 401) because unauthenticated requests cannot see private repos — they appear nonexistent. Octokit will throw `HttpError: Not Found` with status 404. The `catch` block in `fetchCatalogIndex()` logs a warning and returns the empty fallback.

This means: **a build with no token will succeed and produce all 10 category pages, each showing the empty state**.

### Per-file config fetch

`fetchCategoryConfigs()` uses `Promise.allSettled()`, so individual file fetch failures are isolated — a failure to fetch one YAML file does not prevent other files in the same category from rendering. Each rejected promise is logged as a warning and skipped.

---

## Graceful Fallback Analysis

| Condition | `fetchCatalogIndex()` result | `generateStaticParams()` result | Page render result |
|-----------|-----------------------------|---------------------------------|--------------------|
| Token set, API succeeds | Real `catalog.json` data | Dynamic list from API | Full configs rendered |
| Token set, API returns 404/500 | `{ categories: {}, updated_at: '' }` | Hardcoded 10 categories | Empty state UI per category |
| Token missing (undefined) | `{ categories: {}, updated_at: '' }` (404 caught) | Hardcoded 10 categories | Empty state UI per category |
| Token set, one YAML file fails | Partial — that file skipped | All categories still generated | Partial configs (missing file omitted) |
| `catalog.json` parse fails (malformed JSON) | `{ categories: {}, updated_at: '' }` | Hardcoded 10 categories | Empty state UI per category |

**The fallback is solid.** The build never hard-fails due to catalog fetch errors. However, there is one gap: the hardcoded `categoryLabels` in `page.tsx` and the fallback in `generateStaticParams()` must be kept in sync manually. If the catalog adds a new category that is not in `categoryLabels`, it will be fetched and included only when the API succeeds. If the API fails, that new category will not appear in the fallback list.

**Module-level singleton risk:** `_indexCache` is a module-level variable in `lib/catalog.ts`. During a single `next build` run this is fine — it prevents redundant API calls. Between build runs, Node.js module cache is cleared, so there is no staleness issue across deployments.

---

## Verification Checklist

### Before running the build

- [ ] `pnpm install --frozen-lockfile` completes with no errors
- [ ] `sh .husky/post-process.sh` exits 0 (check for TypeScript compilation errors)
- [ ] `dist/scripts/scripts/content.mjs` exists after the script runs
- [ ] `CATALOG_READ_TOKEN` is available (either inline or via `.env.local`)

### During the build

- [ ] Terminal shows `[catalog] Failed to fetch` warnings? If yes, token is invalid or API is down. Build will still succeed but pages will be empty.
- [ ] No route shows `ƒ` (dynamic) symbol in the route table — all should be `○` (static)
- [ ] `Generating static pages` counter reaches its final N without error
- [ ] No TypeScript errors (build will abort if type errors exist)

### After the build — checking `out/`

```bash
# Verify all 10 category pages were generated
ls out/docs/yaml-cookbook/

# Should print all 10:
# filesystem-access  web-research  databases  ai-memory  devops-integrations
# security-tools  remote-sse  remote-http  remote-auth  fully-isolated

# Verify each has an index.html
find out/docs/yaml-cookbook -name "index.html" | wc -l
# Should print: 10

# Verify _next/static directory exists and has content
ls out/_next/static/chunks/ | head -5

# Verify sitemap and robots
ls out/sitemap.xml out/robots.txt

# Spot-check a category page for real content (when token was valid)
grep -c "language-yaml" out/docs/yaml-cookbook/filesystem-access/index.html
# > 0 means real configs were embedded; 0 means empty state (token issue)
```

### Local preview

```bash
pnpm start
# Opens on http://localhost:3000
# Navigate to http://localhost:3000/argus-mcp-docs/docs/yaml-cookbook/filesystem-access/
# basePath symlink (created by the start script) makes this work correctly
```

### Distinguishing successful-with-data vs successful-but-empty

The build exit code is 0 in both cases. To confirm real data was fetched:

```bash
# Check for absence of the empty-state text in a category page
grep -l "No configurations available" out/docs/yaml-cookbook/*/index.html
# If this returns files, those categories have no data (empty state was rendered)
# If it returns nothing, all categories have real content
```

---

## Known Issues and Caveats

### `server-only` and static export

`import 'server-only'` in `lib/catalog.ts` works correctly with static export. During `next build`, server components run on Node.js (not in a browser context), so `server-only` does not trigger an error. It only triggers if a Client Component (`'use client'`) attempts to import the module — which would be a developer mistake caught at build time, not a runtime problem.

**Confidence:** HIGH — verified against Next.js 16.2.1 official docs (fetched 2026-03-25).

### No `dynamicParams` export in the category page

The `[category]/page.tsx` does not export `dynamicParams = false`. In static export mode (`output: 'export'`), Next.js implicitly treats all dynamic routes as requiring `generateStaticParams()` and does not support `dynamicParams: true` (runtime params). The current setup is correct — `generateStaticParams()` is always provided and always returns a non-empty array (either from API or from the hardcoded fallback), so no build error occurs.

### The `out/` directory in the repo currently appears incomplete

The current `out/` directory contains only `index.html` plus two WASM files — this is not a full build artifact. It appears to be a partial or manually-placed file. Running `pnpm run build` will overwrite and fully populate this directory.

### `post-process.sh` must precede `next build`

The `scripts/content.ts` script generates content JSON consumed by the docs routes (likely the `[[...slug]]` catch-all). Skipping it will cause the catch-all doc pages to fail or render with empty content, though it should not affect the catalog/yaml-cookbook routes specifically.

### Node.js version

The `package.json` `engines` field specifies `24.x`. The local environment is running Node.js v25.8.1 (visible from the earlier error output). This is newer than required and should be compatible, but if build errors occur, downgrading to Node 24 is the first thing to try.

---

## Confidence Level

| Area | Confidence | Basis |
|------|------------|-------|
| Static export behavior (server components, build-time fetch) | HIGH | Official Next.js 16.2.1 docs fetched 2026-03-25 |
| `generateStaticParams` fallback logic | HIGH | Direct code reading of `lib/catalog.ts` and `page.tsx` |
| Token-absent behavior (404 not 401) | HIGH | GitHub API behavior for private repos + Octokit error handling |
| `server-only` compatibility with static export | HIGH | Official docs confirm server components run on Node.js at build time |
| `post-process.sh` requirement | HIGH | Direct reading of deploy.yml workflow |
| `out/` directory structure with `trailingSlash: true` | HIGH | Official docs + `next.config.mjs` |
| Local preview with `pnpm start` basePath symlink | MEDIUM | Inferred from start script in package.json; not externally verified |

---

## Sources

- Next.js 16 Static Exports guide (version 16.2.1, fetched 2026-03-25): https://nextjs.org/docs/app/guides/static-exports
- Next.js empty-generate-static-params message docs: https://nextjs.org/docs/messages/empty-generate-static-params
- Next.js generateStaticParams API reference: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
- GitHub issue — generateStaticParams with output: export: https://github.com/vercel/next.js/issues/58171
- Code sources (read directly): `next.config.mjs`, `lib/catalog.ts`, `app/docs/yaml-cookbook/[category]/page.tsx`, `.github/workflows/deploy.yml`, `package.json`, `.husky/post-process.sh`
