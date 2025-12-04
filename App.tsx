"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { LanguageProvider, useLanguage } from "@/lib/language-context";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Tokenomics from "@/components/Tokenomics";
import Community from "@/components/Community";
import NFTSection from "@/components/NFTSection";
import CatGenerator from "@/components/CatGenerator";
import Footer from "@/components/Footer";
import GamesPage from "@/components/GamesPage";
import ToolsPage from "@/components/ToolsPage";
import WalletModal from "@/components/WalletModal";
import SwapModal from "@/components/SwapModal";
import SwapChartModal from "@/components/SwapChartModal";
import { redirectToWhitepaper } from "@/components/WhitepaperModal";
import SnowEffect from "@/components/SnowEffect";
import LeafEffect from "@/components/LeafEffect";
import SeasonSelector, { type Season } from "@/components/SeasonSelector";
import type { WalletState, WalletType } from "@/types";
import { getSolBalance, disconnectWallet } from "@/lib/wallet-service";

const BG_NORMAL = "/images/grass3d-light.png";
const BG_FALL = "/images/grass3d-fall.png";
const BG_CHRISTMAS = "/images/grass3d-christmas.png";

const AppContent: React.FC = () => {
  const { language } = useLanguage();
  const [currentView, setCurrentView] = useState<"home" | "games" | "tools">(
    "home"
  );
  const [season, setSeason] = useState<Season>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("season");
      return (saved as Season) || "normal";
    }
    return "normal";
  });
  const [isChristmasMode, setIsChristmasMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    // Carrega o estado do som do localStorage apenas no cliente
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("soundEnabled");
      if (stored !== null) {
        setSoundEnabled(stored === "true");
      }
    }
  }, []);

  // Sync season with Christmas mode
  useEffect(() => {
    if (season === "winter") {
      setIsChristmasMode(true);
    } else if (season === "normal" || season === "fall") {
      setIsChristmasMode(false);
    }
  }, [season]);

  const handleSeasonChange = (newSeason: Season) => {
    setSeason(newSeason);
    localStorage.setItem("season", newSeason);
  };

  // Wallet State
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isSwapChartModalOpen, setIsSwapChartModalOpen] = useState(false);
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    type: null,
  });

  const handleConnect = async (type: WalletType, address: string) => {
    let balance = 0;
    if (type !== "metamask") {
      balance = await getSolBalance(address);
    }

    setWalletState({
      isConnected: true,
      address: address,
      balance: balance,
      type: type,
    });
    setIsWalletModalOpen(false);
  };

  const handleDisconnect = async () => {
    if (walletState.type) {
      await disconnectWallet(walletState.type);
    }
    setWalletState({
      isConnected: false,
      address: null,
      balance: 0,
      type: null,
    });
  };

  // Update data-season attribute for CSS variables
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-season", season);
    }
  }, [season]);

  return (
    <>
      <Header
        walletState={walletState}
        onConnectClick={() => setIsWalletModalOpen(true)}
        onDisconnectClick={handleDisconnect}
        onSwapClick={() => setIsSwapModalOpen(true)}
        soundEnabled={soundEnabled}
        toggleSound={() => {
          const newValue = !soundEnabled;
          setSoundEnabled(newValue);
          localStorage.setItem("soundEnabled", String(newValue));
        }}
        onToolsClick={() => setCurrentView("tools")}
        onGamesClick={() => setCurrentView("games")}
        onWhitepaperClick={() => redirectToWhitepaper(language)}
        season={season}
        onSeasonChange={handleSeasonChange}
      />
      <div
        className="min-h-screen text-(--text-primary) transition-colors duration-500 relative"
        style={{
          backgroundImage: `url(${
            season === "winter"
              ? BG_CHRISTMAS
              : season === "fall"
              ? BG_FALL
              : BG_NORMAL
          })`,
          backgroundSize: "cover",
          backgroundPosition: "bottom center",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="fixed inset-0 bg-(--bg-primary)/85 pointer-events-none z-0" />

        {isChristmasMode && (
          <div className="fixed inset-0 pointer-events-none z-1">
            <SnowEffect isActive={isChristmasMode} />
          </div>
        )}
        {season === "fall" && (
          <div className="fixed inset-0 pointer-events-none z-1">
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
                    setSoundEnabled(false);
                    localStorage.setItem("soundEnabled", "false");
                  }}
                  onToolsClick={() => setCurrentView("tools")}
                  onGamesClick={() => setCurrentView("games")}
                  onWhitepaperClick={() => redirectToWhitepaper(language)}
                />
                {/* SEO-only heading and nav: accessible to crawlers, visually hidden */}
                <h1 className="sr-only">
                  MIAO: The Green Cat Token — Community-Owned Solana Memecoin
                </h1>
                <nav aria-label="Section navigation" className="sr-only">
                  <a href="#about-heading">About</a>
                  <a href="#tokenomics-heading">Tokenomics</a>
                  <a href="#community-heading">Community</a>
                  <a href="#generator-heading">Cat Generator</a>
                  <a href="#nft-heading">NFTs</a>
                  <a href="#tools-heading">Tools</a>
                  <a href="#games-heading">Games</a>
                </nav>

                <section
                  aria-labelledby="about-heading"
                  className="px-4 md:px-8 mt-10"
                >
                  <h2 id="about-heading" className="sr-only">
                    About MIAO: Solana Memecoin
                  </h2>
                  <About isChristmasMode={isChristmasMode} season={season} />
                </section>
                <section
                  aria-labelledby="tokenomics-heading"
                  className="px-4 md:px-8 mt-12"
                >
                  <h2 id="tokenomics-heading" className="sr-only">
                    Tokenomics & Supply
                  </h2>
                  <Tokenomics
                    isChristmasMode={isChristmasMode}
                    season={season}
                    onSwapClick={() => setIsSwapChartModalOpen(true)}
                  />
                </section>
                <section
                  aria-labelledby="community-heading"
                  className="px-4 md:px-8 mt-12"
                >
                  <h2 id="community-heading" className="sr-only">
                    Community & Social
                  </h2>
                  <Community />
                </section>
                <section
                  aria-labelledby="generator-heading"
                  className="px-4 md:px-8 mt-12"
                >
                  <h2 id="generator-heading" className="sr-only">
                    MIAO Cat Generator
                  </h2>
                  <CatGenerator
                    isChristmasMode={isChristmasMode}
                    season={season}
                  />
                </section>
                <section
                  aria-labelledby="nft-heading"
                  className="px-4 md:px-8 mt-12"
                >
                  <h2 id="nft-heading" className="sr-only">
                    NFTs & Collectibles
                  </h2>
                  <NFTSection
                    isChristmasMode={isChristmasMode}
                    season={season}
                  />
                </section>
              </>
            )}

            {currentView === "games" && (
              <section
                aria-labelledby="games-heading"
                className="px-4 md:px-8 mt-8"
              >
                <h2 id="games-heading" className="sr-only">
                  MIAO Games
                </h2>
                <GamesPage
                  onBack={() => setCurrentView("home")}
                  walletState={walletState}
                />
              </section>
            )}

            {currentView === "tools" && (
              <section
                aria-labelledby="tools-heading"
                className="px-4 md:px-8 mt-8"
              >
                <h2 id="tools-heading" className="sr-only">
                  Tools & Swaps
                </h2>
                <ToolsPage
                  onBack={() => setCurrentView("home")}
                  walletState={walletState}
                />
              </section>
            )}
          </main>

          <Footer />
          <div className="px-4 md:px-8 mt-8 text-(--text-primary)">
            <p>
              Learn more about Solana at{" "}
              <a
                href="https://solana.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                solana.com
              </a>{" "}
              and follow us on{" "}
              <a
                href="https://x.com/miaoonsol"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Twitter
              </a>{" "}
              and{" "}
              <a
                href="https://t.me/miaotokensol"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Telegram
              </a>
              .
            </p>
          </div>
        </div>

        <WalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          onConnect={handleConnect}
        />

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
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
