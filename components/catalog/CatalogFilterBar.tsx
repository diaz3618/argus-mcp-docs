import { FilterChip } from '@/components/catalog/FilterChip'
import { SearchInput } from '@/components/catalog/SearchInput'

interface CatalogFilterBarProps {
  query: string
  transport: string
  noAuth: boolean
  containerOnly: boolean
  availableTransports: string[]
  onSearch: (q: string) => void
  onTransport: (t: string) => void
  onNoAuth: () => void
  onContainerOnly: () => void
}

function CatalogFilterBar({
  query,
  transport,
  noAuth,
  containerOnly,
  availableTransports,
  onSearch,
  onTransport,
  onNoAuth,
  onContainerOnly,
}: CatalogFilterBarProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Search input */}
      <SearchInput value={query} onSearch={onSearch} />

      {/* Row 2: Filter chips — transport types derived from data, then boolean toggles */}
      <div className="flex flex-wrap gap-2">
        {availableTransports.map((t) => (
          <FilterChip
            key={t}
            label={t}
            active={transport === t}
            onClick={() => onTransport(transport === t ? '' : t)}
          />
        ))}
        <FilterChip label="No API key" active={noAuth} onClick={onNoAuth} />
        <FilterChip label="Containerized" active={containerOnly} onClick={onContainerOnly} />
      </div>
    </div>
  )
}

export { CatalogFilterBar }
