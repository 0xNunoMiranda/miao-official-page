"use client"

import type React from "react"
import { X } from "lucide-react"
import { useLanguage } from "../lib/language-context"

interface WhitepaperModalProps {
  isOpen: boolean
  onClose: () => void
}

const whitepaperUrls: Record<string, string> = {
  pt: "https://fish-mile-a5f.notion.site/PT-MIAO-Whitepaper-2bb3cf178772809fac7ae5e614c67841",
  en: "https://fish-mile-a5f.notion.site/EN-MIAO-Whitepaper-2bb3cf178772809fac7ae5e614c67841",
  es: "https://fish-mile-a5f.notion.site/ES-MIAO-Whitepaper-2bb3cf178772809fac7ae5e614c67841",
  fr: "https://fish-mile-a5f.notion.site/FR-MIAO-Whitepaper-2bb3cf178772809fac7ae5e614c67841",
  de: "https://fish-mile-a5f.notion.site/DE-MIAO-Whitepaper-2bb3cf178772809fac7ae5e614c67841",
  zh: "https://fish-mile-a5f.notion.site/ZH-MIAO-Whitepaper-2bb3cf178772809fac7ae5e614c67841",
  ar: "https://fish-mile-a5f.notion.site/AR-MIAO-Whitepaper-2bb3cf178772809fac7ae5e614c67841",
}

const WhitepaperModal: React.FC<WhitepaperModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage()
  
  // Get URL based on current language, fallback to EN if not available
  const whitepaperUrl = whitepaperUrls[language] || whitepaperUrls.en

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-6xl h-[90vh] bg-[var(--bg-primary)] rounded-3xl border-2 border-[var(--border-color)] border-b-4 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b-2 border-[var(--border-color)]">
          <h2 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
            Whitepaper
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-primary)] border-2 border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Iframe */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={whitepaperUrl}
            className="w-full h-full border-0"
            title="MIAO Whitepaper"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}

export default WhitepaperModal

