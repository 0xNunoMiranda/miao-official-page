// API Route para gerar imagens usando Stable Horde API (COMPLETAMENTE GRATUITO, SEM CADASTRO)
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

    // Gerar imagem usando Stable Horde (completamente gratuito, sem cadastro)
    // Limite: 576x576 e 50 steps para evitar necessidade de kudos
    const requestedWidth = width || 576
    const requestedHeight = height || 576
    const imageUrl = await generateImageFromText(userInput, {
      width: Math.min(requestedWidth, 576), // Limitar a 576x576
      height: Math.min(requestedHeight, 576),
      model: model || undefined,
      language: language || "en", // Passar a linguagem para o gerador
    })

    return Response.json({
      success: true,
      imageUrl: imageUrl,
      serverGenerated: true,
    })
  } catch (error: any) {
    console.error("Image generation error:", error)
    
    return Response.json({
      success: false,
      error: error?.message || "Failed to generate image",
      serverGenerated: false,
    }, { status: 500 })
  }
}
