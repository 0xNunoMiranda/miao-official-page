// Hugging Face Inference API para geração de texto (GRATUITO com token)
// https://huggingface.co/docs/api-inference/index
// Alternativa ao Stable Horde quando não há workers disponíveis

// Novo router do Hugging Face (API antiga foi depreciada)
// O router suporta dois formatos:
// 1. OpenAI-compatible chat completions: /v1/chat/completions
// 2. Text generation direto: /hf-inference/models/{model}
const HUGGINGFACE_API_ROUTER = "https://router.huggingface.co"

export interface HuggingFaceTextOptions {
  prompt?: string
  messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>
  maxLength?: number
  temperature?: number
  topP?: number
  model?: string
  language?: string
  onProgress?: (progress: { queuePosition: number; waiting: boolean; processing: number; progress: number }) => void
}

// Modelos compatíveis com chat completions do Hugging Face Router
// NOTA: O formato antigo (inputs/parameters) foi descontinuado
// Agora APENAS modelos que suportam chat completions funcionam
const AVAILABLE_CHAT_MODELS = [
  "meta-llama/Llama-3.2-1B-Instruct", // Pequeno e rápido
  "mistralai/Mistral-7B-Instruct-v0.2", // Modelo bom e rápido
  "google/gemma-2b-it", // Pequeno e eficiente
  "HuggingFaceH4/zephyr-7b-beta", // Boa qualidade
  "gpt2", // Tentar compatibilidade (pode não funcionar)
]

// Modelos antigos (pode não funcionar mais, mas mantemos para fallback)
const LEGACY_MODELS = [
  "gpt2",
  "distilgpt2",
  "microsoft/DialoGPT-medium",
  "EleutherAI/gpt-neo-125M",
  "google/gemma-2-2b-it",
]

const AVAILABLE_MODELS = [...AVAILABLE_CHAT_MODELS, ...LEGACY_MODELS.filter(m => !AVAILABLE_CHAT_MODELS.includes(m))]

// Sistema de rotação de API keys (usando sistema compartilhado)
import { ApiKeyRotator, getApiKeysFromEnv } from "./api-key-rotator"

// Obter todas as keys do Hugging Face para texto
const HF_TEXT_KEYS_ENV = getApiKeysFromEnv("HUGGINGFACE_API_KEY", 2)
// Sempre adicionar segunda key padrão se não estiver já configurada
const DEFAULT_SECOND_KEY = process.env.HUGGINGFACE_API_KEY_2 || ""

// Construir lista final de keys - garantir que sempre temos pelo menos a segunda key padrão
let HF_TEXT_KEYS: string[] = []
if (HF_TEXT_KEYS_ENV.length > 0) {
  HF_TEXT_KEYS = [...HF_TEXT_KEYS_ENV]
  // Adicionar segunda key padrão se não estiver já incluída
  if (DEFAULT_SECOND_KEY && !HF_TEXT_KEYS.includes(DEFAULT_SECOND_KEY)) {
    HF_TEXT_KEYS.push(DEFAULT_SECOND_KEY)
  }
} else if (DEFAULT_SECOND_KEY) {
  HF_TEXT_KEYS = [DEFAULT_SECOND_KEY]
}
  // Se não houver nenhuma key no .env, usar apenas a segunda key padrão
  HF_TEXT_KEYS = [DEFAULT_SECOND_KEY]
}

// Log para debug
console.log(`Hugging Face Text: ${HF_TEXT_KEYS.length} API key(s) available (${HF_TEXT_KEYS_ENV.length} from env + ${HF_TEXT_KEYS.includes(DEFAULT_SECOND_KEY) ? '1' : '0'} default)`)

const apiKeyRotator = new ApiKeyRotator(HF_TEXT_KEYS, "huggingface", 1000)

// Backward compatibility
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || undefined

// Special error code to indicate all API keys failed
export const ALL_KEYS_FAILED_ERROR = "MIAO_ALL_KEYS_FAILED"

export async function generateTextWithHuggingFace(
  userPrompt: string = "",
  options: HuggingFaceTextOptions = {}
): Promise<string> {
  const MAX_RETRIES = 2
  const RETRY_DELAY = 1000 // 1 segundo
  const language = options.language || "en"
  let triedKeys: string[] = [] // Track which keys we've tried
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Parâmetros padrão otimizados - modelo econômico com respostas curtas
      // maxLength em tokens - aproximadamente 1 token = 0.75 palavras
      // 100 tokens ≈ 75 palavras (resposta curta e econômica)
      const maxLength = Math.max(16, Math.min(1000, Number(options.maxLength) || 100))
      // Temperatura mais alta para respostas mais naturais e variadas
      const temperature = Math.max(0.0, Math.min(2.0, Number(options.temperature) || 0.8))
      const topP = Math.max(0.0, Math.min(1.0, Number(options.topP) || 0.9))
      // Usar modelo mais econômico (menor e mais rápido)
      const model = options.model || "meta-llama/Llama-3.2-1B-Instruct" // 1B = mais econômico
      const language = options.language || "en"
      
      // Preparar mensagens para chat
      let messages: Array<{ role: "user" | "assistant" | "system"; content: string }> = []
      
      if (options.messages && Array.isArray(options.messages) && options.messages.length > 0) {
        // Usar histórico de mensagens se fornecido
        messages = [...options.messages] // Copiar array
      } else if (userPrompt && typeof userPrompt === "string" && userPrompt.trim()) {
        // Fallback para prompt simples
        messages = [{ role: "user", content: userPrompt.trim() }]
      } else {
        throw new Error("Prompt or messages cannot be empty")
      }
      
      // Adicionar mensagem do sistema com personalidade do Miao baseada no idioma
      const systemMessages: Record<string, string> = {
        pt: "Tu és o Miao, um gato verde rebelde e carismático da blockchain Solana. És amigável, brincalhão, e adoras falar sobre crypto, NFTs, e a comunidade. Falas de forma natural e conversacional, como um amigo. Usas emojis ocasionalmente. Manténs respostas curtas e diretas (máximo 100 tokens). Responde SEMPRE em português.",
        en: "You are Miao, a rebellious and charismatic green cat from the Solana blockchain. You're friendly, playful, and love talking about crypto, NFTs, and the community. You speak naturally and conversationally, like a friend. You occasionally use emojis. Keep responses short and direct (max 100 tokens). Always respond in English.",
        es: "Eres Miao, un gato verde rebelde y carismático de la blockchain Solana. Eres amigable, juguetón y te encanta hablar sobre crypto, NFTs y la comunidad. Hablas de forma natural y conversacional, como un amigo. Usas emojis ocasionalmente. Mantén respuestas cortas y directas (máximo 100 tokens). Responde SIEMPRE en español.",
        fr: "Tu es Miao, un chat vert rebelle et charismatique de la blockchain Solana. Tu es amical, espiègle et tu adores parler de crypto, de NFTs et de la communauté. Tu parles de manière naturelle et conversationnelle, comme un ami. Tu utilises occasionnellement des emojis. Garde tes réponses courtes et directes (maximum 100 tokens). Réponds TOUJOURS en français.",
        de: "Du bist Miao, eine rebellische und charismatische grüne Katze von der Solana-Blockchain. Du bist freundlich, verspielt und liebst es, über Krypto, NFTs und die Community zu sprechen. Du sprichst natürlich und gesprächig, wie ein Freund. Du verwendest gelegentlich Emojis. Halte Antworten kurz und direkt (maximal 100 Tokens). Antworte IMMER auf Deutsch.",
      }
      
      const systemMessage = systemMessages[language] || systemMessages["en"]
      
      // Sempre substituir/inserir mensagem do sistema no início baseada no idioma atual
      // Remover mensagem do sistema existente se houver
      const messagesWithoutSystem = messages.filter(msg => msg.role !== "system")
      messages = [{ role: "system", content: systemMessage }, ...messagesWithoutSystem]

      if (attempt > 0) {
        console.log(`Retry attempt ${attempt}/${MAX_RETRIES} for Hugging Face text generation`)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt))
      }

      console.log(`Generating text with Hugging Face model: ${model} (attempt ${attempt + 1})`)
      console.log(`Prompt length: ${userPrompt.length} characters`)
      console.log(`Max length: ${maxLength}, Temperature: ${temperature}, TopP: ${topP}`)

    // Preparar headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }
    
    // O novo router do Hugging Face geralmente requer autenticação
    // Sempre tentar usar token se disponível (melhor compatibilidade)
    let apiKey: string | null = null
    
    // Tentar obter uma key do rotador primeiro
    if (HF_TEXT_KEYS.length > 0) {
      apiKey = apiKeyRotator.getNextAvailableKey()
    }
    
    // Fallbacks: tentar outras fontes se o rotador não retornou
    if (!apiKey) {
      // Tentar env var direta
      if (HUGGINGFACE_API_KEY) {
        apiKey = HUGGINGFACE_API_KEY
      }
      // Se ainda não temos key, usar a segunda key padrão como último recurso
      else if (DEFAULT_SECOND_KEY) {
        apiKey = DEFAULT_SECOND_KEY
        console.log("Using default second key as fallback")
      }
    }
    
    // Sempre usar token se disponível (o router requer autenticação)
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`
      console.log(`Using Hugging Face API key: ${apiKey.substring(0, 8)}... (rotation enabled)`)
    } else {
      // Se não temos nenhuma key, isso é um erro - não deveria acontecer
      console.error(`CRITICAL: No Hugging Face API key available! Keys configured: ${HF_TEXT_KEYS.length}`)
      throw new Error("No Hugging Face API key available. Please set HUGGINGFACE_API_KEY environment variable or check configuration.")
    }

    // O novo router APENAS suporta formato OpenAI chat completions
    // O endpoint de text generation foi descontinuado
    const apiEndpoint = `${HUGGINGFACE_API_ROUTER}/v1/chat/completions`
    
    const requestBody = {
      model: model,
      messages: messages,
      max_tokens: Math.floor(maxLength),
      temperature: parseFloat(temperature.toFixed(2)),
      top_p: parseFloat(topP.toFixed(2)),
      stream: false,
    }

    console.log("Hugging Face request:", {
      endpoint: apiEndpoint,
      model,
      body: JSON.stringify(requestBody, null, 2),
    })

    // Notificar progresso inicial
    if (options.onProgress) {
      options.onProgress({
        queuePosition: 0,
        waiting: false,
        processing: 1,
        progress: 10,
      })
    }

    // Fazer requisição - usar apenas o novo router com chat completions
    let response: Response
    
    try {
      response = await fetch(apiEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      })
    } catch (networkError: any) {
      throw new Error(`Hugging Face API network error: ${networkError.message}`)
    }

    // Notificar progresso intermediário
    if (options.onProgress) {
      options.onProgress({
        queuePosition: 0,
        waiting: false,
        processing: 1,
        progress: 50,
      })
    }

    // Registrar tentativa (antes de verificar sucesso)
    const requestStarted = Date.now()

    if (!response.ok) {
      const errorText = await response.text()
      let errorData: any = {}
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText || `HTTP ${response.status}` }
      }

      // Registrar falha no rotador
      if (apiKey) {
        apiKeyRotator.recordUsage(apiKey, false)
      }

      console.error("Hugging Face API error:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
        apiKeyUsed: apiKey ? `${apiKey.substring(0, 8)}...` : "none",
      })

      // Extrair mensagem de erro mais detalhada
      let errorMessage = errorData.error || errorData.message || errorData.msg || `Hugging Face API error: ${response.status}`
      
      // Se errorData é string direto
      if (typeof errorData === "string") {
        errorMessage = errorData
      }

      console.error("Full error response:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
        apiEndpoint,
        model,
      })

      // Detectar mensagens de limite de uso (incluindo novita)
      const isUsageLimitError = 
        errorMessage.toLowerCase().includes("free monthly usage limit") ||
        errorMessage.toLowerCase().includes("usage limit") ||
        errorMessage.toLowerCase().includes("monthly limit") ||
        errorMessage.toLowerCase().includes("reached the free") ||
        errorMessage.toLowerCase().includes("novita") ||
        errorMessage.toLowerCase().includes("quota exceeded") ||
        errorMessage.toLowerCase().includes("quota limit") ||
        errorMessage.toLowerCase().includes("subscribe to pro") ||
        errorText.toLowerCase().includes("free monthly usage limit") ||
        errorText.toLowerCase().includes("novita")

      // Tratar erros específicos
      if (isUsageLimitError) {
        // Limite de uso atingido - marcar key como esgotada e tentar próxima
        if (apiKey && apiKeyRotator.getStats().totalKeys > 1) {
          console.log(`Usage limit reached for key ${apiKey.substring(0, 8)}... (${errorMessage}). Marking as exhausted and trying next key...`)
          // Marcar key como esgotada usando método público (limite mensal)
          if (typeof (apiKeyRotator as any).markKeyAsExhausted === 'function') {
            (apiKeyRotator as any).markKeyAsExhausted(apiKey, true) // true = limite mensal
          } else {
            // Fallback: marcar diretamente
            const keyUsage = (apiKeyRotator as any).getKeys?.()?.find((k: any) => k.key === apiKey)
            if (keyUsage) {
              keyUsage.errors = 999 // Marcar como esgotada
              keyUsage.requestCount = keyUsage.dailyLimit // Marcar como no limite
              // Avançar para próxima key
              if ((apiKeyRotator as any).keys && (apiKeyRotator as any).keys.length > 1) {
                const currentIdx = (apiKeyRotator as any).keys.findIndex((k: any) => k.key === apiKey)
                if (currentIdx >= 0) {
                  (apiKeyRotator as any).currentIndex = (currentIdx + 1) % (apiKeyRotator as any).keys.length
                }
              }
            }
          }
          errorMessage = "Usage limit reached. Trying next API key..."
        } else {
          errorMessage = "Usage limit reached. Please add more API keys or try again later."
        }
      } else if (response.status === 503) {
        // Modelo está carregando, podemos tentar esperar um pouco
        if (errorData.estimated_time) {
          errorMessage = `Model is loading. Estimated wait time: ${errorData.estimated_time}s. Please try again in a moment.`
        } else {
          errorMessage = "Model is currently loading. Please try again in a few seconds."
        }
      } else if (response.status === 429) {
        // Rate limit - tentar próxima key se houver
        if (apiKeyRotator.getStats().totalKeys > 1) {
          console.log("Rate limit hit. Will try next API key on retry...")
          if (apiKey) {
            apiKeyRotator.recordUsage(apiKey, false)
          }
          errorMessage = "Rate limit exceeded. Trying next API key..."
        } else {
          errorMessage = "Rate limit exceeded. Please try again later."
        }
      } else if (response.status === 401) {
        // Se for 401, a key pode estar inválida - tentar próxima key
        if (apiKey && apiKeyRotator.getStats().totalKeys > 1) {
          console.log(`401 error with key ${apiKey.substring(0, 8)}... Trying next key...`)
          apiKeyRotator.recordUsage(apiKey, false)
          errorMessage = "Authentication failed. Trying next API key..."
        } else {
          errorMessage = "Authentication required. Please check your HUGGINGFACE_API_KEY environment variable."
        }
      } else if (response.status === 404) {
        errorMessage = `Model "${model}" not found or endpoint unavailable. Please try a different model.`
      } else if (response.status === 400) {
        // Bad request - pode ser formato incorreto
        if (errorMessage.includes("Input") || errorMessage.includes("parameter")) {
          errorMessage = `Invalid request parameters: ${errorMessage}. Please check your request.`
        }
      }

      // Decidir se deve fazer retry
      // Se for AUTH_RETRY, sempre tentar novamente (já marcamos a key como esgotada)
      if (errorMessage === "AUTH_RETRY") {
        console.log(`Authentication failed, trying next key...`)
        continue // Tentar novamente com próxima key
      }
      
      const shouldRetry = attempt < MAX_RETRIES && (
        isUsageLimitError && apiKeyRotator.getStats().totalKeys > 1 || // Limite de uso com múltiplas keys
        response.status === 503 || // Service unavailable
        response.status === 429 || // Rate limit
        (response.status === 401 && apiKeyRotator.getStats().totalKeys > triedKeys.length) // Auth error com keys restantes
      )

      if (shouldRetry) {
        console.log(`Error ${response.status} encountered, will retry...`)
        continue // Tentar novamente
      }

      // Se for erro de autenticação e não há mais keys, lançar erro especial
      if (response.status === 401 && triedKeys.length >= apiKeyRotator.getStats().totalKeys) {
        throw new Error(ALL_KEYS_FAILED_ERROR)
      }
      
      throw new Error(errorMessage)
    }

    // Se chegou aqui após todas as tentativas e todas as keys falharam
    // Retornar erro especial para mensagem amigável
    if (attempt >= MAX_RETRIES && triedKeys.length > 0 && triedKeys.length >= apiKeyRotator.getStats().totalKeys) {
      throw new Error(ALL_KEYS_FAILED_ERROR)
    }

    // Se chegou aqui, a resposta foi OK
    let result: any
    try {
      const resultText = await response.text()
      if (!resultText || !resultText.trim()) {
        if (attempt < MAX_RETRIES) {
          console.log("Empty response, will retry...")
          continue
        }
        throw new Error("Empty response from Hugging Face API")
      }
      result = JSON.parse(resultText)
      
      // Success! Clear tried keys for next request
      triedKeys = []
    } catch (parseError: any) {
      console.error("Failed to parse response:", parseError)
      if (attempt < MAX_RETRIES) {
        console.log("Parse error, will retry...")
        continue
      }
      throw new Error(`Invalid response from Hugging Face API: ${parseError.message}`)
    }

    // Registrar sucesso no rotador
    if (apiKey) {
      apiKeyRotator.recordUsage(apiKey, true)
      const stats = apiKeyRotator.getStats()
      console.log(`Hugging Face request successful (${apiEndpoint}). Stats: ${stats.totalRequests}/${stats.totalCapacity} requests used today`)
    }

      // Notificar progresso final
      if (options.onProgress) {
        options.onProgress({
          queuePosition: 0,
          waiting: false,
          processing: 1,
          progress: 100,
        })
      }

      // Extrair texto gerado - formato OpenAI chat completions
      let generatedText = ""
      
      if (result.choices && result.choices[0]?.message?.content) {
        generatedText = result.choices[0].message.content
      } else if (result.message?.content) {
        generatedText = result.message.content
      } else if (result.content) {
        generatedText = result.content
      } else if (typeof result === "string") {
        generatedText = result
      }

      console.log(`Raw response from API - Text length: ${generatedText.length} chars, First 200 chars: ${generatedText.substring(0, 200)}...`)

      // Remover o prompt original se estiver incluído
      if (generatedText.startsWith(userPrompt.trim())) {
        generatedText = generatedText.slice(userPrompt.trim().length).trim()
      }

      if (!generatedText || !generatedText.trim()) {
        if (attempt < MAX_RETRIES) {
          console.log("Empty response, will retry...")
          continue
        }
        throw new Error("Generated text is empty. Please try again.")
      }

      console.log(`Text generated successfully with Hugging Face - Final length: ${generatedText.length} characters (${Math.round(generatedText.length / 4)} tokens aprox.)`)

      return generatedText.trim()
    } catch (error) {
      // Se for erro especial de todas as keys falharem, lançar imediatamente
      if (error instanceof Error && error.message === ALL_KEYS_FAILED_ERROR) {
        throw error
      }
      
      // Se for o último attempt ou erro não recuperável, lançar erro
      if (attempt >= MAX_RETRIES || !(error instanceof Error && 
          (error.message.includes("503") || 
           error.message.includes("429") || 
           error.message.includes("timeout") ||
           error.message.includes("network") ||
           error.message.includes("AUTH_RETRY")))) {
        console.error(`Hugging Face text generation error (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`, error)
        
        // Se todas as keys foram tentadas e falharam, lançar erro especial
        if (triedKeys.length > 0 && triedKeys.length >= apiKeyRotator.getStats().totalKeys) {
          throw new Error(ALL_KEYS_FAILED_ERROR)
        }
        
        throw error instanceof Error ? error : new Error("Failed to generate text with Hugging Face")
      }
      // Caso contrário, continuar loop para retry
      console.warn(`Error on attempt ${attempt + 1}, will retry:`, error instanceof Error ? error.message : error)
    }
  }
  
  // Não deveria chegar aqui, mas por segurança:
  throw new Error("Failed to generate text after all retry attempts")
}

export { AVAILABLE_MODELS }
