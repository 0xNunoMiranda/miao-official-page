"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Menu, X, Sun, Moon, Wallet, Snowflake, LogOut, FileText, Gamepad2, Wrench, Volume2, VolumeX } from "lucide-react"
import type { WalletState } from "../types"
import { useLanguage } from "../lib/language-context"
import LanguageSelector from "./LanguageSelector"

interface HeaderProps {
  walletState?: WalletState
  onConnectClick?: () => void
  onDisconnectClick?: () => void
  onSwapClick?: () => void
  isChristmasMode: boolean
  toggleChristmasMode: () => void
  soundEnabled: boolean
  toggleSound: () => void
  onToolsClick?: () => void
  onGamesClick?: () => void
}

const Header: React.FC<HeaderProps> = ({
  walletState,
  onConnectClick,
  onDisconnectClick,
  onSwapClick,
  isChristmasMode,
  toggleChristmasMode,
  soundEnabled,
  toggleSound,
  onToolsClick,
  onGamesClick,
}) => {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showWhitepaper, setShowWhitepaper] = useState(false)

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme")
    setIsDark(currentTheme === "dark")

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
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
        className={`fixed w-full z-50 top-0 transition-all duration-300 ${
          scrolled ? "bg-[var(--bg-primary)] shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="#hero" className="flex items-center group">
              <img
                src="/logo.png"
                alt="MIAO"
                className="w-14 h-14 object-contain group-hover:scale-110 transition-transform"
                loading="lazy"
              />
            </a>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1 bg-[var(--bg-secondary)] rounded-2xl p-1.5 border-2 border-[var(--border-color)]">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                >
                  {link.name}
                </a>
              ))}
              <button
                onClick={onToolsClick}
                className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5"
              >
                <Wrench size={14} />
                Tools
              </button>
              <button
                onClick={onGamesClick}
                className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5"
              >
                <Gamepad2 size={14} />
                Games
              </button>
              <button
                onClick={() => setShowWhitepaper(true)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5"
              >
                <FileText size={14} />
                Whitepaper
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <LanguageSelector compact />

              <button
                onClick={toggleTheme}
                className="w-11 h-11 rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] border-b-4 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--duo-yellow)] active:border-b-2 active:translate-y-[2px] transition-all"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                onClick={toggleChristmasMode}
                className={`hidden md:flex w-11 h-11 rounded-2xl border-2 border-b-4 items-center justify-center transition-all active:border-b-2 active:translate-y-[2px] ${
                  isChristmasMode
                    ? "bg-[var(--duo-blue)] border-[var(--btn-shadow-blue)] text-white"
                    : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--duo-blue)]"
                }`}
                aria-label="Toggle Christmas Mode"
              >
                <Snowflake size={20} />
              </button>

              <button
                onClick={toggleSound}
                className={`hidden md:flex w-11 h-11 rounded-2xl border-2 border-b-4 items-center justify-center transition-all active:border-b-2 active:translate-y-[2px] ${
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
                      className="px-5 py-2.5 rounded-2xl font-bold text-sm uppercase tracking-wide bg-[var(--duo-green)] text-white border-2 border-b-4 border-[var(--btn-shadow)] hover:brightness-105 active:border-b-2 active:translate-y-[2px] transition-all flex items-center gap-2"
                    >
                      {t("header.buy")}
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--duo-green)]">
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
                    className="px-6 py-2.5 rounded-2xl font-bold text-sm uppercase tracking-wide bg-[var(--duo-green)] text-white border-2 border-b-4 border-[var(--btn-shadow)] hover:brightness-105 active:border-b-2 active:translate-y-[2px] transition-all flex items-center gap-2"
                  >
                    <Wallet size={18} />
                    {t("header.connect")}
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden w-11 h-11 rounded-2xl bg-[var(--duo-green)] border-2 border-b-4 border-[var(--btn-shadow)] flex items-center justify-center text-white active:border-b-2 active:translate-y-[2px] transition-all"
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

            <div className="flex-1 p-5 space-y-2 overflow-y-auto">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
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
              >
                <Wrench size={20} />
                MIAO Tools
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  onGamesClick?.()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
              >
                <Gamepad2 size={20} />
                MIAO Games
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setShowWhitepaper(true)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
              >
                <FileText size={20} />
                Whitepaper
              </button>

              <hr className="my-4 border-2 border-[var(--border-color)]" />

              <div className="px-4 py-3">
                <LanguageSelector />
              </div>

              <button
                onClick={() => {
                  toggleChristmasMode()
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold transition-all ${
                  isChristmasMode
                    ? "bg-[var(--duo-blue)]/20 text-[var(--duo-blue)]"
                    : "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                }`}
              >
                <Snowflake size={22} />
                {t("nav.christmasMode")}: {isChristmasMode ? "ON" : "OFF"}
              </button>

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
            </div>
          </div>
        </div>
      )}

      {showWhitepaper && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowWhitepaper(false)} />
          <div className="relative w-full max-w-5xl h-[85vh] bg-[var(--bg-primary)] rounded-3xl border-2 border-[var(--border-color)] border-b-4 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b-2 border-[var(--border-color)]">
              <h2 className="text-xl font-black text-[var(--text-primary)]">Whitepaper</h2>
              <button
                onClick={() => setShowWhitepaper(false)}
                className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border-2 border-b-4 border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--duo-red)] active:border-b-2 active:translate-y-[2px] transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src="https://fish-mile-a5f.notion.site/ebd/2bb3cf178772809fac7ae5e614c67841"
                className="w-full h-full border-0"
                title="MIAO Whitepaper"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
