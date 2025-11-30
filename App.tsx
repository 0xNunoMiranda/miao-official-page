
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Tokenomics from './components/Tokenomics';
import Community from './components/Community';
import NFTSection from './components/NFTSection';
import CatGenerator from './components/CatGenerator';
import Footer from './components/Footer';
import GamesPage from './components/GamesPage';
import ToolsPage from './components/ToolsPage'; 
import WalletModal from './components/WalletModal';
import SwapModal from './components/SwapModal';
import { WalletState, WalletType } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'games' | 'tools'>('home');
  const [isChristmasMode, setIsChristmasMode] = useState(false);
  
  // Wallet State
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    type: null
  });

  const handleConnect = (type: WalletType) => {
    // Simulate connection
    setWalletState({
      isConnected: true,
      address: '7xKX...9j2M',
      balance: 14.5,
      type: type
    });
    setIsWalletModalOpen(false);
  };

  return (
    <div className="min-h-screen text-[var(--text-primary)] bg-[var(--bg-primary)] transition-colors duration-300">
      
      {/* Shared Header with Wallet Props */}
      <Header 
        walletState={walletState} 
        onConnectClick={() => setIsWalletModalOpen(true)}
        onSwapClick={() => setIsSwapModalOpen(true)}
        isChristmasMode={isChristmasMode}
        toggleChristmasMode={() => setIsChristmasMode(!isChristmasMode)}
      />

      <main>
        {currentView === 'home' && (
          <>
            <Hero 
              onOpenGames={() => setCurrentView('games')} 
              onOpenTools={() => setCurrentView('tools')}
              isChristmasMode={isChristmasMode}
            />
            <About /> {/* Interlude Section */}
            <Tokenomics isChristmasMode={isChristmasMode} /> {/* Combined Overview: Tokenomics + How To Buy + Roadmap */}
            <Community /> {/* New Open Source / Community Section */}
            <CatGenerator isChristmasMode={isChristmasMode} />
            <NFTSection isChristmasMode={isChristmasMode} />
          </>
        )}
        
        {currentView === 'games' && (
          <GamesPage onBack={() => setCurrentView('home')} walletState={walletState} />
        )}

        {currentView === 'tools' && (
          <ToolsPage onBack={() => setCurrentView('home')} walletState={walletState} />
        )}
      </main>

      <Footer />

      {/* Global Modals */}
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleConnect}
      />
      
      <SwapModal 
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        walletBalance={walletState.balance}
      />
    </div>
  );
};

export default App;
