// Hugging Face Inference API para geração de imagens (GRATUITO)
// Usando fetch direto para evitar problemas de dependência

// Reference cat: Green cartoon cat with big black eyes, wide smile with sharp teeth
// Prompt base MÍNIMO - apenas características essenciais para não sobrepor instruções do usuário
const MIAO_CAT_BASE = `bright green teal cartoon cat, solid green color, big black eyes, wide smile with sharp white teeth, green tail`

// Sistema de rotação de API keys para imagens
import { ApiKeyRotator, getApiKeysFromEnv } from "./api-key-rotator"

// Obter todas as keys do Hugging Face (para imagens e texto)
const HF_IMAGE_KEYS_ENV = getApiKeysFromEnv("HUGGINGFACE_API_KEY", 2)
// Sempre adicionar segunda key padrão se não estiver já configurada
const DEFAULT_SECOND_KEY = process.env.HUGGINGFACE_API_KEY_2 || ""
const HF_IMAGE_KEYS = HF_IMAGE_KEYS_ENV.length > 0 
  ? (DEFAULT_SECOND_KEY && !HF_IMAGE_KEYS_ENV.includes(DEFAULT_SECOND_KEY)
      ? [...HF_IMAGE_KEYS_ENV, DEFAULT_SECOND_KEY] 
      : HF_IMAGE_KEYS_ENV)
  : (DEFAULT_SECOND_KEY ? [DEFAULT_SECOND_KEY] : [])
const hfImageKeyRotator = new ApiKeyRotator(HF_IMAGE_KEYS, "huggingface", 1000)

// Backward compatibility
const token = process.env.HUGGINGFACE_TOKEN || process.env.HUGGINGFACE_API_KEY || ""

export interface GenerateImageOptions {
  prompt?: string
  width?: number
  height?: number
  model?: string
  language?: string // Código da linguagem (ex: "pt", "en", "es")
}

export async function generateImageFromText(
  userPrompt: string = "",
  options: GenerateImageOptions = {}
): Promise<string> {
  // Construir prompt final (fora do try para estar disponível no catch)
  // IMPORTANTE: Dar MÁXIMA prioridade às instruções do usuário
  const language = options.language || "en"
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
  
  let finalPrompt: string
  if (userPrompt.trim()) {
    // Estrutura: instruções do usuário REPETIDAS + descrição mínima do gato + indicação de linguagem
    // Repetir as instruções do usuário para dar mais peso
    // Adicionar a linguagem para que o modelo não descarte o prompt
    const userInstructions = userPrompt.trim()
    finalPrompt = `[User prompt in ${languageName}]: ${userInstructions}, ${userInstructions}, green cartoon cat character with big black eyes and wide smile, ${MIAO_CAT_BASE}, ${userInstructions}, high quality, detailed, beautiful illustration, cartoon style`
  } else {
    finalPrompt = `${MIAO_CAT_BASE}, standing confident pose with hands on hips, mischievous smile, rebellious attitude, simple cartoon illustration, white or transparent background`
  }

  // Usar proporções quadradas para evitar achatamento (1:1)
  // Dimensões padrão: 800x800
  const width = options.width || 800
  const height = options.height || 800
  
  // Modelo padrão: SDXL (mais estável) ou FLUX.1-dev como fallback
  // SDXL: stabilityai/stable-diffusion-xl-base-1.0 (mais estável, amplamente suportado)
  // FLUX.1-dev: black-forest-labs/FLUX.1-dev (melhor qualidade, mais rápido)
  const model = options.model || "stabilityai/stable-diffusion-xl-base-1.0"

  try {
    console.log(`Generating image with Hugging Face model: ${model}`)
    console.log(`Prompt length: ${finalPrompt.length} characters`)
    console.log(`Dimensions: ${width}x${height}`)
    console.log(`Final prompt: ${finalPrompt.substring(0, 200)}...`) // Log do início do prompt para debug

    // Chamar API do Hugging Face diretamente via fetch (novo endpoint)
    // Formato: https://router.huggingface.co/hf-inference/models/{ORGANIZATION}/{MODEL_NAME}
    const apiUrl = `https://router.huggingface.co/hf-inference/models/${model}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }
    
    // Usar sistema de rotação de keys
    let apiKey: string | null = null
    if (HF_IMAGE_KEYS.length > 0) {
      apiKey = hfImageKeyRotator.getNextAvailableKey()
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`
        console.log(`Using Hugging Face image API key: ${apiKey.substring(0, 8)}... (rotation enabled)`)
      }
    } else if (token) {
      // Fallback para token antigo
      headers["Authorization"] = `Bearer ${token}`
      apiKey = token
    }

    const requestBody = {
      inputs: finalPrompt,
      parameters: {
        negative_prompt: "ugly, blurry, low quality, text, watermark, nsfw, violence, gore, blood, weapons, nude, naked, adult content, racism, hate symbols, distorted, deformed, bad anatomy, extra limbs",
        width: width,
        height: height,
        num_inference_steps: 60, // Mais steps para melhor qualidade
        guidance_scale: 7.5, // Aumentar guidance_scale para dar mais peso ao prompt
      },
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      // Registrar falha
      if (apiKey) {
        hfImageKeyRotator.recordUsage(apiKey, false)
      }

      const errorText = await response.text()
      let errorData: any = {}
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText || `HTTP ${response.status}` }
      }
      
      // Se o modelo não estiver disponível, tentar com SDXL como fallback
      if (response.status === 503 || errorData.error?.includes("loading") || errorData.error?.includes("model")) {
        console.log("Primary model unavailable, trying SDXL fallback...")
        return await tryFallbackModel(finalPrompt, width, height, apiKey || token)
      }
      
      // Se for rate limit e temos múltiplas keys, logar para próxima tentativa
      if (response.status === 429 && HF_IMAGE_KEYS.length > 1) {
        console.log("Rate limit hit. Next request will use different API key...")
      }
      
      throw new Error(errorData.error || errorData.message || `Hugging Face API error: ${response.status} - ${errorText}`)
    }

    // Registrar sucesso
    if (apiKey) {
      hfImageKeyRotator.recordUsage(apiKey, true)
      const stats = hfImageKeyRotator.getStats()
      console.log(`Hugging Face image request successful. Stats: ${stats.totalRequests}/${stats.totalCapacity} requests used today`)
    }

    // A resposta do Hugging Face é um Blob (imagem)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString("base64")
    
    // Retornar como data URI
    const imageUrl = `data:image/png;base64,${base64}`

    console.log(`Image generated successfully, size: ${buffer.length} bytes`)

    return imageUrl
  } catch (error: any) {
    console.error("Hugging Face image generation error:", error)
    
    // Se ainda não tentou fallback, tentar agora
    if (!error?.message?.includes("Fallback")) {
      try {
        return await tryFallbackModel(finalPrompt, width, height, token)
      } catch (fallbackError) {
        console.error("Fallback model also failed:", fallbackError)
        throw new Error(`Failed to generate image: ${error?.message || "Unknown error"}. Fallback also failed: ${fallbackError instanceof Error ? fallbackError.message : "Unknown"}`)
      }
    }
    
    throw error instanceof Error ? error : new Error("Failed to generate image with Hugging Face")
  }
}

// Função auxiliar para tentar modelo fallback
async function tryFallbackModel(
  finalPrompt: string,
  width: number,
  height: number,
  apiKey: string | null
): Promise<string> {
  const fallbackModel = "black-forest-labs/FLUX.1-dev"
  console.log(`Trying fallback model: ${fallbackModel}`)
  
  const apiUrl = `https://router.huggingface.co/hf-inference/models/${fallbackModel}`
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }
  
  // Usar próxima key disponível ou a key fornecida
  let fallbackKey = apiKey
  if (!fallbackKey && HF_IMAGE_KEYS.length > 0) {
    fallbackKey = hfImageKeyRotator.getNextAvailableKey()
  }
  
  if (fallbackKey) {
    headers["Authorization"] = `Bearer ${fallbackKey}`
  }

  const requestBody = {
    inputs: finalPrompt,
    parameters: {
      negative_prompt: "ugly, blurry, low quality, text, watermark, nsfw, violence, gore, blood, weapons, nude, naked, adult content, racism, hate symbols, distorted, deformed, bad anatomy, extra limbs",
      width: width,
      height: height,
      num_inference_steps: 50,
      guidance_scale: 7.5, // Aumentar guidance_scale para dar mais peso ao prompt
    },
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Fallback model failed: ${response.status} - ${errorText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64 = buffer.toString("base64")
  const imageUrl = `data:image/png;base64,${base64}`
  
  console.log(`Image generated successfully with fallback model, size: ${buffer.length} bytes`)
  return imageUrl
}
