"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, Wind, Leaf, Snowflake } from "lucide-react"

export type Season = "normal" | "fall" | "winter"

interface SeasonOption {
  value: Season
  label: string
  icon: React.ReactNode
}

const seasons: SeasonOption[] = [
  { value: "normal", label: "Normal", icon: <Wind size={18} /> },
  { value: "fall", label: "Fall Season", icon: <Leaf size={18} /> },
  { value: "winter", label: "Winter Season", icon: <Snowflake size={18} /> },
]

interface SeasonSelectorProps {
  season: Season
  onSeasonChange: (season: Season) => void
  compact?: boolean
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({ season, onSeasonChange, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentSeason = seasons.find((s) => s.value === season)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 rounded-xl border-2 border-[var(--border-color)] border-b-4 
          bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]
          active:border-b-2 active:translate-y-0.5 transition-all
          ${compact ? "w-11 h-11 justify-center" : "px-3 py-2"}
        `}
        title={compact ? currentSeason?.label : undefined}
        aria-label={`Select season: ${currentSeason?.label}`}
      >
        <span className="text-[var(--text-secondary)]">{currentSeason?.icon}</span>
        {!compact && (
          <>
            <span className="text-sm font-bold text-[var(--text-primary)] hidden sm:block">
              {currentSeason?.label}
            </span>
            <ChevronDown
              size={16}
              className={`text-[var(--text-secondary)] transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-[var(--bg-primary)] border-2 border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden z-50 min-w-[180px]">
          {seasons.map((seasonOption) => (
            <button
              key={seasonOption.value}
              onClick={() => {
                onSeasonChange(seasonOption.value)
                setIsOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-left
                hover:bg-[var(--bg-secondary)] transition-colors
                ${season === seasonOption.value ? "bg-[var(--brand)]/10 text-[var(--brand)]" : "text-[var(--text-primary)]"}
              `}
            >
              <span className="text-[var(--text-secondary)]">{seasonOption.icon}</span>
              <span className="font-bold">{seasonOption.label}</span>
              {season === seasonOption.value && <span className="ml-auto text-[var(--brand)]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SeasonSelector

