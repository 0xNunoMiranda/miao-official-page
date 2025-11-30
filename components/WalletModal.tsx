import React, { useState } from 'react';
import { WalletType } from '../types';
import { X, Shield, Wallet, Zap } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (type: WalletType) => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [connecting, setConnecting] = useState<WalletType | null>(null);

  if (!isOpen) return null;

  const handleConnect = (type: WalletType) => {
    setConnecting(type);
    // Simulate network delay
    setTimeout(() => {
      onConnect(type);
      setConnecting(null);
    }, 1500);
  };

  const wallets = [
    { id: 'phantom', name: 'Phantom', icon: '👻', color: '#AB9FF2' },
    { id: 'solflare', name: 'Solflare', icon: '🌞', color: '#FC7227' },
    { id: 'metamask', name: 'MetaMask', icon: '🦊', color: '#F6851B', sub: '(Solana Snap)' },
    { id: 'backpack', name: 'Backpack', icon: '🎒', color: '#E33E3F' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[var(--bg-secondary)] border-4 border-[var(--border-color)] rounded-3xl p-6 comic-shadow animate-float">
        
        <div className="flex justify-between items-center mb-6 border-b-2 border-[var(--border-color)] pb-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-2">
            <Wallet className="text-[var(--brand)]" /> Connect Wallet
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-tertiary)] hover:bg-red-500 hover:text-white transition-colors btn-icon-pop"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleConnect(wallet.id as WalletType)}
              disabled={connecting !== null}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 border-[var(--border-color)] transition-all group hover:bg-[var(--bg-tertiary)] btn-comic ${connecting === wallet.id ? 'opacity-50 cursor-wait' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 border-[var(--border-color)]"
                  style={{ backgroundColor: wallet.color }}
                >
                  {wallet.icon}
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg text-[var(--text-primary)]">{wallet.name}</div>
                  {wallet.sub && <div className="text-xs font-bold text-[var(--text-secondary)]">{wallet.sub}</div>}
                  <div className="text-xs text-[var(--text-secondary)]">Detected</div>
                </div>
              </div>
              
              {connecting === wallet.id ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--brand)]"></div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-[var(--border-color)] group-hover:bg-[var(--brand)] transition-colors"></div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 text-center bg-[var(--bg-tertiary)] p-3 rounded-xl border-2 border-[var(--border-color)] border-dashed">
            <p className="text-xs text-[var(--text-secondary)] font-bold flex items-center justify-center gap-2">
                <Shield size={14} /> New to crypto? Get a wallet to start.
            </p>
        </div>

      </div>
    </div>
  );
};

export default WalletModal;