import React, { useState, useEffect } from 'react';
import { X, ArrowDown, Settings, Info, RefreshCw, Check } from 'lucide-react';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
}

const SwapModal: React.FC<SwapModalProps> = ({ isOpen, onClose, walletBalance }) => {
  const [solAmount, setSolAmount] = useState<string>('');
  const [miaoAmount, setMiaoAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mock exchange rate: 1 SOL = 10,000 MIAO
  const RATE = 10000;

  useEffect(() => {
    if (solAmount) {
      const val = parseFloat(solAmount);
      if (!isNaN(val)) {
        setMiaoAmount((val * RATE).toFixed(0));
      } else {
        setMiaoAmount('');
      }
    } else {
      setMiaoAmount('');
    }
  }, [solAmount]);

  const handleSwap = () => {
    if (!solAmount) return;
    setIsLoading(true);
    // Simulate transaction
    setTimeout(() => {
        setIsLoading(false);
        setIsSuccess(true);
    }, 2000);
  };

  const reset = () => {
    setIsSuccess(false);
    setSolAmount('');
    setMiaoAmount('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-[var(--bg-secondary)] border-4 border-[var(--border-color)] rounded-3xl p-6 comic-shadow animate-float">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">Swap</h2>
          <div className="flex gap-2">
             <button className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] btn-icon-pop"><Settings size={20} /></button>
             <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] btn-icon-pop"><X size={20} /></button>
          </div>
        </div>

        {isSuccess ? (
             <div className="text-center py-10">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-500 animate-bounce">
                     <Check size={40} className="text-green-600" />
                 </div>
                 <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">Swap Successful!</h3>
                 <p className="text-[var(--text-secondary)] font-bold mb-6">You received {miaoAmount} $MIAO</p>
                 <button onClick={reset} className="w-full bg-[var(--brand)] text-white font-black py-3 rounded-xl comic-border comic-shadow btn-comic">
                     Close
                 </button>
             </div>
        ) : (
            <>
                {/* Input (SOL) */}
                <div className="bg-[var(--bg-tertiary)] rounded-2xl p-4 border-2 border-[var(--border-color)] mb-2">
                <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--text-secondary)]">You pay</span>
                    <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1">
                        Balance: {walletBalance} SOL
                        <button onClick={() => setSolAmount(walletBalance.toString())} className="text-[var(--brand)] uppercase hover:underline">Max</button>
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[var(--bg-secondary)] px-3 py-1.5 rounded-full border border-[var(--border-color)]">
                        <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 rounded-full" />
                        <span className="font-black text-[var(--text-primary)]">SOL</span>
                    </div>
                    <input 
                        type="number" 
                        placeholder="0.0" 
                        value={solAmount}
                        onChange={(e) => setSolAmount(e.target.value)}
                        className="w-full bg-transparent text-right text-2xl font-black text-[var(--text-primary)] focus:outline-none"
                    />
                </div>
                </div>

                {/* Swap Icon */}
                <div className="flex justify-center -my-4 relative z-10">
                    <div className="bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] p-2 rounded-xl">
                        <ArrowDown size={20} className="text-[var(--text-primary)]" />
                    </div>
                </div>

                {/* Output (MIAO) */}
                <div className="bg-[var(--bg-tertiary)] rounded-2xl p-4 border-2 border-[var(--border-color)] mt-2 mb-6">
                <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--text-secondary)]">You receive</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[var(--bg-secondary)] px-3 py-1.5 rounded-full border border-[var(--border-color)]">
                        <img src="https://miaotoken.vip/wp-content/uploads/2025/11/miao-1.png" alt="MIAO" className="w-6 h-6 object-contain" />
                        <span className="font-black text-[var(--text-primary)]">MIAO</span>
                    </div>
                    <input 
                        type="text" 
                        readOnly
                        placeholder="0.0" 
                        value={miaoAmount}
                        className="w-full bg-transparent text-right text-2xl font-black text-[var(--text-primary)] focus:outline-none"
                    />
                </div>
                </div>

                {/* Info Details */}
                <div className="space-y-2 mb-6 px-2">
                    <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                        <span>Rate</span>
                        <span>1 SOL ≈ {RATE} MIAO</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1">Network Fee <Info size={12}/></span>
                        <span>~0.00005 SOL</span>
                    </div>
                </div>

                {/* Action Button */}
                <button 
                onClick={handleSwap}
                disabled={isLoading || !solAmount}
                className={`w-full py-4 rounded-xl font-black text-xl flex items-center justify-center gap-2 comic-border comic-shadow transition-all btn-comic ${!solAmount ? 'bg-gray-400 cursor-not-allowed' : 'bg-[var(--brand)] text-white hover:brightness-110'}`}
                >
                {isLoading ? <RefreshCw className="animate-spin" /> : 'SWAP NOW'}
                </button>
            </>
        )}

      </div>
    </div>
  );
};

export default SwapModal;