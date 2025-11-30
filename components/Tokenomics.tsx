
import React from 'react';
import SnowCap from './SnowCap';

interface TokenomicsProps {
  isChristmasMode?: boolean;
}

const Tokenomics: React.FC<TokenomicsProps> = ({ isChristmasMode = false }) => {
  return (
    <section id="overview" className="py-24 bg-[var(--bg-primary)] relative">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
        
        {/* Tokenomics & How To Buy Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-24">
            
            {/* Tokenomics Card */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border-b-8 border-slate-200 dark:border-slate-700 p-8 md:p-12 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                <SnowCap className="h-10" visible={isChristmasMode} />
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-100 dark:bg-green-900 rounded-full blur-[80px] opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                
                <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mb-8 inline-block">Tokenomics</h2>
                
                <ul className="space-y-4 relative z-10">
                    {[
                        { k: "Fair Launch", v: "100% Community", color: "text-blue-500" },
                        { k: "Supply", v: "1,000,000,000", color: "text-green-500" },
                        { k: "Launchpad", v: "Pumpfun", color: "text-purple-500" },
                        { k: "Contract", v: "Renounced", color: "text-red-500" },
                        { k: "Chain", v: "Solana", color: "text-indigo-500" },
                        { k: "Liquidity", v: "Burned", color: "text-orange-500" }
                    ].map((item, i) => (
                        <li key={i} className="flex flex-col sm:flex-row justify-between sm:items-center bg-[var(--bg-primary)] p-4 rounded-2xl border-2 border-[var(--bg-secondary)] hover:border-[var(--brand)] transition-colors">
                            <span className="font-bold text-[var(--text-secondary)] text-lg">{item.k}</span>
                            <span className={`font-black text-xl md:text-2xl ${item.color}`}>{item.v}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* How To Buy Card */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border-b-8 border-slate-200 dark:border-slate-700 p-8 md:p-12 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                <SnowCap className="h-10" visible={isChristmasMode} />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-100 dark:bg-yellow-900 rounded-full blur-[80px] opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                
                <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mb-8 inline-block">How to Buy</h2>
                
                <div className="space-y-4 relative z-10">
                    {[
                        { title: "Buy Solana (SOL)", desc: "Comprar SOL em Binance, Coinbase, Kraken, OKX.", color: "bg-black" },
                        { title: "Install Phantom", desc: "Instalar a carteira Phantom e copiar o endereço SOL.", color: "bg-[#AB9FF2]" },
                        { title: "Send Solana", desc: "Enviar SOL da exchange para a Phantom.", color: "bg-purple-600" },
                        { title: "Buy $MIAO", desc: "Conectar à Raydium DEX e trocar SOL por $MIAO.", color: "bg-[var(--brand)]" },
                    ].map((step, i) => (
                        <div key={i} className="flex gap-5 items-center bg-[var(--bg-primary)] p-4 rounded-3xl border-b-4 border-slate-200 dark:border-slate-700">
                            <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${step.color} text-white flex items-center justify-center font-black text-2xl shadow-md transform rotate-3`}>
                                {i + 1}
                            </div>
                            <div>
                                <h4 className="font-black text-lg text-[var(--text-primary)] leading-tight mb-1">{step.title}</h4>
                                <p className="text-[var(--text-secondary)] font-bold text-sm leading-tight">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Roadmap Section */}
        <div className="text-center relative">
            <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-12 inline-block">
                Roadmap
            </h2>
            
            <div className="w-full overflow-x-auto pb-8 custom-scrollbar">
                <div className="min-w-[1000px] w-full max-w-[1200px] mx-auto bg-slate-900 rounded-[3rem] p-10 relative border-b-8 border-slate-950 shadow-2xl">
                    <svg viewBox="0 0 2600 500" width="100%" height="auto" className="w-full h-auto">
                        <defs>
                            <pattern id="img1" patternUnits="objectBoundingBox" width="1" height="1"><image href="https://miaotoken.vip/wp-content/uploads/2025/10/22-1.png" x="0" y="0" width="180" height="180" preserveAspectRatio="xMidYMid slice"/></pattern>
                            <pattern id="img2" patternUnits="objectBoundingBox" width="1" height="1"><image href="https://miaotoken.vip/wp-content/uploads/2025/10/77.png" x="0" y="0" width="180" height="180" preserveAspectRatio="xMidYMid slice"/></pattern>
                            <pattern id="img3" patternUnits="objectBoundingBox" width="1" height="1"><image href="https://miaotoken.vip/wp-content/uploads/2025/10/1010.png" x="0" y="0" width="180" height="180" preserveAspectRatio="xMidYMid slice"/></pattern>
                            <pattern id="img4" patternUnits="objectBoundingBox" width="1" height="1"><image href="https://miaotoken.vip/wp-content/uploads/2025/10/1212.png" x="0" y="0" width="180" height="180" preserveAspectRatio="xMidYMid slice"/></pattern>
                            <pattern id="img5" patternUnits="objectBoundingBox" width="1" height="1"><image href="https://miaotoken.vip/wp-content/uploads/2025/10/1313.png" x="0" y="0" width="180" height="180" preserveAspectRatio="xMidYMid slice"/></pattern>
                            <pattern id="img6" patternUnits="objectBoundingBox" width="1" height="1"><image href="https://miaotoken.vip/wp-content/uploads/2025/10/1111.png" x="0" y="0" width="180" height="180" preserveAspectRatio="xMidYMid slice"/></pattern>
                            <pattern id="img7" patternUnits="objectBoundingBox" width="1" height="1"><image href="https://miaotoken.vip/wp-content/uploads/2025/10/1414.png" x="0" y="0" width="180" height="180" preserveAspectRatio="xMidYMid slice"/></pattern>
                            <pattern id="img8" patternUnits="objectBoundingBox" width="1" height="1"><image href="https://miaotoken.vip/wp-content/uploads/2025/10/22-1.png" x="0" y="0" width="180" height="180" preserveAspectRatio="xMidYMid slice"/></pattern>
                        </defs>
                        <path d="M200,270 Q500,60 800,270 T1400,270 T2000,270 T2400,430" stroke="#fff" strokeWidth="16" strokeDasharray="48 32" fill="none"/>
                        <g><text x="200" y="120" textAnchor="middle" fontSize="54" fill="#fff" fontWeight="bold">1000 Holders</text><circle cx="200" cy="270" r="90" fill="url(#img1)" stroke="#fff" strokeWidth="16"/></g>
                        <g><circle cx="500" cy="120" r="90" fill="url(#img2)" stroke="#fff" strokeWidth="16"/><text x="500" y="270" textAnchor="middle" fontSize="54" fill="#fff" fontWeight="bold">250k MC</text></g>
                        <g><text x="800" y="120" textAnchor="middle" fontSize="54" fill="#fff" fontWeight="bold">Games</text><circle cx="800" cy="270" r="90" fill="url(#img3)" stroke="#fff" strokeWidth="16"/></g>
                        <g><text x="1100" y="280" textAnchor="middle" fontSize="54" fill="#fff" fontWeight="bold">Miao Tools</text><circle cx="1100" cy="390" r="90" fill="url(#img4)" stroke="#fff" strokeWidth="16"/></g>
                        <g><text x="1400" y="120" textAnchor="middle" fontSize="54" fill="#fff" fontWeight="bold">Android APP</text><circle cx="1400" cy="270" r="90" fill="url(#img5)" stroke="#fff" strokeWidth="16"/></g>
                        <g><circle cx="1700" cy="120" r="90" fill="url(#img6)" stroke="#fff" strokeWidth="16"/><text x="1700" y="270" textAnchor="middle" fontSize="54" fill="#fff" fontWeight="bold">+1500 Holders</text></g>
                        <g><text x="2000" y="120" textAnchor="middle" fontSize="54" fill="#fff" fontWeight="bold">CMC/CG Lists</text><circle cx="2000" cy="270" r="90" fill="url(#img7)" stroke="#fff" strokeWidth="16"/></g>
                        <g><circle cx="2400" cy="330" r="90" fill="url(#img8)" stroke="#fff" strokeWidth="16"/><text x="2400" y="210" textAnchor="middle" fontSize="54" fill="#fff" fontWeight="bold">More...</text></g>
                    </svg>
                </div>
            </div>
            <p className="mt-8 text-2xl font-black text-[var(--text-secondary)] uppercase tracking-widest">Building the future with miao</p>
        </div>

      </div>
    </section>
  );
};

export default Tokenomics;
