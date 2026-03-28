# Technology Stack

**Analysis Date:** 2026-03-28

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code, configuration, and build scripts
- JavaScript (JSX/TSX) - React components and Next.js pages

**Secondary:**
- YAML - Configuration files and documentation metadata (via `js-yaml` 4.1.1)

## Runtime

**Environment:**
- Node.js 24.x (specified in `engines` in `package.json`)

**Package Manager:**
- pnpm 10.32.1
- Lockfile: `pnpm-lock.yaml` (managed by pnpm)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with server-side rendering and static generation
  - Output: Static export mode (`output: 'export'` in `next.config.mjs`)
  - Base path: `/argus-mcp-docs` for deployment
  - Turbopack enabled for development (`next dev --turbopack`)

**UI Framework:**
- React 19.2.4 - Component library
- React DOM 19.2.4 - DOM rendering

**Styling:**
- Tailwind CSS 4.2.1 - Utility-first CSS framework
- @tailwindcss/postcss 4.2.1 - PostCSS plugin for Tailwind
- PostCSS 8.5.8 - CSS processing
- tailwind-merge 3.5.0 - Merge Tailwind class names
- tailwindcss-animate 1.0.7 - Animation utilities
- tw-animate-css 1.4.4 - CSS animation support
- @tailwindcss/typography 0.5.19 - Typography plugin for styled content

**Component Library:**
- Radix UI (multiple packages)
  - @radix-ui/react-accordion 1.2.12
  - @radix-ui/react-collapsible 1.1.12
  - @radix-ui/react-dialog 1.1.15
  - @radix-ui/react-dropdown-menu 2.1.16
  - @radix-ui/react-scroll-area 1.2.10
  - @radix-ui/react-separator 1.1.8
  - @radix-ui/react-slot 1.2.4
  - @radix-ui/react-tabs 1.1.13
- class-variance-authority 0.7.1 - Type-safe component variants
- react-icons 5.6.0 - Icon library

## Markdown & Content Processing

**Markdown Compilation:**
- next-mdx-remote 6.0.0 - Process MDX files server-side
- gray-matter 4.0.3 - Parse YAML frontmatter from markdown

**Markdown Parsing & Transformation:**
- unified 11.0.5 - Text processing ecosystem
- remark-parse 11.0.0 - Parse markdown to AST
- remark-stringify 11.0.0 - Convert AST back to markdown
- remark-gfm 4.0.1 - GitHub Flavored Markdown support
- remark-mdx 3.1.1 - MDX support in remark pipeline

**HTML Processing (Rehype):**
- rehype-slug 6.0.0 - Add slugs to headings
- rehype-autolink-headings 7.1.0 - Auto-linkify headings
- rehype-code-titles 1.2.1 - Parse code block titles
- rehype-katex 7.0.1 - LaTeX math rendering
- rehype-prism-plus 2.0.2 - Syntax highlighting with Prism

**AST Utilities:**
- unist-util-visit 5.1.0 - Traverse and transform AST nodes

## Additional Utilities

**Diagram/Visualization:**
- mermaid 11.13.0 - Diagram and flowchart generation

**Theme Management:**
- next-themes 0.4.6 - Dark/light mode switching

**UI Utilities:**
- clsx 2.1.1 - Conditional className builder

**Build & Development:**
- tsx 4.21.0 - Execute TypeScript files directly (used for `scripts/content.ts`)

## Linting & Formatting

**Linting & Formatting:**
- @biomejs/biome 2.4.6 - All-in-one linter and formatter
  - Config: `biome.json` at root
  - Replaces ESLint, Prettier, and other tools
  - Rules: Complexity, correctness, performance, style, suspicious categories enabled
  - JavaScript formatting: Single quotes, 2-space indent, no semicolons

**Type Checking:**
- typescript-eslint 8.57.0 - TypeScript support in linting

## Git Hooks

**Pre-commit:**
- husky 9.1.7 - Git hooks manager
  - Hook: `prepare` script in package.json

## Configuration Files

**TypeScript:**
- `tsconfig.json` - Main TypeScript configuration
  - Target: ES next
  - Module resolution: node
  - Strict mode enabled
  - Base path: `.` with alias `@/*` pointing to root
- `tsconfig.scripts.json` - Separate config for build scripts

**Build:**
- `next.config.mjs` - Next.js configuration
  - Static export mode enabled
  - Base path: `/argus-mcp-docs`
  - Trailing slashes enabled
  - Images: unoptimized (no Next.js image optimization)
- `postcss.config.mjs` - PostCSS configuration with Tailwind plugin

**Code Quality:**
- `biome.json` - Biome linter and formatter configuration (13KB+)

## Environment Requirements

**Development:**
- Node.js 24.x
- pnpm 10.32.1
- Modern browser with ES next support

**Production:**
- Static hosting platform (GitHub Pages, Vercel, Netlify, etc.)
- No server runtime required (fully static)

---

*Stack analysis: 2026-03-28*
