"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Send, Twitter, Instagram } from "lucide-react"
import TamagotchiCat from "./TamagotchiCat"

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

const Hero: React.FC = () => {
  return (
    <section id="hero" className="relative min-h-screen pt-28 pb-12 flex items-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ objectFit: 'cover' }}
      >
        <source src="/assets/page/bg_video_home_section.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay para melhorar legibilidade */}
      <div className="absolute inset-0 bg-[var(--bg-primary)]/30 z-[1]"></div>
      
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Cat Image - Left */}
          <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
            <TamagotchiCat />
          </div>

          {/* Content - Right */}
          <div className="order-1 lg:order-2 space-y-8 md:space-y-10 text-center lg:text-right">
            {/* Logo */}
            <div className="flex justify-center lg:justify-end">
              <img
                src="https://miaotoken.vip/wp-content/uploads/2025/11/miao-1.png"
                alt="$MIAO"
                className="w-64 md:w-80 lg:w-96 h-auto"
              />
            </div>

            <div className="bg-[var(--bg-secondary)]/95 backdrop-blur-sm rounded-2xl p-8 md:p-10 border-2 border-[var(--border-color)] border-b-4 ml-auto mr-auto lg:mr-0 max-w-lg">
              <p className="text-base md:text-lg text-[var(--text-secondary)] font-medium leading-relaxed">
                First came the dogs, then the frogs, but the streets were never safe from the shadows. Behind every
                bark, there's a <span className="text-[var(--duo-green)] font-bold">$MIAO</span> answered back.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end gap-4">
              <a
                href="https://t.me/miaotokensol"
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center bg-[#2DD188] text-white border-2 border-b-4 border-[#1fa068] hover:brightness-110 active:border-b-2 active:translate-y-[2px] transition-all"
              >
                <Send size={28} />
              </a>
              <a
                href="https://x.com/miaoonsol"
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center bg-[#2DD188] text-white border-2 border-b-4 border-[#1fa068] hover:brightness-110 active:border-b-2 active:translate-y-[2px] transition-all"
              >
                <Twitter size={28} />
              </a>
              <a
                href="https://www.instagram.com/miaotoken/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center bg-[#2DD188] text-white border-2 border-b-4 border-[#1fa068] hover:brightness-110 active:border-b-2 active:translate-y-[2px] transition-all"
              >
                <Instagram size={28} />
              </a>
              <a
                href="https://www.tiktok.com/@miaoonsol"
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center bg-[#2DD188] text-white border-2 border-b-4 border-[#1fa068] hover:brightness-110 active:border-b-2 active:translate-y-[2px] transition-all"
              >
                <TikTokIcon size={28} />
              </a>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-end gap-4">
              <a
                href="https://dexscreener.com/solana/87nramn14jjty4nqw847rczwggkeitnwaljn28jmif1t"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 md:px-10 md:py-5 rounded-2xl font-bold uppercase tracking-wide text-lg md:text-xl bg-[var(--duo-green)] text-white border-2 border-b-4 border-[var(--btn-shadow)] hover:brightness-105 active:border-b-2 active:translate-y-[2px] transition-all"
              >
                DexScreener
              </a>
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
