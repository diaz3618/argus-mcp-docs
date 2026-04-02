import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { CatalogEntry } from '@/lib/catalog'

interface CatalogEntryCardProps {
  entry: CatalogEntry
  categoryLabel: string
}

function CatalogEntryCard({ entry, categoryLabel }: CatalogEntryCardProps) {
  const backendSlug = Object.keys(entry.metadata).find((k) => k !== 'name' && k !== 'description')
  const backendConfig =
    backendSlug != null ? (entry.metadata[backendSlug] as Record<string, unknown>) : null

  const transport = typeof backendConfig?.type === 'string' ? backendConfig.type : 'stdio'

  const isContainerized =
    (backendConfig?.container as Record<string, unknown> | undefined)?.enabled === true

  const requiresAuth = backendConfig?.env != null

  return (
    <div className="rounded-lg border p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-sm">
        {(entry.metadata.name as string | undefined) ?? entry.filename}
      </h3>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {entry.metadata.description as string | undefined}
      </p>
      <div className="flex flex-wrap gap-1">
        <Badge variant="outline">{categoryLabel}</Badge>
        <Badge variant="secondary">{transport}</Badge>
        <Badge variant={requiresAuth ? 'default' : 'secondary'}>
          {requiresAuth ? 'API key required' : 'No API key'}
        </Badge>
        <Badge variant={isContainerized ? 'default' : 'outline'}>
          {isContainerized ? 'Containerized' : 'Remote'}
        </Badge>
      </div>
      <Link
        href={`/docs/yaml-cookbook/${entry.category}/#${entry.filename.replace('.yaml', '')}`}
        className="text-xs text-primary underline-offset-4 hover:underline mt-auto"
      >
        View YAML
      </Link>
      <a
        href={`https://github.com/diaz3618/argus-mcp-catalog/blob/main/configs/${entry.category}/${entry.filename}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        View in GitHub
      </a>
    </div>
  )
}

export { CatalogEntryCard }
