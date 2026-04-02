import type { Metadata } from 'next'
import { Suspense } from 'react'
import CatalogBrowser from '@/components/catalog/CatalogBrowser'
import { fetchAllCatalogEntries } from '@/lib/catalog'

export const metadata: Metadata = {
  title: 'Catalog — Argus MCP',
  description:
    'Browse all 65+ pre-tested Argus MCP backend configurations. Filter by category, transport type, authentication requirements, and container support.',
}

export default async function CatalogPage() {
  const { entries, categories, updatedAt } = await fetchAllCatalogEntries()

  return (
    <div className="flex-1">
      <div className="space-y-4 mb-6">
        <h1 className="text-3xl font-semibold">Catalog</h1>
        <p className="text-sm text-muted-foreground">
          Browse {entries.length} pre-tested Argus MCP backend configurations.
        </p>
      </div>
      <Suspense fallback={<div>Loading catalog...</div>}>
        <CatalogBrowser entries={entries} categories={categories} updatedAt={updatedAt} />
      </Suspense>
    </div>
  )
}
