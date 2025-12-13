"use client"

import React, { useState, useEffect } from "react"
import type { WalletState } from "../types"
import {
  Gem,
  TrendingUp,
  Users,
  Award,
  Zap,
  Target,
  Gift,
  Shield,
  Crown,
} from "lucide-react"

interface ClientDashboardProps {
  walletState: WalletState
}

interface UserStats {
  level: number
  experience: number
  nextLevelExp: number
  gemsBalance: number
  gemsThisWeek: number
  questsCompleted: number
  memesCreated: number
  memesLiked: number
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ walletState }) => {
  const [stats, setStats] = useState<UserStats>({
    level: 0,
    experience: 0,
    nextLevelExp: 0,
    gemsBalance: 0,
    gemsThisWeek: 0,
    questsCompleted: 0,
    memesCreated: 0,
    memesLiked: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!walletState.address) {
        setLoading(false)
        setError('Wallet not connected')
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/user/${walletState.address}/stats`)
        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`)
        }
        const data = await response.json()
        setStats(data.data || {})
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }

    fetchUserStats()
  }, [walletState.address])

  const expProgress = (stats.experience / stats.nextLevelExp) * 100

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading your profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-700 rounded-xl p-4">
        <p className="text-red-800 dark:text-red-400 font-semibold">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section - Wallet Info */}
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-400 rounded-3xl p-8 text-white shadow-2xl border-b-4 border-green-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-green-100 text-sm font-semibold mb-2">Wallet Connected</p>
            <p className="font-mono text-xl font-bold">{walletState.address?.substring(0, 6)}...{walletState.address?.substring(-4)}</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full border-4 border-white flex items-center justify-center text-3xl">
            {stats.level <= 10 ? "🐱" : stats.level <= 20 ? "🐯" : "👑"}
          </div>
        </div>

        {/* Level & Experience */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold">Level {stats.level}</span>
            <span className="text-xs bg-white/30 px-3 py-1 rounded-full font-semibold">
              {stats.experience.toLocaleString()} / {stats.nextLevelExp.toLocaleString()} XP
            </span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden border-2 border-white">
            <div
              className="h-full bg-yellow-300 transition-all duration-500"
              style={{ width: `${expProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Gems Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg border-b-4 border-purple-700 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <Gem size={28} className="opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-bold">+{stats.gemsThisWeek} this week</span>
          </div>
          <p className="text-sm font-semibold opacity-90 mb-2">Your Gems</p>
          <p className="text-4xl font-black mb-1">{stats.gemsBalance}</p>
          <div className="w-full bg-white/20 rounded-full h-1 mt-4"></div>
        </div>

        {/* Level Progress */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg border-b-4 border-blue-700 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={28} className="opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-bold">Progress</span>
          </div>
          <p className="text-sm font-semibold opacity-90 mb-2">Current Level</p>
          <p className="text-4xl font-black">{Math.floor(expProgress)}%</p>
          <p className="text-xs opacity-75 mt-2">to level {stats.level + 1}</p>
        </div>

        {/* Quests Completed */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg border-b-4 border-amber-700 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <Target size={28} className="opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-bold">This month</span>
          </div>
          <p className="text-sm font-semibold opacity-90 mb-2">Quests Done</p>
          <p className="text-4xl font-black">{stats.questsCompleted}</p>
          <p className="text-xs opacity-75 mt-2">Keep going! 🚀</p>
        </div>

        {/* Community Stats */}
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg border-b-4 border-pink-700 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <Users size={28} className="opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-bold">Memes</span>
          </div>
          <p className="text-sm font-semibold opacity-90 mb-2">Community Love</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black">{stats.memesLiked}</p>
            <p className="text-xs opacity-75">likes received</p>
          </div>
        </div>
      </div>

      {/* Achievement Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Crown size={24} className="text-amber-600" />
          Your Achievements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[
            { emoji: "🎯", name: "First Quest", unlocked: true },
            { emoji: "🎨", name: "Meme Creator", unlocked: true },
            { emoji: "❤️", name: "Popular", unlocked: true },
            { emoji: "🔥", name: "On Fire", unlocked: false },
            { emoji: "💎", name: "Gem Collector", unlocked: false },
          ].map((achievement, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition ${
                achievement.unlocked
                  ? "bg-amber-100 dark:bg-amber-900/30 border-amber-400 dark:border-amber-700"
                  : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-60"
              }`}
            >
              <span className="text-3xl mb-2">{achievement.emoji}</span>
              <span className="text-xs font-bold text-center text-gray-800 dark:text-gray-200">
                {achievement.name}
              </span>
              {!achievement.unlocked && (
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">🔒</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 font-bold hover:shadow-lg transition border-b-4 border-green-700">
          <Gift size={24} className="mb-3" />
          <p>Claim Daily Reward</p>
        </button>
        <button className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 font-bold hover:shadow-lg transition border-b-4 border-blue-700">
          <Zap size={24} className="mb-3" />
          <p>Available Quests</p>
        </button>
        <button className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 font-bold hover:shadow-lg transition border-b-4 border-purple-700">
          <Award size={24} className="mb-3" />
          <p>Leaderboard</p>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">This Month Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-black text-green-600 mb-2">{stats.memesCreated}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Memes Created</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-purple-600 mb-2">{stats.questsCompleted}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Quests Completed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-pink-600 mb-2">{stats.memesLiked}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Likes Received</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-amber-600 mb-2">+{stats.gemsThisWeek * 4}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gems Earned</p>
          </div>
        </div>
      </div>
    </div>
  )
}
