"use client"

import type React from "react"
import { useState, useEffect } from "react"
import SnowEffect from "./SnowEffect"
import LeafEffect from "./LeafEffect"
import SnowCap from "./SnowCap"
import { useLanguage } from "../lib/language-context"
import { type Season } from "./SeasonSelector"

interface AboutProps {
  isChristmasMode?: boolean
  season?: Season
}

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

const About: React.FC<AboutProps> = ({ isChristmasMode = false, season = "normal" }) => {
  const { t } = useLanguage()
  
  return (
    <section className="py-20 text-center bg-[var(--bg-secondary)]">
      <div className="max-w-4xl mx-auto">
        {/* Duolingo speech bubble card */}
        <div className="relative bg-[var(--bg-primary)] rounded-3xl p-8 md:p-10 border-2 border-[var(--border-color)] border-b-4 overflow-hidden">
          {/* Efeito de neve no card */}
          {isChristmasMode && (
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0">
              <SnowEffect isActive={isChristmasMode} borderRadius="1.5rem" />
            </div>
          )}
          {/* Efeito de folhas no card */}
          {season === "fall" && (
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0">
              <LeafEffect isActive={season === "fall"} />
            </div>
          )}
          
          {/* Capa de neve no topo */}
          <SnowCap className="h-10" visible={isChristmasMode} />
          
          <p className="text-xl md:text-2xl font-bold leading-relaxed text-[var(--text-primary)] mt-6 mb-6 relative z-10">
            {t("about.text").split("$MIAO")[0]}
            <span className="text-[var(--duo-green)] font-black" style={{
              WebkitTextStroke: '2px var(--text-stroke)',
              textStroke: '2px var(--text-stroke)',
              paintOrder: 'stroke fill'
            }}>$MIAO</span>
            {t("about.text").split("$MIAO")[1]}
          </p>
          
          <div className="mt-6 pt-6 border-t-2 border-[var(--border-color)] relative z-10">
            <TypewriterText text={t("about.typewriter")} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
