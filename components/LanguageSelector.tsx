"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "../lib/language-context"
import { languages } from "../lib/translations"

interface LanguageSelectorProps {
  compact?: boolean
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })

  const currentLang = languages.find((l) => l.code === language)

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

      {isOpen && typeof window !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed bg-[var(--bg-primary)] border-2 border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden z-[9999] min-w-[180px]"
          style={{
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`
          }}
        >
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
        </div>,
        document.body
      )}
    </div>
  )
}

export default LanguageSelector
