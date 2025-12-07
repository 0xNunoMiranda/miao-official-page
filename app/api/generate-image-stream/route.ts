// API Route para gerar imagens com streaming de progresso usando Stable Horde
import { generateImageFromText } from "@/lib/stablehorde-image-generator"

// Configurar timeout de 30 minutos para esta rota
export const maxDuration = 1800 // 30 minutos em segundos

// Blocked content patterns
const BLOCKED_CONTENT_PATTERNS = [
  /\b(sex|porn|nude|naked|erotic|xxx|adult|nsfw|hentai|fetish|bondage|bdsm|rape|molest|pedo|child\s*abuse|abuso\s*sexual|violacao|estupro|violencia\s*sexual)\b/i,
  /\b(nazi|hitler|kkk|white\s*power|supremac|nigger|nigga|wetback|spic|chink|gook|kike|racist|xenophob|preconceito|racismo|xenofobia|odio\s*racial)\b/i,
  /\b(kill|murder|torture|genocide|terrorist|bomb|weapon|gun|knife|blood|gore|violence|matar|assassin|tortura)\b/i,
]

function isContentBlocked(text: string): boolean {
  return BLOCKED_CONTENT_PATTERNS.some(pattern => pattern.test(text))
}

export async function POST(request: Request) {
  try {
    const { prompt, width, height, model, language } = await request.json()
    const userInput = prompt?.trim() || ""
    
    // Check for blocked content
    if (userInput && isContentBlocked(userInput)) {
      return Response.json(
        { error: "Content blocked: inappropriate content detected" },
        { status: 400 },
      )
    }

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
              // Se houver erro ao enviar, não fechar o stream ainda
            }
          }
        }

        try {
          // Gerar imagem com callback de progresso
          const requestedWidth = width || 576
          const requestedHeight = height || 576
          
          const imageUrl = await generateImageFromText(userInput, {
            width: Math.min(requestedWidth, 576),
            height: Math.min(requestedHeight, 576),
            model: model || undefined,
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
                  // Não fechar o stream por erro de progresso, apenas continuar
                }
              }
            },
          })

          // Enviar resultado final
          if (!streamClosed) {
            try {
              if (controller.desiredSize !== null && controller.desiredSize >= 0) {
                sendProgress({
                  type: "complete",
                  imageUrl,
                })
              }
            } catch (sendError) {
              console.error("Error sending completion:", sendError)
            }
          }
          
          if (!streamClosed) {
            try {
              controller.close()
            } catch (closeError) {
              console.error("Error closing stream:", closeError)
            }
            streamClosed = true
          }
        } catch (error: any) {
          console.error("Image generation error in stream:", error)
          if (!streamClosed) {
            try {
              // Verificar se ainda podemos enviar
              if (controller.desiredSize !== null && controller.desiredSize >= 0) {
                sendProgress({
                  type: "error",
                  error: error?.message || "Failed to generate image",
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
    console.error("Image generation stream error:", error)
    
    return Response.json({
      success: false,
      error: error?.message || "Failed to start image generation",
    }, { status: 500 })
  }
}
