import { notFound } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import {
  fetchCatalogIndex,
  fetchCategoryConfigs,
} from '@/lib/catalog'

interface PageProps {
  params: Promise<{ category: string }>
}

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

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params
  const label = categoryLabels[category]

  if (!label) notFound()

  const configs = await fetchCategoryConfigs(category)

  return (
    <div className="flex-3">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">{label}</h1>
        <p className="text-sm">
          Pre-tested Argus MCP backend configurations for {label.toLowerCase()}{' '}
          servers.
        </p>
        <Separator />
      </div>
      <Typography>
        <section className="space-y-8 pt-6">
          {configs.length === 0 ? (
            <p className="text-muted-foreground">
              No configurations available for this category yet. Check back soon
              or{' '}
              <a
                href="https://github.com/diaz3618/argus-mcp-catalog"
                target="_blank"
                rel="noopener noreferrer"
              >
                contribute one
              </a>
              .
            </p>
          ) : (
            configs.map((entry) => (
              <div key={entry.filename} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium">
                    {(entry.metadata.name as string) ||
                      entry.filename.replace('.yaml', '')}
                  </h2>
                  <a
                    href={`https://github.com/diaz3618/argus-mcp-catalog/blob/main/configs/${category}/${entry.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    View on GitHub
                  </a>
                </div>
                {typeof entry.metadata.description === 'string' && (
                  <p className="text-sm text-muted-foreground">
                    {entry.metadata.description}
                  </p>
                )}
                <pre className="language-yaml">
                  <code className="language-yaml">{entry.content}</code>
                </pre>
              </div>
            ))
          )}
          <Separator />
          <div className="rounded-lg border p-4">
            <p className="text-sm">
              Want to add a configuration?{' '}
              <a
                href="https://github.com/diaz3618/argus-mcp-catalog/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline"
              >
                See the contributing guide
              </a>
              .
            </p>
          </div>
        </section>
      </Typography>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params
  const label = categoryLabels[category]
  if (!label) return null

  return {
    title: `${label} — YAML Cookbook — Argus MCP`,
    description: `Pre-tested Argus MCP backend configurations for ${label.toLowerCase()} servers.`,
  }
}

export async function generateStaticParams() {
  const index = await fetchCatalogIndex()
  const categories = Object.keys(index.categories)

  if (categories.length > 0) {
    return categories.map((category) => ({ category }))
  }

  return Object.keys(categoryLabels).map((category) => ({ category }))
}
