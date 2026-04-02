import { Button } from '@/components/ui/button'

interface CatalogPaginationProps {
  currentPage: number
  totalPages: number
  totalEntries: number
  filteredCount: number
  onPrev: () => void
  onNext: () => void
}

function CatalogPagination({
  currentPage,
  totalPages,
  totalEntries,
  filteredCount,
  onPrev,
  onNext,
}: CatalogPaginationProps) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
      <span>
        Showing {filteredCount} of {totalEntries} entries
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={currentPage <= 1}>
          Prev
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={onNext} disabled={currentPage >= totalPages}>
          Next
        </Button>
      </div>
    </div>
  )
}

export { CatalogPagination }
