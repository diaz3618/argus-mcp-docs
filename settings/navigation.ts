import { PageRoutes } from '@/lib/pageroutes'

export const Navigations = [
  {
    title: 'Docs',
    href: `/docs${PageRoutes[0].href}`,
  },
  {
    title: 'YAML Cookbook',
    href: '/docs/yaml-cookbook',
  },
  {
    title: 'GitHub',
    href: 'https://github.com/diaz3618/argus-mcp',
    external: true,
  },
  {
    title: 'Catalog',
    href: 'https://github.com/diaz3618/argus-mcp-catalog',
    external: true,
  },
]

export const GitHubLink = {
  href: 'https://github.com/diaz3618/argus-mcp',
}
