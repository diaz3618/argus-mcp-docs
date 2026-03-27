# Argus MCP Documentation

Documentation site for [Argus MCP](https://github.com/diaz3618/argus-mcp) — a programmable MCP gateway.

**Live site:** [diaz3618.github.io/argus-mcp-docs](https://diaz3618.github.io/argus-mcp-docs)

## Development

```bash
pnpm install
pnpm run dev
```

Open [http://localhost:3000/argus-mcp-docs](http://localhost:3000/argus-mcp-docs).

## Build

```bash
sh .husky/post-process.sh   # generate search data
pnpm run build               # static export to out/
```

## Architecture

- **Template:** [rubix-documents](https://github.com/rubixvi/rubix-documents) (Next.js 16 + MDX)
- **Hosting:** GitHub Pages via artifact deploy (no `gh-pages` branch)
- **Catalog:** Build-time fetch from [argus-mcp-catalog](https://github.com/diaz3618/argus-mcp-catalog) using `@octokit/rest`
- **Content:** MDX files in `contents/docs/`, nav tree in `settings/documents.ts`

## Content Structure

| Directory | Purpose |
|-----------|---------|
| `contents/docs/` | MDX documentation files |
| `settings/` | Site config, navigation, document tree |
| `lib/catalog.ts` | Catalog fetch logic (B1 architecture) |
| `app/docs/yaml-cookbook/` | Dynamic catalog-driven route |
| `.github/workflows/deploy.yml` | GitHub Pages deployment |

## License

This documentation site is built on [rubix-documents](https://github.com/rubixvi/rubix-documents), licensed under MIT by Rubix Studios.

Documentation content is part of the [Argus MCP](https://github.com/diaz3618/argus-mcp) project.
