import { experimental_generateImage } from "ai"

export async function POST(request: Request) {
  try {
    // Verificar se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OpenAI API key is not configured" },
        { status: 503 },
      )
    }

    const { prompt } = await request.json()

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 })
    }

    const fullPrompt = `Generate an image of a green cartoon cat character. The cat must have these EXACT characteristics:
- Bright green colored body (like a mint/emerald green)
- Big round black eyes with white highlights/reflections
- Cute cartoon/comic style appearance
- Sharp white teeth showing in a happy smile
- Pink tongue visible
- Black whiskers on both sides of face
- Playful and friendly expression
- Simple clean cartoon art style

The user wants this green cat character: ${prompt}

Keep the cat's core design and green color consistent. Make it fun and vibrant.`

    const { image } = await experimental_generateImage({
      model: "openai/dall-e-3",
      prompt: fullPrompt,
      size: "1024x1024",
    })

    // Return base64 image
    return Response.json({
      success: true,
      imageUrl: `data:image/png;base64,${image.base64}`,
    })
  } catch (error) {
    console.error("Image generation error:", error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate image",
      },
      { status: 500 },
    )
  }
}
