"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import SnowCap from "./SnowCap"
import SnowEffect from "./SnowEffect"
import LeafEffect from "./LeafEffect"
import { useLanguage } from "../lib/language-context"
import { type Season } from "./SeasonSelector"

interface NFTSectionProps {
  isChristmasMode?: boolean
  season?: Season
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

const ENTRANCE_ANIMATIONS = [
  "fade-in",
  "slide-left",
  "slide-right",
  "slide-up",
  "slide-down",
  "spin-in",
  "flip-in",
  "zoom-in",
  "bounce-in",
  "domino",
  "spiral-in",
  "elastic-in",
]

const EXIT_ANIMATIONS = [
  "fade-out",
  "slide-out-left",
  "slide-out-right",
  "slide-out-up",
  "slide-out-down",
  "spin-out",
  "flip-out",
  "zoom-out",
  "bounce-out",
  "spiral-out",
]

const CONTINUOUS_ANIMATIONS = [
  "float",
  "pulse-glow",
  "rotate-slow",
  "zoom-pulse",
  "swing",
  "bounce-soft",
  "tilt-rock",
  "drift",
  "orbit",
  "shake-gentle",
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
  entranceAnimation: string
  exitAnimation: string
  initialRotation: number
  animationDuration: number
}

const NFTSection: React.FC<NFTSectionProps> = ({ isChristmasMode = false, season = "normal" }) => {
  const { t } = useLanguage()
  const [displayNFTs, setDisplayNFTs] = useState<DisplayNFT[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [currentExitAnim, setCurrentExitAnim] = useState("")
  const [bgAnimation, setBgAnimation] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const generateRandomNFTs = useCallback(() => {
    const count = Math.floor(Math.random() * 4) + 1
    const selectedIds = [...NFT_IDS].sort(() => Math.random() - 0.5).slice(0, count)

    const batchEntrance = ENTRANCE_ANIMATIONS[Math.floor(Math.random() * ENTRANCE_ANIMATIONS.length)]
    const batchExit = EXIT_ANIMATIONS[Math.floor(Math.random() * EXIT_ANIMATIONS.length)]

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
        delay: index * 0.12,
        continuousAnimation,
        entranceAnimation: batchEntrance,
        exitAnimation: batchExit,
        initialRotation: (Math.random() - 0.5) * 8,
        animationDuration: 2.5 + Math.random() * 2,
      }
    })
  }, [])

  useEffect(() => {
    const initialNFTs = generateRandomNFTs()
    setDisplayNFTs(initialNFTs)

    intervalRef.current = setInterval(() => {
      setCurrentExitAnim(EXIT_ANIMATIONS[Math.floor(Math.random() * EXIT_ANIMATIONS.length)])
      setIsVisible(false)
      setBgAnimation((prev) => prev + 1)

      setTimeout(() => {
        setDisplayNFTs(generateRandomNFTs())
        setIsVisible(true)
      }, 1000)
    }, 7000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [generateRandomNFTs])

  const animationStyles = `
    /* Entrance Animations */
    @keyframes nft-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes nft-slide-left {
      from { opacity: 0; transform: translateX(-100px) rotate(-15deg); }
      to { opacity: 1; transform: translateX(0) rotate(0deg); }
    }
    @keyframes nft-slide-right {
      from { opacity: 0; transform: translateX(100px) rotate(15deg); }
      to { opacity: 1; transform: translateX(0) rotate(0deg); }
    }
    @keyframes nft-slide-up {
      from { opacity: 0; transform: translateY(80px) scale(0.8); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes nft-slide-down {
      from { opacity: 0; transform: translateY(-80px) scale(0.8); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes nft-spin-in {
      from { opacity: 0; transform: rotate(-360deg) scale(0.3); }
      to { opacity: 1; transform: rotate(0deg) scale(1); }
    }
    @keyframes nft-flip-in {
      from { opacity: 0; transform: perspective(400px) rotateY(-90deg); }
      to { opacity: 1; transform: perspective(400px) rotateY(0deg); }
    }
    @keyframes nft-zoom-in {
      from { opacity: 0; transform: scale(0.1); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes nft-bounce-in {
      0% { opacity: 0; transform: scale(0.3); }
      50% { opacity: 1; transform: scale(1.15); }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); }
    }
    @keyframes nft-domino {
      0% { opacity: 0; transform: rotateX(-90deg) translateY(-30px); }
      60% { transform: rotateX(20deg); }
      80% { transform: rotateX(-10deg); }
      100% { opacity: 1; transform: rotateX(0deg) translateY(0); }
    }
    @keyframes nft-spiral-in {
      from { opacity: 0; transform: rotate(-540deg) scale(0) translateY(-50px); }
      to { opacity: 1; transform: rotate(0deg) scale(1) translateY(0); }
    }
    @keyframes nft-elastic-in {
      0% { opacity: 0; transform: scale(0.3); }
      40% { transform: scale(1.2); }
      60% { transform: scale(0.85); }
      80% { transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); }
    }

    /* Exit Animations */
    @keyframes nft-fade-out {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes nft-slide-out-left {
      from { opacity: 1; transform: translateX(0) rotate(0deg); }
      to { opacity: 0; transform: translateX(-100px) rotate(-15deg); }
    }
    @keyframes nft-slide-out-right {
      from { opacity: 1; transform: translateX(0) rotate(0deg); }
      to { opacity: 0; transform: translateX(100px) rotate(15deg); }
    }
    @keyframes nft-slide-out-up {
      from { opacity: 1; transform: translateY(0) scale(1); }
      to { opacity: 0; transform: translateY(-80px) scale(0.8); }
    }
    @keyframes nft-slide-out-down {
      from { opacity: 1; transform: translateY(0) scale(1); }
      to { opacity: 0; transform: translateY(80px) scale(0.8); }
    }
    @keyframes nft-spin-out {
      from { opacity: 1; transform: rotate(0deg) scale(1); }
      to { opacity: 0; transform: rotate(360deg) scale(0.3); }
    }
    @keyframes nft-flip-out {
      from { opacity: 1; transform: perspective(400px) rotateY(0deg); }
      to { opacity: 0; transform: perspective(400px) rotateY(90deg); }
    }
    @keyframes nft-zoom-out {
      from { opacity: 1; transform: scale(1); }
      to { opacity: 0; transform: scale(0.1); }
    }
    @keyframes nft-bounce-out {
      0% { transform: scale(1); }
      25% { transform: scale(1.15); }
      100% { opacity: 0; transform: scale(0.3); }
    }
    @keyframes nft-spiral-out {
      from { opacity: 1; transform: rotate(0deg) scale(1) translateY(0); }
      to { opacity: 0; transform: rotate(540deg) scale(0) translateY(-50px); }
    }

    /* Continuous Animations */
    @keyframes nft-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }
    @keyframes nft-pulse-glow {
      0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px var(--brand)); }
      50% { transform: scale(1.08); filter: drop-shadow(0 0 20px var(--brand)); }
    }
    @keyframes nft-rotate-slow {
      0% { transform: rotate(-8deg); }
      50% { transform: rotate(8deg); }
      100% { transform: rotate(-8deg); }
    }
    @keyframes nft-zoom-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.12); }
    }
    @keyframes nft-swing {
      0%, 100% { transform: rotate(-10deg); }
      50% { transform: rotate(10deg); }
    }
    @keyframes nft-bounce-soft {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-10px) scale(1.04); }
    }
    @keyframes nft-tilt-rock {
      0%, 100% { transform: rotate(-6deg) scale(1.02); }
      50% { transform: rotate(6deg) scale(0.98); }
    }
    @keyframes nft-drift {
      0%, 100% { transform: translateX(0) translateY(0); }
      25% { transform: translateX(10px) translateY(-5px); }
      50% { transform: translateX(0) translateY(-10px); }
      75% { transform: translateX(-10px) translateY(-5px); }
    }
    @keyframes nft-orbit {
      0% { transform: translateX(0) translateY(0) rotate(0deg); }
      25% { transform: translateX(8px) translateY(-8px) rotate(5deg); }
      50% { transform: translateX(0) translateY(-12px) rotate(0deg); }
      75% { transform: translateX(-8px) translateY(-8px) rotate(-5deg); }
      100% { transform: translateX(0) translateY(0) rotate(0deg); }
    }
    @keyframes nft-shake-gentle {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px) rotate(-2deg); }
      75% { transform: translateX(4px) rotate(2deg); }
    }
  `

  const getEntranceAnimation = (animation: string, delay: number) => {
    const animMap: Record<string, string> = {
      "fade-in": `nft-fade-in 0.8s ease-out ${delay}s both`,
      "slide-left": `nft-slide-left 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both`,
      "slide-right": `nft-slide-right 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both`,
      "slide-up": `nft-slide-up 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both`,
      "slide-down": `nft-slide-down 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both`,
      "spin-in": `nft-spin-in 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both`,
      "flip-in": `nft-flip-in 0.8s ease-out ${delay}s both`,
      "zoom-in": `nft-zoom-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both`,
      "bounce-in": `nft-bounce-in 1s ease-out ${delay}s both`,
      domino: `nft-domino 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both`,
      "spiral-in": `nft-spiral-in 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both`,
      "elastic-in": `nft-elastic-in 1s ease-out ${delay}s both`,
    }
    return animMap[animation] || animMap["fade-in"]
  }

  const getExitAnimation = (animation: string, delay: number) => {
    const animMap: Record<string, string> = {
      "fade-out": `nft-fade-out 0.8s ease-in ${delay}s both`,
      "slide-out-left": `nft-slide-out-left 0.8s ease-in ${delay}s both`,
      "slide-out-right": `nft-slide-out-right 0.8s ease-in ${delay}s both`,
      "slide-out-up": `nft-slide-out-up 0.8s ease-in ${delay}s both`,
      "slide-out-down": `nft-slide-out-down 0.8s ease-in ${delay}s both`,
      "spin-out": `nft-spin-out 0.9s ease-in ${delay}s both`,
      "flip-out": `nft-flip-out 0.7s ease-in ${delay}s both`,
      "zoom-out": `nft-zoom-out 0.7s ease-in ${delay}s both`,
      "bounce-out": `nft-bounce-out 0.8s ease-in ${delay}s both`,
      "spiral-out": `nft-spiral-out 1s ease-in ${delay}s both`,
    }
    return animMap[animation] || animMap["fade-out"]
  }

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
      orbit: `nft-orbit ${duration * 1.3}s ease-in-out infinite`,
      "shake-gentle": `nft-shake-gentle ${duration * 0.8}s ease-in-out infinite`,
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
          {isChristmasMode && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
              <SnowEffect isActive={isChristmasMode} borderRadius="1rem" />
            </div>
          )}
          {season === "fall" && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
              <LeafEffect isActive={season === "fall"} />
            </div>
          )}
          <SnowCap className="h-6 opacity-90" visible={isChristmasMode} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
            {/* Column 1: Mint Info */}
            <div className="flex flex-col justify-center">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
                {t("nft.title")}
              </h3>
              <p className="text-sm font-medium leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                {t("nft.description")}
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <a
                  href="https://launchmynft.io/sol/20841"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm font-bold py-2.5 px-5 text-center uppercase tracking-wide rounded-xl bg-[var(--brand)] text-white border-[3px] border-[var(--btn-shadow)] shadow-[4px_4px_0_0_var(--btn-shadow)] hover:shadow-[6px_6px_0_0_var(--btn-shadow)] hover:-translate-y-0.5 active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
                >
                  {t("nft.mintV1")}
                </a>
                <a
                  href="https://launchmynft.io/sol/20841"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm font-bold py-2.5 px-5 text-center uppercase tracking-wide rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-[3px] border-[var(--btn-shadow)] shadow-[4px_4px_0_0_var(--btn-shadow)] hover:shadow-[6px_6px_0_0_var(--btn-shadow)] hover:-translate-y-0.5 active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
                >
                  {t("nft.mintV2")}
                </a>
              </div>
            </div>

            {/* Column 2: NFT Showcase with varied animations */}
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
                      animation: isVisible
                        ? getEntranceAnimation(nft.entranceAnimation, nft.delay)
                        : getExitAnimation(currentExitAnim || nft.exitAnimation, nft.delay),
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
