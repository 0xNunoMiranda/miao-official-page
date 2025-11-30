"use client"

import { useState, useEffect, useCallback } from "react"
import { Utensils, Moon, Gamepad2, BookOpen, BarChart3 } from "lucide-react"

const catEmotions = [
  { name: "excited", src: "/images/header-cat.png" },
  { name: "happy", src: "/images/cat-happy.png" },
  { name: "laugh", src: "/images/cat-laugh.png" },
  { name: "surprise", src: "/images/cat-surprise.png" },
  { name: "sleepy", src: "/images/cat-sleepy.png" },
  { name: "sad", src: "/images/cat-sad.png" },
  { name: "mad", src: "/images/cat-mad.png" },
]

interface Stats {
  hunger: number
  energy: number
  happiness: number
  intelligence: number
}

export default function TamagotchiCat() {
  const [currentEmotion, setCurrentEmotion] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [stats, setStats] = useState<Stats>({
    hunger: 80,
    energy: 70,
    happiness: 90,
    intelligence: 60,
  })

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const changeEmotion = useCallback((newIndex: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentEmotion(newIndex)
      setIsTransitioning(false)
    }, 300)
  }, [])

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      changeEmotion((currentEmotion + 1) % catEmotions.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [currentEmotion, isPaused, changeEmotion])

  const handleFeed = () => {
    setIsPaused(true)
    changeEmotion(1) // happy
    setStats((prev) => ({ ...prev, hunger: Math.min(100, prev.hunger + 20) }))
    setTimeout(() => setIsPaused(false), 3000)
  }

  const handleSleep = () => {
    setIsPaused(true)
    changeEmotion(4) // sleepy
    setStats((prev) => ({ ...prev, energy: Math.min(100, prev.energy + 30) }))
    setTimeout(() => setIsPaused(false), 3000)
  }

  const handlePlay = () => {
    setIsPaused(true)
    changeEmotion(2) // laugh
    setStats((prev) => ({ ...prev, happiness: Math.min(100, prev.happiness + 25) }))
    setTimeout(() => setIsPaused(false), 3000)
  }

  const handleStudy = () => {
    setIsPaused(true)
    changeEmotion(3) // surprise
    setStats((prev) => ({ ...prev, intelligence: Math.min(100, prev.intelligence + 15) }))
    setTimeout(() => setIsPaused(false), 3000)
  }

  const handleClick = () => {
    setIsPaused(true)
    const randomIndex = Math.floor(Math.random() * catEmotions.length)
    changeEmotion(randomIndex)
    setTimeout(() => setIsPaused(false), 10000)
  }

  const handlePet = () => {
    setIsPaused(true)
    const happyEmotions = [0, 1, 2]
    const randomHappy = happyEmotions[Math.floor(Math.random() * happyEmotions.length)]
    changeEmotion(randomHappy)
  }

  const handleMouseLeave = () => {
    setTimeout(() => setIsPaused(false), 10000)
  }

  const ActionButton = ({
    icon: Icon,
    onClick,
    label,
  }: {
    icon: typeof Utensils
    onClick: () => void
    label: string
  }) => (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-full bg-[#2DD188] hover:bg-[#25b876] border-2 border-[#1a6b4a] border-b-4 active:border-b-2 active:translate-y-[2px] flex items-center justify-center transition-all"
      title={label}
    >
      <Icon size={18} className="text-white" />
    </button>
  )

  return (
    <div
      className={`flex flex-col items-center gap-4 transition-all duration-700 ease-out ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Cat image */}
      <div
        className="relative cursor-pointer select-none"
        style={{
          animation: "tamagotchi-float 3s ease-in-out infinite",
        }}
        onClick={handleClick}
        onMouseEnter={handlePet}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={catEmotions[currentEmotion].src || "/placeholder.svg"}
          alt={`Miao ${catEmotions[currentEmotion].name}`}
          className={`w-full max-w-[400px] h-auto object-contain transition-all duration-300 ease-in-out ${
            isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
          draggable={false}
        />
      </div>

      <div className="flex items-center gap-2">
        <ActionButton icon={Utensils} onClick={handleFeed} label="Feed" />
        <ActionButton icon={Moon} onClick={handleSleep} label="Sleep" />
        <ActionButton icon={Gamepad2} onClick={handlePlay} label="Play" />
        <ActionButton icon={BookOpen} onClick={handleStudy} label="Study" />
        <button
          onClick={() => setShowStats(!showStats)}
          className={`w-10 h-10 rounded-full border-2 border-b-4 active:border-b-2 active:translate-y-[2px] flex items-center justify-center transition-all ${
            showStats
              ? "bg-[var(--duo-green)] text-white border-[#1a6b4a]"
              : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)]"
          }`}
          title="Stats"
        >
          <BarChart3 size={18} />
        </button>
      </div>

      {showStats && (
        <div className="bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] border-b-4 rounded-2xl p-4 w-full max-w-[280px]">
          <div className="space-y-3">
            <StatBar label="Hunger" value={stats.hunger} color="#FF6B6B" />
            <StatBar label="Energy" value={stats.energy} color="#4ECDC4" />
            <StatBar label="Happy" value={stats.happiness} color="#FFE66D" />
            <StatBar label="Smart" value={stats.intelligence} color="#A78BFA" />
          </div>
        </div>
      )}
    </div>
  )
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold w-14 text-[var(--text-primary)]">{label}</span>
      <div className="flex-1 h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden border-2 border-[var(--border-color)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold w-8 text-right text-[var(--text-primary)]">{value}%</span>
    </div>
  )
}
