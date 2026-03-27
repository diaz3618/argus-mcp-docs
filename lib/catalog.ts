import 'server-only'
import { Octokit } from '@octokit/rest'
import yaml from 'js-yaml'

const octokit = new Octokit({
  auth: process.env.CATALOG_READ_TOKEN,
})

const OWNER = 'diaz3618'
const REPO = 'argus-mcp-catalog'

export interface CatalogIndex {
  categories: Record<string, string[]>
  updated_at: string
}

export interface CatalogEntry {
  filename: string
  content: string
  metadata: Record<string, unknown>
}

let _indexCache: CatalogIndex | null = null

export async function fetchCatalogIndex(): Promise<CatalogIndex> {
  if (_indexCache) return _indexCache
  try {
    const res = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: 'catalog.json',
    })
    const data = res.data as { content: string; encoding: string }
    const content = Buffer.from(data.content, 'base64').toString()
    _indexCache = JSON.parse(content) as CatalogIndex
    return _indexCache
  } catch (e) {
    console.warn('[catalog] Failed to fetch catalog.json:', e)
    return { categories: {}, updated_at: '' }
  }
}

export async function fetchCategoryConfigs(
  category: string
): Promise<CatalogEntry[]> {
  const index = await fetchCatalogIndex()
  const files = index.categories[category] ?? []
  const results = await Promise.allSettled(
    files.map(async (filename) => {
      const res = await octokit.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path: `configs/${category}/${filename}`,
      })
      const data = res.data as { content: string; encoding: string }
      const content = Buffer.from(data.content, 'base64').toString()
      const metadata =
        (yaml.load(content, { schema: yaml.JSON_SCHEMA }) as Record<
          string,
          unknown
        >) ?? {}
      return { filename, content, metadata }
    })
  )
  for (const r of results) {
    if (r.status === 'rejected') {
      console.warn(`[catalog] Failed to fetch config in ${category}:`, r.reason)
    }
  }
  return results
    .filter(
      (r): r is PromiseFulfilledResult<CatalogEntry> =>
        r.status === 'fulfilled'
    )
    .map((r) => r.value)
}
