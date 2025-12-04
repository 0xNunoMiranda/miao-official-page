"use client"

import dynamic from 'next/dynamic'

const AdminContent = dynamic(() => import('@/components/AdminContent'), { 
  ssr: false,
  loading: () => <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Admin Panel...</div>
})

export default function AdminPage() {
  return <AdminContent />
}
