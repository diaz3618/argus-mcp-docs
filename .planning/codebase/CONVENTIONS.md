# Coding Conventions

**Analysis Date:** 2026-03-28

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `Navbar.tsx`, `Card.tsx`)
- Utilities and hooks: camelCase (e.g., `useHash.ts`, `useTransitionRouter.ts`, `markdown.ts`)
- Pages and layouts: kebab-case with brackets for dynamic segments (e.g., `[[...slug]]`, `[category]`)
- Index/barrel files: lowercase (e.g., `index.tsx`)

**Functions:**
- Regular functions: camelCase (e.g., `helperSearch`, `calculateRelevance`, `extractSnippet`)
- Component functions: PascalCase (e.g., `Navbar`, `Card`, `ErrorBoundary`)
- Hooks: camelCase with `use` prefix (e.g., `useHash`, `useSetFinishViewTransition`)
- Internal helpers: camelCase with function description (e.g., `memoize`, `formatDateHelper`)

**Variables:**
- Constants: camelCase or UPPER_SNAKE_CASE when appropriate (e.g., `const maxDistance = 5`, `cache`, `searchData`)
- Boolean variables: prefix with `is`, `has`, or `should` (e.g., `isRoute`, `parentHas`, `isMatch`)
- Component props: camelCase with descriptive names (e.g., `activeClassName`, `disabled`, `variant`)

**Types:**
- Interface names: PascalCase (e.g., `SearchMeta`, `SearchDocument`, `CardProps`, `AnchorProps`)
- Type unions: PascalCase (e.g., `Paths`)
- Generic type parameters: single uppercase letters or descriptive PascalCase (e.g., `T`, `Frontmatter`)

## Code Style

**Formatting:**
- Line width: 100 characters
- Indentation: 2 spaces
- Line endings: LF
- Quote style: Single quotes for strings, double quotes for JSX attributes
- Trailing commas: ES5 (commas where valid in ES5)

**Linting:**
- Tool: Biome (2.4.6)
- Semicolons: asNeeded (automatic insertion not required)
- Arrow parentheses: always (required for all arrow functions)
- Bracket spacing: true (spaces inside braces)
- No CommonJS: enforced as error
- No var: enforced as error, use const/let only

**Key Rules Enforced:**
- No explicit `any` types without `// biome-ignore lint/suspicious/noExplicitAny` comment
- No unused variables (error level)
- No unreachable code (error level)
- No empty block statements (error level)
- No duplicate class members (error level)
- Consistent type definitions: use `type` over `interface` by default (enforced)
- Use `const` for all variables (enforced as error in TypeScript files)

## Import Organization

**Order:**
1. External dependencies (React, Next.js, third-party libraries)
2. Internal absolute imports (using `@/` alias)
3. Relative imports (using `./` or `../`)

**Pattern:**
```typescript
import { useState } from 'react'
import Link from 'next/link'
import { LuArrowUpRight } from 'react-icons/lu'

import { cn } from '@/lib/utils'
import { PageRoutes } from '@/lib/pageroutes'
import Anchor from '@/components/anchor'

import { Logo } from './logo'
```

**Path Aliases:**
- `@/` - root directory alias for absolute imports
- `lib/transition` - can be imported as `import { Link } from 'lib/transition'` (defined in tsconfig)

**Organize Imports:**
- Biome assist feature enabled for automatic import organization via `--write` flag
- Run `pnpm clean` to auto-organize and format all imports

## Error Handling

**Patterns:**
- Try-catch blocks for async operations and third-party library calls
- Console logging for error debugging (e.g., `console.error(error)`)
- Return `null` on error in async functions when graceful degradation is needed (see `lib/markdown.ts:68-99`)
- Error boundaries used for React component error handling (see `app/error.tsx`)
- Biome-ignore comments for intentional error suppression with clear reason:
  ```typescript
  // biome-ignore lint/suspicious/noExplicitAny: third-party library returns any
  function memoize<T extends (...args: any[]) => any>(fn: T): T { ... }
  ```

**Example Error Handling (from `lib/markdown.ts`):**
```typescript
export async function getDocument(slug: string) {
  try {
    const contentPath = getDocumentPath(slug)
    // ... operation logic
    return {
      frontmatter: parsedMdx.frontmatter,
      content: parsedMdx.content,
      tocs,
      lastUpdated,
    }
  } catch (err) {
    console.error(err)
    return null
  }
}
```

## Logging

**Framework:** console methods (native browser/Node.js)

**Patterns:**
- `console.error()` for errors and exceptions
- Error logging in catch blocks and effect cleanup
- Example from `app/error.tsx`:
  ```typescript
  useEffect(() => {
    console.error(error)
  }, [error])
  ```
- Example from `components/markdown/mermaid.tsx`:
  ```typescript
  try {
    mermaid.contentLoaded()
  } catch (error) {
    console.error('Mermaid diagram render error:', error)
  }
  ```

## Comments

**When to Comment:**
- Complex algorithms (e.g., Levenshtein distance calculation in `lib/utils.ts`)
- Non-obvious logic that requires context
- Biome-ignore directives for intentional rule suppression

**JSDoc/TSDoc:**
- Not heavily used in this codebase
- Type annotations preferred over JSDoc for TypeScript
- Comments kept minimal and focused on "why" not "what"

## Function Design

**Size:** Functions are generally compact (10-50 lines), with longer algorithms broken into smaller helpers

**Parameters:**
- Destructured object parameters for components (e.g., `{ title, description, href, ...props }`)
- Separate typed parameters for utility functions (e.g., `function helperSearch(query, node, prefix, currentLevel, maxLevel?)`)
- Optional parameters use trailing `?` in type definitions

**Return Values:**
- Components return JSX.Element implicitly
- Async functions return typed promises (e.g., `Promise<Document | null>`)
- Utility functions return specific types (e.g., `number`, `string[]`, `search[]`)
- Hooks return state tuple or single value (e.g., `useHash() returns string`)

## Module Design

**Exports:**
- Named exports for utilities and functions (e.g., `export function cn()`, `export function helperSearch()`)
- Default export for React components (e.g., `export default function Navbar()`)
- Type exports when exposing interfaces (e.g., `export interface CardProps`)

**Barrel Files:**
- Used in `lib/components.ts` to centralize MDX component mappings
- Pattern: single file re-exporting related components/utilities
- Example from `lib/components.ts`:
  ```typescript
  export const components = {
    a: RoutedLink,
    Card,
    CardGrid,
    FileTree,
    Folder,
    File,
    Mermaid,
    Note,
    pre: Pre,
    Step,
    StepItem,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  }
  ```

## Type Safety

**General Rules:**
- Strict TypeScript (no `any` without biome-ignore)
- Discriminated unions for complex prop types (e.g., `Paths` type in `lib/pageroutes.ts`)
- Type guards for runtime type checking:
  ```typescript
  function isRoute(node: Paths): node is Extract<Paths, { href: string; title: string }> {
    return 'href' in node && 'title' in node
  }
  ```

**Component Props:**
- Props typed as interfaces ending in `Props` (e.g., `CardProps`, `AnchorProps`)
- Use `PropsWithChildren` for components accepting children
- Optional props marked with `?`
- Defaults provided in function signatures

## Class and Object Conventions

**CSS Classes:**
- Tailwind CSS utilities (e.g., `className="flex min-h-[86.5vh] flex-col"`)
- Class merging via `cn()` utility from `clsx` and `tailwind-merge`
- Dark mode support via Tailwind's `dark:` prefix (e.g., `dark:bg-neutral-900`)

**Object Patterns:**
- Spread operator used extensively for prop forwarding: `{...props}`
- Object mutation avoided, prefer spread for new objects: `{ ...node, items: undefined }`
- Settings imported from centralized config (e.g., `Settings` from `@/types/settings`)

---

*Convention analysis: 2026-03-28*
