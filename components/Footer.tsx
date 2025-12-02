"use client"

import type React from "react"
import { useLanguage } from "../lib/language-context"
import { Mail, Heart } from "lucide-react"

const Footer: React.FC = () => {
  const { t } = useLanguage()

  return (
    <footer className="relative bg-[var(--bg-secondary)] pt-16 pb-12 px-6 md:px-12 lg:px-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-12 relative z-10">
        {/* Left: Disclaimer */}
        <div>
          <h3 className="text-2xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <div className="w-10 h-10 bg-[var(--duo-red)] rounded-xl border-2 border-b-4 border-[var(--btn-shadow-red)] flex items-center justify-center">
              <Heart className="text-white" size={20} />
            </div>
            {t("footer.disclaimer")}
          </h3>
          <div className="bg-[var(--bg-primary)] rounded-2xl p-6 border-2 border-[var(--border-color)] border-b-4">
            <p className="text-[var(--text-secondary)] font-medium leading-relaxed">{t("footer.disclaimerText")}</p>
          </div>
        </div>

        {/* Right: Copyright & Contact */}
        <div className="flex flex-col items-start justify-between">
          <div className="text-left w-full">
            <p className="font-bold text-[var(--text-primary)] text-lg mb-4">{t("footer.rights")}</p>
            <a
              href="mailto:miaotokenonsol@gmail.com"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-bold uppercase bg-[var(--duo-green)] text-white border-2 border-b-4 border-[var(--btn-shadow)] hover:brightness-105 active:border-b-2 active:translate-y-[2px] transition-all mb-4"
            >
              <Mail size={18} />
              {t("footer.sendEmail")}
            </a>
            <p className="text-sm font-medium text-[var(--text-secondary)]">v1.0.6</p>
          </div>
        </div>
      </div>

      <img
        src="/images/clouds3.png"
        alt="Miao cats relaxing on a tropical island"
        className="absolute bottom-0 right-0 w-[500px] md:w-[650px] lg:w-[800px] h-auto pointer-events-none select-none"
      />
    </footer>
  )
}

export default Footer
