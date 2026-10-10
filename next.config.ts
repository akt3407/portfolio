import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [new URL('https://images.microcms-assets.io/**')],
  },
}

export default nextConfig
