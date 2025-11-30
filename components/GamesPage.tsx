"use client"

import type React from "react"
import { useState } from "react"
import type { WalletState } from "../types"
import { ArrowLeft, Gamepad2, Flame, Zap, Crown, Maximize2, X } from "lucide-react"

interface GamesPageProps {
  onBack: () => void
  walletState: WalletState
}

interface MiaoGame {
  id: string
  title: string
  description: string
  image: string
  embedUrl: string
  embedWidth: number
  embedHeight: number
  itchUrl: string
  isHot?: boolean
  isNew?: boolean
}

const miaoGames: MiaoGame[] = [
  {
    id: "1",
    title: "Miao Card Battle",
    description:
      "Battle against other players in this strategic card game! Collect cards, build your deck, and become the ultimate MIAO champion.",
    image: "/images/image.png",
    embedUrl: "https://itch.io/embed-upload/15609552?color=333333",
    embedWidth: 640,
    embedHeight: 960,
    itchUrl: "https://miaoonsol.itch.io/miao-card-battle-game",
    isHot: true,
  },
  {
    id: "2",
    title: "Miao Archaeological Dig",
    description:
      "Explore ancient ruins and uncover hidden treasures! Dig through layers of history as the adventurous MIAO explorer.",
    image: "/images/image.png",
    embedUrl: "https://itch.io/embed-upload/15588886?color=333333",
    embedWidth: 640,
    embedHeight: 860,
    itchUrl: "https://miaoonsol.itch.io/miao-archeological-dig",
    isNew: true,
  },
  {
    id: "3",
    title: "MIAO The Terminator",
    description:
      "Action-packed shooter where MIAO takes on waves of enemies! Blast your way through levels and save the world.",
    image: "/images/image.png",
    embedUrl: "https://itch.io/embed-upload/15609552?color=333333",
    embedWidth: 640,
    embedHeight: 960,
    itchUrl: "https://miaoonsol.itch.io/miao-the-terminator",
  },
]

const GamesPage: React.FC<GamesPageProps> = ({ onBack, walletState }) => {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedGame, setSelectedGame] = useState<MiaoGame | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const NavButton = ({ id, icon: Icon, label }: { id: string; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        w-full text-left p-4 rounded-2xl font-black flex items-center gap-4 transition-all border-2 border-transparent btn-comic
        ${
          activeTab === id
            ? "bg-[var(--brand-green)] bg-opacity-10 text-[var(--brand-green)] border-[var(--brand-green)] border-opacity-20 border-b-4"
            : "text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
        }
      `}
    >
      <Icon size={28} className={activeTab === id ? "fill-current" : ""} strokeWidth={2.5} />
      <span className="text-lg tracking-tight">{label}</span>
    </button>
  )

  // Game modal for playing
  const GameModal = () => {
    if (!selectedGame) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div
          className={`bg-[var(--bg-primary)] rounded-3xl overflow-hidden shadow-2xl transition-all ${isFullscreen ? "w-full h-full" : "max-w-4xl w-full max-h-[90vh]"}`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b-2 border-[var(--bg-tertiary)]">
            <h3 className="text-xl font-black text-[var(--text-primary)]">{selectedGame.title}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Maximize2 size={20} />
              </button>
              <button
                onClick={() => {
                  setSelectedGame(null)
                  setIsFullscreen(false)
                }}
                className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Game iframe */}
          <div className={`${isFullscreen ? "h-[calc(100%-60px)]" : "aspect-[3/4] max-h-[70vh]"} w-full`}>
            <iframe src={selectedGame.embedUrl} className="w-full h-full" allowFullScreen frameBorder="0" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-12 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-12 h-12 bg-[var(--bg-secondary)] rounded-xl border-b-4 border-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all flex items-center justify-center active:border-b-0 active:translate-y-1 btn-comic"
            >
              <ArrowLeft size={24} strokeWidth={3} />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight leading-none">
                MIAO Games
              </h1>
              <span className="text-[var(--text-muted)] font-bold text-sm">Play & Have Fun</span>
            </div>
          </div>

          {/* Wallet / Points Status */}
          <div className="flex items-center gap-3 bg-[var(--bg-secondary)] border-2 border-[var(--bg-tertiary)] rounded-2xl p-2 pr-6 shadow-sm">
            <div className="w-12 h-12 bg-transparent flex items-center justify-center">
              <Crown size={32} className="text-yellow-400 fill-current animate-bounce" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-black text-yellow-500 tracking-tight">PLAYER</span>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                {walletState.isConnected ? walletState.address?.slice(0, 6) : "GUEST"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <div className="sticky top-28 space-y-2">
              <NavButton id="all" icon={Gamepad2} label="All Games" />
              <NavButton id="action" icon={Zap} label="Action" />
              <NavButton id="hot" icon={Flame} label="Hot" />

              <div className="mt-8 pt-6 border-t-2 border-[var(--bg-tertiary)] px-4">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-3 tracking-widest">Game Info</p>
                <div className="bg-[var(--bg-secondary)] p-4 rounded-2xl border-2 border-[var(--bg-tertiary)]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-black text-[var(--text-secondary)]">Total Games</span>
                    <span className="text-[var(--brand-green)] font-black">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-[var(--text-secondary)]">Platform</span>
                    <span className="text-blue-500 font-black">itch.io</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-8 animate-fade-up">
            {/* Featured Banner - Miao Card Battle */}
            <div
              onClick={() => setSelectedGame(miaoGames[0])}
              className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-[2.5rem] p-8 relative overflow-hidden border-b-8 border-emerald-700 shadow-xl group cursor-pointer hover:brightness-105 transition-all"
            >
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left text-white max-w-md">
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-lg font-black text-xs uppercase tracking-wide inline-block mb-3 border-b-2 border-yellow-600">
                    Featured Game
                  </span>
                  <h2 className="text-4xl font-black mb-2 leading-tight">Miao Card Battle</h2>
                  <p className="text-emerald-100 font-bold text-lg mb-6">
                    Battle against other players in this strategic card game! Collect cards and become the ultimate
                    champion.
                  </p>
                  <button className="bg-white text-emerald-600 font-black px-8 py-4 rounded-xl border-b-4 border-emerald-200 hover:bg-emerald-50 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-wide flex items-center gap-2 mx-auto md:mx-0 btn-comic">
                    <Gamepad2 size={20} /> Play Now
                  </button>
                </div>

                {/* Hero Image */}
                <div className="w-64 h-48 rounded-2xl border-4 border-emerald-300 transform rotate-3 shadow-lg overflow-hidden">
                  <img
                    src="/images/image.png"
                    alt="Miao Card Battle"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
            </div>

            {/* Games Grid */}
            <div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <Flame className="text-orange-400 fill-current" /> All MIAO Games
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {miaoGames.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => setSelectedGame(game)}
                    className="bg-[var(--bg-secondary)] rounded-[2rem] border-2 border-[var(--bg-tertiary)] p-4 shadow-sm hover:border-[var(--brand-green)] transition-all group cursor-pointer hover:-translate-y-2"
                  >
                    <div className="aspect-video bg-[var(--bg-tertiary)] rounded-2xl mb-4 relative overflow-hidden">
                      <img
                        src={game.image || "/placeholder.svg"}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {game.isHot && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg border-b-2 border-red-700">
                          HOT
                        </span>
                      )}
                      {game.isNew && (
                        <span className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-lg border-b-2 border-blue-700">
                          NEW
                        </span>
                      )}
                    </div>

                    <div className="mb-3">
                      <h4 className="font-black text-lg text-[var(--text-primary)] leading-tight mb-1">{game.title}</h4>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2">{game.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t-2 border-[var(--bg-tertiary)]">
                      <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1">
                        <Gamepad2 size={14} /> itch.io
                      </span>
                      <button className="bg-[var(--brand-green)] text-white px-6 py-2 rounded-xl font-black text-sm border-b-4 border-green-700 hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all btn-comic">
                        PLAY
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Modal */}
      <GameModal />
    </div>
  )
}

export default GamesPage
