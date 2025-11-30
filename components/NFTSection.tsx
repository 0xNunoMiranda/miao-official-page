"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import SnowCap from "./SnowCap"

interface NFTSectionProps {
  isChristmasMode?: boolean
}

const NFT_BASE_URL =
  "https://gateway.pinit.io/cdn-cgi/image/format=auto/https://ap-assets.pinit.io/5bVgayL6649hBZACjWtoC1jziVrVxBg4HPRTQvShLaWd/25d5498d-a12a-4878-87ee-813a56b20308"

const NFT_IDS = Array.from({ length: 100 }, (_, i) => i + 1)

const NFT_ATTRIBUTES = [
  { trait: "Background", values: ["Mystic Purple", "Shadow Black", "Neon Green", "Cyber Blue"] },
  { trait: "Eyes", values: ["Laser", "Diamond", "Fire", "Galaxy"] },
  { trait: "Accessory", values: ["Crown", "Shades", "Halo", "None"] },
  { trait: "Fur", values: ["Golden", "Cosmic", "Shadow", "Emerald"] },
  { trait: "Expression", values: ["Smirk", "Fierce", "Chill", "Mysterious"] },
]

const CONTINUOUS_ANIMATIONS = [
  "float", // gentle up/down floating
  "pulse-glow", // pulsing with glow
  "rotate-slow", // slow continuous rotation
  "zoom-pulse", // zoom in and out
  "swing", // swinging motion
  "bounce-soft", // soft bouncing
  "tilt-rock", // tilting back and forth
  "drift", // drifting sideways
]

interface DisplayNFT {
  id: number
  imageUrl: string
  showAttribute: boolean
  attribute?: { trait: string; value: string }
  position: { x: number; y: number }
  scale: number
  delay: number
  continuousAnimation: string
  initialRotation: number
  animationDuration: number
}

const NFTSection: React.FC<NFTSectionProps> = ({ isChristmasMode = false }) => {
  const [displayNFTs, setDisplayNFTs] = useState<DisplayNFT[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [bgAnimation, setBgAnimation] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const generateRandomNFTs = useCallback(() => {
    const count = Math.floor(Math.random() * 4) + 1
    const selectedIds = [...NFT_IDS].sort(() => Math.random() - 0.5).slice(0, count)

    const getPositions = (count: number): { x: number; y: number }[] => {
      const randomOffset = () => (Math.random() - 0.5) * 10
      switch (count) {
        case 1:
          return [{ x: 50 + randomOffset(), y: 50 + randomOffset() }]
        case 2:
          return [
            { x: 32 + randomOffset(), y: 50 + randomOffset() },
            { x: 68 + randomOffset(), y: 50 + randomOffset() },
          ]
        case 3:
          return [
            { x: 25 + randomOffset(), y: 38 + randomOffset() },
            { x: 75 + randomOffset(), y: 38 + randomOffset() },
            { x: 50 + randomOffset(), y: 68 + randomOffset() },
          ]
        case 4:
          return [
            { x: 30 + randomOffset(), y: 32 + randomOffset() },
            { x: 70 + randomOffset(), y: 32 + randomOffset() },
            { x: 30 + randomOffset(), y: 68 + randomOffset() },
            { x: 70 + randomOffset(), y: 68 + randomOffset() },
          ]
        default:
          return [{ x: 50, y: 50 }]
      }
    }

    const positions = getPositions(count)

    return selectedIds.map((id, index) => {
      const showAttribute = Math.random() > 0.75
      const randomAttr = NFT_ATTRIBUTES[Math.floor(Math.random() * NFT_ATTRIBUTES.length)]
      const randomValue = randomAttr.values[Math.floor(Math.random() * randomAttr.values.length)]
      const continuousAnimation = CONTINUOUS_ANIMATIONS[Math.floor(Math.random() * CONTINUOUS_ANIMATIONS.length)]

      return {
        id,
        imageUrl: `${NFT_BASE_URL}/${id}`,
        showAttribute,
        attribute: showAttribute ? { trait: randomAttr.trait, value: randomValue } : undefined,
        position: positions[index],
        scale: count === 1 ? 1.15 : count === 2 ? 1 : 0.85,
        delay: index * 0.15,
        continuousAnimation,
        initialRotation: (Math.random() - 0.5) * 8,
        animationDuration: 2.5 + Math.random() * 2, // 2.5-4.5s random duration
      }
    })
  }, [])

  useEffect(() => {
    setDisplayNFTs(generateRandomNFTs())

    intervalRef.current = setInterval(() => {
      setIsVisible(false)
      setBgAnimation((prev) => prev + 1)

      setTimeout(() => {
        setDisplayNFTs(generateRandomNFTs())
        setIsVisible(true)
      }, 800) // Longer fade transition
    }, 6000) // NFTs stay 6 seconds

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [generateRandomNFTs])

  const animationStyles = `
    @keyframes nft-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }
    @keyframes nft-pulse-glow {
      0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px var(--brand)); }
      50% { transform: scale(1.08); filter: drop-shadow(0 0 20px var(--brand)); }
    }
    @keyframes nft-rotate-slow {
      0% { transform: rotate(-5deg); }
      50% { transform: rotate(5deg); }
      100% { transform: rotate(-5deg); }
    }
    @keyframes nft-zoom-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.12); }
    }
    @keyframes nft-swing {
      0%, 100% { transform: rotate(-8deg); }
      50% { transform: rotate(8deg); }
    }
    @keyframes nft-bounce-soft {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-8px) scale(1.03); }
    }
    @keyframes nft-tilt-rock {
      0%, 100% { transform: rotate(-6deg) scale(1.02); }
      50% { transform: rotate(6deg) scale(0.98); }
    }
    @keyframes nft-drift {
      0%, 100% { transform: translateX(0) translateY(0); }
      25% { transform: translateX(8px) translateY(-4px); }
      50% { transform: translateX(0) translateY(-8px); }
      75% { transform: translateX(-8px) translateY(-4px); }
    }
  `

  const getContinuousAnimationStyle = (animation: string, duration: number) => {
    const animationMap: Record<string, string> = {
      float: `nft-float ${duration}s ease-in-out infinite`,
      "pulse-glow": `nft-pulse-glow ${duration}s ease-in-out infinite`,
      "rotate-slow": `nft-rotate-slow ${duration}s ease-in-out infinite`,
      "zoom-pulse": `nft-zoom-pulse ${duration}s ease-in-out infinite`,
      swing: `nft-swing ${duration}s ease-in-out infinite`,
      "bounce-soft": `nft-bounce-soft ${duration}s ease-in-out infinite`,
      "tilt-rock": `nft-tilt-rock ${duration}s ease-in-out infinite`,
      drift: `nft-drift ${duration * 1.5}s ease-in-out infinite`,
    }
    return animationMap[animation] || animationMap["float"]
  }

  return (
    <section
      id="nfts"
      className="relative py-16 md:py-24 overflow-hidden flex items-center justify-center"
      style={{ background: "var(--bg-tertiary)" }}
    >
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />

      <div className="absolute inset-0 w-full h-full z-0 opacity-15 pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: "grayscale(100%) contrast(1.1)" }}
          src="https://miaotoken.vip/wp-content/uploads/2025/11/final.mp4"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 w-full">
        <div
          className="rounded-2xl p-5 md:p-6 relative overflow-hidden shadow-lg backdrop-blur-sm"
          style={{
            background: "var(--bg-secondary)",
            border: "2px solid var(--border-color)",
          }}
        >
          <SnowCap className="h-6 opacity-90" visible={isChristmasMode} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
            {/* Column 1: Mint Info */}
            <div className="flex flex-col justify-center">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
                Mint MIAO NFT
              </h3>
              <p className="text-sm font-medium leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                Born from the shadows of the meme wars, the $MIAO NFTs embody stealth and energy. Own a symbol of power
                in the streets.
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
                <a
                  href="https://launchmynft.io/sol/20841"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="duo-btn duo-btn-green text-sm font-bold py-2.5 px-5 text-center uppercase tracking-wide"
                >
                  MINT V1
                </a>
                <a
                  href="https://launchmynft.io/sol/20841"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="duo-btn duo-btn-secondary text-sm font-bold py-2.5 px-5 text-center uppercase tracking-wide"
                >
                  MINT V2
                </a>
              </div>

              <div className="pt-3 border-t grid grid-cols-3 gap-2" style={{ borderColor: "var(--border-color)" }}>
                <div className="text-center">
                  <p className="text-lg md:text-xl font-black" style={{ color: "var(--brand)" }}>
                    999
                  </p>
                  <p className="text-[10px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                    Total Supply
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg md:text-xl font-black" style={{ color: "var(--brand)" }}>
                    0.5
                  </p>
                  <p className="text-[10px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                    SOL Price
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg md:text-xl font-black" style={{ color: "var(--brand)" }}>
                    100+
                  </p>
                  <p className="text-[10px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                    Holders
                  </p>
                </div>
              </div>
            </div>

            {/* Column 2: NFT Showcase with continuous animations */}
            <div
              className="relative rounded-xl overflow-hidden min-h-[260px] md:min-h-[300px]"
              style={{
                background: `linear-gradient(${45 + bgAnimation * 25}deg, var(--bg-tertiary), var(--bg-primary), var(--bg-tertiary))`,
                transition: "background 1.2s ease-out",
              }}
            >
              {/* Animated gradient overlay */}
              <div
                className="absolute inset-0 opacity-25 transition-all duration-1000"
                style={{
                  background: `radial-gradient(circle at ${25 + (bgAnimation % 4) * 15}% ${35 + (bgAnimation % 3) * 15}%, var(--brand) 0%, transparent 45%)`,
                }}
              />

              {/* NFT Display Area */}
              <div className="relative w-full h-full min-h-[260px] md:min-h-[300px]">
                {displayNFTs.map((nft, index) => (
                  <div
                    key={`${nft.id}-${index}-${bgAnimation}`}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${nft.position.x}%`,
                      top: `${nft.position.y}%`,
                      opacity: isVisible ? 1 : 0,
                      transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.7})`,
                      transition: `opacity 0.8s ease-out ${nft.delay}s, transform 0.8s ease-out ${nft.delay}s`,
                    }}
                  >
                    <div
                      style={{
                        animation: isVisible
                          ? getContinuousAnimationStyle(nft.continuousAnimation, nft.animationDuration)
                          : "none",
                        transform: `rotate(${nft.initialRotation}deg) scale(${nft.scale})`,
                      }}
                    >
                      <div
                        className="rounded-xl overflow-hidden shadow-xl cursor-pointer transition-shadow duration-300 hover:shadow-2xl"
                        style={{
                          border: "3px solid var(--brand)",
                          background: "var(--bg-primary)",
                        }}
                      >
                        <img
                          src={nft.imageUrl || "/placeholder.svg"}
                          alt={`MIAO NFT #${nft.id}`}
                          className="w-20 h-20 md:w-24 md:h-24 object-cover"
                          loading="lazy"
                        />

                        <div className="px-2 py-1 text-center" style={{ background: "var(--bg-tertiary)" }}>
                          <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                            #{nft.id}
                          </span>
                        </div>

                        {nft.showAttribute && nft.attribute && (
                          <div className="px-2 py-1 text-center" style={{ background: "var(--brand)" }}>
                            <p className="text-[9px] font-bold text-white truncate">{nft.attribute.trait}</p>
                            <p className="text-[9px] text-white/80 truncate">{nft.attribute.value}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{
                      background: "var(--brand)",
                      opacity: 0.35,
                      left: `${12 + ((i * 15) % 75)}%`,
                      top: `${18 + ((i * 18) % 65)}%`,
                      animation: `nft-float ${3 + i * 0.4}s ease-in-out infinite`,
                      animationDelay: `${i * 0.4}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NFTSection
