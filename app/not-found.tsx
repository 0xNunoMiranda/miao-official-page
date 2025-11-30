"use client"

import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[var(--text-primary)] mb-4">404</h1>
        <p className="text-xl text-[var(--text-secondary)] mb-8">Page Not Found</p>
        <Link
          href="/"
          className="px-8 py-4 rounded-2xl font-bold uppercase tracking-wide text-lg bg-[var(--duo-green)] text-white border-2 border-b-4 border-[var(--btn-shadow)] hover:brightness-105 active:border-b-2 active:translate-y-[2px] transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}

