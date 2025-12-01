"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
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
  onSwapClick?: () => void
}

// Componente de ícone 3D de chama para Liquidity Burned
const Flame3DIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ transform: 'translateZ(8px)', filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4))' }}
    >
      {/* Chama principal - camada de trás (mais escura) */}
      <path
        d="M12 2C10 4 8 6 7 8C6 10 5.5 12 6 14C6.5 16 8 17 10 18C12 19 14 18.5 15 17C16 15.5 16.5 13.5 16 12C15.5 10.5 14.5 9 13 8C11.5 7 10.5 6.5 10 7C9.5 7.5 9 8.5 9 10C9 11.5 10 12.5 11 12C12 11.5 12.5 10 12 9C11.5 8 10.5 7.5 10 8C9.5 8.5 9 9.5 9 11C9 12.5 10 13.5 11 13C12 12.5 12.5 11 12 10C11.5 9 10.5 8.5 10 9C9.5 9.5 9 10.5 9 12C9 13.5 10 14.5 11 14C12 13.5 12.5 12 12 11C11.5 10 10.5 9.5 10 10C9.5 10.5 9 11.5 9 13C9 14.5 10 15.5 11 15C12 14.5 12.5 13 12 12Z"
        fill="url(#flame-gradient-dark)"
        opacity="0.6"
        style={{ transform: 'translateZ(-2px)' }}
      />
      {/* Chama média */}
      <path
        d="M12 3C10.5 4.5 9 6.5 8.5 8.5C8 10.5 8.5 12.5 9.5 14C10.5 15.5 12 16 13.5 15.5C15 15 16 13.5 15.5 12C15 10.5 13.5 9.5 12.5 9C11.5 8.5 11 9 11 10C11 11 11.5 11.5 12 11C12.5 10.5 12.5 9.5 12 9C11.5 8.5 11 9 11 10C11 11 11.5 11.5 12 11C12.5 10.5 12.5 9.5 12 9C11.5 8.5 11 9 11 10C11 11 11.5 11.5 12 11C12.5 10.5 12.5 9.5 12 9Z"
        fill="url(#flame-gradient-medium)"
        opacity="0.8"
        style={{ transform: 'translateZ(2px)' }}
      />
      {/* Chama frontal (mais brilhante) */}
      <path
        d="M12 4C11 5.5 10.5 7 10.5 8.5C10.5 10 11 11.5 12 12.5C13 13.5 14 13.5 14.5 12.5C15 11.5 14.5 10.5 13.5 10C12.5 9.5 12 10 12 11C12 11.5 12.5 11.5 13 11C13.5 10.5 13.5 10 13 9.5C12.5 9 12 9.5 12 10.5C12 11 12.5 11 13 10.5C13.5 10 13.5 9.5 13 9C12.5 8.5 12 9 12 10C12 10.5 12.5 10.5 13 10C13.5 9.5 13.5 9 13 8.5C12.5 8 12 8.5 12 9.5Z"
        fill="url(#flame-gradient-light)"
        style={{ transform: 'translateZ(6px)' }}
      />
      {/* Brilho no topo */}
      <ellipse
        cx="12"
        cy="5"
        rx="2"
        ry="1.5"
        fill="url(#flame-highlight)"
        opacity="0.9"
        style={{ transform: 'translateZ(8px)' }}
      />
      {/* Gradientes */}
      <defs>
        <linearGradient id="flame-gradient-dark" x1="12" y1="2" x2="12" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff6b35" />
          <stop offset="50%" stopColor="#f7931e" />
          <stop offset="100%" stopColor="#ff4b4b" />
        </linearGradient>
        <linearGradient id="flame-gradient-medium" x1="12" y1="3" x2="12" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff9500" />
          <stop offset="50%" stopColor="#ff6b35" />
          <stop offset="100%" stopColor="#ff4b4b" />
        </linearGradient>
        <linearGradient id="flame-gradient-light" x1="12" y1="4" x2="12" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffc800" />
          <stop offset="50%" stopColor="#ff9500" />
          <stop offset="100%" stopColor="#ff6b35" />
        </linearGradient>
        <radialGradient id="flame-highlight" cx="12" cy="5" r="2" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffc800" stopOpacity="0.5" />
        </radialGradient>
      </defs>
    </svg>
  )
}

const CONTRACT_ADDRESS = "8xpdiZ5GrnAdxpf7DSyZ1YXZxx6itvvoXPHZ4K2Epump"

// Função para gerar URL de imagem NFT aleatória do LaunchMyNFT
// Baseado no formato: https://gateway.pinit.io/cdn-cgi/image/format=auto/https://ap-assets.pinit.io/{collectionId}/{uuid}/{nftNumber}
const generateRandomNFTImage = (): string => {
  // ID da coleção Miao NFT do LaunchMyNFT (https://launchmynft.io/sol/20841)
  const collectionId = "5bVgayL6649hBZACjWtoC1jziVrVxBg4HPRTQvShLaWd"
  // UUID da coleção (fixo baseado no exemplo fornecido)
  const uuid = "25d5498d-a12a-4878-87ee-813a56b20308"
  // Gera número de NFT aleatório (assumindo que há NFTs numerados)
  // Usando um range maior para ter mais variedade
  const nftNumber = Math.floor(Math.random() * 10000) + 1
  
  return `https://gateway.pinit.io/cdn-cgi/image/format=auto/https://ap-assets.pinit.io/${collectionId}/${uuid}/${nftNumber}`
}

const Tokenomics: React.FC<TokenomicsProps> = ({ isChristmasMode = false, onSwapClick }) => {
  const [copied, setCopied] = useState(false)
  const [swapCardClicked, setSwapCardClicked] = useState(false)
  
  // Gera imagens aleatórias do LaunchMyNFT para o roadmap
  const roadmapItemsWithNFTImages = useMemo(() => {
    const baseItems = [
      {
        label: "1000 Holders",
        color: "var(--duo-green)",
        x: 60,
        y: 280,
      },
      {
        label: "250k MC",
        color: "var(--duo-blue)",
        x: 185,
        y: 200,
      },
      {
        label: "Games",
        color: "var(--duo-orange)",
        x: 310,
        y: 280,
      },
      {
        label: "Miao Tools",
        color: "var(--duo-purple)",
        x: 435,
        y: 200,
      },
      {
        label: "Android APP",
        color: "var(--duo-pink)",
        x: 560,
        y: 280,
      },
      {
        label: "+1500 Holders",
        color: "var(--duo-yellow)",
        x: 685,
        y: 200,
      },
      {
        label: "CMC/CG Lists",
        color: "var(--duo-red)",
        x: 810,
        y: 280,
      },
      {
        label: "More...",
        color: "var(--duo-green)",
        x: 935,
        y: 60,
      },
    ]
    
    // Adiciona imagem NFT aleatória para cada item
    return baseItems.map(item => ({
      ...item,
      img: generateRandomNFTImage(),
    }))
  }, []) // Array vazio para gerar apenas uma vez

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
      iconColor: "text-[var(--duo-orange)]",
      icon: Rocket,
    },
    {
      k: "Supply",
      v: "1B MIAO",
      color: "bg-[var(--duo-yellow)]",
      shadow: "border-[var(--btn-shadow-orange)]",
      iconColor: "text-[var(--duo-yellow)]",
      icon: Coins,
    },
    {
      k: "Launchpad",
      v: "Pumpfun",
      color: "bg-[var(--duo-pink)]",
      shadow: "border-[var(--duo-pink-dark)]",
      iconColor: "text-[var(--duo-pink)]",
      icon: Target,
    },
    {
      k: "Liquidity Burned",
      v: "No rug pulls",
      color: "bg-[var(--duo-red)]",
      shadow: "border-[var(--btn-shadow-red)]",
      iconColor: "text-[var(--duo-red)]",
      icon: Flame,
    },
    {
      k: "Contract Renounced",
      v: "Can't change it",
      color: "bg-[var(--duo-blue)]",
      shadow: "border-[var(--btn-shadow-blue)]",
      iconColor: "text-[var(--duo-blue)]",
      icon: ShieldCheck,
    },
    {
      k: "No Treasury",
      v: "Pure chaos",
      color: "bg-[var(--duo-purple)]",
      shadow: "border-[var(--btn-shadow-purple)]",
      iconColor: "text-[var(--duo-purple)]",
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
      desc: "Use our Swap",
      color: "bg-[var(--duo-green)]",
      shadow: "border-[var(--btn-shadow)]",
      icon: ArrowRightLeft,
    },
  ]


  return (
    <section id="overview" className="py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Tokenomics + How to Buy Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Tokenomics Card */}
          <div className="bg-[var(--bg-secondary)]/95 backdrop-blur-sm rounded-3xl p-6 border-2 border-[var(--border-color)] border-b-4 relative overflow-visible">
            <SnowCap className="h-10" visible={isChristmasMode} />
            <div className="absolute -top-3 right-0 w-32 h-32 md:w-40 md:h-40 z-0 pointer-events-none">
              <img
                src="/images/miao-confident.png"
                alt="MIAO confident"
                className="w-full h-full object-cover object-top opacity-90"
                style={{ 
                  clipPath: 'inset(0 0 30% 0)',
                  objectPosition: 'top',
                  maskImage: 'linear-gradient(to bottom, black 0%, black 50%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.4) 75%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 50%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.4) 75%, transparent 100%)'
                }}
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] mb-6 relative z-10">Tokenomics</h2>

            <div className="grid grid-cols-3 gap-2.5 relative z-10">
              {tokenomicsItems.map((item, i) => {
                const IconComponent = item.icon
                const isLiquidityBurned = item.k === "Liquidity Burned"
                return (
                  <div
                    key={i}
                    className="aspect-square bg-[var(--bg-primary)] rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer border-2 border-b-4 border-[var(--border-color)] hover:scale-105 active:border-b-2 active:translate-y-[2px] transition-all"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 border-2 ${item.shadow} icon-3d relative`}
                      style={{
                        transform: 'perspective(1000px) rotateX(8deg) rotateY(-8deg)',
                        transformStyle: 'preserve-3d',
                        backgroundColor: item.k === "Fair Launch" ? "var(--duo-orange)" : 
                                        item.k === "Supply" ? "var(--duo-yellow)" : 
                                        item.k === "Launchpad" ? "var(--duo-pink)" : 
                                        item.k === "Liquidity Burned" ? "var(--duo-red)" : 
                                        item.k === "Contract Renounced" ? "var(--duo-blue)" : 
                                        "var(--duo-purple)",
                      }}
                    >
                      {isLiquidityBurned ? (
                        <Flame3DIcon className="w-7 h-7 relative z-10" />
                      ) : (
                        <IconComponent 
                          className="w-7 h-7 text-white relative z-10" 
                          strokeWidth={2.5}
                          style={{ 
                            transform: 'translateZ(8px)',
                            filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4))'
                          }}
                        />
                      )}
                    </div>
                    <span className="font-bold text-[var(--text-secondary)] text-xs uppercase tracking-tight leading-tight">
                      {item.k}
                    </span>
                    <span className="font-black text-[var(--duo-green)] text-sm leading-tight">{item.v}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* How to Buy Card */}
          <div className="bg-[var(--bg-secondary)]/95 backdrop-blur-sm rounded-3xl p-6 border-2 border-[var(--border-color)] border-b-4 relative overflow-visible">
            <SnowCap className="h-10" visible={isChristmasMode} />
            <div className="absolute -top-3 right-0 w-32 h-32 md:w-40 md:h-40 z-0 pointer-events-none">
              <img
                src="/images/miao-asking.png"
                alt="MIAO asking"
                className="w-full h-full object-cover object-top opacity-90"
                style={{ 
                  clipPath: 'inset(0 0 30% 0)',
                  objectPosition: 'top',
                  maskImage: 'linear-gradient(to bottom, black 0%, black 50%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.4) 75%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 50%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.4) 75%, transparent 100%)'
                }}
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] mb-6 relative z-10">How to Buy</h2>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              {howToBuySteps.map((step, i) => {
                const IconComponent = step.icon
                const numberImage = `/assets/numbers/${i + 1}.png`
                const isSwapStep = i === 3 // 4th step (index 3)
                return (
                  <div
                    key={i}
                    onClick={
                      isSwapStep && onSwapClick
                        ? () => {
                            setSwapCardClicked(true)
                            onSwapClick()
                            setTimeout(() => setSwapCardClicked(false), 300)
                          }
                        : undefined
                    }
                    className={`bg-[var(--bg-primary)]/70 backdrop-blur-sm p-4 rounded-2xl border-2 border-b-4 transition-all ${
                      isSwapStep && onSwapClick
                        ? `cursor-pointer hover:scale-[1.02] active:border-b-2 active:translate-y-[2px] ${
                            swapCardClicked
                              ? "bg-[var(--duo-green)]/30 border-[var(--duo-green)] border-b-[var(--btn-shadow)]"
                              : "border-[var(--duo-green)] border-b-[var(--btn-shadow)] shadow-[0_4px_0_var(--btn-shadow)] hover:shadow-[0_6px_0_var(--btn-shadow)]"
                          }`
                        : "border-[var(--border-color)] hover:scale-[1.02] active:border-b-2 active:translate-y-[2px]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 relative">
                        <img
                          src={numberImage}
                          alt={`Step ${i + 1}`}
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h4 className="font-black text-base text-[var(--text-primary)] leading-tight mb-1">{step.title}</h4>
                        <p className="text-[var(--text-secondary)] font-medium text-sm leading-tight">
                          {step.desc}
                        </p>
                      </div>
                      <div
                        className={`flex-shrink-0 w-10 h-10 ${step.color} rounded-xl text-white flex items-center justify-center border-2 ${step.shadow}`}
                      >
                        <IconComponent className="w-5 h-5" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

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
            <div 
              className="min-w-[1000px] w-full max-w-[1200px] mx-auto rounded-3xl p-8 border-2 border-[var(--border-color)] border-b-4 relative overflow-hidden"
              style={{
                backgroundImage: `url('/assets/${isChristmasMode ? 'bg_roadmap_christmas.jpg' : 'bg_roadmap.jpg'}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}
            >
              {/* Overlay sutil para melhorar legibilidade */}
              <div className="absolute inset-0 bg-[var(--bg-tertiary)]/30 backdrop-blur-[2px] pointer-events-none"></div>
              <div className="relative z-10" style={{ height: "400px" }}>
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

                {roadmapItemsWithNFTImages.map((item, i) => (
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
                      <span className="font-black text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] px-4 py-1.5 rounded-full border-2 border-[var(--border-color)] whitespace-nowrap mb-1.5">
                        {item.label}
                      </span>
                    )}

                    {/* Avatar */}
                    <div
                      className="w-16 h-16 rounded-full border-4 overflow-hidden bg-[var(--bg-primary)] shadow-lg"
                      style={{ borderColor: item.color }}
                    >
                      <img
                        src={item.img || "/placeholder.svg"}
                        alt={item.label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          if (target.src !== "/placeholder.svg") {
                            target.src = "/placeholder.svg"
                          }
                        }}
                        loading="lazy"
                      />
                    </div>

                    {/* Label below for items at y=280 */}
                    {item.y === 280 && (
                      <span className="font-black text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] px-4 py-1.5 rounded-full border-2 border-[var(--border-color)] whitespace-nowrap mt-1.5">
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
