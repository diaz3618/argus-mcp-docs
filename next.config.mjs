/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/argus-mcp-docs',
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
