"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Menu, X, Sun, Moon, Wallet, Snowflake, LogOut } from "lucide-react"
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
}

const Header: React.FC<HeaderProps> = ({
  walletState,
  onConnectClick,
  onDisconnectClick,
  onSwapClick,
  isChristmasMode,
  toggleChristmasMode,
}) => {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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
        className={`fixed w-full z-50 top-0 transition-all duration-300 ${scrolled ? "bg-[var(--bg-primary)]/95 backdrop-blur-md shadow-sm" : "bg-transparent"}`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="#hero" className="flex items-center group">
              <img
                src="https://miaotoken.vip/wp-content/uploads/2025/11/miao-1.png"
                alt="MIAO"
                className="w-14 h-14 object-contain group-hover:scale-110 transition-transform"
              />
            </a>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1 bg-[var(--bg-secondary)] rounded-2xl p-1.5 border-2 border-[var(--border-color)]">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} className="duo-nav-link text-sm uppercase tracking-wide">
                  {link.name}
                </a>
              ))}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <LanguageSelector compact />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-11 h-11 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] border-b-4 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] active:border-b-2 active:translate-y-0.5 transition-all"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Christmas Toggle - Desktop */}
              <button
                onClick={toggleChristmasMode}
                className={`hidden md:flex w-11 h-11 rounded-xl border-2 border-b-4 items-center justify-center active:border-b-2 active:translate-y-0.5 transition-all ${
                  isChristmasMode
                    ? "bg-[var(--duo-blue)] border-[var(--duo-blue-dark)] text-white"
                    : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--duo-blue)]"
                }`}
                aria-label="Toggle Christmas Mode"
              >
                <Snowflake size={20} />
              </button>

              {/* Connect Wallet Button - Desktop */}
              <div className="hidden md:block">
                {walletState?.isConnected ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onSwapClick}
                      className="duo-btn duo-btn-green px-5 py-2.5 text-sm uppercase tracking-wide flex items-center gap-2"
                    >
                      {t("header.buy")}
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--brand)]">
                      <span className="text-[var(--brand)] font-mono font-bold text-sm">
                        {walletState.address?.slice(0, 4)}...{walletState.address?.slice(-4)}
                      </span>
                      <button
                        onClick={onDisconnectClick}
                        className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 transition-all"
                        title={t("header.disconnect")}
                      >
                        <LogOut size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={onConnectClick}
                    className="duo-btn duo-btn-green px-6 py-2.5 text-sm uppercase tracking-wide flex items-center gap-2"
                  >
                    <Wallet size={18} />
                    {t("header.connect")}
                  </button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden w-11 h-11 rounded-xl bg-[var(--brand)] border-b-4 border-[var(--brand-dark)] flex items-center justify-center text-white active:border-b-0 active:translate-y-1 transition-all"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 top-0 h-full w-80 bg-[var(--bg-primary)] border-l-2 border-[var(--border-color)] shadow-2xl flex flex-col animate-fade-left">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b-2 border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <img
                  src="https://miaotoken.vip/wp-content/uploads/2025/11/miao-1.png"
                  alt="MIAO"
                  className="w-10 h-10 object-contain"
                />
                <span className="text-xl font-black text-[var(--text-primary)]">{t("nav.menu")}</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 p-5 space-y-2 overflow-y-auto">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  {link.name}
                </a>
              ))}

              <hr className="my-4 border-[var(--border-color)]" />

              {/* Language Selector in Mobile */}
              <div className="px-4 py-3">
                <LanguageSelector />
              </div>

              {/* Christmas Toggle */}
              <button
                onClick={() => {
                  toggleChristmasMode()
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold transition-colors ${
                  isChristmasMode
                    ? "bg-[var(--duo-blue)]/10 text-[var(--duo-blue)]"
                    : "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                }`}
              >
                <Snowflake size={22} />
                {t("nav.christmasMode")}: {isChristmasMode ? "ON" : "OFF"}
              </button>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t-2 border-[var(--border-color)] space-y-3">
              {walletState?.isConnected ? (
                <>
                  <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-color)]">
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1">
                      {t("header.connected")}
                    </p>
                    <p className="font-mono font-black text-[var(--brand)] truncate">{walletState.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        onSwapClick?.()
                      }}
                      className="duo-btn duo-btn-green flex-1 py-4 text-base uppercase tracking-wide"
                    >
                      {t("header.buy")}
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        onDisconnectClick?.()
                      }}
                      className="w-14 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 transition-all"
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
                  className="duo-btn duo-btn-green w-full py-4 text-base uppercase tracking-wide flex items-center justify-center gap-2"
                >
                  <Wallet size={20} />
                  {t("header.connectWallet")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
