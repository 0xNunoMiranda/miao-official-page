"use client"

import { useEffect, useState } from "react"
import App from "../App"

// Forçar renderização apenas no cliente para evitar problemas com localStorage
export const dynamic = 'force-dynamic'

export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
