# External Integrations

**Analysis Date:** 2026-03-28

## APIs & External Services

**GitHub API:**
- Service: GitHub REST API
  - What it's used for: Fetch catalog index and configuration files from GitHub repository
  - SDK/Client: @octokit/rest 22.0.1 - Official GitHub API client
  - Auth: Environment variable `CATALOG_READ_TOKEN`
  - Usage: `lib/catalog.ts` functions `fetchCatalogIndex()` and `fetchCategoryConfigs()`
  - Repository: `argus-mcp-catalog` owned by user `diaz3618`
  - Data fetched: YAML configuration files for MCP (Model Context Protocol) categories

**Google Analytics:**
- Service: Google Tag Manager (GTM)
  - SDK/Client: @next/third-parties/google 16.1.6 - Next.js Google integration
  - Tag: `GTM-XXXXXXX` (placeholder, disabled via `gtmconnected: false` in settings)
  - Implementation: `GoogleTagManager` component in `app/layout.tsx`
  - Status: Currently disabled/not connected

## Data Storage

**Databases:**
- Not applicable - Static documentation site with no persistent data storage

**File Storage:**
- Local filesystem only
  - MDX content files: `contents/docs/` directory
  - Generated JSON index: `public/search-data/documents.json` (generated at build time)
  - Static assets: `public/` directory

**Caching:**
- In-memory caching for GitHub catalog data
  - Implementation: `_indexCache` variable in `lib/catalog.ts`
  - Cache pattern: Check-before-fetch on `fetchCatalogIndex()`
  - Scope: Application instance lifetime

## Authentication & Identity

**GitHub API Authentication:**
- Type: Token-based authentication
  - Environment Variable: `CATALOG_READ_TOKEN`
  - Scope: Repository read access to `diaz3618/argus-mcp-catalog`
  - Implementation: Passed to Octokit constructor in `lib/catalog.ts` line 5-6

**User Authentication:**
- Not applicable - Public documentation site with no user accounts

## Monitoring & Observability

**Error Tracking:**
- Not integrated - No external error tracking service configured

**Logs:**
- Console-based logging
  - Warnings: `console.warn()` for catalog fetch failures in `lib/catalog.ts`
  - Errors: Standard Node.js error logging for build-time processes
  - No centralized logging system

## CI/CD & Deployment

**Hosting:**
- GitHub Pages (inferred from deployment URL structure)
  - Base URL: `https://diaz3618.github.io/argus-mcp-docs`
  - Deployment method: Static export from Next.js

**CI Pipeline:**
- Not detected in codebase - Likely managed via GitHub Actions (separate repo/workflow)

**Build Output:**
- Static HTML/CSS/JS export to `out/` directory
- Served via `serve@latest` package in development (`npm start` script)

## Environment Configuration

**Required Environment Variables:**
- `CATALOG_READ_TOKEN` - GitHub personal access token for reading catalog repository
  - Scope: Read access to https://github.com/diaz3618/argus-mcp-catalog
  - Used by: `lib/catalog.ts`

**Optional Configuration:**
- Google Tag Manager tag (currently disabled, set to placeholder `GTM-XXXXXXX`)
- All other settings defined in `settings/main.ts` are hardcoded

**Configuration Files:**
- `settings/main.ts` - Static configuration
  - Site metadata (name, URL, description)
  - Feature flags (table of contents, feedback, scrolling, etc.)
  - Social media metadata (Twitter, OpenGraph)
  - Company information

## Webhooks & Callbacks

**Incoming:**
- Not applicable - Static site with no incoming webhooks

**Outgoing:**
- Not detected - No outgoing webhook integrations

## Content Source

**Documentation Content:**
- Source: Local MDX files in `contents/docs/`
- Processing: Build-time MDX compilation via `next-mdx-remote`
- Search Index: Generated at build time via `scripts/content.ts` → `public/search-data/documents.json`

**Catalog Data:**
- Source: GitHub repository (diaz3618/argus-mcp-catalog)
- Fetched at: Runtime (server-side rendering)
- Format: YAML configuration files with metadata
- Cache: In-memory on first access

## External Links

**GitHub References:**
- Main Repository: https://github.com/diaz3618/argus-mcp (reference link in navbar)
- Catalog Repository: https://github.com/diaz3618/argus-mcp-catalog (reference link in navbar)
- Used for: Navigation and source code discovery

---

*Integration audit: 2026-03-28*
