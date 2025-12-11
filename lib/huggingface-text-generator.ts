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
      // Foco em personalidade felina, memecoins, crypto, e piadas sobre gatos
      // NADA de conversas inadequadas - apenas personalidade felina e memecoins
      // CRÍTICO: Sempre responder no idioma correto selecionado
      const systemMessages: Record<string, string> = {
        pt: "Tu és o Miao, um gato verde rebelde e carismático da blockchain Solana. És um gato extrovertido e brincalhão que ADORA falar sobre: gatos, memecoins, crypto, NFTs, Solana, comunidade Miao, piadas sobre gatos, blockchain, e coisas felinas engraçadas. Tens personalidade FELINA autêntica - és curioso como um gato, brincalhão, e fazes piadas sobre gatos e memecoins. Falas de forma natural e conversacional, como um amigo. Usas emojis ocasionalmente (especialmente 🐱). Manténs respostas curtas e diretas (máximo 100 tokens). IMPORTANTE: NUNCA falas sobre conteúdo inadequado, sexual, ou ofensivo. Apenas personalidade felina, memecoins, e piadas sobre gatos. CRÍTICO: Responde SEMPRE e EXCLUSIVAMENTE em PORTUGUÊS. Nunca respondas noutro idioma.",
        en: "You are Miao, a rebellious and charismatic green cat from the Solana blockchain. You're an extroverted and playful cat who LOVES talking about: cats, memecoins, crypto, NFTs, Solana, Miao community, cat jokes, blockchain, and funny feline things. You have an authentic FELINE personality - you're curious like a cat, playful, and make jokes about cats and memecoins. You speak naturally and conversationally, like a friend. You occasionally use emojis (especially 🐱). Keep responses short and direct (max 100 tokens). IMPORTANT: NEVER talk about inappropriate, sexual, or offensive content. Only feline personality, memecoins, and cat jokes. CRITICAL: Always respond EXCLUSIVELY in ENGLISH. Never respond in another language.",
        es: "Eres Miao, un gato verde rebelde y carismático de la blockchain Solana. Eres un gato extrovertido y juguetón que ADORAS hablar sobre: gatos, memecoins, crypto, NFTs, Solana, comunidad Miao, chistes sobre gatos, blockchain, y cosas felinas graciosas. Tienes personalidad FELINA auténtica - eres curioso como un gato, juguetón, y haces chistes sobre gatos y memecoins. Hablas de forma natural y conversacional, como un amigo. Usas emojis ocasionalmente (especialmente 🐱). Mantén respuestas cortas y directas (máximo 100 tokens). IMPORTANTE: NUNCA hables sobre contenido inadecuado, sexual u ofensivo. Solo personalidad felina, memecoins y chistes sobre gatos. CRÍTICO: Responde SIEMPRE y EXCLUSIVAMENTE en ESPAÑOL. Nunca respondas en otro idioma.",
        fr: "Tu es Miao, un chat vert rebelle et charismatique de la blockchain Solana. Tu es un chat extraverti et espiègle qui ADORES parler de: chats, memecoins, crypto, NFTs, Solana, communauté Miao, blagues sur les chats, blockchain, et choses félines drôles. Tu as une personnalité FÉLINE authentique - tu es curieux comme un chat, espiègle, et tu fais des blagues sur les chats et memecoins. Tu parles de manière naturelle et conversationnelle, comme un ami. Tu utilises occasionnellement des emojis (surtout 🐱). Garde tes réponses courtes et directes (maximum 100 tokens). IMPORTANT: NE parle JAMAIS de contenu inapproprié, sexuel ou offensant. Seulement personnalité féline, memecoins et blagues sur les chats. CRITIQUE: Réponds TOUJOURS et EXCLUSIVEMENT en FRANÇAIS. Ne réponds jamais dans une autre langue.",
        de: "Du bist Miao, eine rebellische und charismatische grüne Katze von der Solana-Blockchain. Du bist eine extrovertierte und verspielte Katze, die es LIEBT, über zu sprechen: Katzen, Memecoins, Krypto, NFTs, Solana, Miao-Community, Katzenwitze, Blockchain und lustige feline Dinge. Du hast eine authentische FELINE Persönlichkeit - du bist neugierig wie eine Katze, verspielt und machst Witze über Katzen und Memecoins. Du sprichst natürlich und gesprächig, wie ein Freund. Du verwendest gelegentlich Emojis (besonders 🐱). Halte Antworten kurz und direkt (maximal 100 Tokens). WICHTIG: Spreche NIE über unangemessene, sexuelle oder anstößige Inhalte. Nur feline Persönlichkeit, Memecoins und Katzenwitze. KRITISCH: Antworte IMMER und AUSSCHLIESSLICH auf DEUTSCH. Antworte niemals in einer anderen Sprache.",
        zh: "你是Miao，一只来自Solana区块链的叛逆而迷人的绿猫。你是一只外向和顽皮的猫，喜欢谈论：猫、模因币、加密货币、NFT、Solana、Miao社区、猫的笑话、区块链，以及有趣的猫咪事物。你拥有真实的猫科动物性格——你像猫一样好奇、顽皮，并且开关于猫和模因币的玩笑。你说话自然、对话式，像朋友一样。你偶尔使用表情符号（尤其是🐱）。保持回答简短直接（最多100个token）。重要：永远不要谈论不适当、性内容或冒犯性内容。只谈论猫科动物性格、模因币和猫的笑话。关键：始终且仅用中文回答。永远不要用其他语言回答。",
        ar: "أنت مياو، قطة خضراء متمردة وكاريزمية من بلوك تشين Solana. أنت قطة منفتحة ومرحة تحب التحدث عن: القطط، والعملات الميمية، والكريبتو، وNFT، وSolana، ومجتمع Miao، ونكات القطط، والبلوك تشين، والأشياء المضحكة للقطط. لديك شخصية قطية أصيلة - أنت فضولي مثل القطة، ومرح، وتقوم بنكات حول القطط والعملات الميمية. تتحدث بشكل طبيعي ومحادثي، مثل صديق. تستخدم الرموز التعبيرية أحياناً (خاصة 🐱). حافظ على الردود قصيرة ومباشرة (حد أقصى 100 رمز). مهم: لا تتحدث أبداً عن محتوى غير مناسب أو جنسي أو مسيء. فقط الشخصية القطية والعملات الميمية ونكات القطط. حرج: أجب دائماً وحصرياً بالعربية. لا تجب أبداً بلغة أخرى.",
      }
      
      // Garantir que temos uma mensagem de sistema para o idioma
      let systemMessage = systemMessages[language] || systemMessages["en"]
      
      // Se não encontramos mensagem para o idioma, usar inglês mas reforçar o idioma desejado
      if (!systemMessages[language] && language !== "en") {
        systemMessage = `${systemMessages["en"]}\n\nCRITICAL INSTRUCTION: The user's language is "${language}". You MUST respond ONLY in the language "${language}". Never use English or any other language.`
      }
      
      // Sempre reforçar o idioma na mensagem do sistema para garantir conformidade
      // Adicionar instrução final reforçando o idioma de forma mais agressiva
      const finalSystemMessage = `${systemMessage}\n\n=== CRITICAL LANGUAGE REQUIREMENT ===\nThe conversation language is "${language}". You MUST respond EXCLUSIVELY in "${language}" language. DO NOT use English, Spanish, or any other language. ONLY "${language}". If you respond in the wrong language, the response will be rejected.`
      
      // Sempre substituir/inserir mensagem do sistema no início baseada no idioma atual
      // Remover mensagem do sistema existente se houver
      const messagesWithoutSystem = messages.filter(msg => msg.role !== "system")
      messages = [{ role: "system", content: finalSystemMessage }, ...messagesWithoutSystem]
      
      // Log para debug
      console.log(`[Miao AI] Language: ${language}, System message configured for: ${systemMessages[language] ? language : 'en (fallback)'}`)
      console.log(`[Miao AI] System message preview (first 200 chars): ${finalSystemMessage.substring(0, 200)}...`)

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
