"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Menu, X, Sun, Moon, Wallet, LogOut, FileText, Gamepad2, Wrench, Volume2, VolumeX, Send, Twitter, Instagram } from "lucide-react"
import type { WalletState } from "../types"
import { useLanguage } from "../lib/language-context"
import LanguageSelector from "./LanguageSelector"
import SeasonSelector, { type Season } from "./SeasonSelector"

const TikTokIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

interface HeaderProps {
  walletState?: WalletState
  onConnectClick?: () => void
  onDisconnectClick?: () => void
  onSwapClick?: () => void
  soundEnabled: boolean
  toggleSound: () => void
  onToolsClick?: () => void
  onGamesClick?: () => void
  onWhitepaperClick?: () => void
  season: Season
  onSeasonChange: (season: Season) => void
}

const Header: React.FC<HeaderProps> = ({
  walletState,
  onConnectClick,
  onDisconnectClick,
  onSwapClick,
  soundEnabled,
  toggleSound,
  onToolsClick,
  onGamesClick,
  onWhitepaperClick,
  season,
  onSeasonChange,
}) => {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme")
    setIsDark(currentTheme === "dark")

    // Otimização: usar requestAnimationFrame para scroll suave
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark ? "dark" : "light"
    setIsDark(!isDark)
    document.documentElement.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)
  }

  const navLinks = [
    { name: t("nav.home"), href: "#hero" },
    { name: t("nav.tokenomics"), href: "#overview" },
    { name: t("nav.community"), href: "#community" },
    { name: t("nav.miaoAi"), href: "#generator" },
    { name: t("nav.nfts"), href: "#nfts" },
  ]

  return (
    <>
      <nav
        className={`fixed w-full z-50 top-0 transition-all duration-300 overflow-visible ${
          scrolled ? "backdrop-blur-md shadow-lg" : "bg-transparent"
        }`}
        style={scrolled ? { 
          backgroundColor: 'var(--bg-primary)',
          opacity: 0.95
        } : {}}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 relative overflow-visible">
          <div className="flex items-center justify-between h-20 overflow-visible">
            {/* Logo visível apenas após scroll */}
            <a href="#hero" className={`flex items-center group h-full transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <img
                src="/logo.png"
                alt="MIAO"
                className="h-10 w-auto object-contain group-hover:scale-110 transition-transform"
                loading="lazy"
              />
            </a>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-0.5 bg-[var(--bg-secondary)] rounded-xl p-1 border-2 border-[var(--border-color)]" style={{ direction: 'ltr' }}>
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wide text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                  style={{ direction: 'ltr', textAlign: 'center' }}
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Right Controls */}
            <div className="hidden lg:flex flex-col items-end gap-2 overflow-visible">
              <div className="flex items-center gap-2 overflow-visible">
                <LanguageSelector compact />

                <SeasonSelector season={season} onSeasonChange={onSeasonChange} />

                <button
                  onClick={toggleTheme}
                  className="w-11 h-11 rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] border-b-4 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--duo-yellow)] active:border-b-2 active:translate-y-0.5 transition-all"
                  aria-label="Toggle Theme"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button
                  onClick={toggleSound}
                  className={`w-11 h-11 rounded-2xl border-2 border-b-4 items-center justify-center transition-all active:border-b-2 active:translate-y-0.5 flex ${
                    soundEnabled
                      ? "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--duo-green)]"
                      : "bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-muted)]"
                  }`}
                  aria-label="Toggle Sound"
                >
                  {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>

                {walletState?.isConnected ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onSwapClick}
                      className="h-11 px-5 rounded-2xl font-bold text-sm uppercase tracking-wide bg-[var(--duo-green)] text-white border-2 border-b-4 border-[var(--btn-shadow)] hover:brightness-105 active:border-b-2 active:translate-y-0.5 transition-all flex items-center gap-2"
                    >
                      {t("header.buy")}
                    </button>
                    <div className="flex items-center gap-2 h-11 px-4 rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--duo-green)]">
                      <span className="text-[var(--duo-green)] font-mono font-bold text-sm">
                        {walletState.address?.slice(0, 4)}...{walletState.address?.slice(-4)}
                      </span>
                      <button
                        onClick={onDisconnectClick}
                        className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--duo-red)] transition-all"
                        title={t("header.disconnect")}
                      >
                        <LogOut size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={onConnectClick}
                    className="h-11 px-6 rounded-2xl font-bold text-sm uppercase tracking-wide bg-[var(--duo-green)] text-white border-2 border-b-4 border-[var(--btn-shadow)] hover:brightness-105 active:border-b-2 active:translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    <Wallet size={18} />
                    {t("header.connect")}
                  </button>
                )}
              </div>
            </div>

            {/* Mobile/Tablet Controls */}
            <div className="flex lg:hidden items-center gap-2 ml-auto overflow-visible">
              <LanguageSelector compact />
              
              <SeasonSelector season={season} onSeasonChange={onSeasonChange} compact />

              <button
                onClick={toggleTheme}
                className="w-11 h-11 rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] border-b-4 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--duo-yellow)] active:border-b-2 active:translate-y-0.5 transition-all"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                onClick={toggleSound}
                className={`hidden md:flex w-11 h-11 rounded-2xl border-2 border-b-4 items-center justify-center transition-all active:border-b-2 active:translate-y-0.5 ${
                  soundEnabled
                    ? "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--duo-green)]"
                    : "bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-muted)]"
                }`}
                aria-label="Toggle Sound"
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>

              <div className="hidden md:block">
                {walletState?.isConnected ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onSwapClick}
                      className="h-11 px-5 rounded-2xl font-bold text-sm uppercase tracking-wide bg-[var(--duo-green)] text-white border-2 border-b-4 border-[var(--btn-shadow)] hover:brightness-105 active:border-b-2 active:translate-y-0.5 transition-all flex items-center gap-2"
                    >
                      {t("header.buy")}
                    </button>
                    <div className="flex items-center gap-2 h-11 px-4 rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--duo-green)]">
                      <span className="text-[var(--duo-green)] font-mono font-bold text-sm">
                        {walletState.address?.slice(0, 4)}...{walletState.address?.slice(-4)}
                      </span>
                      <button
                        onClick={onDisconnectClick}
                        className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--duo-red)] transition-all"
                        title={t("header.disconnect")}
                      >
                        <LogOut size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={onConnectClick}
                    className="h-11 px-6 rounded-2xl font-bold text-sm uppercase tracking-wide bg-[var(--duo-green)] text-white border-2 border-b-4 border-[var(--btn-shadow)] hover:brightness-105 active:border-b-2 active:translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    <Wallet size={18} />
                    {t("header.connect")}
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsOpen(true)}
                className="w-11 h-11 rounded-2xl bg-[var(--duo-green)] border-2 border-b-4 border-[var(--btn-shadow)] flex items-center justify-center text-white active:border-b-2 active:translate-y-0.5 transition-all"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 top-0 h-full w-80 bg-[var(--bg-primary)] flex flex-col animate-fade-left shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b-2 border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="MIAO"
                  className="w-10 h-10 object-contain"
                  loading="lazy"
                />
                <span className="text-xl font-black text-[var(--text-primary)]">{t("nav.menu")}</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border-2 border-b-4 border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] active:border-b-2 active:translate-y-[2px] transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 p-5 space-y-2 overflow-y-auto" style={{ direction: 'ltr' }}>
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                >
                  {link.name}
                </a>
              ))}

              <button
                onClick={() => {
                  setIsOpen(false)
                  onToolsClick?.()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                style={{ direction: 'ltr', textAlign: 'left' }}
              >
                <Wrench size={20} />
                {t("nav.tools")}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  onGamesClick?.()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                style={{ direction: 'ltr', textAlign: 'left' }}
              >
                <Gamepad2 size={20} />
                {t("nav.games")}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  onWhitepaperClick?.()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                style={{ direction: 'ltr', textAlign: 'left' }}
              >
                <FileText size={20} />
                {t("nav.whitepaper")}
              </button>

              <hr className="my-4 border-2 border-[var(--border-color)]" />

              <div className="px-4 py-3">
                <LanguageSelector />
              </div>

              <div className="px-4 py-3">
                <SeasonSelector season={season} onSeasonChange={onSeasonChange} />
              </div>

              <button
                onClick={() => {
                  toggleSound()
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold transition-all ${
                  soundEnabled
                    ? "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                }`}
              >
                {soundEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
                Sound: {soundEnabled ? "ON" : "OFF"}
              </button>
            </div>

            <div className="p-5 border-t-2 border-[var(--border-color)] space-y-3">
              {walletState?.isConnected ? (
                <>
                  <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--duo-green)]">
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1">
                      {t("header.connected")}
                    </p>
                    <p className="font-mono font-black text-[var(--duo-green)] truncate">{walletState.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        onSwapClick?.()
                      }}
                      className="flex-1 py-4 rounded-xl font-bold text-base uppercase bg-[var(--duo-green)] text-white border-2 border-b-4 border-[var(--btn-shadow)] active:border-b-2 active:translate-y-[2px] transition-all"
                    >
                      {t("header.buy")}
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        onDisconnectClick?.()
                      }}
                      className="w-14 rounded-xl bg-[var(--bg-secondary)] border-2 border-b-4 border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--duo-red)] active:border-b-2 active:translate-y-[2px] transition-all"
                      title={t("header.disconnect")}
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false)
                    onConnectClick?.()
                  }}
                  className="w-full py-4 rounded-xl font-bold text-base uppercase bg-[var(--duo-green)] text-white border-2 border-b-4 border-[var(--btn-shadow)] active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center gap-2"
                >
                  <Wallet size={20} />
                  {t("header.connectWallet")}
                </button>
              )}

              {/* Version */}
              <div className="px-4 py-2 border-t-2 border-[var(--border-color)]">
                <p className="text-xs font-medium text-[var(--text-secondary)] text-center">v1.0.9</p>
              </div>

              {/* Social Media Buttons - Only in menu when very tight */}
              <div className="flex items-center justify-center gap-2 px-4 py-3 border-t-2 border-[var(--border-color)]">
                <a
                  href="https://t.me/miaotokensol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                >
                  <Send size={18} />
                </a>
                <a
                  href="https://x.com/miaoonsol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href="https://www.instagram.com/miaotoken/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://www.tiktok.com/@miaoonsol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                >
                  <TikTokIcon size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
