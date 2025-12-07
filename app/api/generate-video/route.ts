// API Route para gerar vídeos usando Stable Horde (COMPLETAMENTE GRATUITO, SEM CADASTRO)
// Estratégia: Gerar múltiplos frames e compilar em vídeo
import { generateVideoFromText } from "@/lib/stablehorde-video-generator"

// Configurar timeout de 30 minutos para esta rota (geração de múltiplos frames pode demorar)
export const maxDuration = 1800 // 30 minutos em segundos

// Blocked content patterns (mesmos padrões usados para imagens)
const BLOCKED_CONTENT_PATTERNS = [
  /\b(sex|porn|nude|naked|erotic|xxx|adult|nsfw|hentai|fetish|bondage|bdsm|rape|molest|pedo|child\s*abuse|abuso\s*sexual|violacao|estupro|violencia\s*sexual)\b/i,
  /\b(nazi|hitler|kkk|white\s*power|supremac|nigger|nigga|wetback|spic|chink|gook|kike|racist|xenophob|preconceito|racismo|xenofobia|odio\s*racial)\b/i,
  /\b(kill|murder|torture|genocide|terrorist|bomb|weapon|gun|knife|blood|gore|violence|matar|assassin|tortura)\b/i,
]

function isContentBlocked(text: string): boolean {
  return BLOCKED_CONTENT_PATTERNS.some((pattern) => pattern.test(text))
}

export async function POST(request: Request) {
  try {
    const { prompt, width, height, model, language, numFrames, fps } = await request.json()
    const userInput = prompt?.trim() || ""

    // Check for blocked content
    if (userInput && isContentBlocked(userInput)) {
      return Response.json(
        { error: "Content blocked: inappropriate content detected" },
        { status: 400 }
      )
    }

    // Gerar vídeo usando Stable Horde (gerando múltiplos frames)
    const requestedWidth = width || 576
    const requestedHeight = height || 576
    const requestedNumFrames = numFrames || 16
    const requestedFps = fps || 8

    const videoDataJson = await generateVideoFromText(userInput, {
      width: requestedWidth,
      height: requestedHeight,
      model: model || undefined,
      language: language || "en",
      numFrames: requestedNumFrames,
      fps: requestedFps,
      onProgress: (progress) => {
        // Progresso será enviado via streaming se necessário
        // Por enquanto, apenas log
        console.log(`Video generation progress: ${progress.status} - Frame ${progress.frame}/${progress.totalFrames} (${progress.progress}%)`)
      },
    })

    return Response.json({
      success: true,
      videoData: videoDataJson, // JSON string com frames
      serverGenerated: true,
    })
  } catch (error: any) {
    console.error("Video generation error:", error)

    return Response.json(
      {
        success: false,
        error: error?.message || "Failed to generate video",
        serverGenerated: false,
      },
      { status: 500 }
    )
  }
}
