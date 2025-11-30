"use client"

import type React from "react"
import { useLanguage } from "../lib/language-context"

const About: React.FC = () => {
  const { t } = useLanguage()

  return (
    <section className="py-20 px-6 md:px-12 lg:px-24 text-center bg-[var(--bg-tertiary)] border-y-4 border-[var(--border-color)]">
      <div className="max-w-4xl mx-auto">
        <p className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-relaxed text-[var(--text-primary)]">
          {t("about.text")} <span className="text-[var(--brand)] font-black text-stroke">$MIAO</span> {t("about.text2")}{" "}
          <span className="inline-block animate-pulse text-[var(--brand)]">_</span>
        </p>
      </div>
    </section>
  )
}

export default About
