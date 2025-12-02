"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { LanguageProvider, useLanguage } from "@/lib/language-context"
import Header from "@/components/Header"
import Hero from "@/components/Hero"
import About from "@/components/About"
import Tokenomics from "@/components/Tokenomics"
import Community from "@/components/Community"
import NFTSection from "@/components/NFTSection"
import CatGenerator from "@/components/CatGenerator"
import Footer from "@/components/Footer"
import GamesPage from "@/components/GamesPage"
import ToolsPage from "@/components/ToolsPage"
import WalletModal from "@/components/WalletModal"
import SwapModal from "@/components/SwapModal"
import SwapChartModal from "@/components/SwapChartModal"
import { redirectToWhitepaper } from "@/components/WhitepaperModal"
import SnowEffect from "@/components/SnowEffect"
import LeafEffect from "@/components/LeafEffect"
import SeasonSelector, { type Season } from "@/components/SeasonSelector"
import type { WalletState, WalletType } from "@/types"
import { getSolBalance, disconnectWallet } from "@/lib/wallet-service"

const BG_NORMAL = "/images/grass3d-light.png"
const BG_FALL = "/images/grass3d-fall.png"
const BG_CHRISTMAS = "/images/grass3d-christmas.png"

const AppContent: React.FC = () => {
  const { language } = useLanguage()
  const [currentView, setCurrentView] = useState<"home" | "games" | "tools">("home")
  const [season, setSeason] = useState<Season>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("season")
      return (saved as Season) || "normal"
    }
    return "normal"
  })
  const [isChristmasMode, setIsChristmasMode] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  useEffect(() => {
    // Carrega o estado do som do localStorage apenas no cliente
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("soundEnabled")
      if (stored !== null) {
        setSoundEnabled(stored === "true")
      }
    }
  }, [])
  
  // Sync season with Christmas mode
  useEffect(() => {
    if (season === "winter") {
      setIsChristmasMode(true)
    } else if (season === "normal" || season === "fall") {
      setIsChristmasMode(false)
    }
  }, [season])
  
  const handleSeasonChange = (newSeason: Season) => {
    setSeason(newSeason)
    localStorage.setItem("season", newSeason)
  }

  // Wallet State
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)
  const [isSwapChartModalOpen, setIsSwapChartModalOpen] = useState(false)
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    type: null,
  })

  const handleConnect = async (type: WalletType, address: string) => {
    let balance = 0
    if (type !== "metamask") {
      balance = await getSolBalance(address)
    }

    setWalletState({
      isConnected: true,
      address: address,
      balance: balance,
      type: type,
    })
    setIsWalletModalOpen(false)
  }

  const handleDisconnect = async () => {
    if (walletState.type) {
      await disconnectWallet(walletState.type)
    }
    setWalletState({
      isConnected: false,
      address: null,
      balance: 0,
      type: null,
    })
  }

  // Update data-season attribute for CSS variables
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-season', season)
    }
  }, [season])

  return (
    <>
      <Header
        walletState={walletState}
        onConnectClick={() => setIsWalletModalOpen(true)}
        onDisconnectClick={handleDisconnect}
        onSwapClick={() => setIsSwapModalOpen(true)}
        soundEnabled={soundEnabled}
        toggleSound={() => {
          const newValue = !soundEnabled
          setSoundEnabled(newValue)
          localStorage.setItem("soundEnabled", String(newValue))
        }}
        onToolsClick={() => setCurrentView("tools")}
        onGamesClick={() => setCurrentView("games")}
        onWhitepaperClick={() => redirectToWhitepaper(language)}
        season={season}
        onSeasonChange={handleSeasonChange}
      />
    <div
      className="min-h-screen text-[var(--text-primary)] transition-colors duration-500 relative"
      style={{
        backgroundImage: `url(${
          season === "winter" ? BG_CHRISTMAS : 
          season === "fall" ? BG_FALL : 
          BG_NORMAL
        })`,
        backgroundSize: "cover",
        backgroundPosition: "bottom center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="fixed inset-0 bg-[var(--bg-primary)]/85 pointer-events-none z-0" />

      {isChristmasMode && (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <SnowEffect isActive={isChristmasMode} />
        </div>
      )}
      {season === "fall" && (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <LeafEffect isActive={season === "fall"} />
        </div>
      )}

      <div className="relative">
        <main>
          {currentView === "home" && (
            <>
              <Hero 
                onSwapChartClick={() => setIsSwapChartModalOpen(true)} 
                isChristmasMode={isChristmasMode}
                season={season}
                soundEnabled={soundEnabled}
                onDisableSound={() => {
                  setSoundEnabled(false)
                  localStorage.setItem("soundEnabled", "false")
                }}
                onToolsClick={() => setCurrentView("tools")}
                onGamesClick={() => setCurrentView("games")}
                onWhitepaperClick={() => redirectToWhitepaper(language)}
              />
              <About isChristmasMode={isChristmasMode} season={season} />
              <Tokenomics 
                isChristmasMode={isChristmasMode}
                season={season}
                onSwapClick={() => setIsSwapChartModalOpen(true)}
              />
              <Community />
              <CatGenerator isChristmasMode={isChristmasMode} season={season} />
              <NFTSection isChristmasMode={isChristmasMode} season={season} />
            </>
          )}

          {currentView === "games" && <GamesPage onBack={() => setCurrentView("home")} walletState={walletState} />}

          {currentView === "tools" && <ToolsPage onBack={() => setCurrentView("home")} walletState={walletState} />}
        </main>

        <Footer />
      </div>

      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} onConnect={handleConnect} />

      <SwapModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        walletBalance={walletState.balance}
        walletAddress={walletState.address || undefined}
      />

      <SwapChartModal
        isOpen={isSwapChartModalOpen}
        onClose={() => setIsSwapChartModalOpen(false)}
        walletBalance={walletState.balance}
        walletAddress={walletState.address || undefined}
      />
    </div>
    </>
  )
}

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}

export default App
