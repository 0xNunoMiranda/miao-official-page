"use client"

import type React from "react"
import { useState } from "react"
import {
  Copy,
  Check,
  Rocket,
  Coins,
  Target,
  Flame,
  Wallet,
  Download,
  ArrowRightLeft,
  ShoppingCart,
  ShieldCheck,
  FileX,
} from "lucide-react"
import SnowCap from "./SnowCap"

interface TokenomicsProps {
  isChristmasMode?: boolean
}

const CONTRACT_ADDRESS = "8xpdiZ5GrnAdxpf7DSyZ1YXZxx6itvvoXPHZ4K2Epump"

const Tokenomics: React.FC<TokenomicsProps> = ({ isChristmasMode = false }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const tokenomicsItems = [
    {
      k: "Fair Launch",
      v: "100% Community",
      color: "bg-[var(--duo-orange)]",
      shadow: "border-[var(--btn-shadow-orange)]",
      icon: Rocket,
    },
    {
      k: "Supply",
      v: "1B MIAO",
      color: "bg-[var(--duo-yellow)]",
      shadow: "border-[var(--btn-shadow-orange)]",
      icon: Coins,
    },
    {
      k: "Launchpad",
      v: "Pumpfun",
      color: "bg-[var(--duo-pink)]",
      shadow: "border-[var(--duo-pink-dark)]",
      icon: Target,
    },
    {
      k: "Liquidity Burned",
      v: "No rug pulls",
      color: "bg-[var(--duo-red)]",
      shadow: "border-[var(--btn-shadow-red)]",
      icon: Flame,
    },
    {
      k: "Contract Renounced",
      v: "Can't change it",
      color: "bg-[var(--duo-blue)]",
      shadow: "border-[var(--btn-shadow-blue)]",
      icon: ShieldCheck,
    },
    {
      k: "No Treasury",
      v: "Pure chaos",
      color: "bg-[var(--duo-purple)]",
      shadow: "border-[var(--btn-shadow-purple)]",
      icon: FileX,
    },
  ]

  const howToBuySteps = [
    {
      title: "Buy Solana",
      desc: "Binance, Coinbase, Kraken",
      color: "bg-[var(--duo-blue)]",
      shadow: "border-[var(--btn-shadow-blue)]",
      icon: ShoppingCart,
    },
    {
      title: "Get Phantom",
      desc: "Install wallet",
      color: "bg-[var(--duo-purple)]",
      shadow: "border-[var(--btn-shadow-purple)]",
      icon: Wallet,
    },
    {
      title: "Send SOL",
      desc: "Transfer from exchange",
      color: "bg-[var(--duo-orange)]",
      shadow: "border-[var(--btn-shadow-orange)]",
      icon: Download,
    },
    {
      title: "Swap to $MIAO",
      desc: "Use Raydium DEX",
      color: "bg-[var(--duo-green)]",
      shadow: "border-[var(--btn-shadow)]",
      icon: ArrowRightLeft,
    },
  ]

  const roadmapItems = [
    {
      label: "1000 Holders",
      img: "https://miaotoken.vip/wp-content/uploads/2025/10/22-1.png",
      color: "var(--duo-green)",
      x: 60,
      y: 280,
    },
    {
      label: "250k MC",
      img: "https://miaotoken.vip/wp-content/uploads/2025/10/77.png",
      color: "var(--duo-blue)",
      x: 185,
      y: 200,
    },
    {
      label: "Games",
      img: "https://miaotoken.vip/wp-content/uploads/2025/10/1010.png",
      color: "var(--duo-orange)",
      x: 310,
      y: 280,
    },
    {
      label: "Miao Tools",
      img: "https://miaotoken.vip/wp-content/uploads/2025/10/1212.png",
      color: "var(--duo-purple)",
      x: 435,
      y: 200,
    },
    {
      label: "Android APP",
      img: "https://miaotoken.vip/wp-content/uploads/2025/10/1313.png",
      color: "var(--duo-pink)",
      x: 560,
      y: 280,
    },
    {
      label: "+1500 Holders",
      img: "https://miaotoken.vip/wp-content/uploads/2025/10/1111.png",
      color: "var(--duo-yellow)",
      x: 685,
      y: 200,
    },
    {
      label: "CMC/CG Lists",
      img: "https://miaotoken.vip/wp-content/uploads/2025/10/1414.png",
      color: "var(--duo-red)",
      x: 810,
      y: 280,
    },
    {
      label: "More...",
      img: "https://miaotoken.vip/wp-content/uploads/2025/10/22-1.png",
      color: "var(--duo-green)",
      x: 935,
      y: 60,
    },
  ]

  return (
    <section id="overview" className="py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Tokenomics + How to Buy Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Tokenomics Card */}
          <div className="bg-[var(--bg-secondary)]/95 backdrop-blur-sm rounded-3xl p-6 border-2 border-[var(--border-color)] border-b-4 relative">
            <SnowCap className="h-10" visible={isChristmasMode} />
            <h2 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] mb-6">Tokenomics</h2>

            <div className="grid grid-cols-3 gap-3">
              {tokenomicsItems.map((item, i) => {
                const IconComponent = item.icon
                return (
                  <div
                    key={i}
                    className="aspect-square bg-[var(--bg-primary)] rounded-2xl p-2 flex flex-col items-center justify-center text-center cursor-pointer border-2 border-b-4 border-[var(--border-color)] hover:scale-105 active:border-b-2 active:translate-y-[2px] transition-all"
                  >
                    <div
                      className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center mb-2 border-2 ${item.shadow}`}
                    >
                      <IconComponent className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-[var(--text-secondary)] text-[10px] uppercase tracking-tight leading-tight">
                      {item.k}
                    </span>
                    <span className="font-black text-[var(--duo-green)] text-xs leading-tight">{item.v}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* How to Buy Card */}
          <div className="bg-[var(--bg-secondary)]/95 backdrop-blur-sm rounded-3xl p-6 border-2 border-[var(--border-color)] border-b-4 relative overflow-hidden">
            <SnowCap className="h-10" visible={isChristmasMode} />
            <h2 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] mb-6">How to Buy</h2>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              {howToBuySteps.map((step, i) => {
                const IconComponent = step.icon
                return (
                  <div
                    key={i}
                    className="bg-[var(--bg-primary)] p-4 rounded-2xl cursor-pointer border-2 border-b-4 border-[var(--border-color)] hover:scale-[1.02] active:border-b-2 active:translate-y-[2px] transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-10 h-10 ${step.color} rounded-xl text-white flex items-center justify-center font-black text-lg border-2 ${step.shadow}`}
                      >
                        <IconComponent className="w-5 h-5" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0 pt-1">
                        <h4 className="font-black text-sm text-[var(--text-primary)] leading-tight">{step.title}</h4>
                        <p className="text-[var(--text-secondary)] font-medium text-xs leading-tight mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <img
              src="/images/miao-asking.png"
              alt="MIAO asking"
              className="absolute bottom-0 right-0 w-28 h-28 object-contain opacity-90 pointer-events-none"
            />
          </div>
        </div>

        <div className="mb-16">
          <div
            onClick={copyToClipboard}
            className="bg-[var(--duo-green)] rounded-2xl p-5 cursor-pointer group border-2 border-b-4 border-[var(--btn-shadow)] hover:brightness-105 active:border-b-2 active:translate-y-[2px] transition-all"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="font-black text-white text-lg uppercase tracking-wide">Contract Address</span>
              <div className="flex items-center gap-3">
                <code className="font-mono text-sm bg-white text-[var(--duo-green)] px-4 py-3 rounded-xl break-all font-bold">
                  {CONTRACT_ADDRESS}
                </code>
                <button className="flex-shrink-0 w-12 h-12 rounded-xl bg-white text-[var(--duo-green)] flex items-center justify-center font-black">
                  {copied ? (
                    <Check className="w-5 h-5" strokeWidth={3} />
                  ) : (
                    <Copy className="w-5 h-5" strokeWidth={3} />
                  )}
                </button>
              </div>
            </div>
            {copied && <p className="text-center text-white font-black mt-3 text-lg animate-bounce">Copied! MEOW~</p>}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mb-10">Roadmap</h2>

          <div className="w-full overflow-x-auto pb-6 custom-scrollbar">
            <div className="min-w-[1000px] w-full max-w-[1200px] mx-auto bg-[var(--bg-tertiary)]/95 backdrop-blur-sm rounded-3xl p-8 border-2 border-[var(--border-color)] border-b-4">
              <div className="relative" style={{ height: "400px" }}>
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 1000 400"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path
                    d="M60,280 L185,200 L310,280 L435,200 L560,280 L685,200 L810,280 L935,60"
                    stroke="var(--duo-green)"
                    strokeWidth="6"
                    strokeDasharray="15 10"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-path-dash"
                  />
                </svg>

                {roadmapItems.map((item, i) => (
                  <div
                    key={i}
                    className="absolute flex flex-col items-center gap-2"
                    style={{
                      left: `${(item.x / 1000) * 100}%`,
                      top: `${(item.y / 400) * 100}%`,
                      transform: "translate(-50%, -50%)",
                      animation: `roadmap-float 4s ease-in-out infinite`,
                      animationDelay: `${i * 0.4}s`,
                    }}
                  >
                    {/* Label above for items at y=200 or y=60, below for y=280 */}
                    {(item.y === 200 || item.y === 60) && (
                      <span className="font-black text-xs text-[var(--text-primary)] bg-[var(--bg-primary)] px-3 py-1 rounded-full border-2 border-[var(--border-color)] whitespace-nowrap mb-1">
                        {item.label}
                      </span>
                    )}

                    {/* Avatar */}
                    <div
                      className="w-14 h-14 rounded-full border-4 overflow-hidden bg-[var(--bg-primary)] shadow-lg"
                      style={{ borderColor: item.color }}
                    >
                      <img
                        src={item.img || "/placeholder.svg"}
                        alt={item.label}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Label below for items at y=280 */}
                    {item.y === 280 && (
                      <span className="font-black text-xs text-[var(--text-primary)] bg-[var(--bg-primary)] px-3 py-1 rounded-full border-2 border-[var(--border-color)] whitespace-nowrap mt-1">
                        {item.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-8 text-lg font-black text-[var(--text-primary)] uppercase tracking-wider">
            Building the future with MIAO
          </p>
        </div>
      </div>
    </section>
  )
}

export default Tokenomics
