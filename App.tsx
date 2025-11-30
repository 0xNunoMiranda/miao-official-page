"use client"

import type React from "react"
import { useState } from "react"
import { LanguageProvider } from "./lib/language-context"
import Header from "./components/Header"
import Hero from "./components/Hero"
import About from "./components/About"
import Tokenomics from "./components/Tokenomics"
import Community from "./components/Community"
import NFTSection from "./components/NFTSection"
import CatGenerator from "./components/CatGenerator"
import Footer from "./components/Footer"
import GamesPage from "./components/GamesPage"
import ToolsPage from "./components/ToolsPage"
import WalletModal from "./components/WalletModal"
import SwapModal from "./components/SwapModal"
import type { WalletState, WalletType } from "./types"
import { getSolBalance, disconnectWallet } from "./lib/wallet-service"

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<"home" | "games" | "tools">("home")
  const [isChristmasMode, setIsChristmasMode] = useState(false)

  // Wallet State
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)
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

  return (
    <div className="min-h-screen text-[var(--text-primary)] bg-[var(--bg-primary)] transition-colors duration-300">
      <Header
        walletState={walletState}
        onConnectClick={() => setIsWalletModalOpen(true)}
        onDisconnectClick={handleDisconnect}
        onSwapClick={() => setIsSwapModalOpen(true)}
        isChristmasMode={isChristmasMode}
        toggleChristmasMode={() => setIsChristmasMode(!isChristmasMode)}
      />

      <main>
        {currentView === "home" && (
          <>
            <Hero
              onOpenGames={() => setCurrentView("games")}
              onOpenTools={() => setCurrentView("tools")}
              isChristmasMode={isChristmasMode}
            />
            <About />
            <Tokenomics isChristmasMode={isChristmasMode} />
            <Community />
            <CatGenerator isChristmasMode={isChristmasMode} />
            <NFTSection isChristmasMode={isChristmasMode} />
          </>
        )}

        {currentView === "games" && <GamesPage onBack={() => setCurrentView("home")} walletState={walletState} />}

        {currentView === "tools" && <ToolsPage onBack={() => setCurrentView("home")} walletState={walletState} />}
      </main>

      <Footer />

      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} onConnect={handleConnect} />

      <SwapModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        walletBalance={walletState.balance}
        walletAddress={walletState.address || undefined}
      />
    </div>
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
