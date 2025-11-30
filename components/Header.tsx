"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Menu, X, Sun, Moon, Wallet, Snowflake } from "lucide-react"
import type { WalletState } from "../types"

interface HeaderProps {
  walletState?: WalletState
  onConnectClick?: () => void
  onSwapClick?: () => void
  isChristmasMode: boolean
  toggleChristmasMode: () => void
}

const Header: React.FC<HeaderProps> = ({
  walletState,
  onConnectClick,
  onSwapClick,
  isChristmasMode,
  toggleChristmasMode,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Sync state with DOM on mount
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
    { name: "Inicio", href: "#hero" },
    { name: "Tokenomics", href: "#overview" },
    { name: "Community", href: "#community" },
    { name: "Miao AI", href: "#generator" },
    { name: "NFT's", href: "#nfts" },
  ]

  return (
    <>
      <nav
        className={`fixed w-full z-50 top-0 transition-all duration-300 ${scrolled ? "bg-[var(--bg-primary)]/95 backdrop-blur-md shadow-sm" : "bg-transparent"}`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="#hero" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-[var(--brand)] flex items-center justify-center overflow-hidden border-b-4 border-[var(--brand-dark)] group-hover:border-b-2 group-active:border-b-0 transition-all">
                <img
                  src="https://miaotoken.vip/wp-content/uploads/2025/11/miao-1.png"
                  alt="MIAO"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="hidden sm:block text-2xl font-black text-[var(--text-primary)]">MIAO</span>
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
            <div className="flex items-center gap-3">
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
                      Buy $MIAO
                    </button>
                    <div className="px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--brand)] text-[var(--brand)] font-mono font-bold text-sm">
                      {walletState.address?.slice(0, 4)}...{walletState.address?.slice(-4)}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={onConnectClick}
                    className="duo-btn duo-btn-green px-6 py-2.5 text-sm uppercase tracking-wide flex items-center gap-2"
                  >
                    <Wallet size={18} />
                    Conectar
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
                <div className="w-10 h-10 rounded-xl bg-[var(--brand)] flex items-center justify-center">
                  <img
                    src="https://miaotoken.vip/wp-content/uploads/2025/11/miao-1.png"
                    alt="MIAO"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <span className="text-xl font-black text-[var(--text-primary)]">Menu</span>
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
                Modo Natal: {isChristmasMode ? "ON" : "OFF"}
              </button>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t-2 border-[var(--border-color)] space-y-3">
              {walletState?.isConnected ? (
                <>
                  <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] text-center">
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1">
                      Conectado
                    </p>
                    <p className="font-mono font-black text-[var(--brand)] truncate">{walletState.address}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      onSwapClick?.()
                    }}
                    className="duo-btn duo-btn-green w-full py-4 text-base uppercase tracking-wide"
                  >
                    Buy $MIAO
                  </button>
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
                  Conectar Carteira
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
