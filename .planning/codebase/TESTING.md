# Testing Patterns

**Analysis Date:** 2026-03-28

## Test Framework

**Runner:**
- Not detected in current configuration
- Package.json contains no test runner dependencies (Jest, Vitest, etc.)

**Assertion Library:**
- Not applicable - no test infrastructure configured

**Run Commands:**
- No test scripts defined in `package.json`
- Current scripts: `dev`, `build`, `start`, `clean`, `update`, `generate-content-json`, `prepare`

## Test File Organization

**Location:**
- No test files found in source directory (`/app`, `/components`, `/lib`)
- Test infrastructure not set up in this codebase

**Naming:**
- Convention would follow `*.test.ts` or `*.spec.ts` pattern (not implemented)

**Structure:**
- No test directories configured

## Testing Coverage

**Current Status:**
- Not applicable - no testing framework configured
- No coverage reporting tooling present

## How Testing Should Be Implemented

If testing infrastructure is added to this project, follow these patterns based on codebase complexity:

**Unit Testing Candidates:**

1. **Utility Functions in `lib/utils.ts`:**
   - `cn()` - className merger
   - `memoize()` - function result caching
   - `searchMatch()` - Levenshtein distance calculation
   - `calculateRelevance()` - search relevance scoring
   - `formatDate()` and `formatDate2()` - date formatting
   - `debounce()` - debounce utility
   - `highlight()` - snippet highlighting

2. **Route Helpers in `lib/pageroutes.ts`:**
   - `isRoute()` - type guard function
   - `getAllLinks()` - recursive link extraction
   - `PageRoutes` constant generation

3. **Markdown Processing in `lib/markdown.ts`:**
   - `getDocument()` - document fetching and parsing
   - `parseMdx()` - MDX compilation
   - `getDocumentPath()` - cached path resolution

**Component Testing Candidates:**

1. **Simple Presentational Components:**
   - `Card` component with multiple variants
   - `Navbar` component with conditional rendering
   - `Anchor` component with active state logic
   - `Mermaid` component with error handling

2. **Hook Testing:**
   - `useHash()` - window hash synchronization
   - `useSetFinishViewTransition()` - context hook
   - `useTransitionRouter()` - custom router logic

**Integration Testing Candidates:**

1. **MDX Document Loading:**
   - Document retrieval from filesystem or GitHub
   - MDX parsing with plugins
   - Component mapping to MDX elements

2. **Search Functionality:**
   - `advanceSearch()` with mocked search data
   - Relevance scoring with various input patterns
   - Snippet extraction and highlighting

## Suggested Test Structure

If implementing tests, use this structure:

```
project-root/
├── __tests__/
│   ├── lib/
│   │   ├── utils.test.ts
│   │   ├── pageroutes.test.ts
│   │   └── markdown.test.ts
│   └── components/
│       ├── card.test.tsx
│       ├── navbar.test.tsx
│       └── anchor.test.tsx
└── src/
    ├── lib/
    ├── components/
    └── app/
```

## Testing Patterns for Key Areas

**Async Function Testing Pattern (from `lib/markdown.ts`):**

```typescript
// Document fetching with try-catch pattern
export async function getDocument(slug: string) {
  try {
    // operation
    return { frontmatter, content, tocs, lastUpdated }
  } catch (err) {
    console.error(err)
    return null
  }
}

// Tests should cover:
// - Success case with valid slug
// - Error handling (file not found, network error)
// - Return type (object or null)
```

**Component Error Handling Pattern (from `app/error.tsx`):**

```typescript
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    // error UI
  )
}

// Tests should cover:
// - Error logging on mount
// - Reset button click handler
// - Conditional rendering based on error state
```

**Type Guard Testing Pattern (from `lib/pageroutes.ts`):**

```typescript
function isRoute(node: Paths): node is Extract<Paths, { href: string; title: string }> {
  return 'href' in node && 'title' in node
}

// Tests should cover:
// - Route object returns true
// - Spacer object returns false
// - Type narrowing works correctly
```

**Memoization Pattern (from `lib/utils.ts`):**

```typescript
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>()
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      const cachedResult = cache.get(key)
      if (cachedResult !== undefined) {
        return cachedResult
      }
    }
    const result = fn(...args)
    if (result !== '' && result != null) {
      cache.set(key, result)
    }
    return result
  }) as T
}

// Tests should cover:
// - Cache hit returns same reference
// - Cache miss calls original function
// - Empty/null values not cached
// - Different args generate different cache keys
```

**Algorithm Testing Pattern (from `lib/utils.ts`):**

```typescript
function searchMatch(a: string, b: string): number {
  // Levenshtein distance implementation
  // Returns numeric distance between strings
}

// Tests should cover:
// - Exact match returns 0
// - Empty strings
// - Single character difference
// - Long strings with multiple differences
// - Max distance threshold enforcement
```

## Current Testing Approach

**Biome Linting as Test Replacement:**
- Biome enforces code quality and correctness rules at lint time
- Rules configured in `biome.json` cover:
  - No unreachable code detection
  - No unused variables
  - Type safety checks
  - Unused label detection
  - Hook rules (useHookAtTopLevel, useExhaustiveDependencies)

**Manual Testing Approach:**
- Development: `pnpm run dev` with Turbopack for fast iteration
- Build: `pnpm run build` validates TypeScript and build integrity
- Code review: Biome `--check` and `--write` before commits

## Recommended Testing Setup (Future)

If adding test infrastructure:

```json
{
  "devDependencies": {
    "vitest": "^1.x",
    "@testing-library/react": "^14.x",
    "@testing-library/jest-dom": "^6.x",
    "@vitejs/plugin-react": "^4.x"
  }
}
```

**Configuration would include:**
- Unit tests for utilities (vitest recommended for speed)
- Component tests with React Testing Library
- Coverage threshold enforcement (80% recommended)
- Pre-commit hook validation via Husky (already configured)

---

*Testing analysis: 2026-03-28*
