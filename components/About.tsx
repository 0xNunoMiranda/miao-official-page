"use client"

import type React from "react"
import { useState, useEffect } from "react"
import SnowEffect from "./SnowEffect"
import SnowCap from "./SnowCap"

interface AboutProps {
  isChristmasMode?: boolean
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

const About: React.FC<AboutProps> = ({ isChristmasMode = false }) => {
  return (
    <section className="py-20 px-6 md:px-12 lg:px-24 text-center bg-[var(--bg-secondary)]">
      <div className="max-w-4xl mx-auto">
        {/* Duolingo speech bubble card */}
        <div className="relative bg-[var(--bg-primary)] rounded-3xl p-8 md:p-10 border-2 border-[var(--border-color)] border-b-4 overflow-hidden">
          {/* Efeito de neve no card */}
          {isChristmasMode && <SnowEffect isActive={isChristmasMode} />}
          
          {/* Capa de neve no topo */}
          <SnowCap className="h-10" visible={isChristmasMode} />
          
          <p className="text-xl md:text-2xl font-bold leading-relaxed text-[var(--text-primary)] mt-6 mb-6 relative z-10">
            When dogs barked and frogs leapt, everyone thought the meme wars were done. Yet in the shadows, something patient lingered. Behind every bark or croak came a sharp, knowing <span className="text-[var(--duo-green)] font-black">$MIAO</span> that no one could ignore.
          </p>
          
          <div className="mt-6 pt-6 border-t-2 border-[var(--border-color)] relative z-10">
            <TypewriterText text="The streets aren't safe $MIAO is already watching." />
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
