"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, X, Loader2, Mic, Keyboard } from "lucide-react"
import TamagotchiCat from "./TamagotchiCat"
import { useLanguage } from "../lib/language-context"
import { useSpeechRecognition } from "../lib/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "../lib/hooks/use-speech-synthesis"
import { VoiceIndicator } from "./VoiceIndicator"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

interface VisualNovelChatProps {
  isOpen: boolean
  onClose: () => void
  videoRef?: React.RefObject<HTMLVideoElement | null>
}

export default function VisualNovelChat({ isOpen, onClose, videoRef }: VisualNovelChatProps) {
  const { t, language } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [queueProgress, setQueueProgress] = useState<{ queuePosition: number; progress: number } | null>(null)
  const [inputMode, setInputMode] = useState<"text" | "voice">("text")
  const [currentEmotion, setCurrentEmotion] = useState<string>("excited")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Função para detectar emoção no texto da resposta
  const detectEmotion = (text: string): string => {
    const textLower = text.toLowerCase()
    
    // Palavras-chave para cada emoção
    const emotionKeywords: { [key: string]: RegExp[] } = {
      laugh: [
        /haha|hehe|😂|😆|😄|lol|funny|engraçado|divertido|riso/g,
        /\b(laugh|chuckle|giggle)\b/g,
      ],
      happy: [
        /😊|😃|😁|feliz|alegre|happy|joy|great|awesome|incrível|maravilhoso/g,
        /\b(happy|glad|pleased|delighted|cheerful|joyful)\b/g,
      ],
      surprise: [
        /wow|uau|surpresa|surprise|incrível|amazing|wonderful/g,
        /😮|😲|🤩|omg|não acredito/g,
      ],
      sad: [
        /😢|😭|triste|sad|sorry|desculpa|desculpe|unfortunately/g,
        /\b(sad|sorry|unfortunately|regret|sorrowful)\b/g,
      ],
      mad: [
        /😠|😡|bravo|angry|mad|raiva|irritado|furioso/g,
        /\b(angry|mad|furious|annoyed|irritated)\b/g,
      ],
      sleepy: [
        /😴|sleepy|sono|cansado|tired|sleep|dormir/g,
        /\b(sleepy|tired|exhausted|drowsy)\b/g,
      ],
      excited: [
        /excited|empolgado|emocionado|😆|🎉|yay/g,
        /\b(excited|thrilled|pumped|enthusiastic)\b/g,
      ],
    }

    // Contar matches para cada emoção
    let maxMatches = 0
    let detectedEmotion = "excited" // default

    for (const [emotion, patterns] of Object.entries(emotionKeywords)) {
      let matches = 0
      for (const pattern of patterns) {
        const found = textLower.match(pattern)
        if (found) matches += found.length
      }
      if (matches > maxMatches) {
        maxMatches = matches
        detectedEmotion = emotion
      }
    }

    return detectedEmotion
  }

  // Speech recognition hook
  const {
    transcript,
    isListening,
    isSupported: sttSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError,
  } = useSpeechRecognition(language)

  // Speech synthesis hook
  const { speak, cancel: cancelSpeech, isSpeaking } = useSpeechSynthesis(language)

  // Update input when transcript changes (voice input)
  useEffect(() => {
    // Always update input when transcript changes, even if empty
    // This ensures real-time transcription display
    console.log("Transcript changed, updating input:", {
      transcript,
      transcriptLength: transcript.length,
      isListening,
      inputMode,
    });
    setInput(transcript || "");
  }, [transcript, isListening, inputMode])

  // Stop listening when TTS is speaking to prevent transcribing the cat's voice
  useEffect(() => {
    if (isSpeaking && isListening) {
      console.log("TTS is speaking, stopping speech recognition to avoid transcribing cat's voice");
      stopListening();
    }
  }, [isSpeaking, isListening, stopListening])

  // Auto-speak assistant messages
  useEffect(() => {
    if (messages.length > 0 && inputMode === "voice") {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "assistant" && !loading) {
        // Stop listening before speaking to avoid transcribing the cat's voice
        if (isListening) {
          stopListening();
        }
        cancelSpeech()
        setTimeout(() => {
          speak(lastMessage.content)
        }, 500)
      }
    }
  }, [messages, inputMode, loading, speak, cancelSpeech, isListening, stopListening])

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [messages, loading])

  // Desabilitar scroll no body quando chat está aberto
  useEffect(() => {
    if (isOpen) {
      // Guardar o valor original do overflow
      const originalOverflow = document.body.style.overflow
      const originalPaddingRight = document.body.style.paddingRight
      
      // Desabilitar scroll
      document.body.style.overflow = 'hidden'
      
      return () => {
        // Restaurar scroll quando chat fecha
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = originalPaddingRight
      }
    }
  }, [isOpen])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Add welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessages: Record<string, string> = {
        pt: "Olá! Sou o Miao, o gato verde mais rebelde da blockchain! 🐱✨ O que queres saber?",
        en: "Hello! I'm Miao, the most rebellious green cat on the blockchain! 🐱✨ What would you like to know?",
        es: "¡Hola! Soy Miao, el gato verde más rebelde de la blockchain! 🐱✨ ¿Qué quieres saber?",
        fr: "Salut! Je suis Miao, le chat vert le plus rebelle de la blockchain! 🐱✨ Que veux-tu savoir?",
        de: "Hallo! Ich bin Miao, die rebellischste grüne Katze der Blockchain! 🐱✨ Was möchtest du wissen?",
      }
      
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: welcomeMessages[language] || welcomeMessages["en"],
        timestamp: Date.now(),
      }
      setMessages([welcomeMessage])
      // Emoção inicial para a mensagem de boas-vindas
      setCurrentEmotion("excited")
    }
  }, [isOpen, messages.length, language])

  const handleStartVoice = () => {
    // Don't start if TTS is speaking
    if (isSpeaking) {
      console.log("Cannot start voice input: TTS is speaking");
      return;
    }
    
    console.log("Starting voice input...");
    resetTranscript();
    setInput(""); // Clear input field
    startListening();
  }

  const handleStopVoice = () => {
    stopListening()
    // Send the transcript if there's text
    if (transcript.trim()) {
      handleSend()
    }
  }

  const handleCancelVoice = () => {
    stopListening()
    resetTranscript()
    setInput("")
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    // Stop listening if active
    if (isListening) {
      stopListening()
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    resetTranscript()
    setLoading(true)
    setQueueProgress(null)

    try {
      // Usar API com streaming para receber atualizações de progresso
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1800000) // 30 minutos timeout

      // Preparar histórico de conversa (últimas 10 mensagens para contexto)
      const conversationHistory = messages
        .slice(-10) // Últimas 10 mensagens
        .map(msg => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        }))
      
      // Adicionar a nova mensagem do usuário
      const conversationMessages = [
        ...conversationHistory,
        { role: "user" as const, content: userMessage.content },
      ]

      const response = await fetch("/api/generate-text-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: conversationMessages, // Enviar histórico completo
          maxLength: 100, // Modelo econômico - respostas curtas (~75 palavras)
          temperature: 0.8, // Mais alto para respostas mais naturais
          topP: 0.9,
          model: "meta-llama/Llama-3.2-1B-Instruct", // Modelo Hugging Face (chat completions)
          language: language,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = "Failed to generate text"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      // Ler stream de eventos
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      if (!reader) {
        throw new Error("No response stream available")
      }

      let generatedText: string | null = null
      let streamError: string | null = null
      let hasReceivedData = false

      try {
        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            console.log("Stream ended. Generated text:", generatedText ? "received" : "not received")
            break
          }

          hasReceivedData = true
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.trim() && line.startsWith("data: ")) {
              try {
                const jsonStr = line.slice(6).trim()
                if (!jsonStr) continue
                
                const data = JSON.parse(jsonStr)
                console.log("Received SSE data:", data.type, data)

                if (data.type === "progress") {
                  // Atualizar progresso da fila
                  const queuePosition = data.queuePosition || 0
                  setQueueProgress({
                    queuePosition: queuePosition,
                    progress: data.progress || 0,
                  })
                  
                  // Se queuePosition for -1, significa que não há workers disponíveis
                  if (queuePosition === -1) {
                    console.log("No workers available, request queued and waiting...")
                  }
                } else if (data.type === "complete") {
                  console.log("Received complete message, text length:", data.text?.length || 0)
                  if (data.text && typeof data.text === "string" && data.text.trim()) {
                    generatedText = data.text.trim()
                    console.log("Generated text set:", generatedText.substring(0, 50) + "...")
                  } else {
                    console.warn("Complete message received but text is empty or invalid:", data)
                    streamError = "Generated text is empty"
                  }
                } else if (data.type === "error") {
                  console.error("Error received from stream:", data.error)
                  streamError = data.error || "Text generation failed"
                }
              } catch (parseError) {
                console.warn("Failed to parse SSE data:", parseError, "Line:", line)
              }
            } else if (line.trim() && !line.startsWith("data: ")) {
              // Log non-SSE lines for debugging
              console.warn("Unexpected line format:", line.substring(0, 100))
            }
          }
        }

        // Se não recebemos nenhum dado, pode ser um problema de conexão
        if (!hasReceivedData) {
          console.error("No data received from stream")
          streamError = "No data received from server"
        }
      } catch (streamReadError: any) {
        console.error("Error reading stream:", streamReadError)
        streamError = streamReadError?.message || "Error reading response stream"
      } finally {
        try {
          reader.releaseLock()
        } catch (releaseError) {
          console.warn("Error releasing reader lock:", releaseError)
        }
      }

      // Verificar se houve erro no stream
      if (streamError) {
        // Melhorar mensagens de erro específicas
        let errorMessage = streamError
        
        if (streamError.includes("Input payload validation failed") || 
            streamError.includes("validation failed")) {
          errorMessage = language === "pt"
            ? "Parâmetros inválidos. Por favor, tenta novamente!"
            : "Invalid parameters. Please try again!"
        } else if (streamError.includes("timeout") || streamError.includes("timed out")) {
          errorMessage = language === "pt"
            ? "Tempo de espera esgotado. O serviço pode estar ocupado. Tenta novamente mais tarde!"
            : "Request timed out. The service may be busy. Please try again later!"
        } else if (streamError.includes("not found") || streamError.includes("404")) {
          errorMessage = language === "pt"
            ? "Serviço temporariamente indisponível. Tenta novamente mais tarde!"
            : "Service temporarily unavailable. Please try again later!"
        }
        
        throw new Error(errorMessage)
      }

      // Verificar se recebemos texto
      if (!generatedText) {
        throw new Error(
          language === "pt"
            ? "Não foi possível gerar uma resposta. Tenta novamente!"
            : "Could not generate a response. Please try again!"
        )
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: generatedText,
        timestamp: Date.now(),
      }

      // Detectar emoção na resposta e atualizar
      const detectedEmotion = detectEmotion(generatedText)
      console.log("Detected emotion:", detectedEmotion, "from text:", generatedText.substring(0, 100))
      setCurrentEmotion(detectedEmotion)

      setMessages((prev) => [...prev, assistantMessage])
      
      // Auto-speak if in voice mode
      if (inputMode === "voice") {
        // Stop listening before speaking to avoid transcribing the cat's voice
        if (isListening) {
          stopListening();
        }
        cancelSpeech()
        setTimeout(() => {
          speak(assistantMessage.content)
        }, 500)
      }
    } catch (error: any) {
      console.error("Chat error:", error)
      
      // Check if all API keys failed - show friendly cat message
      // Import the constant from the generator
      if (error?.message?.includes("MIAO_ALL_KEYS_FAILED") || 
          error?.message?.includes("ALL_KEYS_FAILED")) {
        const tiredMessages: Record<string, string> = {
          pt: "Miau... Estou um pouco cansado agora 😴. Tenta novamente mais tarde, sim? Preciso de descansar um bocado!",
          en: "Meow... I'm a bit tired right now 😴. Try again later, okay? I need to rest a bit!",
          es: "Miau... Estoy un poco cansado ahora 😴. ¡Inténtalo de nuevo más tarde! Necesito descansar un poco.",
          fr: "Miaou... Je suis un peu fatigué maintenant 😴. Réessaye plus tard, d'accord? J'ai besoin de me reposer un peu!",
          de: "Miau... Ich bin gerade ein bisschen müde 😴. Versuche es später noch einmal, okay? Ich muss mich ein bisschen ausruhen!",
          ar: "مياو... أنا متعب قليلاً الآن 😴. حاول مرة أخرى لاحقاً، حسناً؟ أحتاج للراحة قليلاً!",
          zh: "喵...我现在有点累了😴。稍后再试，好吗？我需要休息一下！",
        }
        
        const tiredMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: tiredMessages[language] || tiredMessages["en"],
          timestamp: Date.now(),
        }
        
        // Detectar emoção "sleepy" para a mensagem de cansado
        setCurrentEmotion("sleepy")
        setMessages((prev) => [...prev, tiredMessage])
        
        // Auto-speak if in voice mode
        if (inputMode === "voice") {
          if (isListening) {
            stopListening();
          }
          cancelSpeech()
          setTimeout(() => {
            speak(tiredMessage.content)
          }, 500)
        }
        return
      }
      
      // Don't show "Authentication failed" errors to user
      if (error?.message?.toLowerCase().includes("authentication failed") || 
          error?.message?.toLowerCase().includes("authentication required")) {
        // Silently retry or show generic error
        const genericMessages: Record<string, string> = {
          pt: "Desculpa, não consegui gerar uma resposta. Tenta novamente!",
          en: "Sorry, I couldn't generate a response. Please try again!",
          es: "Lo siento, no pude generar una respuesta. ¡Inténtalo de nuevo!",
          fr: "Désolé, je n'ai pas pu générer de réponse. Réessaye!",
          de: "Entschuldigung, ich konnte keine Antwort generieren. Versuche es bitte erneut!",
          ar: "آسف، لم أتمكن من إنشاء رد. يرجى المحاولة مرة أخرى!",
          zh: "抱歉，我无法生成回复。请重试！",
        }
        
        const genericMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: genericMessages[language] || genericMessages["en"],
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, genericMessage])
        return
      }
      
      // Mensagem de erro mais específica baseada no idioma
      const errorMessages: Record<string, Record<string, string>> = {
        pt: {
          default: "Desculpa, não consegui gerar uma resposta. Tenta novamente!",
          timeout: "O tempo de espera expirou. Por favor, tenta novamente!",
          network: "Erro de conexão. Verifica a tua ligação à internet e tenta novamente!",
        },
        en: {
          default: "Sorry, I couldn't generate a response. Please try again!",
          timeout: "Request timed out. Please try again!",
          network: "Connection error. Please check your internet connection and try again!",
        },
        es: {
          default: "Lo siento, no pude generar una respuesta. ¡Inténtalo de nuevo!",
          timeout: "Tiempo de espera agotado. ¡Por favor, inténtalo de nuevo!",
          network: "Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo!",
        },
        fr: {
          default: "Désolé, je n'ai pas pu générer de réponse. Réessaye!",
          timeout: "Temps d'attente expiré. Réessaye s'il te plaît!",
          network: "Erreur de connexion. Vérifie ta connexion internet et réessaye!",
        },
        de: {
          default: "Entschuldigung, ich konnte keine Antwort generieren. Versuche es bitte erneut!",
          timeout: "Wartezeit abgelaufen. Bitte versuche es erneut!",
          network: "Verbindungsfehler. Überprüfe deine Internetverbindung und versuche es erneut!",
        },
        ar: {
          default: "آسف، لم أتمكن من إنشاء رد. يرجى المحاولة مرة أخرى!",
          timeout: "انتهت مهلة الانتظار. يرجى المحاولة مرة أخرى!",
          network: "خطأ في الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى!",
        },
        zh: {
          default: "抱歉，我无法生成回复。请重试！",
          timeout: "请求超时。请重试！",
          network: "连接错误。请检查您的互联网连接并重试！",
        },
      }
      
      const langErrors = errorMessages[language] || errorMessages["en"]
      let errorMessageText = langErrors.default
      
      if (error?.message) {
        // Se for um erro de timeout ou conexão, usar mensagem específica
        if (error.name === "AbortError" || error.message.includes("timeout")) {
          errorMessageText = langErrors.timeout
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessageText = langErrors.network
        } else {
          // Usar a mensagem de erro específica se disponível (mas não mostrar "Authentication failed")
          if (!error.message.toLowerCase().includes("authentication")) {
            errorMessageText = error.message
          }
        }
      }
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: errorMessageText,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
      setQueueProgress(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col lg:flex-row bg-transparent">
      {/* Gato estilo Visual Novel - z-index alto para ficar acima do chat */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-visible">
        {/* Desktop: Gato à esquerda, com espaço suficiente para não cortar */}
        <div className="hidden lg:block absolute inset-0 left-0 w-[60%] xl:w-[58%] 2xl:w-[55%] h-full overflow-visible">
          <TamagotchiCat isChatMode={true} emotion={currentEmotion} />
        </div>
        
        {/* Tablet: Gato à esquerda, com espaço suficiente */}
        <div className="hidden md:block lg:hidden absolute inset-0 left-0 w-[65%] h-full overflow-visible">
          <TamagotchiCat isChatMode={true} emotion={currentEmotion} />
        </div>
        
        {/* Mobile: Gato centralizado no fundo, visível mas não interferindo */}
        <div className="block md:hidden absolute inset-0 w-full h-full overflow-hidden">
          <TamagotchiCat isChatMode={true} emotion={currentEmotion} />
        </div>
      </div>
      
      {/* Chat Area - Contorna o gato, não sobrepõe - z-index baixo para ficar atrás do gato */}
      {/* Desktop: começa bem à direita para contornar completamente o gato */}
      {/* Mobile: largura total */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-4 lg:p-6 space-y-3 sm:space-y-4 pt-14 sm:pt-20 md:pt-24 lg:pt-6 pb-20 sm:pb-32 md:pb-32 lg:pb-6 h-screen relative z-10 pointer-events-auto lg:ml-[65%] xl:ml-[62%] 2xl:ml-[58%]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} w-full`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl transition-all duration-200 ${
                message.role === "user"
                  ? "bg-[var(--brand)] text-white shadow-[var(--brand)]/30"
                  : "bg-[var(--bg-secondary)]/95 backdrop-blur-md text-[var(--text-primary)] border-2 border-[var(--border-color)]/80 shadow-black/20"
              }`}
            >
              <p className="text-xs sm:text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[var(--bg-secondary)]/95 backdrop-blur-md border-2 border-[var(--border-color)]/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-2 shadow-xl shadow-black/20">
              <Loader2 className="animate-spin" size={16} />
              <span className="text-xs sm:text-sm text-[var(--text-primary)]">
                {queueProgress && queueProgress.queuePosition === -1
                  ? language === "pt"
                    ? "A aguardar workers disponíveis..."
                    : "Waiting for available workers..."
                  : queueProgress && queueProgress.queuePosition > 0
                  ? `${language === "pt" ? "Na fila" : "In queue"}: ${queueProgress.queuePosition}`
                  : language === "pt"
                  ? "Miao está a pensar..."
                  : "Miao is thinking..."}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Gradientes de contraste - fora do scroll */}
      {/* Gradiente sutil no topo para melhor contraste (apenas mobile/tablet) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-20 bg-gradient-to-b from-[var(--bg-primary)]/70 to-transparent pointer-events-none z-40" />
      
      {/* Footer - Input area fixed at bottom - sempre largura total */}
      <div className="fixed bottom-0 left-0 right-0 p-2 sm:p-4 bg-[var(--bg-secondary)]/85 backdrop-blur-md border-t-2 border-[var(--border-color)]/50 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
        <div className="w-full max-w-full">
          {/* Mode toggle - ocultar em mobile muito pequeno */}
          {sttSupported && (
            <div className="flex flex-col gap-2 mb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInputMode(inputMode === "text" ? "voice" : "text")}
                  className="text-xs px-2 sm:px-3 py-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-all flex items-center gap-1"
                >
                  {inputMode === "text" ? (
                    <>
                      <Mic size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">{language === "pt" ? "Modo Voz" : "Voice Mode"}</span>
                    </>
                  ) : (
                    <>
                      <Keyboard size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">{language === "pt" ? "Modo Texto" : "Text Mode"}</span>
                    </>
                  )}
                </button>
              </div>
              {/* Mostrar erro de microfone se houver */}
              {speechError && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1">
                  {speechError}
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                // Allow manual editing even in voice mode (user can correct transcription)
                setInput(e.target.value);
              }}
              onKeyPress={handleKeyPress}
              placeholder={
                inputMode === "voice"
                  ? language === "pt" 
                    ? (isListening ? "A falar..." : "Clique no microfone para falar...")
                    : (isListening ? "Speaking..." : "Click microphone to speak...")
                  : language === "pt" ? "Escreve uma mensagem..." : "Type a message..."
              }
              disabled={loading}
              readOnly={inputMode === "voice" && isListening}
              className="flex-1 bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand)] disabled:opacity-50"
            />
            
            {sttSupported && inputMode === "voice" && !isListening && (
              <button
                onClick={handleStartVoice}
                disabled={loading || isSpeaking}
                className="bg-[var(--brand)] text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                title={
                  isSpeaking 
                    ? (language === "pt" ? "Aguarda o gato terminar de falar" : "Wait for cat to finish speaking")
                    : (language === "pt" ? "Iniciar gravação de voz" : "Start voice recording")
                }
              >
                <Mic size={18} className="sm:w-5 sm:h-5" />
              </button>
            )}
            
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-[var(--brand)] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} className="sm:w-5 sm:h-5" />
              ) : (
                <Send size={18} className="sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Close button - floating top right, sempre na área do chat */}
      <button
        onClick={onClose}
        className="fixed top-2 right-2 sm:top-4 sm:right-4 lg:top-4 z-[55] w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-black/60 backdrop-blur-sm border-2 border-white/30 hover:bg-red-500/70 hover:border-red-500 transition-all shadow-lg"
      >
        <X size={16} className="sm:w-5 sm:h-5 text-white" />
      </button>

      {/* Voice Indicator */}
      {sttSupported && (
        <VoiceIndicator
          isListening={isListening}
          transcript={transcript}
          onStop={handleStopVoice}
          onCancel={handleCancelVoice}
        />
      )}
    </div>
  )
}
