"use client"

// Desabilitar completamente a pré-renderização estática
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const dynamicParams = true
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

import { useEffect, useState } from "react"
import App from "../App"

export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Renderizar apenas no cliente para evitar problemas com localStorage
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--duo-green)] mx-auto"></div>
        </div>
      </div>
    )
  }

  return <App />
}
