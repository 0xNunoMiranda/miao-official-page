/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
  // Desabilitar output estático para forçar renderização dinâmica
  output: undefined,
}

export default nextConfig