"use client"

import { useState, useEffect, useRef } from "react"
import { AlertTriangle, X, MessageCircle } from "lucide-react"
import { useLanguage } from "../lib/language-context"

const DISCLAIMER_URL = "https://miaodotarmy.notion.site/DISCLAIMER-FROM-NEW-TEAM-2c8bc193fe2e80b3885eea909fa4c8db?source=copy_link"

export default function DisclaimerBanner() {
  const { t } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Verificar se o usuário já minimizou o banner anteriormente (apenas na montagem inicial)
    const minimized = localStorage.getItem("disclaimer-minimized")
    if (minimized === "true") {
      setIsExpanded(false)
      document.documentElement.style.setProperty("--disclaimer-banner-height", "0px")
      return
    }
  }, [])

  useEffect(() => {
    // Calcular altura do banner e atualizar CSS variable quando expandido/minimizado
    const updateBannerHeight = () => {
      if (bannerRef.current && isExpanded) {
        const height = bannerRef.current.offsetHeight
        document.documentElement.style.setProperty("--disclaimer-banner-height", `${height}px`)
      } else {
        document.documentElement.style.setProperty("--disclaimer-banner-height", "0px")
      }
    }
    
    // Pequeno delay para garantir que o DOM foi atualizado
    const timeoutId = setTimeout(updateBannerHeight, 10)
    window.addEventListener("resize", updateBannerHeight)
    
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("resize", updateBannerHeight)
    }
  }, [isExpanded])

  const handleMinimize = () => {
    setIsExpanded(false)
    localStorage.setItem("disclaimer-minimized", "true")
    document.documentElement.style.setProperty("--disclaimer-banner-height", "0px")
  }

  const handleIconClick = () => {
    setShowConfirmModal(true)
  }

  const handleConfirmRedirect = () => {
    window.open(DISCLAIMER_URL, "_blank", "noopener,noreferrer")
    setShowConfirmModal(false)
  }

  const handleCancelRedirect = () => {
    setShowConfirmModal(false)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flash-sale-pulse {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 20px rgba(255, 193, 7, 0.5);
          }
          50% {
            opacity: 0.95;
            box-shadow: 0 0 30px rgba(255, 193, 7, 0.8);
          }
        }
        @keyframes disclaimer-shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes icon-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(255, 193, 7, 0);
          }
        }
      `}} />
      
      {/* Expanded Banner */}
      {isExpanded && (
        <div
          ref={bannerRef}
          className="fixed top-0 left-0 right-0 w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 text-white py-2 px-4 z-[10000] transition-all duration-300"
          style={{
            animation: "flash-sale-pulse 2s ease-in-out infinite",
          }}
        >
          <div className="max-w-[1400px] mx-auto flex items-center justify-center gap-3 relative">
            {/* Left icon */}
            <AlertTriangle 
              size={20} 
              className="flex-shrink-0 animate-bounce"
              style={{ animationDuration: "1.5s" }}
            />
            
            {/* Text content - clickable */}
            <button
              onClick={handleIconClick}
              className="flex-1 text-center font-black text-xs sm:text-sm md:text-base uppercase tracking-wide hover:underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-yellow-400 rounded px-2 py-1"
            >
              {t("disclaimer.message")}
            </button>
            
            {/* Minimize button */}
            <button
              onClick={handleMinimize}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-yellow-400"
              aria-label={t("disclaimer.close")}
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Animated shimmer effect */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              animation: "disclaimer-shimmer 3s infinite",
            }}
          />
        </div>
      )}

      {/* Minimized Icon */}
      {!isExpanded && (
        <div
          ref={iconRef}
          className="fixed bottom-6 right-6 z-[9999] cursor-pointer"
          onClick={handleIconClick}
        >
          <div
            className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            style={{
              animation: "icon-pulse 2s ease-in-out infinite",
            }}
          >
            <MessageCircle size={24} className="text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={handleCancelRedirect}
          />
          
          <div className="relative w-full max-w-md bg-[var(--bg-primary)] border-2 border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl animate-fade-up">
            <div className="flex justify-between items-center p-5 border-b-2 border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <h2 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center">
                  <AlertTriangle className="text-white" size={20} />
                </div>
                {t("disclaimer.modalTitle")}
              </h2>
              <button
                onClick={handleCancelRedirect}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-[var(--text-primary)] text-center font-medium mb-4">
                {t("disclaimer.modalMessage")}
              </p>
              
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4 mb-6 border-2 border-[var(--border-color)]">
                <p className="text-sm text-[var(--text-secondary)] text-center">
                  {t("disclaimer.modalNote")}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelRedirect}
                  className="flex-1 px-4 py-3 rounded-xl font-bold border-2 border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
                >
                  {t("disclaimer.cancel")}
                </button>
                <button
                  onClick={handleConfirmRedirect}
                  className="flex-1 px-4 py-3 rounded-xl font-black text-white transition-all hover:opacity-90"
                  style={{
                    background: "linear-gradient(to right, #fbbf24, #f97316, #ef4444)",
                  }}
                >
                  {t("disclaimer.confirm")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

