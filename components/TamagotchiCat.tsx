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
      className="w-14 h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-full bg-[#2DD188] hover:bg-[#25b876] border-2 border-[#1a6b4a] border-b-4 active:border-b-2 active:translate-y-[2px] flex items-center justify-center transition-all"
      title={label}
    >
      <Icon size={20} className="text-white md:w-5 md:h-5 lg:w-6 lg:h-6" />
    </button>
  )

  return (
    <div
      className={`flex flex-row items-start gap-2 md:gap-3 transition-all duration-700 ease-out relative ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Botões verticais à esquerda */}
      <div className="flex flex-col items-center gap-3 md:gap-4 relative z-10 flex-shrink-0">
        <ActionButton icon={Utensils} onClick={handleFeed} label="Feed" />
        <ActionButton icon={Moon} onClick={handleSleep} label="Sleep" />
        <ActionButton icon={Gamepad2} onClick={handlePlay} label="Play" />
        <ActionButton icon={BookOpen} onClick={handleStudy} label="Study" />
        <button
          onClick={() => setShowStats(!showStats)}
          className={`w-14 h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-full border-2 border-b-4 active:border-b-2 active:translate-y-[2px] flex items-center justify-center transition-all ${
            showStats
              ? "bg-[var(--duo-green)] text-white border-[#1a6b4a]"
              : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)]"
          }`}
          title="Stats"
        >
          <BarChart3 size={20} className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
        </button>
      </div>

      {/* Cat image */}
      <div
        className="relative cursor-pointer select-none flex-shrink-0"
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
          className={`w-full max-w-[380px] md:max-w-[480px] lg:max-w-[580px] h-auto object-contain transition-all duration-300 ease-in-out ${
            isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
          draggable={false}
        />
      </div>

      {showStats && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] border-b-4 rounded-2xl p-6 md:p-8 w-full max-w-[400px] md:max-w-[450px] shadow-2xl z-50">
          <div className="space-y-4 md:space-y-5">
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
    <div className="flex items-center gap-3">
      <span className="text-sm md:text-base font-bold w-16 md:w-20 text-[var(--text-primary)]">{label}</span>
      <div className="flex-1 h-4 md:h-5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden border-2 border-[var(--border-color)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm md:text-base font-bold w-10 md:w-12 text-right text-[var(--text-primary)]">{value}%</span>
    </div>
  )
}
