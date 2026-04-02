'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CatalogFilterBar } from '@/components/catalog/CatalogFilterBar'
import { CatalogGrid } from '@/components/catalog/CatalogGrid'
import { CatalogPagination } from '@/components/catalog/CatalogPagination'
import { FilterChip } from '@/components/catalog/FilterChip'
import type { CatalogEntry } from '@/lib/catalog'
import { cn } from '@/lib/utils'

const categoryLabels: Record<string, string> = {
  'filesystem-access': 'Filesystem Access',
  'web-research': 'Web Research',
  databases: 'Databases',
  'ai-memory': 'AI Memory',
  'devops-integrations': 'DevOps Integrations',
  'security-tools': 'Security Tools',
  'remote-sse': 'Remote SSE',
  'remote-http': 'Remote HTTP',
  'remote-auth': 'Remote Auth',
  'fully-isolated': 'Fully Isolated',
}

const PAGE_SIZE = 12

interface CatalogBrowserProps {
  entries: CatalogEntry[]
  categories: string[]
  updatedAt: string
}

export default function CatalogBrowser({ entries, categories, updatedAt }: CatalogBrowserProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const category = searchParams?.get('category') ?? ''
  const query = searchParams?.get('q') ?? ''
  const transport = searchParams?.get('transport') ?? ''
  const noAuth = searchParams?.get('noAuth') === '1'
  const containerOnly = searchParams?.get('container') === '1'
  const currentPage = Number(searchParams?.get('page') ?? '1')

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    for (const [key, val] of Object.entries(updates)) {
      if (val === null || val === '') {
        params.delete(key)
      } else {
        params.set(key, val)
      }
    }
    params.delete('page')
    router.replace(`?${params.toString()}`)
  }

  function gotoPage(n: number) {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('page', String(n))
    router.replace(`?${params.toString()}`)
  }

  const filtered = entries.filter((entry) => {
    const slug = Object.keys(entry.metadata).find((k) => k !== 'name' && k !== 'description')
    const entryMeta = slug ? (entry.metadata[slug] as Record<string, unknown>) : {}

    if (category && entry.category !== category) return false

    if (query) {
      const name = String(entry.metadata.name ?? '').toLowerCase()
      const desc = String(entry.metadata.description ?? '').toLowerCase()
      if (!name.includes(query.toLowerCase()) && !desc.includes(query.toLowerCase())) return false
    }

    if (transport) {
      if (String(entryMeta.type ?? '') !== transport) return false
    }

    if (noAuth) {
      const env = entryMeta.env as Record<string, unknown> | undefined
      if (env && Object.keys(env).length > 0) return false
    }

    if (containerOnly) {
      const container = entryMeta.container as Record<string, unknown> | undefined
      if (!container?.enabled) return false
    }

    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <div className="flex gap-6">
      {/* Left panel: category sidebar — hidden on mobile */}
      <aside className="hidden md:flex flex-col gap-1 w-48 shrink-0">
        <button
          type="button"
          onClick={() => updateParams({ category: null })}
          className={cn(
            'text-left px-3 py-1.5 rounded-md text-sm',
            !category ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => updateParams({ category: cat })}
            className={cn(
              'text-left px-3 py-1.5 rounded-md text-sm',
              category === cat ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            )}
          >
            {categoryLabels[cat] ?? cat}
          </button>
        ))}
      </aside>

      {/* Right panel */}
      <div className="flex flex-col gap-4 flex-1 min-w-0">
        {/* Mobile-only horizontal category chip row */}
        <div className="flex md:hidden flex-wrap gap-2">
          <FilterChip
            label="All"
            active={!category}
            onClick={() => updateParams({ category: null })}
          />
          {categories.map((cat) => (
            <FilterChip
              key={cat}
              label={categoryLabels[cat] ?? cat}
              active={category === cat}
              onClick={() => updateParams({ category: category === cat ? null : cat })}
            />
          ))}
        </div>

        <CatalogFilterBar
          query={query}
          transport={transport}
          noAuth={noAuth}
          containerOnly={containerOnly}
          onSearch={(val) => updateParams({ q: val })}
          onTransport={(val) => updateParams({ transport: val })}
          onNoAuth={() => updateParams({ noAuth: noAuth ? null : '1' })}
          onContainerOnly={() => updateParams({ container: containerOnly ? null : '1' })}
        />

        {updatedAt && <p className="text-xs text-muted-foreground">Last updated: {updatedAt}</p>}

        <CatalogGrid
          entries={paginated}
          categoryLabels={categoryLabels}
          onClearFilters={() => router.replace('?')}
        />

        {totalPages > 1 && (
          <CatalogPagination
            currentPage={safePage}
            totalPages={totalPages}
            filteredCount={filtered.length}
            totalEntries={entries.length}
            onPrev={() => gotoPage(Math.max(1, safePage - 1))}
            onNext={() => gotoPage(Math.min(totalPages, safePage + 1))}
          />
        )}
      </div>
    </div>
  )
}
