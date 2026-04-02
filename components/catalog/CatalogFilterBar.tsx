import { FilterChip } from '@/components/catalog/FilterChip'
import { SearchInput } from '@/components/catalog/SearchInput'

interface CatalogFilterBarProps {
  query: string
  transport: string
  noAuth: boolean
  containerOnly: boolean
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
  onSearch,
  onTransport,
  onNoAuth,
  onContainerOnly,
}: CatalogFilterBarProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Search input */}
      <SearchInput value={query} onSearch={onSearch} />

      {/* Row 2: All 4 filter chips in one row */}
      <div className="flex flex-wrap gap-2">
        <FilterChip
          label="stdio"
          active={transport === 'stdio'}
          onClick={() => onTransport(transport === 'stdio' ? '' : 'stdio')}
        />
        <FilterChip
          label="streamable-http"
          active={transport === 'streamable-http'}
          onClick={() => onTransport(transport === 'streamable-http' ? '' : 'streamable-http')}
        />
        <FilterChip label="No API key" active={noAuth} onClick={onNoAuth} />
        <FilterChip label="Containerized" active={containerOnly} onClick={onContainerOnly} />
      </div>
    </div>
  )
}

export { CatalogFilterBar }
