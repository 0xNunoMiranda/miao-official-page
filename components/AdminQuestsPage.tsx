"use client"

import React, { useState, useEffect } from "react"
import { Edit2, Trash2, Plus, Search, Eye } from "lucide-react"
import { AdminTable, TableColumn, AdminModal, Badge } from "@/components/AdminComponents"

interface Quest {
  id: string
  title: string
  description: string
  type: "daily" | "weekly" | "one-time" | "recurring"
  rewards: number
  participants: number
  completionRate: number
  status: "active" | "inactive"
  createdDate: string
}

export const AdminQuestsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState<"view" | "edit" | "create">("view")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: ("daily" as const) as "daily" | "weekly" | "one-time" | "recurring",
    rewards: 0,
  })
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real data from API
  useEffect(() => {
    const fetchQuests = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/quests')
        const data = await response.json()
        
        if (data.success && Array.isArray(data.data)) {
          // Transform API response to match Quest interface
          const transformedQuests: Quest[] = data.data.map((quest: any) => ({
            id: quest.id || quest.quest_id || '',
            title: quest.title || '',
            description: quest.description || '',
            type: (quest.type || 'one-time') as "daily" | "weekly" | "one-time" | "recurring",
            rewards: quest.rewards || 0,
            participants: quest.participants_count || 0,
            completionRate: quest.completion_rate || 0,
            status: quest.status || 'active',
            createdDate: quest.created_at ? new Date(quest.created_at).toLocaleDateString() : 'N/A',
          }))
          setQuests(transformedQuests)
          setError(null)
        }
      } catch (err) {
        console.error('Error fetching quests:', err)
        setError('Failed to load quests')
      } finally {
        setLoading(false)
      }
    }

    fetchQuests()
  }, [])

  const filteredQuests = quests.filter((quest) =>
    quest.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns: TableColumn<Quest>[] = [
    {
      key: "title",
      label: "Quest Title",
      render: (value, row) => (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{row.description}</p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value) => {
        const colors = {
          daily: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          weekly: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
          "one-time": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          recurring: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        }
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[value as keyof typeof colors]}`}>
            {value}
          </span>
        )
      },
    },
    {
      key: "rewards",
      label: "Rewards",
      render: (value) => <span className="font-bold text-green-600 dark:text-green-400">{value} 💎</span>,
    },
    {
      key: "participants",
      label: "Participants",
    },
    {
      key: "completionRate",
      label: "Completion",
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${value}%` }}></div>
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}%</span>
        </div>
      ),
    },
  ]

  const handleAction = (quest: Quest, action: "view" | "edit" | "delete") => {
    if (action === "delete") {
      setQuests((prev) => prev.filter((q) => q.id !== quest.id))
    } else {
      setSelectedQuest(quest)
      setFormData({
        title: quest.title,
        description: quest.description,
        type: quest.type,
        rewards: quest.rewards,
      })
      setModalAction(action)
      setIsModalOpen(true)
    }
  }

  const handleSaveQuest = () => {
    if (selectedQuest) {
      setQuests((prev) =>
        prev.map((q) =>
          q.id === selectedQuest.id
            ? { ...q, ...formData }
            : q
        )
      )
    } else {
      const newQuest: Quest = {
        id: String(Math.random()),
        ...formData,
        participants: 0,
        completionRate: 0,
        status: "active",
        createdDate: new Date().toISOString().split("T")[0],
      }
      setQuests((prev) => [newQuest, ...prev])
    }
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Loading & Error States */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Loading quests...</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Search & Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search quests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => {
                setSelectedQuest(null)
                setFormData({ title: "", description: "", type: "daily", rewards: 0 })
                setModalAction("create")
                setIsModalOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              <Plus size={20} />
              New Quest
            </button>
          </div>

          {/* Quests Table */}
          <AdminTable
            data={filteredQuests}
            columns={columns}
            actions={(row: Quest) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(row, "view")}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                  title="View details"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleAction(row, "edit")}
                  className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition"
                  title="Edit quest"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleAction(row, "delete")}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                  title="Delete quest"
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
            title={modalAction === "create" ? "Create New Quest" : modalAction === "edit" ? "Edit Quest" : "Quest Details"}
            size="large"
            actions={
              modalAction !== "view" ? (
                <>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
              <button
                onClick={handleSaveQuest}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Save Quest
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              Close
            </button>
          )
        }
      >
        {modalAction === "view" && selectedQuest ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Title</p>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">{selectedQuest.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
              <p className="text-gray-900 dark:text-white">{selectedQuest.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                <Badge label={selectedQuest.type.toUpperCase()} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rewards</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedQuest.rewards} 💎</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Quest Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="one-time">One-Time</option>
                  <option value="recurring">Recurring</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Gem Rewards
                </label>
                <input
                  type="number"
                  value={formData.rewards}
                  onChange={(e) => setFormData({ ...formData, rewards: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}
      </AdminModal>
        </>
      )}
    </div>
  )
}
