/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'miaotoken.vip',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cryptologos.cc',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'arweave.net',
        pathname: '/**',
      },
    ],
  },
  reactStrictMode: true,
  // Garantir que não há problemas com a estrutura
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Adicionar rewrites para servir favicon.ico
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/icon-light-32x32.png',
      },
    ]
  },
}

export default nextConfig