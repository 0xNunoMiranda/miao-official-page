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
    const langConfig = languages.find((l) => l.code === language)
    document.documentElement.setAttribute("dir", langConfig?.dir || "ltr")
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
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
