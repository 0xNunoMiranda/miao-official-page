"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type Language, languages, getTranslation } from "./translations"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  dir: "ltr" | "rtl"
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    if (typeof window === "undefined") return
    
    const savedLang = localStorage.getItem("language") as Language
    if (savedLang && languages.some((l) => l.code === savedLang)) {
      setLanguageState(savedLang)
    } else {
      // Detect browser language
      const browserLang = navigator.language.split("-")[0] as Language
      if (languages.some((l) => l.code === browserLang)) {
        setLanguageState(browserLang)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    
    // Não aplicar dir no elemento raiz para não inverter o layout
    // Apenas textos serão afetados via CSS
    const langConfig = languages.find((l) => l.code === language)
    if (langConfig?.dir === "rtl") {
      document.documentElement.classList.add("rtl-text")
      document.documentElement.classList.remove("ltr-text")
    } else {
      document.documentElement.classList.add("ltr-text")
      document.documentElement.classList.remove("rtl-text")
    }
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang)
    }
  }

  const t = (key: string) => getTranslation(language, key)

  const dir = languages.find((l) => l.code === language)?.dir || "ltr"

  return <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
