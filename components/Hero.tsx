"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Send, Twitter, Instagram, ArrowDownUp } from "lucide-react"
import TamagotchiCat from "./TamagotchiCat"
import { useVideoSound } from "@/lib/use-video-sound"

interface HeroProps {
  onSwapChartClick?: () => void
  isChristmasMode?: boolean
  soundEnabled?: boolean
  onDisableSound?: () => void
}

const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    let index = 0
    let timeout: NodeJS.Timeout

    const type = () => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index))
        index++
        timeout = setTimeout(type, 80)
      } else {
        setIsTyping(false)
        // Restart after pause
        setTimeout(() => {
          index = 0
          setIsTyping(true)
          type()
        }, 3000)
      }
    }

    type()
    return () => clearTimeout(timeout)
  }, [text])

  return (
    <span className="text-[var(--duo-green)] font-bold">
      {displayText}
      <span className={`${isTyping ? "animate-pulse" : "opacity-0"}`}>|</span>
    </span>
  )
}

const Hero: React.FC<HeroProps> = ({ onSwapChartClick, isChristmasMode = false, soundEnabled = true, onDisableSound }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoRefChristmas = useRef<HTMLVideoElement>(null)
  const [isDark, setIsDark] = useState(false)
  const [videoOpacity, setVideoOpacity] = useState(() => ({
    normal: isChristmasMode ? 0 : 1,
    christmas: isChristmasMode ? 1 : 0
  }))
  
  // Usar o hook de som para reprodução aleatória - usar o vídeo ativo
  const activeVideoRef = isChristmasMode ? videoRefChristmas : videoRef
  useVideoSound({ videoRef: activeVideoRef, soundEnabled, isChristmasMode, onDisableSound })
  
  // Garantir que os vídeos estejam sempre muted (o hook controla o unmute quando necessário)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true
    }
    if (videoRefChristmas.current) {
      videoRefChristmas.current.muted = true
    }
  }, [])

  useEffect(() => {
    // Verificar tema inicial
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme")
      setIsDark(theme === "dark")
    }
    
    checkTheme()
    
    // Observar mudanças no tema
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })
    
    return () => observer.disconnect()
  }, [])

  // Transição suave entre vídeos
  useEffect(() => {
    const transitionDuration = 2000 // 2 segundos para transição suave
    const steps = 60
    const stepTime = transitionDuration / steps
    let currentStep = 0

    if (isChristmasMode) {
      // Fade in Christmas, fade out normal
      const interval = setInterval(() => {
        currentStep++
        const progress = Math.min(currentStep / steps, 1)
        setVideoOpacity({
          normal: 1 - progress,
          christmas: progress
        })
        if (currentStep >= steps) {
          // Garantir valores finais exatos
          setVideoOpacity({
            normal: 0,
            christmas: 1
          })
          clearInterval(interval)
        }
      }, stepTime)
      return () => clearInterval(interval)
    } else {
      // Fade in normal, fade out Christmas
      const interval = setInterval(() => {
        currentStep++
        const progress = Math.min(currentStep / steps, 1)
        setVideoOpacity({
          normal: progress,
          christmas: 1 - progress
        })
        if (currentStep >= steps) {
          // Garantir valores finais exatos
          setVideoOpacity({
            normal: 1,
            christmas: 0
          })
          clearInterval(interval)
        }
      }, stepTime)
      return () => clearInterval(interval)
    }
  }, [isChristmasMode])

  // Garantir que os vídeos estejam sempre reproduzindo
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
    if (videoRefChristmas.current) {
      videoRefChristmas.current.play().catch(() => {})
    }
  }, [])

  return (
    <section id="hero" className="relative min-h-screen pt-28 pb-12 flex items-center overflow-hidden">
      {/* Video Background - Normal */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={true}
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-[2000ms] ease-in-out"
        style={{ 
          objectFit: 'cover', 
          objectPosition: 'left top',
          opacity: videoOpacity.normal,
          pointerEvents: videoOpacity.normal === 0 ? 'none' : 'auto'
        }}
      >
        <source 
          src="/assets/page/bg_video_home_section.mp4"
          type="video/mp4" 
        />
      </video>
      
      {/* Video Background - Christmas */}
      <video
        ref={videoRefChristmas}
        autoPlay
        loop
        muted={true}
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-[2000ms] ease-in-out"
        style={{ 
          objectFit: 'cover', 
          objectPosition: 'left top',
          opacity: videoOpacity.christmas,
          pointerEvents: videoOpacity.christmas === 0 ? 'none' : 'auto'
        }}
      >
        <source 
          src="/assets/page/bg_video_home_section_christmas.mp4"
          type="video/mp4" 
        />
      </video>
      
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Cat Image - Left */}
          <div className="order-2 lg:order-1 flex justify-center lg:justify-start lg:items-start">
            <TamagotchiCat />
          </div>

          {/* Content - Right */}
          <div className="order-1 lg:order-2 space-y-8 md:space-y-10 text-center lg:text-right">
            {/* Logo */}
            <div className="flex justify-center lg:justify-end">
              <img
                src="/logo.png"
                alt="$MIAO"
                className="w-64 md:w-80 lg:w-96 h-auto"
                loading="lazy"
              />
            </div>

            <div 
              className={`backdrop-blur-md p-8 md:p-10 ml-auto mr-auto lg:mr-0 max-w-lg animate-cloud-float relative ${
                isDark ? 'bg-black/30' : 'bg-white/25'
              }`}
              style={{
                clipPath: 'polygon(15% 5%, 25% 0%, 40% 2%, 55% 0%, 70% 3%, 85% 0%, 100% 8%, 100% 25%, 98% 40%, 100% 55%, 95% 70%, 100% 85%, 90% 100%, 75% 98%, 60% 100%, 45% 98%, 30% 100%, 15% 95%, 5% 85%, 0% 70%, 2% 55%, 0% 40%, 3% 25%, 0% 10%)',
                borderRadius: '50px',
                border: isDark ? '2px solid rgba(0, 0, 0, 0.4)' : '2px solid rgba(255, 255, 255, 0.3)',
                opacity: isDark ? 0.8 : 0.65,
              }}
            >
              <p className="text-base md:text-lg text-white font-medium leading-relaxed drop-shadow-lg">
                First came the dogs, then the frogs, but the streets were never safe from the shadows. Behind every
                bark, there's a <span className="text-[var(--duo-green)] font-bold drop-shadow-md">$MIAO</span> answered back.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end gap-3">
              <a
                href="https://t.me/miaotokensol"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center bg-[#2DD188] text-white border-2 border-b-4 border-[#1fa068] hover:brightness-110 active:border-b-2 active:translate-y-[2px] transition-all"
              >
                <Send size={20} />
              </a>
              <a
                href="https://x.com/miaoonsol"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center bg-[#2DD188] text-white border-2 border-b-4 border-[#1fa068] hover:brightness-110 active:border-b-2 active:translate-y-[2px] transition-all"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://www.instagram.com/miaotoken/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center bg-[#2DD188] text-white border-2 border-b-4 border-[#1fa068] hover:brightness-110 active:border-b-2 active:translate-y-[2px] transition-all"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.tiktok.com/@miaoonsol"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center bg-[#2DD188] text-white border-2 border-b-4 border-[#1fa068] hover:brightness-110 active:border-b-2 active:translate-y-[2px] transition-all"
              >
                <TikTokIcon size={20} />
              </a>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-end gap-4">
              <button
                onClick={onSwapChartClick}
                className="px-8 py-4 md:px-10 md:py-5 rounded-2xl font-bold uppercase tracking-wide text-lg md:text-xl bg-[var(--duo-green)] text-white border-2 border-b-4 border-[var(--btn-shadow)] hover:brightness-105 active:border-b-2 active:translate-y-[2px] transition-all flex items-center gap-2"
              >
                <ArrowDownUp size={20} />
                Swap / Chart
              </button>
              <a
                href="https://pump.fun/coin/8xpdiZ5GrnAdxpf7DSyZ1YXZxx6itvvoXPHZ4K2Epump"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 md:px-10 md:py-5 rounded-2xl font-bold uppercase tracking-wide text-lg md:text-xl bg-[var(--duo-orange)] text-white border-2 border-b-4 border-[var(--btn-shadow-orange)] hover:brightness-105 active:border-b-2 active:translate-y-[2px] transition-all"
              >
                Pump.fun
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
