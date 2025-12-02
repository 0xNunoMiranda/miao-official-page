"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ArrowDownUp, Wrench, Gamepad2, FileText, Send, Twitter, Instagram } from "lucide-react"
import TamagotchiCat from "./TamagotchiCat"
import { useVideoSound } from "@/lib/use-video-sound"
import { useLanguage } from "../lib/language-context"

import { type Season } from "./SeasonSelector"

interface HeroProps {
  onSwapChartClick?: () => void
  isChristmasMode?: boolean
  season?: Season
  soundEnabled?: boolean
  onDisableSound?: () => void
  onToolsClick?: () => void
  onGamesClick?: () => void
  onWhitepaperClick?: () => void
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

const Hero: React.FC<HeroProps> = ({ onSwapChartClick, isChristmasMode = false, season = "normal", soundEnabled = true, onDisableSound, onToolsClick, onGamesClick, onWhitepaperClick }) => {
  const { t } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoRefFall = useRef<HTMLVideoElement>(null)
  const videoRefWinter = useRef<HTMLVideoElement>(null)
  const [isDark, setIsDark] = useState(false)
  const [videoOpacity, setVideoOpacity] = useState(() => ({
    normal: 0,
    fall: 0,
    winter: 0
  }))
  const [imageOpacity, setImageOpacity] = useState(() => {
    if (season === "winter") return { normal: 0, fall: 0, winter: 1 }
    if (season === "fall") return { normal: 0, fall: 1, winter: 0 }
    return { normal: 1, fall: 0, winter: 0 }
  })
  const [videoReady, setVideoReady] = useState({
    normal: false,
    fall: false,
    winter: false
  })
  
  // Usar o hook de som para reprodução aleatória - usar o vídeo ativo
  const activeVideoRef = season === "winter" ? videoRefWinter : season === "fall" ? videoRefFall : videoRef
  useVideoSound({ videoRef: activeVideoRef, soundEnabled, isChristmasMode: season === "winter", onDisableSound })
  
  // Garantir que os vídeos estejam sempre muted (o hook controla o unmute quando necessário)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true
    }
    if (videoRefFall.current) {
      videoRefFall.current.muted = true
    }
    if (videoRefWinter.current) {
      videoRefWinter.current.muted = true
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


  // Garantir que os vídeos estejam sempre reproduzindo
  // Handle video loading and transition
  useEffect(() => {
    const handleVideoCanPlay = (mode: "normal" | "fall" | "winter") => {
      let video: HTMLVideoElement | null = null
      if (mode === "normal") video = videoRef.current
      else if (mode === "fall") video = videoRefFall.current
      else if (mode === "winter") video = videoRefWinter.current
      
      setVideoReady(prev => ({
        ...prev,
        [mode]: true
      }))
      
      // Start playing video
      if (video) {
        video.play().catch(() => {})
      }
      
      // Only transition if this is the active season
      if (season === mode) {
        // Fade out image and fade in video with smooth transition
        setTimeout(() => {
          setImageOpacity(prev => ({
            ...prev,
            [mode]: 0
          }))
          setVideoOpacity(prev => ({
            ...prev,
            [mode]: 1
          }))
        }, 100)
      }
    }

    const videoNormal = videoRef.current
    const videoFall = videoRefFall.current
    const videoWinter = videoRefWinter.current

    // Reset all opacities when season changes
    setVideoOpacity({ normal: 0, fall: 0, winter: 0 })
    if (season === "winter") {
      setImageOpacity({ normal: 0, fall: 0, winter: 1 })
    } else if (season === "fall") {
      setImageOpacity({ normal: 0, fall: 1, winter: 0 })
    } else {
      setImageOpacity({ normal: 1, fall: 0, winter: 0 })
    }

    // Load and play video for current season
    if (season === "normal" && videoNormal) {
      videoNormal.load() // Force reload
      if (videoNormal.readyState >= 3) {
        handleVideoCanPlay("normal")
      } else {
        videoNormal.addEventListener('canplaythrough', () => handleVideoCanPlay("normal"), { once: true })
      }
    } else if (season === "fall" && videoFall) {
      videoFall.load() // Force reload
      if (videoFall.readyState >= 3) {
        handleVideoCanPlay("fall")
      } else {
        videoFall.addEventListener('canplaythrough', () => handleVideoCanPlay("fall"), { once: true })
      }
    } else if (season === "winter" && videoWinter) {
      videoWinter.load() // Force reload
      if (videoWinter.readyState >= 3) {
        handleVideoCanPlay("winter")
      } else {
        videoWinter.addEventListener('canplaythrough', () => handleVideoCanPlay("winter"), { once: true })
      }
    }

    return () => {
      if (videoNormal) {
        videoNormal.removeEventListener('canplaythrough', () => handleVideoCanPlay("normal"))
      }
      if (videoFall) {
        videoFall.removeEventListener('canplaythrough', () => handleVideoCanPlay("fall"))
      }
      if (videoWinter) {
        videoWinter.removeEventListener('canplaythrough', () => handleVideoCanPlay("winter"))
      }
    }
  }, [season])

  return (
    <section id="hero" className="relative min-h-screen pt-28 pb-12 flex items-center overflow-x-hidden overflow-y-auto" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
      {/* Image Placeholder - Normal */}
      <img
        src="/assets/page/summer.jpg"
        alt="Summer background"
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ease-in-out"
        style={{ 
          objectFit: 'cover', 
          objectPosition: 'left top',
          opacity: imageOpacity.normal,
          pointerEvents: 'none'
        }}
      />
      
      {/* Image Placeholder - Fall */}
      <img
        src="/assets/page/fall.jpg"
        alt="Fall background"
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ease-in-out"
        style={{ 
          objectFit: 'cover', 
          objectPosition: 'left top',
          opacity: imageOpacity.fall,
          pointerEvents: 'none'
        }}
      />
      
      {/* Image Placeholder - Winter */}
      <img
        src="/assets/page/winter.jpg"
        alt="Winter background"
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ease-in-out"
        style={{ 
          objectFit: 'cover', 
          objectPosition: 'left top',
          opacity: imageOpacity.winter,
          pointerEvents: 'none'
        }}
      />
      
      {/* Video Background - Normal */}
      <video
        ref={videoRef}
        loop
        muted={true}
        playsInline
        preload={season === "normal" ? "metadata" : "none"}
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ease-in-out"
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
      
      {/* Video Background - Fall */}
      <video
        ref={videoRefFall}
        loop
        muted={true}
        playsInline
        preload={season === "fall" ? "metadata" : "none"}
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ease-in-out"
        style={{ 
          objectFit: 'cover', 
          objectPosition: 'left top',
          opacity: videoOpacity.fall,
          pointerEvents: videoOpacity.fall === 0 ? 'none' : 'auto'
        }}
      >
        <source 
          src="/assets/page/bg_video_home_section_fall.mp4"
          type="video/mp4" 
        />
      </video>
      
      {/* Video Background - Winter */}
      <video
        ref={videoRefWinter}
        loop
        muted={true}
        playsInline
        preload={season === "winter" ? "metadata" : "none"}
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ease-in-out"
        style={{ 
          objectFit: 'cover', 
          objectPosition: 'left top',
          opacity: videoOpacity.winter,
          pointerEvents: videoOpacity.winter === 0 ? 'none' : 'auto'
        }}
      >
        <source 
          src="/assets/page/bg_video_home_section_christmas.mp4"
          type="video/mp4" 
        />
      </video>
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 w-full relative z-20">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-6 lg:gap-8 items-center justify-items-center lg:justify-items-stretch">
          {/* Cat Image - Left */}
          <div className="order-2 lg:order-1 flex justify-center lg:justify-start lg:items-start w-full max-w-full min-w-0" style={{ overflow: 'visible' }}>
            <TamagotchiCat />
          </div>

          {/* Content - Right */}
            <div className="order-1 lg:order-2 space-y-8 md:space-y-10 text-center lg:text-center w-full max-w-full px-2 sm:px-0">
            {/* Logo */}
            <div className="flex flex-col items-center gap-4">
              <h1 className="sr-only">MIAO - The Green Cat Token - Community Owned Memecoin</h1>
              <img
                src="/logo.png"
                alt="MIAO - The Green Cat Token"
                className="w-64 md:w-80 lg:w-96 h-auto"
                loading="lazy"
              />

              {/* Social Media Buttons - Between logo and cloud */}
              <div className="flex items-center gap-1.5">
                <a
                  href="https://t.me/miaotokensol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                >
                  <Send size={14} />
                </a>
                <a
                  href="https://x.com/miaoonsol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                >
                  <Twitter size={14} />
                </a>
                <a
                  href="https://www.instagram.com/miaotoken/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                >
                  <Instagram size={14} />
                </a>
                <a
                  href="https://www.tiktok.com/@miaoonsol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                >
                  <TikTokIcon size={14} />
                </a>
              </div>
            </div>

            <div 
              className="px-8 py-2 md:px-10 md:py-3 lg:px-12 lg:py-4 mx-auto max-w-2xl animate-cloud-float relative"
              style={{
                borderRadius: '9999px',
                opacity: 1,
              }}
            >
              <p className={`text-lg md:text-xl lg:text-2xl xl:text-3xl font-black leading-tight ${isDark ? 'text-white' : 'text-black'}`} style={{
                opacity: 1,
                WebkitTextStroke: isDark ? '2px rgba(0, 0, 0, 1)' : '2px rgba(255, 255, 255, 1)',
                textStroke: isDark ? '2px rgba(0, 0, 0, 1)' : '2px rgba(255, 255, 255, 1)',
                paintOrder: 'stroke fill',
                textShadow: isDark ? '3px 3px 6px rgba(0, 0, 0, 0.7)' : '3px 3px 6px rgba(0, 0, 0, 0.4)',
                letterSpacing: '0.5px'
              }}>
                {t("hero.tagline").split("$MIAO")[0]}
                <span className="text-[var(--duo-green)] font-black" style={{ 
                  textShadow: isDark ? '3px 3px 6px rgba(0, 0, 0, 1), -1px -1px 3px rgba(255, 255, 255, 0.5)' : '3px 3px 6px rgba(255, 255, 255, 1), -1px -1px 3px rgba(0, 0, 0, 0.5)',
                  WebkitTextStroke: '3px var(--text-stroke)',
                  textStroke: '3px var(--text-stroke)',
                  paintOrder: 'stroke fill',
                  opacity: 1,
                  letterSpacing: '1px'
                }}>$MIAO</span>
                {t("hero.tagline").split("$MIAO")[1]}
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 relative z-30">
              {/* Capsule-style buttons container */}
              <div className="flex flex-nowrap w-full justify-center relative" style={{ direction: 'ltr' }}>
                {/* Capsule wrapper with pill shape - single unified capsule */}
                <div 
                  className="flex items-stretch relative shadow-xl"
                  style={{
                    borderRadius: '9999px',
                    border: '6px solid var(--capsule-border)',
                    boxShadow: '0 6px 10px -3px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                    direction: 'ltr',
                    width: '100%',
                    maxWidth: '100%',
                  }}
                >
                  {/* Left half - Mint green/Seafoam (Swap Chart) */}
                  <button
                    onClick={onSwapChartClick}
                    className="font-bold uppercase tracking-wide text-sm md:text-base lg:text-lg text-white transition-all relative overflow-hidden"
                    style={{
                      background: '#52D48E',
                      borderRight: '3px solid var(--capsule-border)',
                      borderTopLeftRadius: '9999px',
                      borderBottomLeftRadius: '9999px',
                      direction: 'ltr',
                      padding: '16px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '50%',
                      flex: '1 1 50%',
                      minHeight: '100%',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#6ee7b7'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#52D48E'
                    }}
                  >
                    {/* Curved white highlight on green side */}
                    <div 
                      className="absolute top-1 left-1 w-12 h-12 rounded-full pointer-events-none opacity-30"
                      style={{
                        background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
                        transform: 'translate(-20%, -20%)',
                      }}
                    />
                    {/* Internal shadow from bottom to left and right sides */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 pointer-events-none"
                      style={{
                        height: '25%',
                        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.15) 0%, transparent 100%)',
                      }}
                    />
                    <div 
                      className="absolute bottom-0 left-0 pointer-events-none"
                      style={{
                        width: '100%',
                        height: '25%',
                        background: 'linear-gradient(to right, rgba(0, 0, 0, 0.1) 0%, transparent 100%)',
                      }}
                    />
                    <div 
                      className="absolute bottom-0 right-0 pointer-events-none"
                      style={{
                        width: '100%',
                        height: '25%',
                        background: 'linear-gradient(to left, rgba(0, 0, 0, 0.1) 0%, transparent 100%)',
                      }}
                    />
                    <span className="relative z-10 text-center w-full" style={{ padding: '0 8px', lineHeight: '1.2', wordBreak: 'break-word', hyphens: 'auto', display: 'block' }}>{t("hero.swapChart")}</span>
                  </button>
                  
                  {/* Right half - White (Pump.Fun) */}
                  <a
                    href="https://pump.fun/coin/8xpdiZ5GrnAdxpf7DSyZ1YXZxx6itvvoXPHZ4K2Epump"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold uppercase tracking-wide text-sm md:text-base lg:text-lg text-gray-800 transition-all relative overflow-hidden"
                    style={{
                      background: '#ffffff',
                      borderLeft: '3px solid var(--capsule-border)',
                      borderTopRightRadius: '9999px',
                      borderBottomRightRadius: '9999px',
                      direction: 'ltr',
                      padding: '16px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '50%',
                      flex: '1 1 50%',
                      minHeight: '100%',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e5e5e5'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ffffff'
                    }}
                  >
                    {/* Internal shadow from bottom to left and right sides */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 pointer-events-none"
                      style={{
                        height: '25%',
                        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.12) 0%, transparent 100%)',
                      }}
                    />
                    <div 
                      className="absolute bottom-0 left-0 pointer-events-none"
                      style={{
                        width: '100%',
                        height: '25%',
                        background: 'linear-gradient(to right, rgba(0, 0, 0, 0.08) 0%, transparent 100%)',
                      }}
                    />
                    <div 
                      className="absolute bottom-0 right-0 pointer-events-none"
                      style={{
                        width: '100%',
                        height: '25%',
                        background: 'linear-gradient(to left, rgba(0, 0, 0, 0.08) 0%, transparent 100%)',
                      }}
                    />
                    {/* Highlight effect on white side */}
                    <div 
                      className="absolute top-1 right-1 w-14 h-14 rounded-full pointer-events-none opacity-20"
                      style={{
                        background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
                        transform: 'translate(20%, -20%)',
                      }}
                    />
                    <span className="relative z-10 text-center w-full" style={{ padding: '0 8px', lineHeight: '1.2', wordBreak: 'break-word', hyphens: 'auto', display: 'block' }}>{t("hero.pumpfunButton")}</span>
                  </a>
                </div>
              </div>
              
              {/* Tools, Games, Whitepaper - Smaller buttons below */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center max-w-full px-2 sm:px-0" style={{ direction: 'ltr' }}>
                <button
                  onClick={onToolsClick}
                  className="px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wide bg-[var(--bg-secondary)] text-[var(--text-primary)] border-2 border-b-4 border-[var(--btn-shadow)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--duo-green)] active:border-b-2 active:translate-y-[2px] transition-all flex items-center gap-1 sm:gap-1.5"
                  style={{ direction: 'ltr' }}
                >
                  <Wrench size={14} className="sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">{t("nav.tools")}</span>
                </button>
                <button
                  onClick={onGamesClick}
                  className="px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wide bg-[var(--bg-secondary)] text-[var(--text-primary)] border-2 border-b-4 border-[var(--btn-shadow)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--duo-orange)] active:border-b-2 active:translate-y-[2px] transition-all flex items-center gap-1 sm:gap-1.5"
                  style={{ direction: 'ltr' }}
                >
                  <Gamepad2 size={14} className="sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">{t("nav.games")}</span>
                </button>
                <button
                  onClick={onWhitepaperClick}
                  className="px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wide bg-[var(--bg-secondary)] text-[var(--text-primary)] border-2 border-b-4 border-[var(--btn-shadow)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--duo-blue)] active:border-b-2 active:translate-y-[2px] transition-all flex items-center gap-1 sm:gap-1.5"
                  style={{ direction: 'ltr' }}
                >
                  <FileText size={14} className="sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">{t("nav.whitepaper")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
