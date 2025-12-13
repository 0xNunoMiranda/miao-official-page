// API Route para gerar texto com streaming de progresso usando Hugging Face
import { generateTextWithHuggingFace } from "@/lib/huggingface-text-generator"

// Configurar timeout máximo permitido pelo plano Pro do Vercel
export const maxDuration = 800 // Máximo permitido: 800 segundos (~13 minutos)

// Blocked content patterns - filtro robusto para manter apenas conversas sobre gatos e memecoins
const BLOCKED_CONTENT_PATTERNS = [
  // Conteúdo sexual e adulto
  /\b(sex|porn|nude|naked|erotic|xxx|adult|nsfw|hentai|fetish|bondage|bdsm|rape|molest|pedo|child\s*abuse|abuso\s*sexual|violacao|estupro|violencia\s*sexual)\b/i,
  // Conteúdo ofensivo e discriminatório
  /\b(nazi|hitler|kkk|white\s*power|supremac|nigger|nigga|wetback|spic|chink|gook|kike|racist|xenophob|preconceito|racismo|xenofobia|odio\s*racial)\b/i,
  // Violência e armas
  /\b(kill|murder|torture|genocide|terrorist|bomb|weapon|gun|knife|blood|gore|violence|matar|assassin|tortura)\b/i,
  // Conteúdo porco/vulgar (expansão)
  /\b(fuck|shit|damn|bitch|bastard|asshole|pussy|dick|cock|penis|vagina|boobs|tits|ass|butt|nudes|sexy\s*time|make\s*love)\b/i,
  // Conteúdo que não é sobre gatos, memecoins ou crypto
  // Não bloquear diretamente, mas vamos filtrar nas respostas através do prompt do sistema
]

function isContentBlocked(text: string): boolean {
  return BLOCKED_CONTENT_PATTERNS.some((pattern) => pattern.test(text))
}

export async function POST(request: Request) {
  try {
    let requestBody
    try {
      requestBody = await request.json()
    } catch (parseError) {
      return Response.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    const { prompt, messages, maxLength, temperature, topP, model, language } = requestBody
    
    // Suportar tanto prompt simples quanto mensagens (histórico)
    let userInput = ""
    if (messages && Array.isArray(messages) && messages.length > 0) {
      // Extrair última mensagem do usuário para validação
      const lastUserMessage = messages
        .slice()
        .reverse()
        .find((msg: any) => msg.role === "user")
      userInput = lastUserMessage?.content?.trim() || ""
    } else {
      userInput = prompt?.trim() || ""
    }

    // Check for blocked content
    if (userInput && isContentBlocked(userInput)) {
      return Response.json(
        { error: "Content blocked: inappropriate content detected" },
        { status: 400 }
      )
    }

    if (!userInput && (!messages || messages.length === 0)) {
      return Response.json({ error: "Prompt or messages cannot be empty" }, { status: 400 })
    }

    // Validate and sanitize parameters according to Hugging Face API requirements
    // Modelo econômico: respostas curtas (100 tokens ≈ 75 palavras)
    const validatedMaxLength = Math.max(16, Math.min(1000, Number(maxLength) || 100))
    const validatedTemperature = Math.max(0.0, Math.min(2.0, Number(temperature) || 0.6))
    const validatedTopP = Math.max(0.0, Math.min(1.0, Number(topP) || 0.85))
    // Modelo padrão compatível com chat completions
    const validatedModel = (model || "meta-llama/Llama-3.2-1B-Instruct").trim()

    // Validate model name - modelos compatíveis com Hugging Face Router (chat completions)
    const validModels = [
      // Modelos novos (chat completions)
      "meta-llama/Llama-3.2-1B-Instruct",
      "mistralai/Mistral-7B-Instruct-v0.2",
      "google/gemma-2b-it",
      "HuggingFaceH4/zephyr-7b-beta",
      // Modelos legados (pode não funcionar mais)
      "gpt2",
      "distilgpt2",
      "microsoft/DialoGPT-medium",
      "EleutherAI/gpt-neo-125M",
      "google/gemma-2-2b-it",
    ]
    
    if (!validModels.includes(validatedModel)) {
      console.error(`Invalid model requested: ${validatedModel}. Valid models:`, validModels)
      return Response.json(
        { error: `Invalid model: ${validatedModel}. Please use a valid model.` },
        { status: 400 }
      )
    }

    // Log parameters being used
    console.log("Text generation parameters:", {
      promptLength: userInput.length,
      maxLength: validatedMaxLength,
      temperature: validatedTemperature,
      topP: validatedTopP,
      model: validatedModel,
    })

    // Criar stream de resposta
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let streamClosed = false

        const sendProgress = (data: any) => {
          if (!streamClosed && controller.desiredSize !== null) {
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
            } catch (error) {
              console.error("Error sending progress:", error)
            }
          }
        }

        try {
          // Gerar texto com Hugging Face usando callback de progresso
          // Parâmetros otimizados para velocidade máxima
          console.log(`Starting text generation with Hugging Face${messages ? ' (with conversation history)' : ` for prompt: ${userInput.substring(0, 50)}...`}`)
          const generatedText = await generateTextWithHuggingFace(userInput, {
            messages: messages, // Passar histórico de conversa
            maxLength: validatedMaxLength,
            temperature: validatedTemperature,
            topP: validatedTopP,
            model: validatedModel,
            language: language || "en",
            onProgress: (progress) => {
              if (!streamClosed) {
                try {
                  // Verificar se o controller ainda está válido
                  if (controller.desiredSize !== null && controller.desiredSize >= 0) {
                    sendProgress({
                      type: "progress",
                      ...progress,
                    })
                  }
                } catch (progressError) {
                  console.warn("Error sending progress update:", progressError)
                }
              }
            },
          })

          console.log(`Text generation completed. Generated text length: ${generatedText?.length || 0}`)

          // Enviar resultado final ANTES de fechar o stream
          if (!streamClosed) {
            try {
              // Verificar se o texto gerado é válido
              if (!generatedText || !generatedText.trim()) {
                console.error("Generated text is empty or null")
                if (controller.desiredSize !== null && controller.desiredSize >= 0) {
                  sendProgress({
                    type: "error",
                    error: "Generated text is empty. Please try again.",
                  })
                }
              } else {
                console.log(`Sending completion message with text: ${generatedText.substring(0, 50)}...`)
                // Garantir que a mensagem é enviada
                if (controller.desiredSize !== null && controller.desiredSize >= 0) {
                  const completionMessage = {
                    type: "complete",
                    text: generatedText,
                  }
                  const message = `data: ${JSON.stringify(completionMessage)}\n\n`
                  controller.enqueue(encoder.encode(message))
                  console.log("Completion message sent successfully")
                } else {
                  console.warn("Controller desiredSize is invalid, trying to send anyway")
                  // Tentar enviar mesmo assim
                  try {
                    const completionMessage = {
                      type: "complete",
                      text: generatedText,
                    }
                    const message = `data: ${JSON.stringify(completionMessage)}\n\n`
                    controller.enqueue(encoder.encode(message))
                    console.log("Completion message sent (forced)")
                  } catch (forceError) {
                    console.error("Failed to force send completion:", forceError)
                  }
                }
              }
            } catch (sendError) {
              console.error("Error sending completion:", sendError)
              if (!streamClosed) {
                try {
                  if (controller.desiredSize !== null && controller.desiredSize >= 0) {
                    sendProgress({
                      type: "error",
                      error: "Failed to send completion message",
                    })
                  }
                } catch (errorSendError) {
                  console.error("Failed to send error message:", errorSendError)
                }
              }
            }
          } else {
            console.warn("Stream already closed, cannot send completion")
          }

          // Dar um pequeno delay antes de fechar para garantir que a mensagem foi enviada
          await new Promise(resolve => setTimeout(resolve, 100))
          
          if (!streamClosed) {
            try {
              console.log("Closing stream")
              controller.close()
              streamClosed = true
            } catch (closeError) {
              console.error("Error closing stream:", closeError)
              streamClosed = true
            }
          }
        } catch (error: any) {
          console.error("Text generation error in stream:", error)
          if (!streamClosed) {
            try {
              // Verificar se ainda podemos enviar
              if (controller.desiredSize !== null && controller.desiredSize >= 0) {
                // Parse error message to provide better feedback
                let errorMessage = error?.message || "Failed to generate text"
                
                // Check if it's a validation error from Stable Horde
                if (errorMessage.includes("Input payload validation failed") || 
                    errorMessage.includes("validation failed") ||
                    errorMessage.includes("Invalid")) {
                  errorMessage = "Invalid request parameters. Please try again with different settings."
                } else if (errorMessage.includes("503") || 
                           errorMessage.includes("Service temporarily unavailable")) {
                  errorMessage = "Service temporarily unavailable. Please try again in a moment."
                } else if (errorMessage.includes("429") || 
                           errorMessage.includes("Service is busy")) {
                  errorMessage = "Service is busy. Please try again in a moment."
                } else if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
                  errorMessage = "Request timed out. The service may be busy. Please try again later."
                } else if (errorMessage.includes("not found") || errorMessage.includes("404")) {
                  errorMessage = "Service temporarily unavailable. Please try again later."
                }
                
                sendProgress({
                  type: "error",
                  error: errorMessage,
                })
              }
            } catch (sendError) {
              console.error("Error sending error message:", sendError)
            }
            try {
              if (!streamClosed) {
                controller.close()
              }
            } catch (closeError) {
              console.error("Error closing stream:", closeError)
            }
            streamClosed = true
          }
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (error: any) {
    console.error("Text generation stream error:", error)

    return Response.json(
      {
        success: false,
        error: error?.message || "Failed to start text generation",
      },
      { status: 500 }
    )
  }
}
