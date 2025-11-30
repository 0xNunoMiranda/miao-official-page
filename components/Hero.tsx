import type React from "react"
import { Send, Twitter, Instagram, BarChart3, Rocket, Wrench, Gamepad2, ArrowRight } from "lucide-react"
import SnowCap from "./SnowCap"
import SnowEffect from "./SnowEffect"

interface HeroProps {
  onOpenGames?: () => void
  onOpenTools?: () => void
  isChristmasMode?: boolean
}

const Hero: React.FC<HeroProps> = ({ onOpenGames, onOpenTools, isChristmasMode = false }) => {
  const actionItems = [
    {
      title: "Dexscreen",
      desc: "Live Charts",
      action: "VIEW",
      href: "#",
      type: "link",
      bgColor: "bg-[#8b5cf6]",
      borderColor: "border-[#7c3aed]",
      icon: <BarChart3 size={28} strokeWidth={2.5} />,
    },
    {
      title: "PumpFun",
      desc: "Fair Launch",
      action: "APE IN",
      href: "#",
      type: "link",
      bgColor: "bg-[var(--brand)]",
      borderColor: "border-[var(--brand-dark)]",
      icon: <Rocket size={28} strokeWidth={2.5} />,
    },
    {
      title: "MIAO Tools",
      desc: "Utilities",
      action: "OPEN",
      onClick: onOpenTools,
      type: "button",
      bgColor: "bg-[var(--duo-blue)]",
      borderColor: "border-[var(--duo-blue-dark)]",
      icon: <Wrench size={28} strokeWidth={2.5} />,
    },
    {
      title: "MIAO Games",
      desc: "Play & Earn",
      action: "PLAY",
      onClick: onOpenGames,
      type: "button",
      bgColor: "bg-[var(--duo-orange)]",
      borderColor: "border-[var(--duo-orange-dark)]",
      icon: <Gamepad2 size={28} strokeWidth={2.5} />,
    },
  ]

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-28 pb-12 overflow-hidden flex items-center bg-[var(--bg-primary)]"
    >
      <SnowEffect isActive={isChristmasMode} />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Mascot Column (Left) */}
          <div className="relative order-1 lg:order-1 flex justify-center lg:justify-start group">
            <div className="relative w-full max-w-[500px] lg:max-w-[600px] animate-float transition-transform duration-500 hover:scale-105">
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
                className="w-64 md:w-96 lg:w-[420px] h-auto animate-fade-up hover:scale-105 transition-transform duration-300 drop-shadow-lg"
              />
            </div>

            {/* Tagline */}
            <p className="text-xl md:text-2xl font-bold text-[var(--text-secondary)] leading-relaxed lg:pl-12">
              Primeiro vieram os caes, depois os sapos...
              <br />
              Agora, as sombras pertencem ao{" "}
              <span className="text-[var(--brand)] font-black text-2xl md:text-3xl">$MIAO</span>.
            </p>

            <div className="flex justify-center lg:justify-end gap-3">
              {[
                { icon: <Send size={22} />, bg: "bg-[#229ED9]", border: "border-[#1a7fb0]" },
                { icon: <Twitter size={22} />, bg: "bg-[#1DA1F2]", border: "border-[#1681bf]" },
                { icon: <Instagram size={22} />, bg: "bg-[#E1306C]", border: "border-[#b01b4e]" },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  ),
                  bg: "bg-[var(--text-primary)]",
                  border: "border-[var(--text-secondary)]",
                },
              ].map((social, i) => (
                <a
                  key={i}
                  href="#"
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white border-b-4 active:border-b-0 active:translate-y-1 transition-all hover:brightness-110 ${social.bg} ${social.border}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 lg:ml-auto max-w-[480px] mx-auto lg:mr-0 pt-6">
              {actionItems.map((item, i) => {
                const Component = item.type === "button" ? "button" : "a"
                const props = item.type === "button" ? { onClick: item.onClick } : { href: item.href }

                return (
                  // @ts-ignore
                  <Component
                    key={i}
                    {...props}
                    className={`
                              group relative overflow-hidden rounded-2xl p-5 text-left
                              ${item.bgColor} ${item.borderColor}
                              border-b-[6px] active:border-b-0 active:translate-y-1.5
                              transition-all hover:brightness-105 text-white
                            `}
                  >
                    <SnowCap visible={isChristmasMode} className="opacity-90" />

                    {/* Icon */}
                    <div className="mb-4 opacity-90 group-hover:scale-110 transition-transform">{item.icon}</div>

                    {/* Content */}
                    <div className="space-y-1">
                      <h3 className="font-black text-lg uppercase tracking-tight leading-none">{item.title}</h3>
                      <p className="font-semibold text-sm opacity-80">{item.desc}</p>
                    </div>

                    {/* Action Badge */}
                    <div className="mt-4 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 font-black text-xs uppercase tracking-wider group-hover:bg-white group-hover:text-[var(--text-primary)] transition-all">
                      {item.action}
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Component>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
