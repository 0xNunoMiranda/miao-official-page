import type React from "react"
import { useLanguage } from "../lib/language-context"

const Community: React.FC = () => {
  const { t } = useLanguage()
  
  return (
    <section id="community" className="py-24 px-6 md:px-12 lg:px-24 bg-[var(--bg-secondary)]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-8">100% Community Owned</h2>

        <div className="bg-[var(--bg-primary)] rounded-3xl p-8 md:p-12 border-2 border-[var(--border-color)] border-b-4">
          <div className="grid md:grid-cols-3 gap-4 md:gap-8">
            {[
              {
                title: t("community.liquidityBurned"),
                desc: t("community.liquidityBurnedDesc"),
                color: "bg-[var(--duo-red)]",
                shadow: "border-[var(--btn-shadow-red)]",
              },
              {
                title: t("community.contractRenounced"),
                desc: t("community.contractRenouncedDesc"),
                color: "bg-[var(--duo-blue)]",
                shadow: "border-[var(--btn-shadow-blue)]",
              },
              {
                title: t("community.noTreasury"),
                desc: t("community.noTreasuryDesc"),
                color: "bg-[var(--duo-yellow)]",
                shadow: "border-[var(--btn-shadow-orange)]",
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-row md:flex-col items-start md:items-center gap-3 md:gap-0 group">
                {item.title === "Liquidity Burned" ? (
                  <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex-shrink-0 rounded-2xl flex items-center justify-center md:mb-4 border-2 border-b-4 border-[var(--btn-shadow-red)]/60 group-hover:scale-105 transition-all overflow-hidden animate-subtle-float">
                    <div className="absolute inset-0 animate-shimmer rounded-2xl pointer-events-none"></div>
                    <img 
                      src="/images/icons/miao-burns.png" 
                      alt="Burned" 
                      className="w-full h-full object-cover relative z-10"
                    />
                  </div>
                ) : item.title === "Contract Renounced" ? (
                  <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex-shrink-0 rounded-2xl flex items-center justify-center md:mb-4 border-2 border-b-4 border-[var(--btn-shadow-blue)]/60 group-hover:scale-105 transition-all overflow-hidden animate-subtle-float" style={{ animationDelay: `${i * 0.2}s` }}>
                    <div className="absolute inset-0 animate-shimmer rounded-2xl pointer-events-none"></div>
                    <img 
                      src="/images/icons/miao-renouces.png" 
                      alt="Renounced" 
                      className="w-full h-full object-cover relative z-10"
                    />
                  </div>
                ) : item.title === "No Treasury" ? (
                  <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex-shrink-0 rounded-2xl flex items-center justify-center md:mb-4 border-2 border-b-4 border-[var(--btn-shadow-orange)]/60 group-hover:scale-105 transition-all overflow-hidden animate-subtle-float" style={{ animationDelay: `${i * 0.2}s` }}>
                    <div className="absolute inset-0 animate-shimmer rounded-2xl pointer-events-none"></div>
                    <img 
                      src="/images/icons/miao-caos.png" 
                      alt="Chaos" 
                      className="w-full h-full object-cover relative z-10"
                    />
                  </div>
                ) : (
                  <div
                    className={`w-16 h-16 md:w-16 md:h-16 flex-shrink-0 ${item.color} rounded-2xl flex items-center justify-center md:mb-4 border-2 border-b-4 ${item.shadow} group-hover:scale-105 transition-transform`}
                  />
                )}
                <div className="flex-1 min-w-0 md:text-center">
                  <h3 className="text-base md:text-lg font-black text-[var(--text-primary)]">{item.title}</h3>
                  <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1 md:mt-2 font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 relative">
            {/* Interface do Telegram - fundo azul escuro */}
            <div className="bg-[#0e1621] rounded-2xl p-4 sm:p-6 shadow-2xl min-h-[200px]">
              {/* Mensagem anterior (fade X) - como contexto */}
              <div className="mb-4 opacity-60">
                <div className="flex gap-2 sm:gap-3">
                  <div className="hidden min-[500px]:flex flex-shrink-0 self-end mb-1">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--telegram-border)]">
                      <img 
                        src="/assets/tg_avatar_fade.jpg" 
                        alt="fade X" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#8e98a3] font-semibold text-xs">fade X</span>
                    </div>
                    <div className="bg-[#182533] rounded-2xl rounded-tl-none p-3 sm:p-4 relative">
                      <div className="absolute -left-[6px] top-0">
                        <svg width="6" height="13" viewBox="0 0 6 13">
                          <path d="M0 0L6 0L0 13Z" fill="#182533"/>
                        </svg>
                      </div>
                      <p className="text-[#8e98a3] text-xs sm:text-sm leading-relaxed break-words">
                        Chill man. I heard you said "0xMiranda was right about"...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Balão de mensagem - 0xmiranda */}
              <div className="relative flex gap-2 sm:gap-3">
                {/* Avatar */}
                <div className="hidden min-[500px]:flex flex-shrink-0 self-end mb-1">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--telegram-border)]">
                    <img 
                      src="/assets/tg_avatar.jpg" 
                      alt="0xmiranda" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Mensagem */}
                <div className="flex-1 min-w-0">
                  {/* Nome do remetente */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-sm">0xmiranda</span>
                    <button className="text-[#8e98a3] hover:text-white transition-colors">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                        <path d="M7 0C3.134 0 0 3.134 0 7s3.134 7 7 7 7-3.134 7-7S10.866 0 7 0zm3.5 9.625L9.625 11 7 8.375 4.375 11 3.5 10.125 6.125 7.5 3.5 4.875 4.375 4 7 6.625 9.625 4 10.5 4.875 7.875 7.5 10.5 9.625z"/>
                      </svg>
                    </button>
                  </div>
                  
                  {/* Balão de mensagem */}
                  <div className="bg-[#182533] rounded-2xl rounded-tl-none p-3 sm:p-4 shadow-lg relative">
                    {/* Cauda do balão */}
                    <div className="absolute -left-[6px] top-0">
                      <svg width="6" height="13" viewBox="0 0 6 13">
                        <path d="M0 0L6 0L0 13Z" fill="#182533"/>
                      </svg>
                    </div>
                    
                    {/* Texto da mensagem */}
                    <p className="text-white text-xs sm:text-sm leading-relaxed mb-3 break-words">
                      I admit that initially I was skeptical about the project given the behavior of certain members here, but I continued to observe the token. If this were meant to be a rug pull, I'd say it would have already happened. Now, you might consider it hypocrisy, but I'm even developing mini-games as a way to enrich the community. It's all about the value you give to something, and that value is built. Let's do it together.
                    </p>
                    
                    {/* Reações */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 bg-[#0e1621]/50 rounded-full px-2 py-1">
                        <span className="text-base">🔥</span>
                        <span className="text-[#8e98a3] text-xs">3</span>
                      </div>
                      <div className="flex items-center gap-1 bg-[#0e1621]/50 rounded-full px-2 py-1">
                        <span className="text-base">❤️</span>
                        <span className="text-[#8e98a3] text-xs">2</span>
                      </div>
                    </div>
                    
                    {/* Timestamp e checkmarks */}
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-[#8e98a3] text-xs">7:18 PM</span>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="#8e98a3">
                        <path d="M7 0C3.134 0 0 3.134 0 7s3.134 7 7 7 7-3.134 7-7S10.866 0 7 0zm4.5 5.25L6.25 10.5l-2.75-2.75 1.06-1.06L6.25 8.38l4.19-4.19L11.5 5.25z"/>
                      </svg>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="#8e98a3">
                        <path d="M7 0C3.134 0 0 3.134 0 7s3.134 7 7 7 7-3.134 7-7S10.866 0 7 0zm4.5 5.25L6.25 10.5l-2.75-2.75 1.06-1.06L6.25 8.38l4.19-4.19L11.5 5.25z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Community
