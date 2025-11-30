
import React from 'react';
import { Send, Twitter, Instagram, BarChart3, Rocket, Wrench, Gamepad2, ArrowRight } from 'lucide-react';
import SnowCap from './SnowCap';
import SnowEffect from './SnowEffect';

interface HeroProps {
  onOpenGames?: () => void;
  onOpenTools?: () => void;
  isChristmasMode?: boolean;
}

const Hero: React.FC<HeroProps> = ({ onOpenGames, onOpenTools, isChristmasMode = false }) => {
  
  // Duolingo-style Action Buttons Configuration
  const actionItems = [
    { 
      title: "Dexscreen", 
      desc: "Live Charts", 
      action: "VIEW", 
      href: "#", 
      type: 'link',
      color: "bg-indigo-500",
      borderColor: "border-indigo-700",
      textColor: "text-white",
      icon: <BarChart3 size={80} className="absolute -bottom-4 -right-4 text-indigo-700/30 rotate-12" />,
      smallIcon: <BarChart3 size={20} />
    },
    { 
      title: "PumpFun", 
      desc: "Fair Launch", 
      action: "APE IN", 
      href: "#", 
      type: 'link',
      color: "bg-emerald-500",
      borderColor: "border-emerald-700",
      textColor: "text-white",
      icon: <Rocket size={80} className="absolute -bottom-4 -right-4 text-emerald-700/30 -rotate-12" />,
      smallIcon: <Rocket size={20} />
    },
    { 
      title: "MIAO Tools", 
      desc: "Utilities", 
      action: "OPEN", 
      onClick: onOpenTools, 
      type: 'button',
      color: "bg-sky-500",
      borderColor: "border-sky-700",
      textColor: "text-white",
      icon: <Wrench size={80} className="absolute -bottom-4 -right-4 text-sky-700/30 rotate-6" />,
      smallIcon: <Wrench size={20} />
    },
    { 
      title: "MIAO Games", 
      desc: "Play & Earn", 
      action: "PLAY", 
      onClick: onOpenGames, 
      type: 'button',
      color: "bg-orange-500",
      borderColor: "border-orange-700",
      textColor: "text-white",
      icon: <Gamepad2 size={80} className="absolute -bottom-4 -right-4 text-orange-700/30 -rotate-6" />,
      smallIcon: <Gamepad2 size={20} />
    }
  ];

  return (
    <section id="hero" className="relative min-h-screen pt-32 pb-12 overflow-hidden flex items-center bg-[var(--bg-primary)]">
      
      {/* Local Snow Effect */}
      <SnowEffect isActive={isChristmasMode} />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Mascot Column (Left) */}
            <div className="relative order-1 lg:order-1 flex justify-center lg:justify-start group">
               <div className="relative w-full max-w-[500px] lg:max-w-[600px] animate-float transition-transform duration-500 hover:scale-105 hover:rotate-2">
                  <img 
                    src="https://miaotoken.vip/wp-content/uploads/2025/11/Header-Cat.png" 
                    alt="Miao Mascot"
                    className="w-full h-auto object-contain drop-shadow-2xl"
                  />
               </div>
            </div>

            {/* Content Column (Right) */}
            <div className="order-2 lg:order-2 space-y-8 text-center lg:text-right">
                
                {/* Logo */}
                <div className="flex justify-center lg:justify-end">
                    <img 
                      src="https://miaotoken.vip/wp-content/uploads/2025/11/miao-1.png" 
                      alt="$MIAO" 
                      className="w-64 md:w-96 lg:w-[420px] h-auto animate-fade-up hover:rotate-2 transition-transform duration-300 drop-shadow-lg"
                    />
                </div>
                
                {/* Tagline */}
                <p className="text-xl md:text-2xl font-bold text-[var(--text-secondary)] leading-relaxed lg:pl-12 font-fredoka">
                   Primeiro vieram os cães, depois os sapos...<br/>
                   Agora, as sombras pertencem ao <span className="text-[var(--brand)] font-black text-2xl md:text-3xl">$MIAO</span>.
                </p>

                {/* Socials - Chunky Buttons */}
                <div className="flex justify-center lg:justify-end gap-3">
                   {[
                     { icon: <Send size={24} />, color: "bg-[#229ED9] border-[#187cb0]" },
                     { icon: <Twitter size={24} />, color: "bg-[#1DA1F2] border-[#1681bf]" },
                     { icon: <Instagram size={24} />, color: "bg-[#E1306C] border-[#b01b4e]" },
                     { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>, color: "bg-black border-gray-800" }
                   ].map((social, i) => (
                     <a 
                       key={i} 
                       href="#" 
                       className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white border-b-[6px] active:border-b-0 active:translate-y-[6px] transition-all hover:brightness-110 ${social.color}`}
                     >
                        {social.icon}
                     </a>
                   ))}
                </div>

                {/* Action Grid - Duolingo Style */}
                <div className="grid grid-cols-2 gap-4 lg:ml-auto max-w-[500px] mx-auto lg:mr-0 pt-8">
                    {actionItems.map((item, i) => {
                        const Component = item.type === 'button' ? 'button' : 'a';
                        const props = item.type === 'button' ? { onClick: item.onClick } : { href: item.href };
                        
                        return (
                          // @ts-ignore
                          <Component 
                            key={i} 
                            {...props} 
                            className={`
                              group relative overflow-hidden rounded-[2rem] p-5 text-left h-40 flex flex-col justify-between
                              ${item.color} ${item.borderColor} ${item.textColor}
                              border-b-[8px] active:border-b-0 active:translate-y-[8px]
                              transition-all hover:brightness-105 shadow-xl
                            `}
                          >
                              <SnowCap visible={isChristmasMode} className="opacity-90" />
                              
                              {/* Background Icon */}
                              <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                {item.icon}
                              </div>

                              <div className="relative z-10">
                                  <h3 className="font-black text-2xl uppercase tracking-tight leading-none mb-1 drop-shadow-md">
                                    {item.title}
                                  </h3>
                                  <p className="font-bold text-sm opacity-90">{item.desc}</p>
                              </div>
                              
                              <div className="relative z-10 self-start bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 font-black text-sm uppercase tracking-wider flex items-center gap-2 transition-all group-hover:bg-white group-hover:text-black">
                                {item.smallIcon} {item.action}
                              </div>
                          </Component>
                        );
                    })}
                </div>

            </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
