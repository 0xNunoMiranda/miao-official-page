// API Route para gerar texto usando Hugging Face API (GRATUITO)
import { generateTextWithHuggingFace } from "@/lib/huggingface-text-generator"

// Configurar timeout máximo permitido pelo plano Pro do Vercel
export const maxDuration = 800 // Máximo permitido: 800 segundos (~13 minutos)

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
    const { prompt, maxLength, temperature, topP, model } = await request.json()
    const userInput = prompt?.trim() || ""

    // Check for blocked content
    if (userInput && isContentBlocked(userInput)) {
      return Response.json(
        { error: "Content blocked: inappropriate content detected" },
        { status: 400 }
      )
    }

    if (!userInput) {
      return Response.json({ error: "Prompt cannot be empty" }, { status: 400 })
    }

    // Gerar texto usando Hugging Face (gratuito com token)
    // Parâmetros otimizados para velocidade máxima
    const generatedText = await generateTextWithHuggingFace(userInput, {
      maxLength: maxLength || 100, // Modelo econômico - respostas curtas (~75 palavras)
      temperature: temperature || 0.6,
      topP: topP || 0.85,
      model: model || "meta-llama/Llama-3.2-1B-Instruct", // Modelo padrão (chat completions)
    })

    return Response.json({
      success: true,
      text: generatedText,
      serverGenerated: true,
    })
  } catch (error: any) {
    console.error("Text generation error:", error)

    return Response.json(
      {
        success: false,
        error: error?.message || "Failed to generate text",
        serverGenerated: false,
      },
      { status: 500 }
    )
  }
}
