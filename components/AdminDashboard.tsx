"use client"

import React, { useState, useEffect } from "react"
import {
  Users,
  Gem,
  CheckSquare,
  Image,
  TrendingUp,
  Activity,
  DollarSign,
  AlertCircle,
} from "lucide-react"
import { StatCard } from "@/components/AdminComponents"

interface DashboardStats {
  totalUsers: number
  activeToday: number
  totalGems: number
  totalQuests: number
  memesCreated: number
  memesReported: number
  avgSessionTime: string
  revenue: number
}

interface AdminDashboardProps {}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 2453,
    activeToday: 487,
    totalGems: 1250000,
    totalQuests: 24,
    memesCreated: 5420,
    memesReported: 12,
    avgSessionTime: "12m 34s",
    revenue: 45320,
  })

  const [loading, setLoading] = useState(false)

  // Simular carregamento de dados
  useEffect(() => {
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }, [])

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<Users size={24} />}
          trend={{ value: 12, up: true }}
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          label="Active Today"
          value={stats.activeToday}
          icon={<Activity size={24} />}
          trend={{ value: 8, up: true }}
          bgColor="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          label="Total Gems"
          value={`${(stats.totalGems / 1000).toFixed(0)}K`}
          icon={<Gem size={24} />}
          trend={{ value: 5, up: true }}
          bgColor="bg-purple-50 dark:bg-purple-900/20"
        />
        <StatCard
          label="Active Quests"
          value={stats.totalQuests}
          icon={<CheckSquare size={24} />}
          trend={{ value: 2, up: false }}
          bgColor="bg-amber-50 dark:bg-amber-900/20"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Memes Created"
          value={stats.memesCreated}
          icon={<Image size={24} />}
          trend={{ value: 23, up: true }}
          bgColor="bg-pink-50 dark:bg-pink-900/20"
        />
        <StatCard
          label="Revenue (30d)"
          value={`$${stats.revenue.toLocaleString()}`}
          icon={<DollarSign size={24} />}
          trend={{ value: 15, up: true }}
          bgColor="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          label="Reported Memes"
          value={stats.memesReported}
          icon={<AlertCircle size={24} />}
          trend={{ value: 3, up: false }}
          bgColor="bg-red-50 dark:bg-red-900/20"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">User Activity (7 Days)</h3>
          <div className="space-y-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
              <div key={day} className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-12">{day}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-8 rounded-full flex items-center justify-end pr-3"
                    style={{ width: `${40 + Math.random() * 60}%` }}
                  >
                    <span className="text-xs font-bold text-white">{Math.floor(200 + Math.random() * 300)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activities</h3>
          <div className="space-y-4">
            {[
              { user: "User #2543", action: "Claimed Quest Reward", time: "2 mins ago" },
              { user: "User #1234", action: "Created New Meme", time: "5 mins ago" },
              { user: "User #5678", action: "Received Gems", time: "12 mins ago" },
              { user: "User #9012", action: "Started Quest", time: "18 mins ago" },
              { user: "User #3456", action: "Shared Meme", time: "24 mins ago" },
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-gray-600"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{activity.user}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">System Health</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Database", status: "Healthy", uptime: "99.9%" },
            { name: "API Server", status: "Healthy", uptime: "99.8%" },
            { name: "Cache", status: "Healthy", uptime: "100%" },
            { name: "Image Generation", status: "Healthy", uptime: "99.5%" },
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-2">✓ {item.status}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Uptime: {item.uptime}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
