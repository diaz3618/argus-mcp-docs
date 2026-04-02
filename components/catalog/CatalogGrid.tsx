import { CatalogEntryCard } from '@/components/catalog/CatalogEntryCard'
import { Button } from '@/components/ui/button'
import type { CatalogEntry } from '@/lib/catalog'

interface CatalogGridProps {
  entries: CatalogEntry[]
  categoryLabels: Record<string, string>
  onClearFilters: () => void
}

function CatalogGrid({ entries, categoryLabels, onClearFilters }: CatalogGridProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-muted-foreground">
        <p>No entries match your filters.</p>
        <Button onClick={onClearFilters}>Clear filters</Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map((entry) => (
        <CatalogEntryCard
          key={`${entry.category}/${entry.filename}`}
          entry={entry}
          categoryLabel={categoryLabels[entry.category] ?? entry.category}
        />
      ))}
    </div>
  )
}

export { CatalogGrid }
