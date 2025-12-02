"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { GeneratedCat } from "@/types"
import { Sparkles, RefreshCw, Zap, Share2, Download, X, AlertTriangle } from "lucide-react"
import SnowCap from "./SnowCap"
import SnowEffect from "./SnowEffect"
import LeafEffect from "./LeafEffect"
import { useLanguage } from "../lib/language-context"
import { type Season } from "./SeasonSelector"

interface CatGeneratorProps {
  isChristmasMode?: boolean
  season?: Season
}

const CAT_REFERENCE_IMAGE = "/images/cat.png"
const MAX_GENERATIONS_PER_DAY = 3
const STORAGE_KEY = "miao_generator_daily_count"
const IMAGES_STORAGE_KEY = "miao_generator_images"
const IMAGE_EXPIRATION_HOURS = 24
const MAX_STORED_IMAGES = 10 // Limite máximo de imagens salvas para evitar exceder quota

interface StoredCat extends GeneratedCat {
  timestamp: number
}

// Características essenciais do gato que devem sempre estar presentes
const baseCharacteristics = "um gato verde com grandes olhos pretos"

// Funções para gerenciar o limite diário
const getTodayKey = (): string => {
  const today = new Date()
  return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
}

const getDailyCount = (): number => {
  if (typeof window === "undefined") return 0
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return 0
  
  try {
    const data = JSON.parse(stored)
    const todayKey = getTodayKey()
    
    // Se for um dia diferente, resetar
    if (data.date !== todayKey) {
      return 0
    }
    
    return data.count || 0
  } catch {
    return 0
  }
}

const incrementDailyCount = (): number => {
  if (typeof window === "undefined") return 0
  const todayKey = getTodayKey()
  const currentCount = getDailyCount()
  const newCount = currentCount + 1
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    date: todayKey,
    count: newCount
  }))
  
  return newCount
}

// Funções para gerenciar imagens salvas com expiração
const saveImage = (cat: GeneratedCat): void => {
  if (typeof window === "undefined") return
  
  try {
    const storedCats = getStoredImages()
    const newCat: StoredCat = {
      ...cat,
      timestamp: Date.now()
    }
    
    // Adiciona a nova imagem
    storedCats.push(newCat)
    
    // Ordena por timestamp (mais recentes primeiro)
    storedCats.sort((a, b) => b.timestamp - a.timestamp)
    
    // Remove as imagens mais antigas se exceder o limite
    if (storedCats.length > MAX_STORED_IMAGES) {
      storedCats.splice(MAX_STORED_IMAGES)
    }
    
    // Tenta salvar no localStorage
    localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(storedCats))
  } catch (error) {
    // Se houver erro (quota excedida), tenta limpar tudo e salvar apenas a nova imagem
    console.warn("Erro ao salvar imagem (quota excedida), limpando imagens antigas:", error)
    try {
      // Limpa todas as imagens
      clearAllImages()
      
      // Tenta salvar apenas a nova imagem
      const newCat: StoredCat = {
        ...cat,
        timestamp: Date.now()
      }
      localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify([newCat]))
    } catch (retryError) {
      console.error("Não foi possível salvar a imagem no localStorage mesmo após limpeza:", retryError)
      // Se ainda falhar, limpa completamente e não salva
      clearAllImages()
      // A imagem ainda será exibida na sessão atual, apenas não será salva
    }
  }
}

const getStoredImages = (): StoredCat[] => {
  if (typeof window === "undefined") return []
  
  try {
    const stored = localStorage.getItem(IMAGES_STORAGE_KEY)
    if (!stored) return []
    
    const storedCats: StoredCat[] = JSON.parse(stored)
    const now = Date.now()
    const expirationTime = IMAGE_EXPIRATION_HOURS * 60 * 60 * 1000 // 24 horas em milissegundos
    
    // Filtra imagens que ainda não expiraram
    let validCats = storedCats.filter(cat => {
      const age = now - cat.timestamp
      return age < expirationTime
    })
    
    // Ordena por timestamp (mais recentes primeiro)
    validCats.sort((a, b) => b.timestamp - a.timestamp)
    
    // Limita ao número máximo de imagens (mantém apenas as mais recentes)
    if (validCats.length > MAX_STORED_IMAGES) {
      validCats = validCats.slice(0, MAX_STORED_IMAGES)
    }
    
    // Se houve remoção de imagens, atualiza o storage
    if (validCats.length !== storedCats.length) {
      try {
        localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(validCats))
      } catch (error) {
        console.warn("Erro ao atualizar localStorage, mantendo apenas em memória:", error)
      }
    }
    
    return validCats
  } catch (error) {
    console.warn("Erro ao carregar imagens do localStorage:", error)
    // Se houver erro ao ler, tenta limpar o storage corrompido
    try {
      localStorage.removeItem(IMAGES_STORAGE_KEY)
    } catch {
      // Ignora erros ao limpar
    }
    return []
  }
}

const clearExpiredImages = (): void => {
  if (typeof window === "undefined") return
  getStoredImages() // Isso já remove as expiradas automaticamente
}

// Função para limpar todas as imagens (útil em caso de erro de quota)
const clearAllImages = (): void => {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(IMAGES_STORAGE_KEY)
  } catch (error) {
    console.warn("Erro ao limpar imagens:", error)
  }
}

// Declaração de tipo para Puter
declare global {
  interface Window {
    puter?: {
      ai?: {
        txt2img: (
          prompt: string,
          options?: { model?: string; quality?: string }
        ) => Promise<HTMLImageElement>
      }
      auth?: {
        isSignedIn: () => boolean
        signIn: () => Promise<void>
      }
    }
  }
}

const CatGenerator: React.FC<CatGeneratorProps> = ({ isChristmasMode = false, season = "normal" }) => {
  const { t } = useLanguage()
  const [cats, setCats] = useState<GeneratedCat[]>([])
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState("gpt-image-1")
  const [quality, setQuality] = useState("medium")
  const [puterReady, setPuterReady] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [dailyCount, setDailyCount] = useState(0)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const latestCatRef = useRef<HTMLDivElement | null>(null)

  // Carrega a contagem diária do servidor e imagens salvas ao montar o componente
  useEffect(() => {
    // Buscar rate limit do servidor (por IP)
    fetch("/api/generate")
      .then((res) => res.json())
      .then((data) => {
        setDailyCount(data.count || 0)
      })
      .catch((err) => {
        console.warn("Failed to fetch rate limit:", err)
        // Fallback para localStorage se o servidor falhar
        setDailyCount(getDailyCount())
      })
    
    // Carrega imagens salvas
    const storedImages = getStoredImages()
    if (storedImages.length > 0) {
      // Converte StoredCat para GeneratedCat (remove timestamp)
      const cats: GeneratedCat[] = storedImages.map(({ timestamp, ...cat }) => cat)
      setCats(cats)
    }
    
    // Limpa imagens expiradas
    clearExpiredImages()
    
    // Limpeza periódica de imagens expiradas (a cada hora)
    const cleanupInterval = setInterval(() => {
      const validImages = getStoredImages()
      // Atualiza o estado com as imagens válidas
      const cats: GeneratedCat[] = validImages.map(({ timestamp, ...cat }) => cat)
      setCats(cats)
    }, 60 * 60 * 1000) // Verifica a cada hora
    
    return () => clearInterval(cleanupInterval)
  }, [])

  // Verifica se Puter.js está carregado e se o usuário está autenticado
  useEffect(() => {
    const checkPuter = () => {
      if (window.puter && window.puter.ai && window.puter.auth) {
        setPuterReady(true)
        // Verifica se o usuário já está autenticado - AUTENTICAÇÃO OBRIGATÓRIA
        if (window.puter.auth.isSignedIn()) {
          setIsAuthenticated(true)
        } else {
          // Garante que o estado está sincronizado se não estiver autenticado
          setIsAuthenticated(false)
        }
      } else {
        setTimeout(checkPuter, 100)
      }
    }
    checkPuter()
    
    // Verifica periodicamente o estado de autenticação
    const authCheckInterval = setInterval(() => {
      if (window.puter?.auth) {
        const signedIn = window.puter.auth.isSignedIn()
        if (signedIn !== isAuthenticated) {
          setIsAuthenticated(signedIn)
        }
      }
    }, 1000)
    
    return () => clearInterval(authCheckInterval)
  }, [isAuthenticated])

  // Função para autenticar o usuário
  const handleSignIn = async () => {
    if (!window.puter?.auth) {
      setError(t("generator.puterNotLoaded"))
      return
    }

    setIsAuthenticating(true)
    setError(null)

    try {
      await window.puter.auth.signIn()
      // Verifica novamente após o login
      if (window.puter.auth.isSignedIn()) {
        setIsAuthenticated(true)
      }
    } catch (err) {
      console.error("Authentication error:", err)
      setError(err instanceof Error ? err.message : t("generator.authFailed"))
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert(t("generator.pleaseEnterPrompt"))
      return
    }

    // Verifica se Puter está carregado
    if (!puterReady) {
      setError(t("generator.puterNotLoaded"))
      return
    }

    // Verifica se Puter.auth está disponível
    if (!window.puter?.auth) {
      setError(t("generator.puterNotLoaded"))
      return
    }

    // AUTENTICAÇÃO OBRIGATÓRIA: Verifica se o usuário está autenticado no Puter
    if (!window.puter.auth.isSignedIn()) {
      setError(t("generator.pleaseAuthenticate") || "Por favor, autentique-se primeiro")
      // Atualiza o estado de autenticação
      setIsAuthenticated(false)
      return
    }

    // Atualiza o estado de autenticação se estiver autenticado
    if (!isAuthenticated) {
      setIsAuthenticated(true)
    }

    setLoading(true)
    setError(null)

    try {
      // Verificar rate limit no servidor (por IP)
      const rateLimitResponse = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!rateLimitResponse.ok) {
        if (rateLimitResponse.status === 429) {
          const errorData = await rateLimitResponse.json()
          setShowLimitModal(true)
          setLoading(false)
          return
        }
        throw new Error("Failed to check rate limit")
      }

      const rateLimitData = await rateLimitResponse.json()
      if (!rateLimitData.allowed) {
        setShowLimitModal(true)
        setLoading(false)
        return
      }

      // Atualizar contador local baseado na resposta do servidor
      setDailyCount(MAX_GENERATIONS_PER_DAY - rateLimitData.remaining)

      // Constrói o prompt final garantindo que tudo que o usuário digitar seja sobre o gato
      const userInput = prompt.trim()
      // Usa "está" ou "tem" dependendo do contexto, mas sempre referindo-se ao gato
      const finalPrompt = `${baseCharacteristics}, ${userInput}. Estilo cartoon animado, personagem mascote expressivo, fundo branco ou transparente, alta qualidade, detalhes nítidos, cores vibrantes`

      if (!window.puter?.ai?.txt2img) {
        throw new Error(t("generator.puterNotAvailable"))
      }

      const img = await window.puter.ai.txt2img(finalPrompt, { model, quality })

      const newCat: GeneratedCat = {
        id: Date.now().toString(),
        imageUrl: img.src,
      }
      setCats((prev) => [newCat, ...prev])
      
      // Salva a imagem no localStorage com expiração de 24h
      saveImage(newCat)

      // Enviar imagem para o Telegram automaticamente (em background, não bloqueia a UI)
      // Converte a imagem para data URL válida antes de enviar
      sendImageToTelegram(img, userInput).catch((err) => {
        // Silenciosamente falha se não conseguir enviar (não afeta a experiência do usuário)
        console.warn("Failed to send image to Telegram:", err)
      })

      // Scroll para a nova imagem após um pequeno delay para garantir que foi renderizada
      setTimeout(() => {
        if (latestCatRef.current) {
          latestCatRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 300)
    } catch (err) {
      console.error("Generation error:", err)
      setError(err instanceof Error ? err.message : t("generator.generationFailed"))
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = async (cat: GeneratedCat) => {
    try {
      if (cat.imageUrl.startsWith("data:")) {
        const a = document.createElement("a")
        a.href = cat.imageUrl
        a.download = `miao-${cat.id}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        const response = await fetch(cat.imageUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `miao-${cat.id}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (e) {
      console.error(e)
      alert(t("generator.downloadFailed"))
    }
  }

  // Função para converter imagem para data URL válida
  const convertImageToDataURL = (imageElement: HTMLImageElement): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Se já é uma data URL válida de imagem, retorna diretamente
      if (imageElement.src.startsWith("data:image/")) {
        resolve(imageElement.src)
        return
      }

      // Se a imagem já está carregada, converte diretamente
      if (imageElement.complete && imageElement.naturalWidth > 0) {
        try {
          const canvas = document.createElement("canvas")
          canvas.width = imageElement.naturalWidth
          canvas.height = imageElement.naturalHeight
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            reject(new Error("Could not get canvas context"))
            return
          }
          ctx.drawImage(imageElement, 0, 0)
          const dataURL = canvas.toDataURL("image/png")
          resolve(dataURL)
        } catch (error) {
          reject(error)
        }
        return
      }

      // Se a imagem ainda não está carregada, espera carregar
      const onLoad = () => {
        try {
          const canvas = document.createElement("canvas")
          canvas.width = imageElement.naturalWidth
          canvas.height = imageElement.naturalHeight
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            reject(new Error("Could not get canvas context"))
            return
          }
          ctx.drawImage(imageElement, 0, 0)
          const dataURL = canvas.toDataURL("image/png")
          resolve(dataURL)
        } catch (error) {
          reject(error)
        }
        imageElement.removeEventListener("load", onLoad)
        imageElement.removeEventListener("error", onError)
      }

      const onError = () => {
        imageElement.removeEventListener("load", onLoad)
        imageElement.removeEventListener("error", onError)
        reject(new Error("Failed to load image"))
      }

      imageElement.addEventListener("load", onLoad, { once: true })
      imageElement.addEventListener("error", onError, { once: true })
    })
  }

  // Função para enviar imagem para o Telegram
  const sendImageToTelegram = async (imageElement: HTMLImageElement, prompt: string) => {
    try {
      // Converte a imagem para data URL válida
      const dataURL = await convertImageToDataURL(imageElement)

      const response = await fetch("/api/send-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: dataURL,
          prompt,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || "Failed to send to Telegram")
      }

      return await response.json()
    } catch (error) {
      console.error("Error sending to Telegram:", error)
      throw error
    }
  }

  const shareImage = async (cat: GeneratedCat) => {
    try {
      // Tenta usar a Web Share API se disponível (mobile e alguns navegadores desktop)
      if (navigator.share && navigator.canShare) {
        let blob: Blob
        let file: File

        if (cat.imageUrl.startsWith("data:")) {
          const base64Data = cat.imageUrl.split(",")[1]
          const binaryString = atob(base64Data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          blob = new Blob([bytes], { type: "image/png" })
        } else {
          const response = await fetch(cat.imageUrl)
          blob = await response.blob()
        }

        file = new File([blob], `miao-${cat.id}.png`, { type: "image/png" })

        // Verifica se pode compartilhar o arquivo
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Miao Army Generator",
            text: `Confere esta imagem gerada com AI! 🐱`,
            files: [file],
          })
          return
        }
      }

      // Fallback: copia a imagem para a área de transferência ou abre opções de compartilhamento
      let blob: Blob
      if (cat.imageUrl.startsWith("data:")) {
        const base64Data = cat.imageUrl.split(",")[1]
        const binaryString = atob(base64Data)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        blob = new Blob([bytes], { type: "image/png" })
      } else {
        const response = await fetch(cat.imageUrl)
        blob = await response.blob()
      }

      // Tenta copiar para a área de transferência
      if (navigator.clipboard && navigator.clipboard.write) {
        const item = new ClipboardItem({ "image/png": blob })
        await navigator.clipboard.write([item])
        alert("✅ Imagem copiada para a área de transferência! Podes colar em qualquer rede social.")
      } else {
        // Fallback final: download da imagem
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `miao-${cat.id}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        alert("📥 " + t("generator.download") + "!")
      }
    } catch (e) {
      console.error(e)
      // Se o usuário cancelar o share, não mostrar erro
      if (e instanceof Error && e.name !== "AbortError") {
        alert("❌ " + t("generator.shareError") + " " + (e.message || t("generator.unknownError")))
      }
    }
  }

  return (
    <section
      id="generator"
      className="py-24 bg-[var(--bg-primary)] text-center px-6 md:px-12 lg:px-24 overflow-hidden border-t-4 border-[var(--border-color)]"
    >
      <div className="max-w-5xl mx-auto">
        <div className="inline-block mb-4 relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48">
          <img 
            src="/images/miao-drawing.png" 
            alt="Miao" 
            className="absolute inset-0 w-full h-full object-contain animate-breathe animate-blink-main"
          />
          <img 
            src="/images/miao-drawing2.png" 
            alt="Miao" 
            className="absolute inset-0 w-full h-full object-contain animate-breathe animate-blink-eyes"
          />
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] mb-6">{t("generator.title")}</h2>
        <p className="text-[var(--text-secondary)] text-xl font-bold mb-12 max-w-2xl mx-auto">
          {t("generator.subtitle")}
        </p>

        <div className="max-w-3xl mx-auto bg-[var(--bg-secondary)] border-b-8 border-[var(--border-color)] rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden text-left shadow-lg">
          {isChristmasMode && (
            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none z-0">
              <SnowEffect isActive={isChristmasMode} borderRadius="2.5rem" />
            </div>
          )}
          {season === "fall" && (
            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none z-0">
              <LeafEffect isActive={season === "fall"} />
            </div>
          )}
          <SnowCap className="h-12" visible={isChristmasMode} />

          <div className="mb-6 relative z-10 flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-2xl border-2 border-[var(--border-color)]">
            <img
              src={CAT_REFERENCE_IMAGE || "/placeholder.svg"}
              alt="Miao Reference"
              className="w-20 h-20 object-contain rounded-xl bg-white"
            />
            <div className="flex-1">
              <p className="font-black text-sm uppercase text-[var(--brand)] tracking-wide">{t("generator.baseCharacter")}</p>
              <p className="text-[var(--text-secondary)] text-sm">
                {t("generator.baseCharacterDesc")}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-2xl">
              <p className="text-red-600 dark:text-red-400 font-bold text-sm">{error}</p>
            </div>
          )}

          {puterReady && !isAuthenticated && (
            <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl">
              <p className="text-yellow-600 dark:text-yellow-400 font-bold text-sm mb-3">
                {t("generator.authRequired")}
              </p>
              <button
                onClick={handleSignIn}
                disabled={isAuthenticating}
                className="bg-[var(--duo-blue)] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wide border-b-4 border-[var(--blue-button-border)] active:border-b-0 active:translate-y-1 hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-wait"
              >
                {isAuthenticating ? t("generator.authenticating") : t("generator.authenticate")}
              </button>
            </div>
          )}

          {/* Indicador de gerações restantes */}
          {isAuthenticated && (
            <div className="mb-6 p-4 bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-sm uppercase text-[var(--text-secondary)] tracking-wide mb-1">
                    {t("generator.generationsToday")}
                  </p>
                  <p className="text-[var(--text-primary)] font-bold">
                    {dailyCount} / {MAX_GENERATIONS_PER_DAY} {t("generator.used")}
                  </p>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: MAX_GENERATIONS_PER_DAY }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center ${
                        index < dailyCount
                          ? "bg-[var(--brand)] border-[var(--brand)]"
                          : "bg-[var(--bg-secondary)] border-[var(--border-color)]"
                      }`}
                    >
                      {index < dailyCount && <Sparkles size={16} className="text-white" />}
                    </div>
                  ))}
                </div>
              </div>
              {dailyCount >= MAX_GENERATIONS_PER_DAY && (
                <p className="mt-2 text-sm font-bold text-red-500">
                  {t("generator.dailyLimit")}
                </p>
              )}
            </div>
          )}

          <div className="mb-6 relative z-10">
            <label className="block font-black text-sm uppercase text-[var(--text-secondary)] mb-3 tracking-widest">
              {t("generator.prompt")}
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleGenerate()}
              placeholder={t("generator.promptPlaceholder")}
              className="w-full bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] rounded-2xl p-5 font-bold text-lg text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/20 transition-all"
            />
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {t("generator.promptHint")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative z-10">
            <div>
              <label className="block font-black text-sm uppercase text-[var(--text-secondary)] mb-3 tracking-widest">
                {t("generator.model")}
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] rounded-2xl p-4 font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/20 transition-all"
              >
                <option value="gpt-image-1">GPT Image-1</option>
                <option value="dall-e-3">DALL·E 3</option>
                <option value="stabilityai/stable-diffusion-3-medium">Stable Diffusion 3</option>
              </select>
            </div>
            <div>
              <label className="block font-black text-sm uppercase text-[var(--text-secondary)] mb-3 tracking-widest">
                {t("generator.quality")}
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] rounded-2xl p-4 font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/20 transition-all"
              >
                <option value="low">{t("generator.quality.low")}</option>
                <option value="medium">{t("generator.quality.medium")}</option>
                <option value="high">{t("generator.quality.high")}</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !puterReady || (puterReady && !isAuthenticated) || dailyCount >= MAX_GENERATIONS_PER_DAY}
            className={`
              w-full bg-[var(--brand)] text-white px-6 py-5 rounded-2xl font-black text-2xl 
              flex items-center justify-center gap-3 uppercase tracking-wide
              border-b-[6px] border-[var(--brand-dark)] active:border-b-0 active:translate-y-[6px]
              hover:brightness-110 transition-all relative z-10
              ${loading || !puterReady || (puterReady && !isAuthenticated) || dailyCount >= MAX_GENERATIONS_PER_DAY ? "opacity-70 cursor-not-allowed" : ""}
            `}
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={28} />
            ) : (
              <Sparkles size={28} className="text-yellow-300 fill-current" />
            )}
            {loading
              ? t("generator.generating")
              : !puterReady
              ? t("generator.loading")
              : !isAuthenticated
              ? t("generator.authenticateFirst")
              : dailyCount >= MAX_GENERATIONS_PER_DAY
              ? t("generator.dailyLimitReached")
              : t("generator.generate")}
          </button>
        </div>

        {cats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {cats.map((cat, index) => (
              <div
                key={cat.id}
                ref={index === 0 ? latestCatRef : null}
                className="bg-[var(--bg-secondary)] rounded-[2rem] p-4 border-b-8 border-[var(--border-color)] hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="aspect-square bg-[var(--bg-tertiary)] rounded-3xl overflow-hidden mb-4 border-2 border-[var(--border-color)]">
                  <img
                    src={cat.imageUrl || "/placeholder.svg"}
                    alt="Generated Green Cat"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-between items-center px-2 pb-2">
                  <span className="font-bold text-sm text-[var(--text-secondary)] uppercase tracking-wide">
                    #{cat.id.slice(-4)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadImage(cat)}
                      className="bg-[var(--brand)] text-white p-3 rounded-xl border-b-4 border-[var(--btn-shadow)] active:border-b-0 active:translate-y-1 transition-all"
                      title={t("generator.download")}
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => shareImage(cat)}
                      className="bg-[var(--duo-blue)] text-white p-3 rounded-xl border-b-4 border-[var(--blue-button-dark)] active:border-b-0 active:translate-y-1 transition-all"
                      title={t("generator.share")}
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Limite Diário */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowLimitModal(false)} />
          
          <div className="relative w-full max-w-md bg-[var(--bg-primary)] border-2 border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl animate-fade-up">
            <div className="flex justify-between items-center p-5 border-b-2 border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <h2 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center">
                  <AlertTriangle className="text-white" size={20} />
                </div>
                {t("generator.limitModalTitle")}
              </h2>
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-tertiary)] border-2 border-b-4 border-[var(--btn-shadow)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 active:border-b-2 active:translate-y-[2px] transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle size={40} className="text-yellow-500" />
              </div>
              
              <h3 className="text-2xl font-black text-[var(--text-primary)] mb-4">
                {t("generator.limitModalTitle")}
              </h3>
              
              <div className="space-y-3 mb-6">
                <p className="text-[var(--text-secondary)] font-bold">
                  {t("generator.limitModalText1").replace("{count}", String(MAX_GENERATIONS_PER_DAY))}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {t("generator.limitModalText2").replace("{count}", String(MAX_GENERATIONS_PER_DAY))}
                </p>
                <p className="text-sm text-[var(--text-secondary)] font-bold">
                  {t("generator.limitModalText3")}
                </p>
              </div>

              <div className="bg-[var(--bg-tertiary)] rounded-2xl p-4 border-2 border-[var(--border-color)] mb-4">
                <p className="text-xs font-bold text-[var(--text-secondary)] mb-2">{t("generator.limitModalGenerations")}</p>
                <div className="flex justify-center gap-2">
                  {Array.from({ length: MAX_GENERATIONS_PER_DAY }).map((_, index) => (
                    <div
                      key={index}
                      className="w-10 h-10 rounded-lg bg-[var(--brand)] border-2 border-[var(--brand)] flex items-center justify-center"
                    >
                      <Sparkles size={20} className="text-white" />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full bg-[var(--brand)] text-white font-black py-4 rounded-xl border-[3px] border-[var(--comic-outline)] shadow-[4px_4px_0_0_var(--comic-outline)] hover:shadow-[6px_6px_0_0_var(--comic-outline)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
              >
                {t("generator.limitModalUnderstood")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default CatGenerator
