// Stable Horde API para geração de texto (COMPLETAMENTE GRATUITO, SEM CADASTRO)
// https://stablehorde.net/
// Mesma plataforma usada para imagens, agora para texto!
// Fallback: Hugging Face Inference API quando não há workers disponíveis

import { generateTextWithHuggingFace } from "./huggingface-text-generator"

const STABLE_HORDE_API = "https://stablehorde.net/api/v2"
// Get API key from environment variable or use provided default
const STABLE_HORDE_API_KEY = process.env.STABLE_HORDE_API_KEY || "lqICemPDKR3ocs7teOaq1g"

export interface GenerateTextOptions {
  prompt?: string
  maxLength?: number
  temperature?: number
  topP?: number
  model?: string
  onProgress?: (progress: { queuePosition: number; waiting: boolean; processing: number; progress: number }) => void
}

// Modelos de texto disponíveis no Stable Horde
// Ordenados por probabilidade de ter workers disponíveis (menores/mais comuns primeiro)
const AVAILABLE_TEXT_MODELS = [
  "gpt-neo-125M", // Menor, mais rápido, mais provável de ter workers
  "gpt-neo-1.3B",
  "gpt-neo-2.7B",
  "google/gemma-2-2b-it",
  "gpt-neo-20B",
  "Qwen/Qwen3-Coder-480B-A35B-Instruct",
  "openai/gpt-oss-120b",
]

// Modelos alternativos para tentar quando não há workers disponíveis
const FALLBACK_MODELS = [
  "gpt-neo-125M",
  "gpt-neo-1.3B", 
  "gpt-neo-2.7B",
  "google/gemma-2-2b-it",
]

export async function generateTextFromPrompt(
  userPrompt: string = "",
  options: GenerateTextOptions = {}
): Promise<string> {
  const MAX_RETRIES = 3
  const RETRY_DELAY = 2000 // 2 seconds between retries
  
  let lastError: Error | null = null
  // Default reduzido para 20 tokens (otimizado para escalabilidade)
  let currentMaxLength = options.maxLength || 20
  let currentModel = options.model || "gpt-neo-125M"
  let modelsToTry = [currentModel, ...FALLBACK_MODELS.filter(m => m !== currentModel)]
  let modelIndex = 0
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // On retry, try different models and/or reduce max_length
      let retryOptions = { ...options }
      
      if (attempt > 0) {
        // Try next model in fallback list
        if (modelIndex < modelsToTry.length - 1) {
          modelIndex++
          retryOptions.model = modelsToTry[modelIndex]
          console.log(`Retry attempt ${attempt}: Trying alternative model: ${retryOptions.model}`)
        }
        
        // Also reduce max_length if no workers error
        if (lastError?.message?.includes("No available workers") || 
            lastError?.message?.includes("not found")) {
          retryOptions.maxLength = Math.max(16, Math.floor(currentMaxLength * 0.75))
          if (retryOptions.maxLength !== currentMaxLength) {
            console.log(`Reducing max_length: ${retryOptions.maxLength} (was ${currentMaxLength})`)
            currentMaxLength = retryOptions.maxLength
          }
        }
      }
      
      return await attemptGenerateText(userPrompt, retryOptions)
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Check if error is retryable (503, 429, network errors, no workers)
      const statusCode = (error as any)?.statusCode
      const isRetryable = 
        statusCode === 503 ||
        statusCode === 429 ||
        error?.message?.includes("503") ||
        error?.message?.includes("429") ||
        error?.message?.includes("Service temporarily unavailable") ||
        error?.message?.includes("Service is busy") ||
        error?.message?.includes("No available workers") ||
        error?.message?.includes("not found") ||
        error?.message?.includes("network") ||
        error?.message?.includes("ECONNRESET") ||
        error?.message?.includes("ETIMEDOUT")
      
      if (isRetryable && attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY * (attempt + 1) // Exponential backoff
        console.log(`Retry attempt ${attempt + 1}/${MAX_RETRIES} after ${delay}ms due to: ${error?.message}`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      // Se não for retryable ou esgotamos as tentativas, tentar Hugging Face como fallback
      if (attempt >= MAX_RETRIES) {
        // Se todas as tentativas com Stable Horde falharam, tentar Hugging Face
        const shouldTryHuggingFace = 
          error?.message?.includes("No available workers") ||
          error?.message?.includes("not found") ||
          error?.message?.includes("Service temporarily unavailable") ||
          error?.message?.includes("503")
        
        if (shouldTryHuggingFace) {
          console.log("Stable Horde failed after retries. Trying Hugging Face as fallback...")
          try {
            return await generateTextWithHuggingFace(userPrompt, {
              maxLength: currentMaxLength,
              temperature: options.temperature || 0.5,
              topP: options.topP || 0.8,
              model: "gpt2", // Modelo padrão - TOTALMENTE GRATUITO, sem token necessário
              onProgress: options.onProgress,
            })
          } catch (hfError: any) {
            console.error("Hugging Face fallback also failed:", hfError)
            // Tentar com distilgpt2 como último recurso (também totalmente gratuito)
            if (hfError?.message?.includes("401") || hfError?.message?.includes("token")) {
              console.log("Trying with distilgpt2 (also free, no token)...")
              try {
                return await generateTextWithHuggingFace(userPrompt, {
                  maxLength: currentMaxLength,
                  temperature: options.temperature || 0.5,
                  topP: options.topP || 0.8,
                  model: "distilgpt2", // Versão menor, também totalmente gratuita
                  onProgress: options.onProgress,
                })
              } catch (hfError2: any) {
                console.error("Both Hugging Face models failed:", hfError2)
                throw error // Lançar erro original do Stable Horde
              }
            }
            // Se Hugging Face também falhar, lançar o erro original do Stable Horde
            throw error
          }
        }
      }
      
      // If not retryable or max retries reached, throw the error
      throw error
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError || new Error("Failed to generate text after retries")
}

async function attemptGenerateText(
  userPrompt: string = "",
  options: GenerateTextOptions = {}
): Promise<string> {
  try {
    if (!userPrompt.trim()) {
      throw new Error("Prompt cannot be empty")
    }

    // Parâmetros padrão otimizados para velocidade máxima
    // maxLength menor = mais rápido (50 tokens é suficiente para respostas curtas)
    // Garantir que os valores são números válidos conforme API Stable Horde
    // API requer: max_length (16-1024), temperature (0.0-5.0), top_p (0.0-1.0)
    const maxLength = Math.max(16, Math.min(1024, Number(options.maxLength) || 50))
    // Temperature menor = mais rápido e determinístico
    const temperature = Math.max(0.0, Math.min(5.0, Number(options.temperature) || 0.5))
    // topP menor = mais rápido
    const topP = Math.max(0.0, Math.min(1.0, Number(options.topP) || 0.8))
    // Modelo menor = muito mais rápido (125M é o mais rápido disponível)
    const model = (options.model || "gpt-neo-125M").trim() // Modelo mais leve e rápido

    console.log(`Generating text with Stable Horde model: ${model}`)
    console.log(`Prompt length: ${userPrompt.length} characters`)
    console.log(`Max length: ${maxLength}, Temperature: ${temperature}, TopP: ${topP}`)
    
    // Validar que o prompt não está vazio após trim
    if (!userPrompt.trim()) {
      throw new Error("Prompt cannot be empty after trimming")
    }

    // Preparar o body com parâmetros validados
    const trimmedPrompt = userPrompt.trim()
    
    // Garantir que max_length é um inteiro (API requer inteiro entre 16-1024)
    const maxLengthInt = Math.floor(Math.max(16, Math.min(1024, maxLength)))
    
    // Garantir que temperature está entre 0.0 e 5.0
    const validTemperature = Math.max(0.0, Math.min(5.0, Number(temperature)))
    
    // Garantir que top_p está entre 0.0 e 1.0
    const validTopP = Math.max(0.0, Math.min(1.0, Number(topP)))
    
    const requestParams = {
      n: 1,
      max_length: maxLengthInt,
      temperature: parseFloat(validTemperature.toFixed(2)), // Limitar a 2 casas decimais, manter como float
      top_p: parseFloat(validTopP.toFixed(2)), // Limitar a 2 casas decimais, manter como float
    }
    
    const requestBody = {
      prompt: trimmedPrompt,
      params: requestParams,
      models: [model],
      nsfw: false,
    }
    
    console.log("Stable Horde request body:", JSON.stringify(requestBody, null, 2))
    console.log("Validated parameters:", {
      maxLength: maxLengthInt,
      temperature: requestParams.temperature,
      topP: requestParams.top_p,
      model: model,
      promptLength: trimmedPrompt.length,
    })
    
    // Criar requisição de geração de texto
    const requestHeaders = {
      "Content-Type": "application/json",
      "apikey": STABLE_HORDE_API_KEY,
      "Client-Agent": "MiaoOfficialPage:1.0:Discord",
    }
    
    const generateResponse = await fetch(`${STABLE_HORDE_API}/generate/text/async`, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    })

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text()
      let errorData: any = {}
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || `HTTP ${generateResponse.status}` }
      }
      
      // Log detalhado do erro para debug
      console.error("Stable Horde API error:", {
        status: generateResponse.status,
        statusText: generateResponse.statusText,
        errorText,
        errorData,
        requestBody: JSON.stringify(requestBody, null, 2),
        validatedParams: {
          maxLength: maxLengthInt,
          temperature: requestParams.temperature,
          topP: requestParams.top_p,
          model: model,
        }
      })
      
      // Mensagens de erro mais específicas
      let errorMessage = errorData.message || errorData.error || errorData.msg || `Stable Horde API error: ${generateResponse.status}`
      
      // Se houver detalhes adicionais, incluí-los
      if (errorData.detail || errorData.details) {
        errorMessage += `. Details: ${errorData.detail || errorData.details}`
      }
      
      // Log completo do erro para debug
      console.error("Full error response:", {
        status: generateResponse.status,
        statusText: generateResponse.statusText,
        errorData,
        requestBody: requestBody,
        rawErrorText: errorText,
      })
      
      if (errorData.message?.includes("validation") || 
          errorData.message?.includes("Invalid") ||
          errorData.error?.includes("validation") ||
          errorData.error?.includes("Invalid") ||
          generateResponse.status === 400) {
        // Tentar extrair detalhes do erro
        const errorDetails = errorData.detail || errorData.details || errorData.message || errorData.error || "Unknown validation error"
        errorMessage = `Invalid request parameters: ${errorDetails}. Parameters used: max_length=${maxLengthInt}, temperature=${requestParams.temperature}, top_p=${requestParams.top_p}, model=${model}`
      } else if (generateResponse.status === 429) {
        errorMessage = "Service is busy. Please try again in a moment. (429)"
      } else if (generateResponse.status === 503) {
        errorMessage = "Service temporarily unavailable. Please try again later. (503)"
      }
      
      // Include status code in error for retry logic
      const errorWithStatus = new Error(errorMessage)
      ;(errorWithStatus as any).statusCode = generateResponse.status
      throw errorWithStatus
    }

    const generateData = await generateResponse.json()
    const requestId = generateData.id

    if (!requestId) {
      throw new Error("No request ID returned from Stable Horde")
    }

    const statusMessage = generateData.message || "queued"
    console.log(`Stable Horde text request ID: ${requestId}, status: ${statusMessage}`)

    // Check if there's a warning about no available workers
    const hasNoWorkersWarning = statusMessage.includes("No available workers") || 
                                statusMessage.includes("no available workers") ||
                                statusMessage.includes("expire in")
    
    if (hasNoWorkersWarning) {
      console.warn(`Warning: ${statusMessage}. The request may expire if no workers become available.`)
      // Notify progress callback about the warning
      if (options.onProgress) {
        options.onProgress({
          queuePosition: -1, // -1 indicates no workers available
          waiting: true,
          processing: 0,
          progress: 0,
        })
      }
      // Continue polling - workers may become available within 20 minutes
    }

    // Small delay before first check to allow request to be properly queued
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Polling para verificar status da geração
    // O texto pode estar na fila, então precisamos verificar periodicamente
    let generatedText: string | null = null
    let attempts = 0
    const maxAttempts = 1800 // Máximo de 30 minutos (1800 * 1s)
    const pollInterval = 1000 // Verificar a cada 1 segundo
    let initialQueuePosition: number | null = null

    while (attempts < maxAttempts && !generatedText) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval))
      attempts++

      try {
        const statusResponse = await fetch(`${STABLE_HORDE_API}/generate/text/check/${requestId}`, {
          headers: {
            "Client-Agent": "MiaoOfficialPage:1.0:Discord",
          },
        })

        if (!statusResponse.ok) {
          // Se for 404, pode ser que a requisição ainda não foi processada ou expirou
          if (statusResponse.status === 404) {
            // Se ainda estamos nos primeiros 10 segundos, pode ser que a requisição ainda não foi processada
            if (attempts < 10) {
              console.warn(`Request ${requestId} not found yet (attempt ${attempts}), waiting longer...`)
              continue
            }
            // Se já passou muito tempo e ainda está 404, provavelmente expirou ou foi cancelada
            // Mas também pode ser que não havia workers disponíveis desde o início
            throw new Error(
              `Request ${requestId} not found. ${statusMessage.includes("No available workers") 
                ? "No workers were available to process this request. Please try again later or reduce the request size." 
                : "It may have expired or been cancelled. Please try again."}`
            )
          }
          // Para outros erros, continuar tentando
          console.warn(`Status check failed: ${statusResponse.status}`)
          continue
        }

        const statusData = await statusResponse.json()

        // Verificar se está pronto
        if (statusData.done === true) {
          // Buscar o texto gerado
          const resultResponse = await fetch(`${STABLE_HORDE_API}/generate/text/status/${requestId}`, {
            headers: {
              "Client-Agent": "MiaoOfficialPage:1.0:Discord",
            },
          })

          if (!resultResponse.ok) {
            throw new Error(`Failed to fetch generated text: ${resultResponse.status}`)
          }

          const resultData = await resultResponse.json()

          if (resultData.generations && resultData.generations.length > 0) {
            const generation = resultData.generations[0]
            if (generation.text) {
              generatedText = generation.text
            }
            if (generatedText) {
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
          throw new Error("Text generation failed on Stable Horde")
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
            progress = Math.min(
              100,
              Math.max(0, ((initialQueuePosition - queuePosition) / initialQueuePosition) * 100)
            )
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
          console.log(
            `Queue position: ${queuePosition}, Waiting: ${waiting}, Processing: ${processing}, Progress: ${progress.toFixed(1)}%`
          )
        }
      } catch (pollError: any) {
        // Se for erro 404, a requisição não existe mais
        if (
          pollError?.message?.includes("not found") ||
          pollError?.message?.includes("404")
        ) {
          throw new Error(
            `Request ${requestId} not found. It may have expired or been cancelled. Please try again.`
          )
        }
        // Se for erro de stream inválido, pode ser que o cliente desconectou
        if (
          pollError?.code === "ERR_INVALID_STATE" ||
          pollError?.message?.includes("Invalid state")
        ) {
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

    if (!generatedText) {
      throw new Error(
        `Text generation timeout after ${maxAttempts} attempts (${maxAttempts} seconds). The request may still be processing. Please try again later.`
      )
    }

    console.log(`Text generated successfully, length: ${generatedText.length} characters`)

    return generatedText
  } catch (error) {
    console.error("Stable Horde text generation error:", error)
    throw error instanceof Error ? error : new Error("Failed to generate text with Stable Horde")
  }
}

export { AVAILABLE_TEXT_MODELS }
