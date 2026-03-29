# Phase 3: Frontend UX Improvements - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Improve the developer-facing experience of the docs site in two ways: complete Prism syntax highlighting token coverage for the four languages used in the docs (YAML, bash, JSON, Python), and implement default-collapsed sidebar navigation with "Getting Started" always open regardless of current page. No new content, no new routes, no library swaps.

</domain>

<decisions>
## Implementation Decisions

### Syntax Highlighting
- **D-01:** Extend `styles/globals.css` with missing Prism token CSS classes. Do NOT swap `rehype-prism-plus` for another library — the pipeline is already wired and the existing pattern (hand-coded token rules) should be continued.
- **D-02:** Languages in scope: YAML (79 blocks), bash (45), JSON (26), Python (9). No TypeScript or JavaScript blocks exist in the docs content.
- **D-03:** Missing token classes that need CSS rules: `.class-name` (Python class names), `.operator` (bash/Python operators), `.variable` (bash `$VAR` expansions), `.important` (YAML anchors `&anchor`/`*alias`), `.atrule` (YAML directives), `.null-keyword` / `.null.token` (JSON null). Each class needs both light and dark variants following the existing pattern (e.g., `.dark .class-name { color: ... }`).
- **D-04:** `styles/globals.css` is listed as a core/rubix-documents file, but it already contains custom Prism token CSS (lines ~213–263). This extension continues that existing pattern — modification is accepted.

### Collapsible Navigation
- **D-05:** All sidebar sections default to collapsed on initial load. Change `sublink.tsx` line 17 from `useState(true)` to `useState(false)`.
- **D-06:** "Getting Started" section ALWAYS stays open, regardless of which page is currently active. It must not collapse when the user navigates to a different section. Identified by `href: '/getting-started'` (not by title string, which is brittle).
- **D-07:** The active section (the one whose href is a prefix of the current pathname) auto-expands — this is already handled by the existing `useEffect` in `sublink.tsx`. No change needed to the useEffect logic.
- **D-08:** `components/sidebar/sublink.tsx` is listed as a core/rubix-documents file. Direct modification is accepted — the behavior change is a deliberate improvement, not infrastructure churn.

### Claude's Discretion
- Exact colors chosen for the new token classes — match the existing palette and light/dark pairing established in globals.css (keywords→pink, strings→green, functions→blue, constants→gray).
- Whether to colocate Getting Started's always-open logic inside the existing `useEffect` or as a separate initial state derivation.
- Handling of the mobile Sheet sidebar (SheetLeft → PageMenu → SubLink) — should follow the same collapsed-by-default behavior since it uses the same SubLink component.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Files to modify
- `components/sidebar/sublink.tsx` — Current nav collapse logic: `useState(true)` (line 17), `useEffect` for active-path opening. This is the primary file for D-05, D-06, D-07.
- `styles/globals.css` — Existing Prism token CSS starts around line 213. New token rules go here. Match the existing pattern exactly (bare class selectors + `.dark` variants).

### Read-only references
- `lib/markdown.ts` — MDX pipeline showing `rehypePrism` in the `rehypePlugins` array. Do NOT modify. Confirms Prism is already generating token class attributes on code elements.
- `settings/documents.ts` — Route definitions. Getting Started is at `href: '/getting-started'` — this is the canonical identifier for D-06.
- `lib/pageroutes.ts` — `Paths` type definition. No `defaultOpen` prop exists. Do NOT add one — the always-open logic belongs in `sublink.tsx` using the href identifier.

### Language coverage confirmation
- Run `grep -rh '```[a-zA-Z]' contents/docs/ | grep -oP '` + '```\K[a-zA-Z]+' | sort | uniq -c` from repo root to confirm language list before implementing.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Existing Prism token CSS pattern in `globals.css` (~lines 213–263) — copy the light/dark pairing format for new token classes
- `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` from `@/components/ui/collapsible` — already imported in sublink.tsx, no new dependencies needed

### Established Patterns
- Token CSS format: `.token-class { color: hsl(...); }` + `.dark .token-class { color: hsl(...); }` — match exactly
- `sublink.tsx` already has the `isRoute` guard, `useEffect` path-matching, and Radix Collapsible integration

### Integration Points
- `sublink.tsx` is rendered by `PageMenu` → `Sidebar` (desktop) and `PageMenu` (mobile Sheet). The same component handles both — changes apply to both automatically.
- `settings/documents.ts` is the extension point: if a new `defaultOpen` prop were ever added to Paths, it would be set there. Per D-08, we're NOT doing this — the logic goes in sublink.tsx.

</code_context>

<specifics>
## Specific Ideas

- Getting Started always-open: initialize state based on `href === '/docs/getting-started'` OR check `props.href` against a constant. The most defensive approach: `const [isOpen, setIsOpen] = useState(isGettingStarted)` where `isGettingStarted = isRoute(props) && props.href === '/docs/getting-started'`.
- Token colors to add should integrate with the existing palette. Suggestions (Claude's discretion): `.class-name` → same blue as `.function` (hsla(210, 100%, 66%, 1)), `.operator` → gray like `.punctuation`, `.variable` → same pink as `.keyword`, `.important` → amber/orange (new color, distinctive for YAML special syntax).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. Site already has search, TOC, dark mode, copy buttons, and prev/next navigation.

</deferred>

---

*Phase: 03-frontend-ux-improvements*
*Context gathered: 2026-03-28*
