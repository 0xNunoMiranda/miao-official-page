"use client"

import React, { useState, useEffect } from "react"
import { Edit2, Trash2, Plus, Search, ArrowUp, ArrowDown } from "lucide-react"
import { AdminTable, TableColumn } from "@/components/AdminComponents"

interface GemsTransaction {
  id: string
  user: string
  wallet: string
  amount: number
  type: "add" | "remove" | "reward" | "purchase"
  reason: string
  timestamp: string
  balance: number
}

export const AdminGemsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "add" | "remove" | "reward" | "purchase">("all")
  const [transactions, setTransactions] = useState<GemsTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real data from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/gems')
        const data = await response.json()
        
        if (data.success && Array.isArray(data.data)) {
          // Transform API response to match GemsTransaction interface
          const transformedTransactions: GemsTransaction[] = data.data.map((tx: any) => ({
            id: tx.id || tx.transaction_id || '',
            user: tx.username || '',
            wallet: tx.wallet || tx.wallet_address || '',
            amount: tx.amount || 0,
            type: tx.type || 'reward',
            reason: tx.reason || 'N/A',
            timestamp: tx.created_at ? new Date(tx.created_at).toLocaleString() : 'N/A',
            balance: tx.balance || 0,
          }))
          setTransactions(transformedTransactions)
          setError(null)
        }
      } catch (err) {
        console.error('Error fetching transactions:', err)
        setError('Failed to load transactions')
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.wallet.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || tx.type === filterType
    return matchesSearch && matchesType
  })

  const columns: TableColumn<GemsTransaction>[] = [
    {
      key: "user",
      label: "User",
      render: (value, row) => (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.wallet}</p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value) => {
        const icons = {
          add: <ArrowUp className="text-green-600" size={18} />,
          remove: <ArrowDown className="text-red-600" size={18} />,
          reward: <span className="text-purple-600">🎁</span>,
          purchase: <span className="text-blue-600">💳</span>,
        }
        return <div className="flex items-center gap-2">{icons[value as keyof typeof icons]}</div>
      },
    },
    {
      key: "amount",
      label: "Amount",
      render: (value, row) => (
        <span className={`font-bold ${row.type === "add" || row.type === "reward" ? "text-green-600" : "text-red-600"}`}>
          {row.type === "add" || row.type === "reward" ? "+" : "-"}
          {value} 💎
        </span>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (value) => <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>,
    },
    {
      key: "balance",
      label: "Balance",
      render: (value) => <span className="font-semibold text-gray-900 dark:text-white">{value} 💎</span>,
    },
    {
      key: "timestamp",
      label: "Date",
    },
  ]

  const totalTransactions = transactions.length
  const totalGemsDistributed = transactions
    .filter((t) => t.type === "add" || t.type === "reward")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalGemsRemoved = transactions
    .filter((t) => t.type === "remove")
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      {/* Loading & Error States */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Transactions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{transactions.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Gems Distributed</p>
              <p className="text-3xl font-bold text-green-600">
                {transactions.filter((t) => t.type === "add" || t.type === "reward").reduce((sum, t) => sum + t.amount, 0)} 💎
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Gems Removed</p>
              <p className="text-3xl font-bold text-red-600">
                {transactions.filter((t) => t.type === "remove").reduce((sum, t) => sum + t.amount, 0)} 💎
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by user or wallet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="add">Added</option>
              <option value="remove">Removed</option>
              <option value="reward">Rewards</option>
              <option value="purchase">Purchases</option>
            </select>
          </div>

          {/* Transactions Table */}
          <AdminTable data={filteredTransactions} columns={columns} />
        </>
      )}
    </div>
  )
}
