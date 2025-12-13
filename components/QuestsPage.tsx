"use client"

import React, { useState, useEffect } from "react"
import {
  CheckSquare,
  Lock,
  Zap,
  Gift,
  Calendar,
  Clock,
  Trophy,
  Target,
  ArrowLeft,
} from "lucide-react"

interface Quest {
  id: string
  title: string
  description: string
  type: "daily" | "weekly" | "one-time" | "recurring"
  rewards: number
  progress: number
  maxProgress: number
  status: "available" | "in-progress" | "completed" | "claimed"
  icon: string
  difficulty: "easy" | "medium" | "hard"
  deadline?: string
}

interface QuestsPageProps {
  onBack: () => void
}

export const QuestsPage: React.FC<QuestsPageProps> = ({ onBack }) => {
  const [selectedTab, setSelectedTab] = useState<"daily" | "weekly" | "all">("daily")
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/admin/quests')
        if (!response.ok) {
          throw new Error(`Failed to fetch quests: ${response.statusText}`)
        }
        const data = await response.json()
        setQuests(data.data || [])
      } catch (err) {
        console.error('Error fetching quests:', err)
        setError(err instanceof Error ? err.message : 'Failed to load quests')
      } finally {
        setLoading(false)
      }
    }

    fetchQuests()
  }, [])

  const filteredQuests = quests.filter((q) => {
    if (selectedTab === "all") return true
    return q.type === selectedTab
  })

  const handleClaimReward = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, status: "claimed" as const } : q))
    )
    alert("Quest completed! +gems earned 💎")
  }

  const getTypeColor = (type: string) => {
    const colors = {
      daily: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      weekly: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      "one-time": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      recurring: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    }
    return colors[type as keyof typeof colors]
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: "text-green-600 dark:text-green-400",
      medium: "text-amber-600 dark:text-amber-400",
      hard: "text-red-600 dark:text-red-400",
    }
    return colors[difficulty as keyof typeof colors]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b-4 border-blue-600 p-6 shadow-lg">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 mb-4 transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-5xl">🎯</span> QUESTS & MISSIONS
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Complete quests to earn gems and level up! 🚀</p>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-xl text-gray-600 dark:text-gray-400">Loading quests...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-700 rounded-xl p-4 mb-6">
            <p className="text-red-800 dark:text-red-400 font-semibold">Error: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800 shadow-lg text-center">
            <p className="text-2xl font-black text-blue-600">{quests.filter((q) => q.status === "in-progress").length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border-2 border-green-200 dark:border-green-800 shadow-lg text-center">
            <p className="text-2xl font-black text-green-600">{quests.filter((q) => q.status === "completed").length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800 shadow-lg text-center">
            <p className="text-2xl font-black text-purple-600">
              +{quests.filter((q) => q.status === "completed" || q.status === "in-progress").reduce((sum, q) => sum + q.rewards, 0)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Potential Gems</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {["daily", "weekly", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as any)}
              className={`px-6 py-3 font-bold rounded-xl transition border-b-4 ${
                selectedTab === tab
                  ? "bg-blue-600 text-white border-blue-800 shadow-lg"
                  : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:shadow-lg"
              }`}
            >
              {tab === "daily" && "📅 Daily"}
              {tab === "weekly" && "📆 Weekly"}
              {tab === "all" && "⭐ All Quests"}
            </button>
          ))}
        </div>

        {/* Quests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuests.map((quest) => (
            <div
              key={quest.id}
              className={`rounded-2xl border-2 overflow-hidden shadow-lg transition hover:shadow-xl cursor-pointer ${
                quest.status === "claimed"
                  ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-70"
                  : quest.status === "completed"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-700"
                  : "bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700"
              }`}
              onClick={() => quest.status !== "claimed" && setSelectedQuest(quest)}
            >
              {/* Card Header */}
              <div className={`p-4 border-b-2 flex items-start justify-between ${
                quest.status === "claimed"
                  ? "bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-600"
                  : quest.status === "completed"
                  ? "bg-green-200 dark:bg-green-900/40 border-green-400 dark:border-green-700"
                  : "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border-blue-300 dark:border-blue-700"
              }`}>
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-4xl">{quest.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{quest.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                      {quest.description}
                    </p>
                  </div>
                </div>
                {quest.status === "claimed" && (
                  <div className="text-2xl">✅</div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Type & Difficulty */}
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(quest.type)}`}>
                    {quest.type.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 ${getDifficultyColor(quest.difficulty)}`}>
                    {quest.difficulty.toUpperCase()}
                  </span>
                </div>

                {/* Progress Bar */}
                {quest.status !== "claimed" && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        Progress: {quest.progress}/{quest.maxProgress}
                      </span>
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">
                        +{quest.rewards} 💎
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          quest.status === "completed"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${(quest.progress / quest.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Status Info */}
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    {quest.deadline && (
                      <>
                        <Clock size={14} />
                        <span>{quest.deadline}</span>
                      </>
                    )}
                  </div>
                  <span className="font-semibold">
                    {quest.status === "completed" ? "✓ Done" : quest.status === "claimed" ? "✓ Claimed" : "In Progress"}
                  </span>
                </div>

                {/* Action Button */}
                {quest.status === "completed" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleClaimReward(quest.id)
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition flex items-center justify-center gap-2"
                  >
                    <Gift size={18} />
                    Claim Reward
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredQuests.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🎭</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">No quests available</p>
            <p className="text-gray-600 dark:text-gray-400">Check back later for new challenges!</p>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}
