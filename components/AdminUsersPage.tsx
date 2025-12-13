"use client"

import React, { useState, useEffect } from "react"
import { Edit2, Trash2, Plus, Search } from "lucide-react"
import { AdminTable, TableColumn, AdminModal, Badge } from "@/components/AdminComponents"

interface User {
  id: string
  wallet: string
  username: string
  gems: number
  level: number
  status: "active" | "banned" | "suspended"
  joinedDate: string
  lastActive: string
}

export const AdminUsersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState<"edit" | "details">("details")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real data from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/users')
        const data = await response.json()
        
        if (data.success && Array.isArray(data.data)) {
          // Transform API response to match User interface
          const transformedUsers: User[] = data.data.map((user: any) => ({
            id: user.id || user.user_id || '',
            wallet: user.wallet || user.wallet_address || '',
            username: user.username || '',
            gems: user.gems_balance || 0,
            level: user.level || 1,
            status: user.status || 'active',
            joinedDate: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
            lastActive: user.last_active ? new Date(user.last_active).toLocaleDateString() : 'N/A',
          }))
          setUsers(transformedUsers)
          setError(null)
        }
      } catch (err) {
        console.error('Error fetching users:', err)
        setError('Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.wallet.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns: TableColumn<User>[] = [
    {
      key: "username",
      label: "Username",
      render: (value, row) => (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.wallet}</p>
        </div>
      ),
    },
    {
      key: "gems",
      label: "Gems",
      render: (value) => <span className="font-bold text-purple-600 dark:text-purple-400">{value}</span>,
    },
    {
      key: "level",
      label: "Level",
      render: (value) => (
        <div className="w-12 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          {value}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge
          label={value.toUpperCase()}
          variant={value === "active" ? "success" : value === "banned" ? "danger" : "warning"}
        />
      ),
    },
    {
      key: "lastActive",
      label: "Last Active",
    },
  ]

  const handleAction = async (user: User, action: "edit" | "details" | "ban" | "delete") => {
    if (action === "ban") {
      try {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'ban', wallet: user.wallet })
        })
        const data = await response.json()
        if (data.success) {
          setUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, status: "banned" as const } : u))
          )
        }
      } catch (err) {
        console.error('Error banning user:', err)
      }
    } else if (action === "delete") {
      try {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', wallet: user.wallet })
        })
        const data = await response.json()
        if (data.success) {
          setUsers((prev) => prev.filter((u) => u.id !== user.id))
        }
      } catch (err) {
        console.error('Error deleting user:', err)
      }
    } else {
      setSelectedUser(user)
      setModalAction(action)
      setIsModalOpen(true)
    }
  }

  return (
    <div className="space-y-6">
      {/* Loading & Error States */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
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
                placeholder="Search by username or wallet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold">
              <Plus size={20} />
              Add User
            </button>
          </div>

          {/* Users Table */}
          <AdminTable
            data={filteredUsers}
            columns={columns}
            actions={(row: User) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(row, "details")}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                  title="View details"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleAction(row, "ban")}
                  disabled={row.status === "banned"}
                  className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition disabled:opacity-50"
                  title="Ban user"
                >
                  ⛔
                </button>
                <button
                  onClick={() => handleAction(row, "delete")}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                  title="Delete user"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />

          {/* Details Modal */}
          <AdminModal
            isOpen={isModalOpen && modalAction === "details"}
            onClose={() => setIsModalOpen(false)}
            title={`User: ${selectedUser?.username}`}
            size="large"
          >
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Wallet</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.wallet}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <Badge label={selectedUser.status.toUpperCase()} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gems</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.gems}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Level</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.joinedDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Active</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.lastActive}</p>
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
