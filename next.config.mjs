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
    // Reduzir uso de memória durante o build
    optimizeCss: false,
    // Desabilitar otimizações pesadas que consomem muita memória
    webpackBuildWorker: false,
  },
  // Desabilitar source maps em produção para economizar memória
  productionBrowserSourceMaps: false,
  // Configurações adicionais do webpack para reduzir memória
  webpack: (config, { isServer }) => {
    // Reduzir paralelismo para economizar memória
    config.parallelism = 1
    
    // Desabilitar otimizações pesadas que usam WebAssembly
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: false, // Desabilitar minificação para economizar memória
      }
    }
    
    // Reduzir cache para economizar memória
    config.cache = false
    
    return config
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
  // Redirects para canonicalização de URL
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.miaotoken.vip',
          },
        ],
        destination: 'https://miaotoken.vip/:path*',
        permanent: true,
      },
    ]
  },
  // Headers para segurança e SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

export default nextConfig