"use client";

import type React from "react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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
const WalletModal = dynamic(() => import("@/components/WalletModal"), {
  ssr: false,
});
const SwapModal = dynamic(() => import("@/components/SwapModal"), {
  ssr: false,
});
const SwapChartModal = dynamic(() => import("@/components/SwapChartModal"), {
  ssr: false,
});
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
  const [season, setSeason] = useState<Season>("normal");
  const [isChristmasMode, setIsChristmasMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Detecta viewport mobile uma vez no cliente
      setIsMobile(window.innerWidth < 768);

      // Carrega o estado do som do localStorage apenas no cliente
      const storedSound = localStorage.getItem("soundEnabled");
      if (storedSound !== null) {
        setSoundEnabled(storedSound === "true");
      }

      // Carrega a estação guardada, se existir
      const savedSeason = localStorage.getItem("season");
      if (savedSeason) {
        setSeason(savedSeason as Season);
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
    try {
      // Autenticar wallet na API (cria usuário se não existir)
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wallet: address }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('Wallet authentication failed:', data.error);
        // Ainda permite conectar localmente, mas sem autenticação
      } else {
        // Salvar token de autenticação
        if (data.token) {
          localStorage.setItem('miao_wallet_token', data.token);
          localStorage.setItem('miao_wallet_auth', JSON.stringify({
            isAuthenticated: true,
            wallet: data.wallet,
            isAdmin: data.isAdmin,
          }));
        }
      }

      // Obter balance (opcional, não bloqueia se falhar)
      let balance = 0;
      if (type !== "metamask") {
        try {
          balance = await getSolBalance(address);
        } catch (error) {
          // Balance não é crítico, continua sem ele
          console.warn('Failed to get balance:', error);
        }
      }

      setWalletState({
        isConnected: true,
        address: address,
        balance: balance,
        type: type,
      });
      setIsWalletModalOpen(false);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      // Ainda permite conectar localmente mesmo se a API falhar
      let balance = 0;
      if (type !== "metamask") {
        try {
          balance = await getSolBalance(address);
        } catch (error) {
          // Balance não é crítico, continua sem ele
          console.warn('Failed to get balance:', error);
        }
      }

      setWalletState({
        isConnected: true,
        address: address,
        balance: balance,
        type: type,
      });
      setIsWalletModalOpen(false);
    }
  };

  const handleDisconnect = async () => {
    if (walletState.type) {
      await disconnectWallet(walletState.type);
    }
    
    // Limpar autenticação
    localStorage.removeItem('miao_wallet_token');
    localStorage.removeItem('miao_wallet_auth');
    
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
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="fixed inset-0 bg-(--bg-primary)/85 pointer-events-none z-0" />

        {!isMobile && isChristmasMode && (
          <div className="fixed inset-0 pointer-events-none z-1">
            <SnowEffect isActive={isChristmasMode} />
          </div>
        )}
        {!isMobile && season === "fall" && (
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

                {/* SEO-only rich content block: hidden from visual layout but readable by crawlers and screen readers */}
                <article
                  className="sr-only"
                  aria-label="About MIAO detailed description"
                >
                  <p>
                    MIAO is a community-owned memecoin on the Solana blockchain,
                    created for fun, culture, and utility-first experimentation.
                    Our mission is simple: build delightful on-chain experiences
                    while rewarding participation, creativity, and helpfulness.
                    The project embraces transparency and open collaboration,
                    inviting anyone to join, contribute, and grow the ecosystem.
                  </p>
                  <p>
                    Powered by Solana’s fast, low-cost infrastructure, MIAO
                    enables instant swaps, playful dApps, and accessible tools
                    for both newcomers and seasoned Web3 users. With
                    community-driven governance and an open roadmap, holders can
                    shape features, propose integrations, and help steer
                    seasonal events such as winter holiday themes, autumn leaf
                    effects, and limited-time collectibles. MIAO celebrates the
                    spirit of memecoins while grounding development in real
                    utility and friendly UX.
                  </p>
                  <p>
                    Tokenomics prioritize fair access and sustainability. The
                    supply is designed to support liquidity, community rewards,
                    and ecosystem development without aggressive emissions.
                    Utility flows through tools like swaps, wallet integrations,
                    and mini-games that encourage engagement. The Cat Generator
                    and NFTs & Collectibles introduce personalization and
                    verifiable digital ownership, extending the MIAO identity
                    across the broader Solana ecosystem. Community & Social
                    channels—Telegram and Twitter—help newcomers get support,
                    share updates, and coordinate collaborations.
                  </p>
                  <p>
                    Security and user safety matter. We promote self-custody,
                    responsible experimentation, and education around Web3 best
                    practices. Our codebase aims for clarity and performance,
                    with a focus on accessibility and internationalization so
                    more people can participate. Whether you are here to swap,
                    collect, play, or build—MIAO welcomes you. Connect your
                    wallet, explore the contract, and join the vibrant community
                    shaping the future of playful on-chain culture.
                  </p>
                  <h2>Getting Started on Solana</h2>
                  <p>
                    To begin, install a Solana-compatible wallet, acquire SOL
                    for fees, and use the integrated swap tools to explore
                    tokens. Visit our official channels for updates, and check
                    the contract details to learn more about how the token
                    works. Seasonal modes add a festive touch to the experience,
                    and community proposals keep the roadmap fresh and
                    collaborative.
                  </p>
                  <h3>Why MIAO?</h3>
                  <p>
                    MIAO blends the charm of memecoins with accessible utility:
                    quick swaps, friendly interfaces, and fun experiences. It’s
                    built for people who enjoy culture, creativity, and shared
                    ownership—without compromising on speed or affordability.
                    Join us, bring a friend, and help build something delightful
                    together on Solana.
                  </p>
                  <p>
                    Learn more at{" "}
                    <a
                      href="https://solana.com/"
                      target="_blank"
                      rel="noopener nofollow"
                    >
                      solana.com
                    </a>{" "}
                    and follow updates on{" "}
                    <a
                      href="https://x.com/miaoonsol"
                      target="_blank"
                      rel="noopener nofollow"
                    >
                      Twitter
                    </a>{" "}
                    and{" "}
                    <a
                      href="https://t.me/miaotokensol"
                      target="_blank"
                      rel="noopener nofollow"
                    >
                      Telegram
                    </a>
                    .
                  </p>
                </article>

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
