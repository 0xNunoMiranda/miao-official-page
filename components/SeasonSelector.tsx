"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
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
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })

  const currentSeason = seasons.find((s) => s.value === season)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        buttonRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return
      }
      setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right
        })
      }
    }
    
    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen])

  return (
    <div className="relative overflow-visible" ref={containerRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 rounded-xl border-2 border-[var(--border-color)] border-b-4 
          bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]
          active:border-b-2 active:translate-y-0.5 transition-all
          ${compact ? "w-11 h-11 justify-center" : "h-11 px-3"}
        `}
        title={compact ? currentSeason?.label : undefined}
        aria-label={`Select season: ${currentSeason?.label}`}
      >
        <span className="text-[var(--text-secondary)] flex-shrink-0">{currentSeason?.icon}</span>
        {!compact && (
          <>
            <span className="text-sm font-bold text-[var(--text-primary)] hidden sm:block whitespace-nowrap">
              {currentSeason?.label}
            </span>
            <ChevronDown
              size={16}
              className={`text-[var(--text-secondary)] transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>

      {isOpen && typeof window !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed bg-[var(--bg-primary)] border-2 border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden z-[9999] min-w-[180px]"
          style={{
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`
          }}
        >
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
        </div>,
        document.body
      )}
    </div>
  )
}

export default SeasonSelector

