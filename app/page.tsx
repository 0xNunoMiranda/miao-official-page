"use client"

import dynamicImport from "next/dynamic"

// Importar App dinamicamente com SSR desabilitado para evitar problemas
const App = dynamicImport(() => import("../App"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--duo-green)] mx-auto"></div>
      </div>
    </div>
  ),
})

// Forçar renderização dinâmica e desabilitar pré-renderização estática
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const dynamicParams = true

export default function Page() {
  return <App />
}
