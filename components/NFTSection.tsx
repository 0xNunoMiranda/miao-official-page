
import React from 'react';
import SnowCap from './SnowCap';

interface NFTSectionProps {
  isChristmasMode?: boolean;
}

const NFTSection: React.FC<NFTSectionProps> = ({ isChristmasMode = false }) => {
  return (
    <section id="nfts" className="relative py-32 overflow-hidden flex items-center justify-center bg-[var(--bg-tertiary)]">
      
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-20 pointer-events-none mix-blend-overlay">
        <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover"
            src="https://miaotoken.vip/wp-content/uploads/2025/11/final.mp4"
        ></video>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 lg:px-24 w-full">
        <div className="bg-[#7F3FBF] p-10 md:p-16 rounded-[3rem] text-center border-b-[12px] border-[#5e2d8f] relative overflow-hidden shadow-2xl">
            <SnowCap className="h-10 opacity-90" visible={isChristmasMode} />
            
            {/* Decoration Circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-black opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <h3 className="text-4xl md:text-6xl font-black text-white mb-6 relative z-10 drop-shadow-md">Mint MIAO NFT</h3>
            <p className="text-purple-100 text-lg md:text-xl font-bold leading-relaxed mb-10 relative z-10 max-w-3xl mx-auto">
                Born from the shadows of the meme wars, the $MIAO NFTs embody stealth and energy. 
                Own a symbol of power in the streets.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
                <button className="bg-[#58CC02] text-white text-xl font-black py-5 px-12 rounded-2xl border-b-[6px] border-[#46a302] active:border-b-0 active:translate-y-[6px] hover:brightness-110 transition-all uppercase tracking-wide shadow-lg">
                    MINT V1
                </button>
                <button className="bg-white text-[#7F3FBF] text-xl font-black py-5 px-12 rounded-2xl border-b-[6px] border-purple-200 active:border-b-0 active:translate-y-[6px] hover:bg-gray-50 transition-all uppercase tracking-wide shadow-lg">
                    MINT V2
                </button>
            </div>
        </div>
      </div>
    </section>
  );
};

export default NFTSection;
