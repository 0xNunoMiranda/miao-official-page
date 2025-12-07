// Stable Horde API para geração de imagens (COMPLETAMENTE GRATUITO, SEM CADASTRO)
// https://stablehorde.net/

const STABLE_HORDE_API = "https://stablehorde.net/api/v2"

// Sistema de rotação de API keys para Stable Horde (imagens)
import { ApiKeyRotator, getApiKeysFromEnv } from "./api-key-rotator"

// Obter todas as keys do Stable Horde
const SH_IMAGE_KEYS = getApiKeysFromEnv("STABLE_HORDE_API_KEY", 2)
// Se não houver keys configuradas, usar a default
const defaultKey = "lqICemPDKR3ocs7teOaq1g"
const stableHordeImageRotator = new ApiKeyRotator(
  SH_IMAGE_KEYS.length > 0 ? SH_IMAGE_KEYS : [defaultKey],
  "stablehorde",
  10000 // Stable Horde não tem limite rígido, mas podemos usar um valor alto
)

// Backward compatibility
const STABLE_HORDE_API_KEY = process.env.STABLE_HORDE_API_KEY || defaultKey

export interface GenerateImageOptions {
  prompt?: string
  width?: number
  height?: number
  model?: string
  language?: string
  onProgress?: (progress: { queuePosition: number; waiting: boolean; processing: number; progress: number }) => void
}

// Modelos disponíveis no Stable Horde
const AVAILABLE_MODELS = [
  "stable_diffusion",
  "stable_diffusion_2.1",
  "stable_diffusion_xl",
  "Deliberate",
  "DreamShaper",
  "Realistic_Vision",
  "Anything-Diffusion",
]

export async function generateImageFromText(
  userPrompt: string = "",
  options: GenerateImageOptions = {}
): Promise<string> {
  try {
    // Construir prompt final
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
      const userInstructions = userPrompt.trim()
      finalPrompt = `[User prompt in ${languageName}]: ${userInstructions}, ${userInstructions}, green cartoon cat character with big black eyes and wide smile, bright green teal cartoon cat, solid green color, big black eyes, wide smile with sharp white teeth, green tail, ${userInstructions}, high quality, detailed, beautiful illustration, cartoon style`
    } else {
      finalPrompt = `bright green teal cartoon cat, solid green color, big black eyes, wide smile with sharp white teeth, green tail, standing confident pose with hands on hips, mischievous smile, rebellious attitude, simple cartoon illustration, white or transparent background`
    }

    // Dimensões padrão: 576x576 (limite gratuito do Stable Horde)
    // Para evitar necessidade de kudos, usar 576x576 ou menos
    const width = Math.min(options.width || 576, 576)
    const height = Math.min(options.height || 576, 576)
    
    // Modelo padrão: stable_diffusion_xl (melhor qualidade)
    const model = options.model || "stable_diffusion_xl"

    console.log(`Generating image with Stable Horde model: ${model}`)
    console.log(`Prompt length: ${finalPrompt.length} characters`)
    console.log(`Dimensions: ${width}x${height}`)

    // Usar sistema de rotação de keys
    const apiKey = stableHordeImageRotator.getNextAvailableKey() || STABLE_HORDE_API_KEY
    
    // Criar requisição de geração (async)
    const generateResponse = await fetch(`${STABLE_HORDE_API}/generate/async`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": apiKey,
        "Client-Agent": "MiaoOfficialPage:1.0:Discord", // Identificação do cliente
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        params: {
          width: width,
          height: height,
          steps: 30, // Máximo 50 steps para evitar necessidade de kudos
          cfg_scale: 7.5,
          sampler_name: "k_euler",
          n: 1, // Número de imagens
        },
        models: [model],
        nsfw: false,
        trusted_workers: false,
        censor_nsfw: true,
      }),
    })

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text()
      let errorData: any = {}
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || `HTTP ${generateResponse.status}` }
      }
      throw new Error(errorData.message || errorData.error || `Stable Horde API error: ${generateResponse.status}`)
    }

    const generateData = await generateResponse.json()
    const requestId = generateData.id

    if (!requestId) {
      throw new Error("No request ID returned from Stable Horde")
    }

    console.log(`Stable Horde request ID: ${requestId}, status: ${generateData.message || "queued"}`)

    // Polling para verificar status da geração
    // A imagem pode estar na fila, então precisamos verificar periodicamente
    let imageBase64: string | null = null
    let attempts = 0
    const maxAttempts = 1800 // Máximo de 30 minutos (1800 * 1s)
    const pollInterval = 1000 // Verificar a cada 1 segundo
    let initialQueuePosition: number | null = null

    while (attempts < maxAttempts && !imageBase64) {
      await new Promise(resolve => setTimeout(resolve, pollInterval))
      attempts++

      try {
        const statusResponse = await fetch(`${STABLE_HORDE_API}/generate/check/${requestId}`, {
          headers: {
            "Client-Agent": "MiaoOfficialPage:1.0:Discord",
          },
        })

        if (!statusResponse.ok) {
          // Se for 404, a requisição pode ter expirado ou sido cancelada
          if (statusResponse.status === 404) {
            throw new Error(`Request ${requestId} not found. It may have expired or been cancelled.`)
          }
          // Para outros erros, continuar tentando
          console.warn(`Status check failed: ${statusResponse.status}`)
          continue
        }

        const statusData = await statusResponse.json()
        
        // Verificar se está pronto
        if (statusData.done === true) {
          // Buscar a imagem gerada
          const resultResponse = await fetch(`${STABLE_HORDE_API}/generate/status/${requestId}`, {
            headers: {
              "Client-Agent": "MiaoOfficialPage:1.0:Discord",
            },
          })

          if (!resultResponse.ok) {
            throw new Error(`Failed to fetch generated image: ${resultResponse.status}`)
          }

          const resultData = await resultResponse.json()
          
          if (resultData.generations && resultData.generations.length > 0) {
            // A imagem pode vir como base64 ou como URL
            const generation = resultData.generations[0]
            if (generation.img) {
              imageBase64 = generation.img
            } else if (generation.url) {
              // Se for URL, fazer fetch e converter para base64
              const imgResponse = await fetch(generation.url)
              const imgBuffer = await imgResponse.arrayBuffer()
              const buffer = Buffer.from(imgBuffer)
              imageBase64 = buffer.toString("base64")
            }
            if (imageBase64) {
              // Notificar progresso final (100%)
              if (options.onProgress) {
                options.onProgress({
                  queuePosition: 0,
                  waiting: false,
                  processing: 1,
                  progress: 100,
                })
              }
              break
            }
          }
        } else if (statusData.faulted === true) {
          throw new Error("Image generation failed on Stable Horde")
        } else if (statusData.finished === undefined && statusData.done === undefined) {
          // Se não temos informações válidas, pode ser que a requisição não existe mais
          console.warn(`Invalid status data for request ${requestId}:`, statusData)
          // Continuar tentando, mas pode ser que precise ser tratado como erro
        } else {
          // Ainda processando ou na fila
          const queuePosition = statusData.queue_position || 0
          const waiting = statusData.waiting || false
          const processing = statusData.processing || 0
          
          // Guardar a posição inicial da fila
          if (initialQueuePosition === null && queuePosition > 0) {
            initialQueuePosition = queuePosition
          }
          
          // Calcular progresso baseado na posição na fila
          let progress = 0
          if (initialQueuePosition !== null && initialQueuePosition > 0) {
            // Progresso = (posição inicial - posição atual) / posição inicial * 100
            progress = Math.min(100, Math.max(0, ((initialQueuePosition - queuePosition) / initialQueuePosition) * 100))
          } else if (processing > 0) {
            // Se está processando, progresso é 95% (quase pronto)
            progress = 95
          }
          
          // Notificar progresso
          if (options.onProgress) {
            options.onProgress({
              queuePosition,
              waiting,
              processing,
              progress,
            })
          }
          
          console.log(`Queue position: ${queuePosition}, Waiting: ${waiting}, Processing: ${processing}, Progress: ${progress.toFixed(1)}%`)
        }
      } catch (pollError: any) {
        // Se for erro 404, a requisição não existe mais
        if (pollError?.message?.includes("not found") || pollError?.message?.includes("404")) {
          throw new Error(`Request ${requestId} not found. It may have expired or been cancelled. Please try again.`)
        }
        // Se for erro de stream inválido, pode ser que o cliente desconectou
        if (pollError?.code === "ERR_INVALID_STATE" || pollError?.message?.includes("Invalid state")) {
          throw new Error("Connection was interrupted. Please try again.")
        }
        console.warn(`Poll attempt ${attempts} failed:`, pollError)
        // Continuar tentando apenas se não for um erro crítico
        if (attempts > 10 && pollError?.message) {
          // Após 10 tentativas com erro, verificar se é um erro crítico
          throw new Error(`Failed to check generation status: ${pollError.message}`)
        }
      }
    }

    if (!imageBase64) {
      throw new Error(`Image generation timeout after ${maxAttempts} attempts (${maxAttempts} seconds). The request may still be processing. Please try again later.`)
    }

    // Retornar como data URI
    const imageUrl = `data:image/png;base64,${imageBase64}`
    console.log(`Image generated successfully, size: ${imageBase64.length} bytes`)

    return imageUrl
  } catch (error) {
    console.error("Stable Horde image generation error:", error)
    throw error instanceof Error ? error : new Error("Failed to generate image with Stable Horde")
  }
}
