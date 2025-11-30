
import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Wallet, Snowflake } from 'lucide-react';
import { WalletState } from '../types';

interface HeaderProps {
  walletState?: WalletState;
  onConnectClick?: () => void;
  onSwapClick?: () => void;
  isChristmasMode: boolean;
  toggleChristmasMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ walletState, onConnectClick, onSwapClick, isChristmasMode, toggleChristmasMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Sync state with DOM on mount
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setIsDark(currentTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const navLinks = [
    { name: 'Início', href: '#hero' },
    { name: 'Tokenomics', href: '#overview' },
    { name: 'Community', href: '#community' },
    { name: 'Miao AI', href: '#generator' },
    { name: "NFT's", href: '#nfts' },
  ];

  return (
    <>
      <nav className="fixed w-full z-50 top-4 px-4 md:px-12 lg:px-24 pointer-events-none">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between pointer-events-auto">
          
          {/* Brand - Desktop Left / Mobile Left */}
          <div className="hidden lg:flex items-center gap-3">
             {/* Theme Toggle */}
             <button 
               onClick={toggleTheme}
               className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] comic-border comic-shadow flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--brand)] hover:text-white btn-icon-pop"
               aria-label="Toggle Theme"
             >
               {isDark ? <Moon size={22} fill="currentColor" /> : <Sun size={22} fill="currentColor" />}
             </button>

             {/* Christmas Toggle */}
             <button 
               onClick={toggleChristmasMode}
               className={`w-12 h-12 rounded-full bg-[var(--bg-secondary)] comic-border comic-shadow flex items-center justify-center btn-icon-pop transition-colors ${isChristmasMode ? 'bg-blue-100 text-blue-500 border-blue-300' : 'text-[var(--text-primary)] hover:text-blue-500'}`}
               aria-label="Toggle Christmas Mode"
               title="Christmas Mode"
             >
               <Snowflake size={22} fill={isChristmasMode ? "currentColor" : "none"} />
             </button>
             
             {/* Lang Toggle (Mock) */}
             <button className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] comic-border comic-shadow flex items-center justify-center btn-icon-pop overflow-hidden">
                <img src="https://flagcdn.com/w40/pt.png" alt="PT" className="w-8 h-auto" />
             </button>
          </div>

          <div className="lg:hidden flex-shrink-0 bg-[var(--bg-secondary)] p-2 rounded-2xl comic-border comic-shadow btn-comic">
            <a href="#hero" className="block w-20">
              <img 
                src="https://miaotoken.vip/wp-content/uploads/2025/11/miao-1.png" 
                alt="MIAO Logo" 
                className="w-full h-auto"
              />
            </a>
          </div>

          {/* Desktop Nav - Floating Island Style - Center */}
          <div className="hidden lg:flex items-center bg-[#1e293b]/95 backdrop-blur-sm rounded-full px-2 py-2 comic-border comic-shadow gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-5 py-2.5 rounded-full font-bold text-gray-300 border-2 border-transparent transition-all duration-300 hover:text-white hover:bg-[var(--brand)] hover:border-black hover:shadow-[3px_3px_0px_0px_#000] hover:-rotate-3 hover:scale-110"
              >
                {link.name}
              </a>
            ))}
            
            {/* Connect Button inside Nav for Desktop */}
            <div className="pl-2">
                {walletState?.isConnected ? (
                     <div className="flex gap-2">
                        <button 
                            onClick={onSwapClick}
                            className="bg-[var(--brand)] text-white font-black px-6 py-2.5 rounded-full comic-border shadow-[2px_2px_0_0_#000] btn-comic flex items-center gap-2 hover:bg-white hover:text-[var(--brand)]"
                        >
                            BUY $MIAO
                        </button>
                        <div className="bg-[#0f172a] text-[#00d26a] font-mono font-bold px-4 py-2.5 rounded-full border-2 border-[var(--brand)] flex items-center">
                            {walletState.address?.slice(0, 4)}...{walletState.address?.slice(-4)}
                        </div>
                     </div>
                ) : (
                    <button 
                        onClick={onConnectClick}
                        className="bg-[var(--brand)] text-white font-black px-6 py-2.5 rounded-full comic-border shadow-[2px_2px_0_0_#000] btn-comic hover:bg-white hover:text-[var(--brand)] hover:rotate-2 hover:scale-105"
                    >
                        Conectar Carteira
                    </button>
                )}
            </div>
          </div>

          {/* Right Brand on Desktop */}
           <div className="hidden lg:block flex-shrink-0 bg-[var(--bg-secondary)] p-2 rounded-2xl comic-border comic-shadow btn-comic">
            <a href="#hero" className="block w-28">
              <img 
                src="https://miaotoken.vip/wp-content/uploads/2025/11/miao-1.png" 
                alt="MIAO Logo" 
                className="w-full h-auto"
              />
            </a>
          </div>

          {/* Mobile Right Controls */}
          <div className="lg:hidden flex items-center gap-3">
             <button 
               onClick={toggleTheme}
               className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] comic-border comic-shadow flex items-center justify-center text-[var(--text-primary)] btn-icon-pop"
             >
               {isDark ? <Moon size={20} /> : <Sun size={20} />}
             </button>

             <button
                onClick={() => setIsOpen(true)}
                className="w-10 h-10 bg-[var(--brand)] rounded-full comic-border comic-shadow flex items-center justify-center text-white btn-icon-pop"
             >
               <Menu size={20} />
             </button>
          </div>

        </div>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="relative w-80 h-full bg-[var(--bg-secondary)] border-l-4 border-[var(--border-color)] shadow-2xl flex flex-col p-6 animate-fade-left">
            <div className="flex justify-between items-center mb-10 border-b-2 border-[var(--border-color)] pb-4">
               <span className="text-3xl font-black text-[var(--brand)] drop-shadow-sm">MENU</span>
               <button onClick={() => setIsOpen(false)} className="text-[var(--text-primary)] hover:rotate-90 transition-transform">
                 <X size={32} />
               </button>
            </div>

            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-2xl font-bold text-[var(--text-primary)] hover:text-[var(--brand)] hover:pl-2 transition-all btn-comic origin-left"
                >
                  {link.name}
                </a>
              ))}
              
              <button 
                onClick={() => { toggleChristmasMode(); setIsOpen(false); }}
                className={`text-2xl font-bold text-left hover:pl-2 transition-all btn-comic flex items-center gap-2 ${isChristmasMode ? 'text-blue-500' : 'text-[var(--text-primary)]'}`}
              >
                <Snowflake size={24} /> Christmas Mode: {isChristmasMode ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="mt-auto space-y-4">
                {walletState?.isConnected ? (
                    <>
                        <div className="bg-[var(--bg-tertiary)] p-4 rounded-xl border-2 border-[var(--border-color)] text-center">
                            <p className="text-sm font-bold text-[var(--text-secondary)] mb-1">Connected as</p>
                            <p className="font-mono font-black text-[var(--brand)] truncate">{walletState.address}</p>
                        </div>
                        <button 
                            onClick={() => { setIsOpen(false); onSwapClick && onSwapClick(); }}
                            className="w-full bg-[var(--brand)] text-white font-black py-4 rounded-xl comic-border comic-shadow btn-comic"
                        >
                            BUY $MIAO
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => { setIsOpen(false); onConnectClick && onConnectClick(); }}
                        className="w-full bg-[var(--brand)] text-white font-black py-4 rounded-xl comic-border comic-shadow btn-comic flex items-center justify-center gap-2"
                    >
                        <Wallet size={20}/> CONECTAR CARTEIRA
                    </button>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
