"use client"

import React, { useState, useEffect } from "react"
import { Edit2, Trash2, Eye, Search, Heart, Flag } from "lucide-react"
import { AdminTable, TableColumn, AdminModal, Badge } from "@/components/AdminComponents"

interface Meme {
  id: string
  creator: string
  wallet: string
  title: string
  imageUrl: string
  likes: number
  reports: number
  status: "published" | "flagged" | "removed"
  createdDate: string
  reason?: string
}

export const AdminMemesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [memes, setMemes] = useState<Meme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real data from API
  useEffect(() => {
    const fetchMemes = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/memes')
        const data = await response.json()
        
        if (data.success && Array.isArray(data.data)) {
          // Transform API response to match Meme interface
          const transformedMemes: Meme[] = data.data.map((meme: any) => ({
            id: meme.id || meme.meme_id || '',
            creator: meme.username || '',
            wallet: meme.wallet || meme.wallet_address || '',
            title: meme.title || meme.prompt || '',
            imageUrl: meme.image_url || meme.imageUrl || '',
            likes: meme.likes || 0,
            reports: meme.reports || 0,
            status: meme.status || 'published',
            createdDate: meme.created_at ? new Date(meme.created_at).toLocaleDateString() : 'N/A',
            reason: meme.rejection_reason || undefined,
          }))
          setMemes(transformedMemes)
          setError(null)
        }
      } catch (err) {
        console.error('Error fetching memes:', err)
        setError('Failed to load memes')
      } finally {
        setLoading(false)
      }
    }

    fetchMemes()
  }, [])

  const filteredMemes = memes.filter((meme) =>
    meme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meme.creator.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns: TableColumn<Meme>[] = [
    {
      key: "title",
      label: "Meme",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <img src={row.imageUrl} alt={value} className="w-10 h-10 rounded-lg object-cover" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{row.creator}</p>
          </div>
        </div>
      ),
    },
    {
      key: "likes",
      label: "Engagement",
      render: (value, row) => (
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <Heart size={16} /> {value}
          </span>
          {row.reports > 0 && (
            <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
              <Flag size={16} /> {row.reports}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge
          label={value.toUpperCase()}
          variant={value === "published" ? "success" : value === "flagged" ? "warning" : "danger"}
        />
      ),
    },
    {
      key: "createdDate",
      label: "Created",
    },
  ]

  const handleAction = (meme: Meme, action: "view" | "delete" | "approve") => {
    if (action === "view") {
      setSelectedMeme(meme)
      setIsModalOpen(true)
    } else if (action === "delete") {
      // Call API to delete meme
      fetch('/api/admin/memes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', meme_id: meme.id })
      }).then(() => {
        setMemes((prev) => prev.filter((m) => m.id !== meme.id))
      })
    } else if (action === "approve") {
      // Call API to approve meme
      fetch('/api/admin/memes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', meme_id: meme.id })
      }).then(() => {
        setMemes((prev) => prev.map((m) => (m.id === meme.id ? { ...m, status: "published" as const } : m)))
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Loading & Error States */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Loading memes...</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Memes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{memes.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Published</p>
              <p className="text-3xl font-bold text-green-600">{memes.filter((m) => m.status === "published").length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Flagged</p>
              <p className="text-3xl font-bold text-amber-600">{memes.filter((m) => m.status === "flagged").length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Reported</p>
              <p className="text-3xl font-bold text-red-600">
                {memes.filter((m) => m.reports > 0).length}
              </p>
            </div>
          </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by title or creator..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Memes Table */}
      <AdminTable
        data={filteredMemes}
        columns={columns}
        actions={(row: Meme) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(row, "view")}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
              title="View"
            >
              <Eye size={16} />
            </button>
            {row.status === "flagged" && (
              <button
                onClick={() => handleAction(row, "approve")}
                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition"
                title="Approve"
              >
                ✓
              </button>
            )}
            <button
              onClick={() => handleAction(row, "delete")}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      />

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Meme Details"
        size="large"
      >
        {selectedMeme && (
          <div className="space-y-4">
            <img src={selectedMeme.imageUrl} alt={selectedMeme.title} className="w-full rounded-lg" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Title</p>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">{selectedMeme.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Creator</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedMeme.creator}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <Badge label={selectedMeme.status.toUpperCase()} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Likes</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedMeme.likes}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reports</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedMeme.reports}</p>
              </div>
            </div>
            {selectedMeme.reason && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Removal Reason</p>
                <p className="text-gray-900 dark:text-white">{selectedMeme.reason}</p>
              </div>
            )}
          </div>
        )}
      </AdminModal>
        </>
      )}
    </div>
  )
}
