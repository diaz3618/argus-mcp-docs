# Codebase Structure

**Analysis Date:** 2026-03-28

## Directory Layout

```
argus-mcp-docs/
├── app/                          # Next.js App Router pages and layouts
│   ├── docs/
│   │   ├── [[...slug]]/          # Dynamic docs page (catch-all route)
│   │   ├── yaml-cookbook/        # Special section for YAML examples
│   │   └── layout.tsx            # Docs section layout with sidebar
│   ├── layout.tsx                # Root layout with Providers, Navbar, Footer
│   ├── page.tsx                  # Home page
│   ├── error.tsx                 # Global error page
│   ├── not-found.tsx             # 404 page
│   ├── robots.ts                 # SEO robots metadata
│   └── sitemap.ts                # SEO sitemap generation
├── components/                   # React components
│   ├── ui/                       # Shadcn/ui base components
│   │   ├── button.tsx, dialog.tsx, tabs.tsx, etc.
│   ├── navigation/               # Header navigation components
│   │   ├── navbar.tsx            # Top navigation bar
│   │   ├── footer.tsx            # Footer
│   │   ├── logo.tsx              # Logo component
│   │   └── search.tsx            # Search input and results
│   ├── sidebar/                  # Document navigation
│   │   ├── index.tsx             # Sidebar container
│   │   ├── pagemenu.tsx          # Document tree menu
│   │   └── sublink.tsx           # Menu item with nested items
│   ├── markdown/                 # Custom markdown/MDX components
│   │   ├── note.tsx              # Alert/callout boxes
│   │   ├── card.tsx              # Card layout component
│   │   ├── mermaid.tsx           # Diagram rendering
│   │   ├── step.tsx              # Tutorial step components
│   │   ├── filetree/             # File structure visualization
│   │   ├── copy.tsx              # Copy to clipboard button
│   │   └── link.tsx              # Custom link with transitions
│   ├── article/                  # Article/doc specific components
│   │   ├── breadcrumb.tsx        # Breadcrumb navigation
│   │   └── pagination.tsx        # Previous/next article links
│   ├── toc/                      # Table of contents
│   │   ├── index.tsx             # TOC container
│   │   ├── anchor.tsx            # TOC link
│   │   ├── backtotop.tsx         # Scroll to top button
│   │   └── feedback.tsx          # Feedback widget
│   ├── anchor.tsx                # Generic anchor component
│   └── theme-toggle.tsx          # Light/dark mode toggle
├── lib/                          # Core utilities and helpers
│   ├── markdown.ts               # MDX loading, parsing, compilation
│   ├── pageroutes.ts             # Route tree flattening logic
│   ├── components.ts             # MDX component registry
│   ├── catalog.ts                # Content catalog/index
│   ├── utils.ts                  # Search, formatting, CSS utilities
│   └── transition/               # Client-side transition system
│       ├── index.tsx             # Public API (exports)
│       ├── link.tsx              # Custom Link with transition intercept
│       ├── transition-context.tsx # ViewTransitions provider
│       ├── use-transition-router.ts # Hook for transition navigation
│       ├── use-hash.ts           # Hash location handling
│       └── browser-native.ts     # Native transition API
├── providers/                    # Context providers
│   └── index.tsx                 # Combines all providers (Theme, ViewTransitions)
├── settings/                     # Configuration
│   ├── main.ts                   # Site metadata, URLs, feature flags
│   ├── documents.ts              # Document structure/hierarchy (Routes)
│   ├── navigation.ts             # Header navigation links
│   └── icons.ts                  # Icon definitions
├── types/                        # TypeScript type definitions
│   ├── settings.ts               # AppSettings interface
│   └── opengraph.ts              # OpenGraph and Twitter card types
├── styles/                       # Global CSS
│   └── globals.css               # Tailwind, theme variables, typography
├── public/                       # Static assets
│   ├── search-data/              # Generated search index (JSON)
│   └── [images, icons, etc.]
├── scripts/                      # Build/utility scripts
│   └── content.ts                # Generate search index from MDX files
├── contents/                     # Source markdown/MDX files
│   └── docs/                     # Documentation content
│       ├── getting-started/
│       ├── configuration/
│       ├── api-reference/
│       ├── audit/
│       ├── middleware/
│       └── [other doc sections]/
├── utils/                        # Utility functions
│   └── toTitleCase.ts            # String formatting helper
├── .planning/                    # GSD planning documents
│   └── codebase/                 # Architecture and codebase analysis
├── next.config.mjs               # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── biome.json                    # Biome linter/formatter config
├── components.json               # Shadcn/ui configuration
├── package.json                  # Dependencies and scripts
├── pnpm-lock.yaml                # Lock file for pnpm
└── README.md                     # Project documentation
```

## Directory Purposes

**app/**
- Purpose: Next.js App Router pages, layouts, and API routes
- Contains: Page components (TSX), layout wrappers, error boundaries
- Key structure: App Router uses file-based routing where filenames become routes

**components/**
- Purpose: Reusable React components organized by domain
- Contains: UI primitives (button, dialog, tabs), navigation, content rendering
- Organization: UI library components in `ui/`, feature-specific in subdirectories
- Pattern: Single Responsibility - each component focuses on one concern

**lib/**
- Purpose: Core business logic, utilities, and helpers
- Contains: Document loading, markdown processing, search, navigation helpers
- Key: `markdown.ts` handles complex MDX compilation with plugins
- Usage: Imported by components and pages via `@/lib/...` alias

**settings/**
- Purpose: Configuration and content structure definitions
- Contains: Site metadata, document hierarchy, navigation menus
- Key: `documents.ts` defines the document tree structure used throughout the site

**providers/**
- Purpose: Context providers and global state
- Contains: Theme provider, view transitions provider
- Key: Single `Providers` component wraps entire app in `app/layout.tsx`

**styles/**
- Purpose: Global and shared CSS
- Contains: Tailwind CSS configuration, custom theme variables
- CSS Variables: Define color scheme, used by all components

**public/**
- Purpose: Static assets served directly by Next.js
- Contains: Images, icons, pre-generated search index JSON
- Search data: `search-data/documents.json` generated by `scripts/content.ts`

**scripts/**
- Purpose: Build-time utilities
- Contains: `content.ts` - generates search index from MDX files
- Execution: Run via `pnpm generate-content-json` before build

**contents/docs/**
- Purpose: Source markdown/MDX documentation files
- Contains: Organized by section (getting-started, configuration, etc.)
- File structure: Each doc is in `contents/docs/{category}/{subcategory}/index.mdx`
- Frontmatter: YAML frontmatter with title, description, keywords

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout wrapping entire app
- `app/page.tsx`: Home page
- `app/docs/[[...slug]]/page.tsx`: Dynamic documentation page handler
- `next.config.mjs`: Next.js configuration (exports as static site)

**Configuration:**
- `package.json`: Dependencies, scripts, Node version requirement
- `tsconfig.json`: TypeScript compiler options with path aliases (`@/*`)
- `biome.json`: Linting and formatting rules
- `next.config.mjs`: Static export config, base path, image optimization
- `settings/main.ts`: Site metadata, URLs, feature flags
- `settings/documents.ts`: Document structure/hierarchy

**Core Logic:**
- `lib/markdown.ts`: Document loading and MDX compilation pipeline
- `lib/pageroutes.ts`: Route tree flattening for navigation
- `lib/utils.ts`: Search algorithms, string formatting, CSS utilities
- `lib/components.ts`: MDX component registry mapping

**Testing:**
- No test files present in codebase

## Naming Conventions

**Files:**
- Component files: camelCase with `.tsx` extension (e.g., `navbar.tsx`, `breadcrumb.tsx`)
- Utility files: camelCase with `.ts` extension (e.g., `markdown.ts`, `utils.ts`)
- Page files: lowercase `page.tsx` (Next.js convention)
- Layout files: lowercase `layout.tsx` (Next.js convention)

**Directories:**
- Feature directories: lowercase (e.g., `navigation/`, `markdown/`, `sidebar/`)
- Dynamic routes: bracket syntax (e.g., `[[...slug]]/`, `[category]/`)
- Index files: `index.tsx` for barrel exports

**Components:**
- React components: PascalCase (e.g., `Navbar`, `ArticleBreadcrumb`, `TableOfContents`)
- Helper functions: camelCase (e.g., `getDocument`, `helperSearch`, `innerslug`)
- Types/Interfaces: PascalCase (e.g., `BaseMdxFrontmatter`, `AppSettings`, `Paths`)

**Variables & Functions:**
- Local variables: camelCase (e.g., `contentPath`, `rawMdx`, `slug`)
- Constants: camelCase or UPPER_SNAKE_CASE for globals
- React hooks: Start with `use` (e.g., `useTransitionRouter`, `useHash`)

## Where to Add New Code

**New Documentation Page:**
1. Create directory: `contents/docs/{category}/{subcategory}/`
2. Create file: `index.mdx` with YAML frontmatter (title, description, keywords)
3. Add route to: `settings/documents.ts` in appropriate hierarchy
4. Run: `pnpm generate-content-json` to update search index

**New Feature Component:**
1. Create in: `components/{feature-name}/` directory
2. If reusable UI primitive: place in `components/ui/`
3. If markdown-specific: place in `components/markdown/`
4. If navigation-related: place in `components/navigation/`

**New Utility Function:**
1. Small utilities: Add to `lib/utils.ts`
2. Domain-specific: Create `lib/{domain}.ts`
3. For markdown: Add to `lib/markdown.ts` or `lib/components.ts`

**New Settings/Configuration:**
1. Site metadata: `settings/main.ts`
2. Document structure: `settings/documents.ts`
3. Navigation menus: `settings/navigation.ts`
4. Type definitions: Create in `types/{domain}.ts`

**New Page/Route:**
1. Create file in `app/` directory following App Router pattern
2. Use bracket syntax for dynamic segments: `app/[param]/page.tsx`
3. Use `[[...slug]]` for catch-all routes
4. Add layout wrapper if needed: `layout.tsx` at directory level

## Special Directories

**contents/docs/:**
- Purpose: Source markdown/MDX files for documentation
- Generated: No - manually authored
- Committed: Yes - part of repository

**public/search-data/:**
- Purpose: Pre-generated search index
- Generated: Yes - via `pnpm generate-content-json` from `scripts/content.ts`
- Committed: Yes - checked in for production builds

**.planning/codebase/:**
- Purpose: Architecture and codebase analysis documents
- Generated: Yes - by GSD mapping tools
- Committed: Yes - for team reference

**.next/:**
- Purpose: Next.js build output cache
- Generated: Yes - automatically during build
- Committed: No - added to .gitignore

**node_modules/:**
- Purpose: Installed dependencies
- Generated: Yes - via `pnpm install`
- Committed: No - added to .gitignore

---

*Structure analysis: 2026-03-28*
