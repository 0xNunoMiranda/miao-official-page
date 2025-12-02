"use client"

import type { Language } from "../lib/language-context"

const whitepaperUrls: Record<string, string> = {
  pt: "https://fish-mile-a5f.notion.site/PT-MIAO-Whitepaper-2bb3cf178772809fac7ae5e614c67841",
  en: "https://fish-mile-a5f.notion.site/EN-MIAO-Whitepaper-2bb3cf178772809fac7ae5e614c67841",
  es: "https://fish-mile-a5f.notion.site/ES-MIAO-Whitepaper-2bb3cf178772809fac7ae5e614c67841",
  fr: "https://fish-mile-a5f.notion.site/FR-MIAO-Whitepaper-2bb3cf178772809fac7ae5e614c67841",
  de: "https://fish-mile-a5f.notion.site/DE-MIAO-Whitepaper-2bb3cf178772809fac7ae5e614c67841",
  zh: "https://fish-mile-a5f.notion.site/ZH-MIAO-Whitepaper-2bb3cf178772809fac7ae5e614c67841",
  ar: "https://fish-mile-a5f.notion.site/AR-MIAO-Whitepaper-2bb3cf178772809fac7ae5e614c67841",
}

/**
 * Redireciona para o whitepaper externo baseado no idioma
 * @param language - Idioma atual do usuário
 */
export const redirectToWhitepaper = (language: Language = "en") => {
  if (typeof window === "undefined") return
  const whitepaperUrl = whitepaperUrls[language] || whitepaperUrls.en
  window.open(whitepaperUrl, "_blank", "noopener,noreferrer")
}

