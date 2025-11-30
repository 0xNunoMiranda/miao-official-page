"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "../lib/language-context"
import { languages } from "../lib/translations"

interface LanguageSelectorProps {
  compact?: boolean
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLang = languages.find((l) => l.code === language)

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
      >
        <span className="text-lg">{currentLang?.flag}</span>
        {!compact && (
          <>
            <span className="text-sm font-bold text-[var(--text-primary)] hidden sm:block">
              {currentLang?.code.toUpperCase()}
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
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code)
                setIsOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-left
                hover:bg-[var(--bg-secondary)] transition-colors
                ${language === lang.code ? "bg-[var(--brand)]/10 text-[var(--brand)]" : "text-[var(--text-primary)]"}
              `}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="font-bold">{lang.name}</span>
              {language === lang.code && <span className="ml-auto text-[var(--brand)]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
