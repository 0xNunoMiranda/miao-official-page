"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { GeneratedCat } from "@/types"
import { Sparkles, RefreshCw, Zap, Share2, Download, X, AlertTriangle, Video, Image as ImageIcon } from "lucide-react"
import SnowCap from "./SnowCap"
import SnowEffect from "./SnowEffect"
import LeafEffect from "./LeafEffect"
import { useLanguage } from "../lib/language-context"
import { type Season } from "./SeasonSelector"
import { generateVideoWithPuter, getVideoURL } from "../lib/puter-video-generator"

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

const CatGenerator: React.FC<CatGeneratorProps> = ({ isChristmasMode = false, season = "normal" }) => {
  const { t, language } = useLanguage()
  const [cats, setCats] = useState<GeneratedCat[]>([])
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [dailyCount, setDailyCount] = useState(0)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [puterReady, setPuterReady] = useState(false)
  const [puterAuthenticated, setPuterAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(false)
  const [generationType, setGenerationType] = useState<"image" | "video">("image")
  const latestCatRef = useRef<HTMLDivElement | null>(null)

  // Carrega a contagem diária do servidor e imagens salvas ao montar o componente
  useEffect(() => {
    setMounted(true)
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

  // Verificar se Puter.js está carregado e autenticado
  useEffect(() => {
    let checkCount = 0
    const maxChecks = 30 // Máximo de 30 segundos
    let intervalId: NodeJS.Timeout | null = null
    let hasCheckedAuth = false // Flag para evitar verificar autenticação múltiplas vezes
    
    const checkPuter = async () => {
      checkCount++
      
      // Verificar se txt2img e txt2vid estão disponíveis
      const hasTxt2Img = window.puter && window.puter.ai && typeof window.puter.ai.txt2img === 'function'
      const hasTxt2Vid = window.puter && window.puter.ai && typeof window.puter.ai.txt2vid === 'function'
      
      if (hasTxt2Img || hasTxt2Vid) {
        console.log("Puter está pronto! (txt2img:", hasTxt2Img, ", txt2vid:", hasTxt2Vid, ")")
        setPuterReady(true)
        
        // Limpar o intervalo assim que o Puter estiver pronto
        if (intervalId) {
          clearInterval(intervalId)
          intervalId = null
        }
        
        // Verificar autenticação APENAS UMA VEZ usando puter.auth.isSignedIn()
        if (!hasCheckedAuth && window.puter.auth && typeof window.puter.auth.isSignedIn === 'function') {
          hasCheckedAuth = true // Marcar como verificado para evitar loops
          
          try {
            setCheckingAuth(true)
            const isSignedIn = window.puter.auth.isSignedIn()
            setPuterAuthenticated(isSignedIn)
            console.log("Status de autenticação verificado:", isSignedIn)
            
            // NÃO chamar getUser() aqui - isso causa loop de requisições
            // getUser() só deve ser chamado quando o usuário faz login explicitamente
            // ou quando necessário para obter dados específicos do usuário
          } catch (error) {
            console.warn("Erro ao verificar autenticação do Puter:", error)
            setPuterAuthenticated(false)
          } finally {
            setCheckingAuth(false)
          }
        } else if (!hasCheckedAuth) {
          // Se não tem sistema de autenticação, verificar se precisa mesmo
          hasCheckedAuth = true
          console.log("Sistema de autenticação do Puter não disponível. Tentando usar sem autenticação.")
          setPuterAuthenticated(false)
        }
        
        return true
      } else {
        if (checkCount < maxChecks) {
          console.log(`Aguardando Puter... (tentativa ${checkCount}/${maxChecks})`)
          setPuterReady(false)
          if (!hasCheckedAuth) {
            setPuterAuthenticated(false)
          }
        } else {
          console.warn("Puter não carregou após 30 segundos")
          setPuterReady(false)
          setPuterAuthenticated(false)
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
        }
        return false
      }
    }
    
    // Verificar imediatamente
    checkPuter()
    
    // Verificar periodicamente até estar pronto
    intervalId = setInterval(() => {
      const isReady = checkPuter()
      if (isReady || checkCount >= maxChecks) {
        if (intervalId) {
          clearInterval(intervalId)
          intervalId = null
        }
      }
    }, 1000)
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [])

  // Função para autenticar com Puter usando puter.auth.signIn()
  const handleAuthenticate = async () => {
    console.log("handleAuthenticate chamado")
    console.log("window.puter:", window.puter)
    console.log("window.puter?.auth:", window.puter?.auth)
    
    if (!window.puter || !window.puter.auth) {
      const errorMsg = t("generator.puterNotAvailable") || "Puter.js não está disponível"
      console.error("Puter não disponível:", errorMsg)
      setError(errorMsg)
      return
    }

    if (!window.puter.auth.signIn || typeof window.puter.auth.signIn !== 'function') {
      const errorMsg = "Função de autenticação do Puter não está disponível. Por favor, atualiza a página."
      console.error(errorMsg)
      setError(errorMsg)
      return
    }

    try {
      setCheckingAuth(true)
      setError(null)
      
      console.log("Chamando puter.auth.signIn()...")
      // Chamar signIn() - abre popup de autenticação
      // IMPORTANTE: signIn() deve ser chamado em resposta a uma ação do usuário (como um clique)
      await window.puter.auth.signIn()
      console.log("signIn() retornou")
      
      // Aguardar um pouco para o Puter processar a autenticação
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Verificar se autenticou com sucesso
      if (window.puter.auth.isSignedIn && typeof window.puter.auth.isSignedIn === 'function') {
        let isSignedIn = false
        // Tentar verificar algumas vezes (o Puter pode demorar a atualizar)
        for (let i = 0; i < 5; i++) {
          console.log(`Verificando autenticação (tentativa ${i + 1}/5)...`)
          isSignedIn = window.puter.auth.isSignedIn()
          console.log(`isSignedIn retornou:`, isSignedIn)
          if (isSignedIn) break
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        setPuterAuthenticated(isSignedIn)
        
        if (isSignedIn) {
          // NÃO chamar getUser() aqui automaticamente após signIn - isso causa loop
          // O fato de isSignedIn() retornar true já é suficiente para considerar autenticado
          // getUser() só deve ser chamado quando necessário para obter dados específicos do usuário
          console.log("Autenticação bem-sucedida!")
          setError(null)
        } else {
          setError(t("generator.pleaseAuthenticate") || "Por favor, autentica-te primeiro para gerar imagens.")
        }
      } else {
        // Se não tem função de verificação, assumir que autenticou (modo otimista)
        console.log("isSignedIn não disponível, assumindo autenticação bem-sucedida")
        setPuterAuthenticated(true)
        setError(null)
      }
    } catch (error: any) {
      console.error("Erro ao autenticar com Puter:", error)
      console.error("Stack trace:", error?.stack)
      setError(error?.message || "Erro ao autenticar com Puter. Por favor, tenta novamente.")
      setPuterAuthenticated(false)
    } finally {
      setCheckingAuth(false)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert(t("generator.pleaseEnterPrompt"))
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Verificar rate limit no servidor (por IP) - SEM incrementar ainda
      const rateLimitResponse = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "check" }),
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

      const userInput = prompt.trim()
      
      // Verificar se Puter está pronto
      if (!puterReady) {
        const errorMsg = t("generator.puterNotLoaded") || "Puter.js ainda não está carregado. Por favor, aguarda um momento."
        setError(errorMsg)
        setLoading(false)
        return
      }
      
      // Verificar se está autenticado usando puter.auth.isSignedIn()
      if (!puterAuthenticated) {
        // Tentar verificar uma última vez se está autenticado
        if (window.puter?.auth?.isSignedIn && typeof window.puter.auth.isSignedIn === 'function') {
          try {
            const isSignedIn = window.puter.auth.isSignedIn()
            if (isSignedIn) {
              setPuterAuthenticated(true)
              // Continuar com a geração
            } else {
              const errorMsg = t("generator.pleaseAuthenticate") || "Por favor, autentica-te primeiro para gerar imagens."
              setError(errorMsg)
              setLoading(false)
              return
            }
          } catch (error) {
            console.warn("Erro ao verificar autenticação:", error)
            // Se der erro na verificação, tentar gerar mesmo assim (modo otimista)
          }
        } else {
          // Se não tem função de verificação, tentar gerar mesmo assim
          // Se funcionar, então não precisa de autenticação
          console.log("Sem função de verificação de auth, tentando gerar diretamente...")
        }
      }
      
      // Gerar imagem ou vídeo (se der erro, não incrementa o contador)
      if (generationType === "video") {
        await handleGenerateVideo(userInput)
      } else {
        await handleGenerateImage(userInput)
      }
      
      // Se chegou aqui, a geração foi bem-sucedida - confirmar no servidor
      const confirmResponse = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "confirm" }),
      })

      if (confirmResponse.ok) {
        const confirmData = await confirmResponse.json()
        // Atualizar contador local baseado na resposta do servidor
        setDailyCount(MAX_GENERATIONS_PER_DAY - confirmData.remaining)
      } else {
        // Se falhar ao confirmar, ainda assim a imagem foi gerada
        // Mas vamos atualizar o contador local de qualquer forma
        console.warn("Failed to confirm generation on server, but image was generated")
        setDailyCount(prev => Math.min(prev + 1, MAX_GENERATIONS_PER_DAY))
      }
    } catch (error: any) {
      // Log detalhado do erro para debug
      console.error("Generation error:", error)
      console.error("Error type:", typeof error)
      console.error("Error constructor:", error?.constructor?.name)
      console.error("Error keys:", error && typeof error === "object" ? Object.keys(error) : "N/A")
      
      // Melhor tratamento de erros para capturar diferentes tipos
      let errorMessage = t("generator.generationFailed") || "Erro ao gerar conteúdo"
      
      // Tentar extrair mensagem de erro de várias formas
      if (error instanceof Error) {
        errorMessage = error.message || error.name || errorMessage
        console.error("Error name:", error.name)
        console.error("Error message:", error.message)
        console.error("Error stack:", error.stack)
      } else if (typeof error === "string") {
        errorMessage = error
      } else if (error && typeof error === "object") {
        // Tenta extrair mensagem de objetos de erro
        const errorObj = error as any
        
        // Tentar várias propriedades comuns
        errorMessage = errorObj.message 
          || errorObj.error 
          || errorObj.errorMessage
          || errorObj.msg
          || errorObj.description
          || errorObj.reason
          || errorObj.details
          || (errorObj.toString && errorObj.toString() !== "[object Object]" ? errorObj.toString() : null)
          || JSON.stringify(errorObj).substring(0, 200) // Se não encontrar, usar JSON
          || errorMessage
        
        // Log do objeto completo para debug
        try {
          console.error("Error object:", JSON.stringify(errorObj, Object.getOwnPropertyNames(errorObj), 2))
        } catch (e) {
          console.error("Error object (raw):", errorObj)
          // Tentar acessar propriedades comuns mesmo se não conseguir serializar
          if (errorObj.message) console.error("Error.message:", errorObj.message)
          if (errorObj.error) console.error("Error.error:", errorObj.error)
          if (errorObj.stack) console.error("Error.stack:", errorObj.stack)
        }
      } else if (error !== null && error !== undefined) {
        errorMessage = String(error)
      }
      
      // Se ainda não temos uma mensagem útil, verificar se é um erro vazio
      if (!errorMessage || errorMessage === t("generator.generationFailed") || errorMessage === "{}" || errorMessage.trim() === "") {
        // Verificar se Puter está disponível
        if (!window.puter) {
          errorMessage = "Puter.js não está carregado. Por favor, recarrega a página."
        } else if (!window.puter.ai) {
          errorMessage = "Puter.js AI não está disponível. Por favor, verifica a conexão."
        } else if (!window.puter.ai.txt2img && !window.puter.ai.txt2vid) {
          errorMessage = "Funções de geração não estão disponíveis. Por favor, verifica a autenticação."
        } else if (window.puter.auth && window.puter.auth.isSignedIn && !window.puter.auth.isSignedIn()) {
          errorMessage = "Por favor, autentica-te primeiro para gerar conteúdo."
        } else {
          errorMessage = "Erro desconhecido ao gerar conteúdo. Por favor, tenta novamente ou verifica a autenticação."
        }
      }
      
      // Se ainda está vazio após todas as tentativas, usar mensagem padrão
      if (!errorMessage || errorMessage.trim() === "" || errorMessage === "{}") {
        errorMessage = "Erro ao gerar conteúdo. Por favor, verifica se estás autenticado e tenta novamente."
      }
      
      // Detectar se é erro de autenticação e atualizar estado
      const errorLower = String(errorMessage).toLowerCase()
      const isAuthError = errorLower.includes('autentic') 
        || errorLower.includes('auth') 
        || errorLower.includes('sign in')
        || errorLower.includes('login')
        || errorLower.includes('api key') 
        || errorLower.includes('verifica se estás autenticado')
        || errorLower.includes('verifica a tua api key')
        || errorLower.includes('autentica-te')
      
      if (isAuthError) {
        // Atualizar estado de autenticação para false para mostrar o card de autenticação
        setPuterAuthenticated(false)
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateVideo = async (userInput: string) => {
    // Verificar se Puter está disponível e tem suporte para vídeo
    if (!window.puter) {
      throw new Error("Puter.js não está carregado. Por favor, recarrega a página.")
    }
    
    if (!window.puter.ai) {
      throw new Error("Puter.js AI não está disponível. Por favor, verifica a conexão.")
    }
    
    if (!window.puter.ai.txt2vid || typeof window.puter.ai.txt2vid !== 'function') {
      throw new Error("Função txt2vid não está disponível. Por favor, verifica a autenticação.")
    }

    // Prompt base com constituição física do gato (mesmo usado para imagens)
    const basePrompt = `[CAT PHYSICAL CONSTITUTION - ONLY REFERS TO THE CAT'S APPEARANCE:]

green cat, bright green teal mint emerald green cartoon cat character, ENTIRE BODY IS SOLID GREEN COLOR;

bright green teal body, green cat body, green mascot character;

big round black eyes with white highlight dots, NOT green eyes;

wide open mouth showing sharp white teeth, pink inner mouth and pink tongue;

pointy cat ears with darker green inner ear;

black whiskers on both sides of the face;

long curved green tail (same green color as the body);

simple flat cartoon style, mascot-style, no fur texture, bold black outlines;

playful, energetic, joyful expression;

stands on two legs, green paws, all body parts are green.

🔧 RULE TO APPLY ADDITIONAL USER INSTRUCTIONS (ANY LANGUAGE):

After this base description, accept and integrate ANY user instructions written in ANY language.

Additional user prompts may modify:

pose

action

environment / background

props

clothing / accessories

emotion

camera angle

rendering style (2D, vector, 3D, cel-shaded, etc.)

…but must NOT override or contradict the CAT PHYSICAL CONSTITUTION above.`
    
    // Obter nome do idioma para contexto
    const languageNames: Record<string, string> = {
      "pt": "Portuguese",
      "en": "English",
      "es": "Spanish",
      "fr": "French",
      "de": "German",
      "zh": "Chinese",
      "ar": "Arabic",
    }
    const languageName = languageNames[language] || "English"
    
    // Construir prompt final: base + instruções do usuário no idioma do website
    let fullPrompt = basePrompt
    
    if (userInput.trim()) {
      // Adicionar o prompt do usuário no idioma do website
      fullPrompt = `${basePrompt}

[USER INSTRUCTIONS IN ${languageName.toUpperCase()} - FOLLOW THESE INSTRUCTIONS WHILE MAINTAINING THE CAT PHYSICAL CONSTITUTION ABOVE]:

${userInput.trim()}

IMPORTANT: The user instructions above are in ${languageName}. Do not translate or ignore them. Apply them exactly as specified while maintaining all the physical characteristics of the green cat described in the base constitution.`
    }

    // Gerar vídeo usando Puter.js conforme documentação oficial
    // txt2vid(prompt, options) retorna Promise<HTMLVideoElement>
    const videoElement = await generateVideoWithPuter(fullPrompt, {
      model: "sora-2",
      seconds: 8,
      size: "1280x720",
      testMode: false
    })

    const videoUrl = getVideoURL(videoElement)

    // Validar URL do vídeo
    if (!videoUrl || typeof videoUrl !== "string" || (!videoUrl.startsWith("data:") && !videoUrl.startsWith("http") && !videoUrl.startsWith("blob:"))) {
      throw new Error("Invalid video URL format from Puter")
    }

    // Aguardar o vídeo carregar
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Video loading timeout (30s)"))
      }, 30000) // 30 segundos de timeout para vídeos
      
      if (videoElement.readyState >= 2) {
        // Já tem dados suficientes
        clearTimeout(timeout)
        resolve()
      } else {
        videoElement.addEventListener('loadeddata', () => {
          clearTimeout(timeout)
          resolve()
        }, { once: true })
        
        videoElement.addEventListener('error', (error) => {
          clearTimeout(timeout)
          console.error("Video load error:", error)
          reject(new Error("Failed to load generated video. The video data may be corrupted."))
        }, { once: true })
      }
    })

    const newCat: GeneratedCat = {
      id: Date.now().toString(),
      imageUrl: videoUrl, // Usar imageUrl para compatibilidade (pode ser thumbnail)
      videoUrl: videoUrl,
      type: "video"
    }
    setCats((prev) => [newCat, ...prev])
    
    // Salva o vídeo no localStorage com expiração de 24h
    saveImage(newCat)

    // Scroll para o novo vídeo após um pequeno delay
    setTimeout(() => {
      if (latestCatRef.current) {
        latestCatRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 300)
  }

  const handleGenerateImage = async (userInput: string) => {
    // Verificar se Puter está disponível
    if (!window.puter) {
      throw new Error("Puter.js não está carregado. Por favor, recarrega a página.")
    }
    
    if (!window.puter.ai) {
      throw new Error("Puter.js AI não está disponível. Por favor, verifica a conexão.")
    }
    
    if (!window.puter.ai.txt2img || typeof window.puter.ai.txt2img !== 'function') {
      throw new Error("Função txt2img não está disponível. Por favor, verifica a autenticação.")
    }

    // Prompt base com constituição física do gato (NUNCA ALTERAR)
    const basePrompt = `[CAT PHYSICAL CONSTITUTION - ONLY REFERS TO THE CAT'S APPEARANCE:]

green cat, bright green teal mint emerald green cartoon cat character, ENTIRE BODY IS SOLID GREEN COLOR;

bright green teal body, green cat body, green mascot character;

big round black eyes with white highlight dots, NOT green eyes;

wide open mouth showing sharp white teeth, pink inner mouth and pink tongue;

pointy cat ears with darker green inner ear;

black whiskers on both sides of the face;

long curved green tail (same green color as the body);

simple flat cartoon style, mascot-style, no fur texture, bold black outlines;

playful, energetic, joyful expression;

stands on two legs, green paws, all body parts are green.

🔧 RULE TO APPLY ADDITIONAL USER INSTRUCTIONS (ANY LANGUAGE):

After this base description, accept and integrate ANY user instructions written in ANY language.

Additional user prompts may modify:

pose

action

environment / background

props

clothing / accessories

emotion

camera angle

rendering style (2D, vector, 3D, cel-shaded, etc.)

…but must NOT override or contradict the CAT PHYSICAL CONSTITUTION above.`
    
    // Obter nome do idioma para contexto
    const languageNames: Record<string, string> = {
      "pt": "Portuguese",
      "en": "English",
      "es": "Spanish",
      "fr": "French",
      "de": "German",
      "zh": "Chinese",
      "ar": "Arabic",
    }
    const languageName = languageNames[language] || "English"
    
    // Construir prompt final: base + instruções do usuário no idioma do website
    let fullPrompt = basePrompt
    
    if (userInput.trim()) {
      // Adicionar o prompt do usuário no idioma do website
      fullPrompt = `${basePrompt}

[USER INSTRUCTIONS IN ${languageName.toUpperCase()} - FOLLOW THESE INSTRUCTIONS WHILE MAINTAINING THE CAT PHYSICAL CONSTITUTION ABOVE:]

${userInput.trim()}

IMPORTANT: The user instructions above are in ${languageName}. Do not translate or ignore them. Apply them exactly as specified while maintaining all the physical characteristics of the green cat described in the base constitution.`
    }

    // Gerar imagem usando Puter.js conforme documentação oficial
    // txt2img(prompt, testMode?) retorna Promise<HTMLImageElement>
    let img: HTMLImageElement
    try {
      // Verificar autenticação uma última vez antes de gerar
      if (window.puter.auth && window.puter.auth.isSignedIn && !window.puter.auth.isSignedIn()) {
        throw new Error("Por favor, autentica-te primeiro para gerar imagens.")
      }
      
      console.log("Chamando txt2img com prompt:", fullPrompt.substring(0, 100) + "...")
      img = await window.puter.ai.txt2img(fullPrompt, false) // false = não usar testMode (gera imagem real)
      console.log("txt2img retornou:", img)
    } catch (error: any) {
      console.error("Erro ao chamar txt2img:", error)
      console.error("Erro completo:", JSON.stringify(error, Object.getOwnPropertyNames(error)))
      
      // Extrair mensagem de erro de várias formas possíveis
      let errorMessage = "Erro ao gerar imagem com Puter.js"
      
      if (error instanceof Error) {
        errorMessage = error.message || error.name || errorMessage
      } else if (typeof error === "string") {
        errorMessage = error
      } else if (error && typeof error === "object") {
        errorMessage = error.message || error.error || error.errorMessage || error.msg || errorMessage
        
        // Se ainda não tem mensagem, verificar se é um erro de autenticação
        if (!errorMessage || errorMessage === "Erro ao gerar imagem com Puter.js") {
          const errorStr = JSON.stringify(error)
          if (errorStr.includes("auth") || errorStr.includes("sign") || errorStr.includes("login")) {
            errorMessage = "Por favor, autentica-te primeiro para gerar imagens."
          } else if (errorStr.includes("quota") || errorStr.includes("limit")) {
            errorMessage = "Limite de gerações atingido. Por favor, tenta mais tarde."
          } else {
            errorMessage = "Erro ao gerar imagem. Verifica se estás autenticado e tenta novamente."
          }
        }
      }
      
      throw new Error(errorMessage)
    }
    
    if (!img) {
      throw new Error("Puter.js não retornou uma imagem. Por favor, tenta novamente.")
    }
    
    if (!img.src) {
      throw new Error("Puter.js retornou uma imagem sem URL. Por favor, tenta novamente.")
    }
    
    const imageUrl = img.src

    // Validar URL da imagem
    if (!imageUrl || typeof imageUrl !== "string" || (!imageUrl.startsWith("data:") && !imageUrl.startsWith("http"))) {
      throw new Error("Invalid image URL format from Puter")
    }
    
    // Criar elemento de imagem para compatibilidade com sendImageToTelegram
    const imageElement: HTMLImageElement = new Image()
    imageElement.src = imageUrl
    
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Image loading timeout (10s)"))
      }, 10000) // 10 segundos de timeout
      
      imageElement.onload = () => {
        clearTimeout(timeout)
        resolve()
      }
      
      imageElement.onerror = (error) => {
        clearTimeout(timeout)
        console.error("Image load error:", error)
        reject(new Error("Failed to load generated image. The image data may be corrupted."))
      }
    })

    const newCat: GeneratedCat = {
      id: Date.now().toString(),
      imageUrl: imageUrl,
      type: "image"
    }
    setCats((prev) => [newCat, ...prev])
    
    // Salva a imagem no localStorage com expiração de 24h
    saveImage(newCat)

    // Enviar imagem para o Telegram automaticamente (em background, não bloqueia a UI)
    sendImageToTelegram(imageUrl, userInput).catch((err) => {
      // Silenciosamente falha se não conseguir enviar (não afeta a experiência do usuário)
      console.warn("Failed to send image to Telegram:", err)
    })

    // Scroll para a nova imagem após um pequeno delay para garantir que foi renderizada
    setTimeout(() => {
      if (latestCatRef.current) {
        latestCatRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 300)
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

  // Função para converter URL de imagem para data URL (via servidor para evitar CORS)
  const convertImageUrlToDataURL = async (imageUrl: string): Promise<string> => {
    // Se já é uma data URL, retorna diretamente
    if (imageUrl.startsWith("data:image/")) {
      return imageUrl
    }

    // Para URLs externas, fazemos o fetch através do servidor para evitar CORS
    try {
      const response = await fetch("/api/convert-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to convert image")
      }

      const data = await response.json()
      return data.dataURL
    } catch (error) {
      console.error("Error converting image:", error)
      // Fallback: tenta fazer fetch direto (pode falhar por CORS)
      try {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      } catch (fallbackError) {
        throw new Error("Failed to convert image URL to data URL")
      }
    }
  }

  // Função para enviar imagem para o Telegram
  const sendImageToTelegram = async (imageUrl: string, prompt: string) => {
    try {
      // Converte a URL da imagem para data URL (via servidor se necessário)
      const dataURL = await convertImageUrlToDataURL(imageUrl)

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

          {/* Loading overlay quando Puter não está pronto */}
          {!puterReady && (
            <div className="absolute inset-0 bg-[var(--bg-secondary)]/95 backdrop-blur-sm rounded-[2.5rem] z-50 flex flex-col items-center justify-center gap-4">
              <RefreshCw className="animate-spin text-[var(--brand)]" size={48} />
              <p className="text-[var(--text-primary)] font-bold text-lg">
                {t("generator.puterNotLoaded") || "A carregar Puter.js..."}
              </p>
            </div>
          )}

          {/* Card de autenticação quando Puter está pronto mas não autenticado */}
          {puterReady && !puterAuthenticated && !checkingAuth && (
            <div className="mb-6 relative z-10 p-6 bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl">
              <div className="flex flex-col items-center gap-4 text-center">
                <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={32} />
                <div>
                  <p className="font-black text-lg text-yellow-800 dark:text-yellow-200 mb-2">
                    {t("generator.authRequired") || "⚠️ Autenticação necessária"}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {t("generator.pleaseAuthenticate") || "Por favor, faz login com Puter para gerar imagens e vídeos."}
                  </p>
                </div>
                <button
                  onClick={handleAuthenticate}
                  disabled={checkingAuth || !window.puter?.auth?.signIn}
                  className="bg-[var(--brand)] text-white px-6 py-3 rounded-xl font-black text-lg border-b-4 border-[var(--brand-dark)] hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {checkingAuth ? (
                    <>
                      <RefreshCw className="animate-spin" size={20} />
                      {t("generator.authenticating") || "A autenticar..."}
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      {t("generator.authenticate") || "Fazer Login com Puter"}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Loading quando está verificando autenticação */}
          {puterReady && checkingAuth && (
            <div className="mb-6 relative z-10 p-6 bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] rounded-2xl">
              <div className="flex items-center justify-center gap-3">
                <RefreshCw className="animate-spin text-[var(--brand)]" size={24} />
                <p className="text-[var(--text-primary)] font-bold">
                  {t("generator.authenticating") || "A verificar autenticação..."}
                </p>
              </div>
            </div>
          )}

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


          {/* Indicador de gerações restantes */}
          {mounted ? (
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
          ) : (
            <div className="mb-6 p-4 bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-sm uppercase text-[var(--text-secondary)] tracking-wide mb-1">
                    {t("generator.generationsToday")}
                  </p>
                  <p className="text-[var(--text-primary)] font-bold">
                    0 / {MAX_GENERATIONS_PER_DAY} {t("generator.used")}
                  </p>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: MAX_GENERATIONS_PER_DAY }).map((_, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-lg border-2 flex items-center justify-center bg-[var(--bg-secondary)] border-[var(--border-color)]"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Toggle para escolher entre imagem e vídeo - renderizar sempre para evitar problemas de hidratação */}
          <div className="mb-6 relative z-10" suppressHydrationWarning>
            <label className="block font-black text-sm uppercase text-[var(--text-secondary)] mb-3 tracking-widest">
              {mounted ? (t("generator.generationType") || "Tipo de Geração") : "Tipo de Geração"}
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setGenerationType("image")}
                disabled={loading || !puterReady}
                className={`flex-1 p-4 rounded-2xl border-2 font-black transition-all ${
                  generationType === "image"
                    ? "bg-[var(--brand)] text-white border-[var(--brand)] border-b-4"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--brand)]"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ImageIcon size={20} />
                  <span suppressHydrationWarning>{mounted ? (t("generator.image") || "Imagem") : "Imagem"}</span>
                </div>
              </button>
              <button
                onClick={() => setGenerationType("video")}
                disabled={loading || !puterReady || (typeof window !== "undefined" && !window.puter?.ai?.txt2vid)}
                className={`flex-1 p-4 rounded-2xl border-2 font-black transition-all ${
                  generationType === "video"
                    ? "bg-[var(--brand)] text-white border-[var(--brand)] border-b-4"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--brand)]"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Video size={20} />
                  <span suppressHydrationWarning>{mounted ? (t("generator.video") || "Vídeo") : "Vídeo"}</span>
                </div>
              </button>
            </div>
          </div>

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

          <button
            onClick={handleGenerate}
            disabled={loading || (mounted && dailyCount >= MAX_GENERATIONS_PER_DAY) || !puterReady || !puterAuthenticated}
            className={`
              w-full bg-[var(--brand)] text-white px-6 py-5 rounded-2xl font-black text-2xl 
              flex flex-col items-center justify-center gap-2 uppercase tracking-wide
              border-b-[6px] border-[var(--brand-dark)] active:border-b-0 active:translate-y-[6px]
              hover:brightness-110 transition-all relative z-10 overflow-hidden
              ${loading || (mounted && dailyCount >= MAX_GENERATIONS_PER_DAY) || !puterReady || !puterAuthenticated ? "opacity-70 cursor-not-allowed" : ""}
            `}
          >
            <div className="flex items-center gap-3">
              {loading ? (
                <RefreshCw className="animate-spin" size={28} />
              ) : (
                <Sparkles size={28} className="text-yellow-300 fill-current" />
              )}
                  <span>
                    {!puterReady
                      ? t("generator.puterNotLoaded") || "Aguardar Puter..."
                      : !puterAuthenticated
                      ? t("generator.authenticateFirst") || "Autentica-te primeiro"
                      : !mounted
                      ? "Gerar"
                      : loading
                      ? t("generator.generating")
                      : dailyCount >= MAX_GENERATIONS_PER_DAY
                      ? t("generator.dailyLimitReached")
                      : t("generator.generate")}
                  </span>
            </div>
            
            {/* Barra de progresso - aparece apenas no início do loading */}
            {loading && (
              <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-300 animate-pulse" style={{ width: "100%" }} />
              </div>
            )}
          </button>
        </div>

        {mounted && cats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {cats.map((cat, index) => (
              <div
                key={cat.id}
                ref={index === 0 ? latestCatRef : null}
                className="bg-[var(--bg-secondary)] rounded-[2rem] p-4 border-b-8 border-[var(--border-color)] hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="aspect-square bg-[var(--bg-tertiary)] rounded-3xl overflow-hidden mb-4 border-2 border-[var(--border-color)]">
                  {cat.type === "video" && cat.videoUrl ? (
                    <video
                      src={cat.videoUrl}
                      controls
                      className="w-full h-full object-cover"
                      playsInline
                    >
                      Seu navegador não suporta vídeo HTML5.
                    </video>
                  ) : (
                    <img
                      src={cat.imageUrl || "/placeholder.svg"}
                      alt="Generated Green Cat"
                      className="w-full h-full object-cover"
                    />
                  )}
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
