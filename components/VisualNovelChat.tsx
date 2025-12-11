"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, X, Loader2, Mic, Keyboard, Play, Pause } from "lucide-react"
// Voice input component - uses Mic icon for both states (no MicOff needed)
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
  const lastSpokenMessageIdRef = useRef<string | null>(null) // Rastrear última mensagem falada
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null) // Rastrear qual mensagem está sendo reproduzida

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

  // Speech synthesis hook - passa a emoção atual para ajustar a voz
  const { speak, cancel: cancelSpeech, isSpeaking } = useSpeechSynthesis(language, currentEmotion)

  // Stop listening when TTS is speaking to prevent transcribing the cat's voice
  // REMOVED: This was causing the microphone to turn off immediately in some cases
  /*
  useEffect(() => {
    if (isSpeaking && isListening) {
      console.log("[VisualNovelChat] TTS is speaking, stopping speech recognition to avoid transcribing cat's voice");
      stopListening();
    }
  }, [isSpeaking, isListening, stopListening])
  */

  // Cancel speech when switching to voice mode
  // REMOVED: Potential conflict
  /*
  useEffect(() => {
    if (inputMode === "text" && isListening) {
      stopListening();
    } else if (inputMode === "voice") {
      cancelSpeech();
    }
  }, [inputMode, isListening, stopListening, cancelSpeech])
  */

  // NÃO reiniciar automaticamente o reconhecimento - isso causa loops
  // O usuário deve clicar no microfone para iniciar/parar manualmente
  // Removido o useEffect que reiniciava automaticamente para evitar loops

  // Sincronizar transcript com input em tempo real enquanto está ouvindo
  useEffect(() => {
    if (isListening && transcript) {
      // Atualizar o input com o transcript em tempo real
      setInput(transcript);
      // Também atualizar o ref para garantir sincronização
      if (inputRef.current) {
        inputRef.current.value = transcript;
      }
    }
  }, [transcript, isListening]);

  // Auto-speak assistant messages - APENAS UMA VEZ por mensagem
  // IMPORTANTE: Não falar se o usuário está ouvindo (tentando falar)
  // IMPORTANTE: Não falar quando apenas muda o modo, apenas quando nova mensagem é adicionada
  const previousMessagesLengthRef = useRef(0);
  useEffect(() => {
    // Só processar se realmente há uma nova mensagem (length aumentou)
    if (messages.length > previousMessagesLengthRef.current && messages.length > 0 && inputMode === "voice") {
      const lastMessage = messages[messages.length - 1]
      
      // Só falar se:
      // 1. É uma mensagem do assistente
      // 2. Não está carregando
      // 3. Usuário não está ouvindo (e não está tentando ouvir - dar mais tempo)
      // 4. É uma NOVA mensagem (não foi falada antes)
      if (
        lastMessage.role === "assistant" && 
        !loading && 
        !isListening &&
        lastMessage.id !== lastSpokenMessageIdRef.current
      ) {
        // Marcar que esta mensagem já foi falada
        lastSpokenMessageIdRef.current = lastMessage.id;
        console.log("[VisualNovelChat] Auto-speaking NEW assistant message (user not listening)");
        cancelSpeech()
        // Delay maior para garantir que o reconhecimento não está sendo iniciado
        setTimeout(() => {
          // Verificar novamente se não está ouvindo antes de falar
          if (!isListening) {
            speak(lastMessage.content, currentEmotion)
          } else {
            console.log("[VisualNovelChat] User started listening, skipping auto-speak");
          }
        }, 1000) // Aumentar delay para dar mais tempo ao usuário
      } else if (isListening) {
        console.log("[VisualNovelChat] Skipping auto-speak: user is listening (trying to speak)");
      } else if (lastMessage.id === lastSpokenMessageIdRef.current) {
        console.log("[VisualNovelChat] Skipping auto-speak: message already spoken");
      }
    }
    
    // Atualizar o comprimento anterior
    previousMessagesLengthRef.current = messages.length;
  }, [messages, inputMode, loading, speak, cancelSpeech, isListening, stopListening, currentEmotion])

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
    } else {
      // Stop listening when chat closes
      if (isListening) {
        stopListening();
      }
    }
  }, [isOpen, isListening, stopListening])

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
        zh: "你好！我是Miao，区块链上最叛逆的绿猫！🐱✨ 你想知道什么？",
        ar: "مرحباً! أنا مياو، القطة الخضراء الأكثر تمرداً في البلوك تشين! 🐱✨ ماذا تريد أن تعرف؟",
      }
      
      const welcomeContent = welcomeMessages[language] || welcomeMessages["en"]
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: welcomeContent,
        timestamp: Date.now(),
      }
      setMessages([welcomeMessage])
      // Emoção inicial para a mensagem de boas-vindas
      setCurrentEmotion("excited")
      // Falar a mensagem de boas-vindas na voz do idioma correto
      // Delay pequeno para garantir que a voz está carregada
      setTimeout(() => {
        speak(welcomeContent, "excited")
      }, 500)
    }
  }, [isOpen, messages.length, language, speak])

  // O vídeo de fundo é gerenciado pelo Hero component - não precisa fazer nada aqui

  const handleToggleVoice = () => {
    // Se já está ouvindo, parar
    if (isListening) {
      console.log("[VisualNovelChat] 🛑 Stopping voice input (toggle)");
      handleStopVoice();
      return;
    }
    
    // Don't start if TTS is speaking
    if (isSpeaking) {
      console.log("[VisualNovelChat] ⚠️ Cannot start voice input: TTS is speaking");
      return;
    }
    
    console.log("[VisualNovelChat] 🎤 Starting voice input...");
    resetTranscript();
    setInput("");
    cancelSpeech();
    
    // Start listening immediately
    startListening();
    console.log("[VisualNovelChat] ✅ Speech recognition started");
  }

  const handleStopVoice = () => {
    console.log("[VisualNovelChat] 🛑 Stopping voice input");
    stopListening();
    
    // Aguardar um pouco para garantir que o transcript final foi processado
    setTimeout(() => {
      // Capturar o transcript final e limpar espaços extras
      const finalTranscript = transcript.trim();
      if (finalTranscript) {
        setInput(finalTranscript);
        // Também atualizar o ref
        if (inputRef.current) {
          inputRef.current.value = finalTranscript;
        }
        console.log("[VisualNovelChat] ✅ Final transcript captured:", finalTranscript);
      } else {
        console.log("[VisualNovelChat] ⚠️ No transcript to capture");
      }
    }, 300); // Pequeno delay para garantir processamento final
  }

  const handleCancelVoice = () => {
    console.log("[VisualNovelChat] 🚫 Cancelling voice input");
    stopListening()
    resetTranscript()
    setInput("")
    // Focus on input after cancelling
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }

  const handleSend = async () => {
    // Obter o texto do input de múltiplas fontes para garantir que capturamos o valor correto
    const inputValue = inputRef.current?.value.trim() || input.trim();
    console.log("[VisualNovelChat] 🚀 handleSend called");
    console.log("[VisualNovelChat] 📋 Input state:", input);
    console.log("[VisualNovelChat] 📋 Input ref value:", inputRef.current?.value);
    console.log("[VisualNovelChat] 📋 Final message text:", inputValue);
    
    if (!inputValue || loading) {
      console.log("[VisualNovelChat] ⚠️ Cannot send: empty input or loading");
      return;
    }

    // Stop listening if active
    if (isListening) {
      console.log("[VisualNovelChat] 🛑 Stopping listening before send");
      stopListening();
      // Aguardar um pouco para garantir que o transcript final foi processado
      await new Promise(resolve => setTimeout(resolve, 500));
      // Atualizar inputValue com o valor mais recente
      const updatedText = inputRef.current?.value.trim() || input.trim();
      if (updatedText && updatedText !== inputValue) {
        console.log("[VisualNovelChat] 📝 Updated message text from input ref:", updatedText);
      }
    }

    const finalMessageText = inputRef.current?.value.trim() || input.trim();
    console.log("[VisualNovelChat] 📤 Sending message to MIAO:", finalMessageText);
    
    if (!finalMessageText) {
      console.error("[VisualNovelChat] ❌ ERROR: Final message text is empty!");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: finalMessageText,
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
          errorMessage = t("chat.invalidParams")
        } else if (streamError.includes("timeout") || streamError.includes("timed out")) {
          errorMessage = t("chat.timeout")
        } else if (streamError.includes("not found") || streamError.includes("404")) {
          errorMessage = t("chat.serviceUnavailable")
        }
        
        throw new Error(errorMessage)
      }

      // Verificar se recebemos texto
      if (!generatedText) {
        throw new Error(t("chat.noResponse"))
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
          speak(assistantMessage.content, detectedEmotion)
        }, 500)
      }
    } catch (error: any) {
      console.error("Chat error:", error)
      
      // Check if all API keys failed - show friendly cat message
      if (error?.message?.includes("MIAO_ALL_KEYS_FAILED") || 
          error?.message?.includes("ALL_KEYS_FAILED")) {
        const tiredMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: t("chat.tired"),
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
            speak(tiredMessage.content, "sleepy")
          }, 500)
        }
        return
      }
      
      // Don't show "Authentication failed" errors to user
      if (error?.message?.toLowerCase().includes("authentication failed") || 
          error?.message?.toLowerCase().includes("authentication required")) {
        // Silently retry or show generic error
        const genericMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: t("chat.genericError"),
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, genericMessage])
        return
      }
      
      // Mensagem de erro mais específica baseada no idioma
      let errorMessageText = t("chat.genericError")
      
      if (error?.message) {
        // Se for um erro de timeout ou conexão, usar mensagem específica
        if (error.name === "AbortError" || error.message.includes("timeout")) {
          errorMessageText = t("chat.timeout")
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessageText = t("chat.serviceUnavailable")
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

  // Função para reproduzir/pausar áudio de uma mensagem específica
  const handlePlayPauseMessage = (message: Message) => {
    if (playingMessageId === message.id && isSpeaking) {
      // Se está reproduzindo esta mensagem, pausar
      cancelSpeech()
      setPlayingMessageId(null)
    } else {
      // Se não está reproduzindo ou é outra mensagem, reproduzir
      cancelSpeech()
      setPlayingMessageId(message.id)
      
      // Detectar emoção da mensagem
      const detectedEmotion = detectEmotion(message.content)
      setCurrentEmotion(detectedEmotion)
      
      // Reproduzir após pequeno delay
      setTimeout(() => {
        speak(message.content, detectedEmotion)
      }, 100)
    }
  }

  // Atualizar playingMessageId quando a fala terminar
  useEffect(() => {
    if (!isSpeaking && playingMessageId) {
      setPlayingMessageId(null)
    }
  }, [isSpeaking, playingMessageId])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-transparent overflow-hidden">
      {/* O vídeo de fundo já está instanciado no Hero - apenas deixamos o background transparente para ele aparecer */}

      {/* Layout vertical em todas as resoluções: Chat → Gato → Input */}
      <div className="flex flex-col h-full w-full flex-1 min-h-0 relative z-10">
        {/* Chat Area - No topo - Sem background para transição suave */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative overflow-hidden bg-transparent">
          {/* Área de mensagens - Visual Novel Style com balões de conversa */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-4 lg:p-6 space-y-3 sm:space-y-4 pt-14 sm:pt-20 md:pt-6 pb-8 relative">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} w-full`}
          >
            <div
              className={
                `max-w-[90%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl transition-all duration-200 ${
                  message.role === "user"
                    ? "bg-[var(--brand)] text-white shadow-[var(--brand)]/30"
                    : "bg-[var(--bg-secondary)]/95 backdrop-blur-md text-[var(--text-primary)] border-2 border-[var(--border-color)]/80 shadow-black/20"
                }`
              }
            >
              <div className="flex items-start gap-2">
                <p className="text-xs sm:text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed flex-1">
                  {message.content}
                </p>
                {/* Botão de play/pause apenas para mensagens do assistente */}
                {message.role === "assistant" && (
                  <button
                    onClick={() => handlePlayPauseMessage(message)}
                    className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)] transition-all hover:scale-110 active:scale-95"
                    title={playingMessageId === message.id && isSpeaking ? t("chat.pause") : t("chat.play")}
                  >
                    {playingMessageId === message.id && isSpeaking ? (
                      <Pause size={12} className="sm:w-3.5 sm:h-3.5 text-[var(--text-primary)]" />
                    ) : (
                      <Play size={12} className="sm:w-3.5 sm:h-3.5 text-[var(--text-primary)]" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[var(--bg-secondary)]/95 backdrop-blur-md border-2 border-[var(--border-color)]/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-2 shadow-xl shadow-black/20">
              <Loader2 className="animate-spin" size={16} />
              <span className="text-xs sm:text-sm text-[var(--text-primary)]">
                {queueProgress && queueProgress.queuePosition === -1
                  ? t("chat.waitingWorkers")
                  : queueProgress && queueProgress.queuePosition > 0
                  ? `${t("chat.inQueue")}: ${queueProgress.queuePosition}`
                  : t("chat.thinking")}
              </span>
            </div>
          </div>
        )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Caixa do Gato - No meio, entre chat e input - Sem divisórias visíveis, por trás do input */}
        <div className="flex flex-col w-full bg-transparent flex-shrink-0 relative" style={{ zIndex: 10, margin: 0, padding: 0 }}>
          {/* Área do gato - Visual Novel: centralizado, não trespassa o topo, sem paddings/margins */}
          <div 
            className="flex items-center justify-center relative"
            style={{ 
              minHeight: "350px", 
              maxHeight: "500px",
              height: "400px",
              margin: 0,
              padding: 0,
              overflow: 'hidden', // Não trespassa o topo
              position: 'relative',
            }}
          >
            <div className="w-full h-full flex items-center justify-center relative" style={{ overflow: 'hidden', margin: 0, padding: 0 }}>
              <TamagotchiCat isChatMode={true} emotion={currentEmotion} />
            </div>
            
            {/* Label Miao - Sobreposta ao gradient bottom */}
            <div 
              className="absolute bottom-0 left-0 right-0 flex-shrink-0 pointer-events-none"
              style={{ 
                zIndex: 20,
                paddingBottom: '10px',
              }}
            >
              <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] text-center">
                {t("chat.miao")}
              </h3>
            </div>
          </div>
        </div>
        
        {/* Footer - Input area no final - Visual Novel Style - Por cima do gato */}
        <div className="flex-shrink-0 p-2 sm:p-4 bg-[var(--bg-secondary)]/95 backdrop-blur-md border-t-2 border-[var(--border-color)] shadow-[0_-4px_20px_rgba(0,0,0,0.15)] relative" style={{ zIndex: 30 }}>
            <div className="w-full max-w-full">
              {/* Mode toggle - ocultar em mobile muito pequeno */}
              {sttSupported && (
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newMode = inputMode === "text" ? "voice" : "text";
                        console.log(`[VisualNovelChat] 🔄 Changing input mode from ${inputMode} to ${newMode}`);
                        setInputMode(newMode);
                        // Se mudou para voice, cancelar qualquer fala em andamento
                        if (newMode === "voice") {
                          cancelSpeech();
                          console.log("[VisualNovelChat] 🔇 Cancelled any ongoing speech when switching to voice mode");
                        }
                      }}
                      className="text-xs px-2 sm:px-3 py-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-all flex items-center gap-1"
                    >
                      {inputMode === "text" ? (
                        <>
                          <Mic size={12} className="sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">{t("chat.voiceMode")}</span>
                        </>
                      ) : (
                        <>
                          <Keyboard size={12} className="sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">{t("chat.textMode")}</span>
                        </>
                      )}
                    </button>
                  </div>
                  {/* Mostrar erro de microfone se houver, exceto network error que pode ser transiente */}
                  {speechError && speechError !== "network" && !speechError.includes("network") && (
                    <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1">
                      {speechError}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => {
                      // Allow manual editing even in voice mode (user can correct transcription)
                      const newValue = e.target.value;
                      setInput(newValue);
                      console.log("[VisualNovelChat] Input manually changed to:", newValue);
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      inputMode === "voice"
                        ? (isListening ? t("chat.speaking") : (input.trim() ? t("chat.editOrSend") : t("chat.clickToSpeak")))
                        : t("chat.typeMessage")
                    }
                    disabled={loading}
                    readOnly={inputMode === "voice" && isListening}
                    className="w-full bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand)] disabled:opacity-50"
                  />
                  {/* Indicador visual quando há texto transcrito */}
                  {inputMode === "voice" && !isListening && input.trim() && (
                    <div className="absolute -top-6 left-0 text-xs text-[var(--brand)] bg-[var(--bg-secondary)] px-2 py-1 rounded border border-[var(--brand)]/30">
                      {t("chat.transcribed")} ✓
                    </div>
                  )}
                </div>
                
                {sttSupported && inputMode === "voice" && (
                  <button
                    onClick={handleToggleVoice}
                    disabled={loading || isSpeaking}
                    className={`${
                      isListening 
                        ? "bg-red-500 hover:bg-red-600" 
                        : "bg-[var(--brand)] hover:brightness-110"
                    } text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center`}
                    title={
                      isSpeaking 
                        ? t("chat.waitCatFinish")
                        : isListening
                        ? t("chat.stopRecording")
                        : t("chat.startRecording")
                    }
                  >
                    <Mic 
                      size={18} 
                      className={`sm:w-5 sm:h-5 ${isListening ? 'animate-pulse' : ''}`}
                      style={isListening ? { 
                        filter: 'brightness(1.5)',
                        transform: 'scale(1.1)'
                      } : undefined}
                    />
                  </button>
                )}
                
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-[var(--brand)] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 className="animate-spin sm:w-5 sm:h-5" size={18} />
                  ) : (
                    <Send className="sm:w-5 sm:h-5" size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
      </div>

      {/* Close button - floating top right */}
      <button
        onClick={onClose}
        className="fixed top-2 right-2 sm:top-4 sm:right-4 z-[55] w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-black/60 backdrop-blur-sm border-2 border-white/30 hover:bg-red-500/70 hover:border-red-500 transition-all shadow-lg"
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
