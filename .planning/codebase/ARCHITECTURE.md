# Architecture

**Analysis Date:** 2026-03-28

## Pattern Overview

**Overall:** Server-Side Rendering (SSR) Static Documentation Site with Content-Driven Architecture

**Key Characteristics:**
- Next.js 16 App Router with static generation for MDX documentation
- Markdown/MDX-driven content with flexible rendering pipeline
- Client-side search and navigation enhancements
- Theme support (light/dark) with client-side state management
- Flexible content loading strategy (local filesystem or GitHub)

## Layers

**Presentation Layer:**
- Purpose: Render UI components and handle client interactions
- Location: `components/` directory
- Contains: React components (UI, navigation, markdown renderers)
- Depends on: `lib/utils`, `lib/components`, settings configuration
- Used by: App routes and layouts

**Content Layer:**
- Purpose: Load, parse, and prepare markdown documents for rendering
- Location: `lib/markdown.ts`, `scripts/content.ts`
- Contains: MDX compilation, frontmatter parsing, table of contents extraction
- Depends on: `next-mdx-remote`, remark/rehype plugins, file system
- Used by: Dynamic route handler (`app/docs/[[...slug]]/page.tsx`)

**Routing & Navigation Layer:**
- Purpose: Manage document structure and navigation paths
- Location: `lib/pageroutes.ts`, `settings/documents.ts`, `settings/navigation.ts`
- Contains: Route definitions, path flattening, navigation hierarchy
- Depends on: Document structure from settings
- Used by: Sidebar, pagination, breadcrumbs, static generation

**Utility & Service Layer:**
- Purpose: Provide reusable functions for search, formatting, and UI helpers
- Location: `lib/utils.ts`, `utils/toTitleCase.ts`
- Contains: Search algorithms (Levenshtein distance), date formatting, CSS utilities (cn function)
- Depends on: clsx, tailwind-merge
- Used by: Components, search functionality

**Configuration & Settings Layer:**
- Purpose: Centralize application settings and customization
- Location: `settings/` and `types/`
- Contains: Site metadata, social links, document structure, theme settings
- Depends on: None (read-only)
- Used by: All layers for consistent configuration

**Theme & Provider Layer:**
- Purpose: Manage application-wide state (theme, transitions)
- Location: `providers/`, `lib/transition/`
- Contains: Theme provider, view transitions context
- Depends on: `next-themes`, React context
- Used by: Root layout

## Data Flow

**Documentation Rendering Flow:**

1. User requests `/docs/{path}`
2. Next.js routes to `app/docs/[[...slug]]/page.tsx`
3. `getDocument(slug)` in `lib/markdown.ts` loads MDX:
   - If `Settings.gitload` is true: fetches from GitHub raw content
   - Otherwise: reads from local filesystem at `contents/docs/{slug}/index.mdx`
4. MDX is compiled with `compileMDX` with custom rehype/remark plugins
5. Plugins extract table of contents via `getTable(slug)`
6. Content is rendered with custom components from `lib/components.ts`
7. Layout components (`ArticleBreadcrumb`, `TableOfContents`, `Pagination`) are added
8. Static params generated via `generateStaticParams()` from `PageRoutes`

**Search Flow:**

1. User types in search input (`components/navigation/search.tsx`)
2. Input triggers `advanceSearch(query)` from `lib/utils.ts`
3. Search data loaded from `public/search-data/documents.json`
4. Algorithm calculates relevance score using:
   - Title matching (exact, substring, word matching)
   - Heading matching with hierarchy consideration
   - Keyword matching from frontmatter
   - Content proximity scoring
   - Result relevance ranking
5. Results sliced to top 10 and returned

**Navigation Flow:**

1. Routes defined in `settings/documents.ts` as hierarchical `Paths` structure
2. `lib/pageroutes.ts` flattens nested structure into `PageRoutes` array
3. Used by:
   - Sidebar for nested menu display
   - Breadcrumb generation from slug
   - Pagination (previous/next links)
   - Static page generation

**State Management:**

- **Theme State:** Managed by `next-themes` provider, persisted to localStorage
- **View Transitions:** Managed by custom context in `lib/transition/transition-context.tsx`
- **Client-Side Navigation:** View transitions intercept link clicks via `Link` component from `lib/transition/link.tsx`
- **Search State:** Component-level in search component, no global state

## Key Abstractions

**Document Model:**
- Purpose: Represents a markdown document with metadata
- Files: `lib/markdown.ts`
- Pattern: Async function returns object with `{ frontmatter, content, tocs, lastUpdated }`
- Frontmatter interface: `BaseMdxFrontmatter` with `title`, `description`, `keywords`

**Routes/Paths Structure:**
- Purpose: Define hierarchical navigation structure
- Files: `lib/pageroutes.ts`
- Pattern: Recursive tree structure where routes can have nested `items`, rendered as `<Paths[]>`
- Flattening: `PageRoutes` converts nested tree to flat array for iteration

**MDX Components Registry:**
- Purpose: Map markdown elements to custom React components
- Files: `lib/components.ts`
- Pattern: Object with lowercase keys (HTML tags) and capitalized keys (custom components)
- Examples:
  - `a`: `RoutedLink` (custom link handling)
  - `Card`, `Note`, `FileTree`: Custom documentation components
  - `Mermaid`: Diagram rendering
  - `Step`/`StepItem`: Tutorial steps

**Search Algorithm:**
- Purpose: Rank document relevance based on query
- Files: `lib/utils.ts`
- Pattern: Multi-factor scoring system (title, headings, keywords, content, proximity)
- Edit distance: Levenshtein distance with memoization for fuzzy matching

**Settings Object:**
- Purpose: Single source of truth for app configuration
- Files: `types/settings.ts`, `settings/main.ts`
- Pattern: Immutable object created from imported constants
- Includes: Site metadata, social links, feature flags, theme options

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Every page render
- Responsibilities:
  - Wraps entire app with `Providers` (theme, transitions)
  - Configures metadata
  - Renders persistent `Navbar` and `Footer`

**Home Page:**
- Location: `app/page.tsx`
- Triggers: `/` route
- Responsibilities: Hero section with CTA to get started

**Documentation Pages:**
- Location: `app/docs/[[...slug]]/page.tsx`
- Triggers: `/docs/*` routes
- Responsibilities:
  - Loads document via `getDocument(slug)`
  - Renders metadata dynamically via `generateMetadata()`
  - Generates static pages via `generateStaticParams()`
  - Composes main article, breadcrumb, TOC, and pagination

**Sitemap & Robots:**
- Location: `app/sitemap.ts`, `app/robots.ts`
- Triggers: `/sitemap.xml`, `/robots.txt`
- Responsibilities: SEO metadata generation

## Error Handling

**Strategy:** Graceful degradation with fallback to 404

**Patterns:**
- `getDocument()` returns `null` on error, triggers `notFound()` in page component
- Try/catch blocks log errors but don't throw
- Fallback: `app/not-found.tsx` for missing documents
- Error page: `app/error.tsx` for runtime errors

## Cross-Cutting Concerns

**Logging:**
- Strategy: console.error() for document load failures
- Minimal logging - only errors, no verbose logging
- Used in `lib/markdown.ts` for GitHub fetch and filesystem read errors

**Validation:**
- Type-based validation via TypeScript
- Frontmatter shape validation through type inference in `compileMDX<BaseMdxFrontmatter>`
- Search query minimum word length (3 chars) to prevent noise

**Authentication:**
- Not applicable - public documentation site
- GitHub link is public; no auth required for content fetching

**SEO:**
- Static generation via `generateStaticParams()` for pre-rendering all pages
- Dynamic metadata per page via `generateMetadata()`
- OpenGraph and Twitter cards configured in `Settings`
- Canonical URLs included in metadata
- Sitemap generation in `app/sitemap.ts`

---

*Architecture analysis: 2026-03-28*
