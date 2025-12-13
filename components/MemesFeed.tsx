"use client"

import React, { useState, useEffect } from "react"
import {
  Heart,
  MessageCircle,
  Share2,
  Search,
  Filter,
  TrendingUp,
  Flame,
  Clock,
  ArrowLeft,
} from "lucide-react"

interface Meme {
  id: string
  creator: string
  avatar: string
  title: string
  image: string
  likes: number
  comments: number
  liked: boolean
  timestamp: string
  category: string
}

interface MemesFeedProps {
  onBack: () => void
}

export const MemesFeed: React.FC<MemesFeedProps> = ({ onBack }) => {
  const [sortBy, setSortBy] = useState<"trending" | "recent">("trending")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<"all" | "funny" | "gaming" | "crypto" | "memes">("all")
  const [memes, setMemes] = useState<Meme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/admin/memes')
        if (!response.ok) {
          throw new Error(`Failed to fetch memes: ${response.statusText}`)
        }
        const data = await response.json()
        setMemes(data.data || [])
      } catch (err) {
        console.error('Error fetching memes:', err)
        setError(err instanceof Error ? err.message : 'Failed to load memes')
      } finally {
        setLoading(false)
      }
    }

    fetchMemes()
  }, [])

  const handleLike = (memeId: string) => {
    setMemes((prev) =>
      prev.map((m) =>
        m.id === memeId
          ? { ...m, liked: !m.liked, likes: m.liked ? m.likes - 1 : m.likes + 1 }
          : m
      )
    )
  }

  const filteredMemes = memes
    .filter((m) => filterCategory === "all" || m.category === filterCategory)
    .filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "trending") return b.likes - a.likes
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b-4 border-pink-600 p-6 shadow-lg sticky top-0 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-pink-600 mb-4 transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-5xl">🌟</span> MEME FEED
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Discover amazing memes from the community! 🎨</p>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-xl text-gray-600 dark:text-gray-400">Loading memes...</p>
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
        {/* Controls */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search memes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30"
            />
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {["all", "funny", "gaming", "crypto", "memes"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat as any)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    filterCategory === cat
                      ? "bg-pink-600 text-white shadow-lg"
                      : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:shadow-lg"
                  }`}
                >
                  {cat === "all" && "All"}
                  {cat === "funny" && "😂 Funny"}
                  {cat === "gaming" && "🎮 Gaming"}
                  {cat === "crypto" && "💰 Crypto"}
                  {cat === "memes" && "🎨 Memes"}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setSortBy("trending")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                  sortBy === "trending"
                    ? "bg-pink-600 text-white shadow-lg"
                    : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                }`}
              >
                <Flame size={18} />
                Trending
              </button>
              <button
                onClick={() => setSortBy("recent")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                  sortBy === "recent"
                    ? "bg-pink-600 text-white shadow-lg"
                    : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                }`}
              >
                <Clock size={18} />
                Recent
              </button>
            </div>
          </div>
        </div>

        {/* Memes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMemes.map((meme) => (
            <div
              key={meme.id}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition border border-gray-200 dark:border-gray-700"
            >
              {/* Meme Image */}
              <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden group">
                <img
                  src={meme.image}
                  alt={meme.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold">
                  🔥 {meme.likes}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Creator Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-lg">
                    {meme.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      {meme.creator}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{meme.timestamp}</p>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full">
                    {meme.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">
                  {meme.title}
                </h3>

                {/* Interactions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleLike(meme.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition ${
                      meme.liked
                        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    <Heart size={18} fill={meme.liked ? "currentColor" : "none"} />
                    {meme.likes}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition">
                    <MessageCircle size={18} />
                    {meme.comments}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition">
                    <Share2 size={18} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMemes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">No memes found</p>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search term</p>
          </div>
        )}

        {/* Load More */}
        {filteredMemes.length > 0 && (
          <div className="text-center pt-8">
            <button className="px-8 py-3 bg-gradient-to-r from-pink-600 to-pink-700 text-white font-bold rounded-lg hover:from-pink-700 hover:to-pink-800 transition shadow-lg">
              Load More Memes
            </button>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}
