"use client"

import type React from "react"
import { useLanguage } from "../lib/language-context"

const About: React.FC = () => {
  const { t } = useLanguage()

  return (
    <section className="py-20 px-6 md:px-12 lg:px-24 text-center bg-[var(--bg-secondary)]">
      <div className="max-w-4xl mx-auto">
        {/* Duolingo speech bubble card */}
        <div className="relative bg-[var(--bg-primary)] rounded-3xl p-8 md:p-10 border-2 border-[var(--border-color)] border-b-4">
          {/* Cat icon badge */}
          {/* <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <div className="w-16 h-16 bg-[var(--duo-green)] rounded-2xl border-2 border-b-4 border-[var(--btn-shadow)] flex items-center justify-center">
              <span className="text-3xl">🐱</span>
            </div>
          </div> */}

          <p className="text-xl md:text-2xl font-bold leading-relaxed text-[var(--text-primary)] mt-6">
            {t("about.text")} <span className="text-[var(--duo-green)] font-black">$MIAO</span> {t("about.text2")}
          </p>
        </div>
      </div>
    </section>
  )
}

export default About
