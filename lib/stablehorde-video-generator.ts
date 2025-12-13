// Geração de vídeo usando Stable Horde (COMPLETAMENTE GRATUITO, SEM CADASTRO)
// Estratégia: Gerar múltiplos frames usando Stable Horde e compilar em vídeo
// https://stablehorde.net/

import { generateImageFromText } from "./stablehorde-image-generator"

export interface GenerateVideoOptions {
  prompt?: string
  width?: number
  height?: number
  model?: string
  language?: string
  numFrames?: number
  fps?: number
  onProgress?: (progress: { 
    frame: number
    totalFrames: number
    progress: number
    status: string
  }) => void
}

/**
 * Gera um vídeo a partir de texto usando Stable Horde
 * Estratégia: Gera múltiplos frames (imagens) e compila em vídeo
 */
export async function generateVideoFromText(
  userPrompt: string = "",
  options: GenerateVideoOptions = {}
): Promise<string> {
  try {
    const numFrames = options.numFrames || 16 // Número de frames do vídeo (padrão: 16)
    const fps = options.fps || 8 // Frames por segundo (padrão: 8)
    const width = Math.min(options.width || 576, 576)
    const height = Math.min(options.height || 576, 576)

    console.log(`Generating video with ${numFrames} frames at ${fps} fps`)
    console.log(`Dimensions: ${width}x${height}`)

    // Notificar progresso inicial
    if (options.onProgress) {
      options.onProgress({
        frame: 0,
        totalFrames: numFrames,
        progress: 0,
        status: "Generating frames...",
      })
    }

    // Gerar múltiplos frames com variações sutis no prompt
    const frames: string[] = []
    
    for (let i = 0; i < numFrames; i++) {
      // Adicionar variação temporal ao prompt para criar movimento
      const frameVariation = i / numFrames // 0.0 a 1.0
      const variationPrompt = userPrompt.trim() 
        ? `${userPrompt}, frame ${i + 1} of ${numFrames}, animation frame ${i + 1}, motion, dynamic, temporal variation ${frameVariation.toFixed(2)}`
        : `green cartoon cat, frame ${i + 1} of ${numFrames}, animation frame ${i + 1}, motion, dynamic, temporal variation ${frameVariation.toFixed(2)}`

      // Notificar progresso do frame atual
      if (options.onProgress) {
        options.onProgress({
          frame: i + 1,
          totalFrames: numFrames,
          progress: Math.round(((i + 1) / numFrames) * 90), // 90% para frames, 10% para compilação
          status: `Generating frame ${i + 1}/${numFrames}...`,
        })
      }

      // Gerar frame usando Stable Horde (sem onProgress para não confundir)
      const frameDataUri = await generateImageFromText(variationPrompt, {
        width,
        height,
        model: options.model,
        language: options.language,
      })

      frames.push(frameDataUri)

      // Pequeno delay entre frames para não sobrecarregar a API
      if (i < numFrames - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // 1 segundo entre frames
      }
    }

    // Notificar que está compilando o vídeo
    if (options.onProgress) {
      options.onProgress({
        frame: numFrames,
        totalFrames: numFrames,
        progress: 95,
        status: "Compiling video...",
      })
    }

    // Compilar frames em vídeo usando canvas e WebCodecs API (client-side)
    // Como estamos no servidor, vamos retornar os frames e compilar no cliente
    // Ou usar uma biblioteca server-side para compilar
    
    // Por enquanto, retornamos os frames como um array JSON
    // O cliente irá compilar usando WebCodecs ou similar
    const videoData = {
      frames,
      fps,
      width,
      height,
      numFrames,
    }

    // Notificar progresso completo
    if (options.onProgress) {
      options.onProgress({
        frame: numFrames,
        totalFrames: numFrames,
        progress: 100,
        status: "Complete",
      })
    }

    // Retornar como JSON string (será processado no cliente)
    return JSON.stringify(videoData)
  } catch (error: any) {
    console.error("Video generation error:", error)
    throw error instanceof Error ? error : new Error("Failed to generate video")
  }
}
