/**
 * Helper functions for Puter.js video generation
 * Based on official Puter.js documentation: https://docs.puter.com/AI/txt2vid/
 */

export interface VideoGenerationOptions {
  model?: "sora-2" | "sora-2-pro"
  seconds?: 4 | 8 | 12
  duration?: 4 | 8 | 12
  size?: "720x1280" | "1280x720" | "1024x1792" | "1792x1024"
  resolution?: "720x1280" | "1280x720" | "1024x1792" | "1792x1024"
  input_reference?: File | Blob
  testMode?: boolean
}

/**
 * Generate a video using Puter.js txt2vid
 * @param prompt - Text description for video generation
 * @param options - Video generation options
 * @returns Promise<HTMLVideoElement> - Video element ready to be appended to DOM
 */
export async function generateVideoWithPuter(
  prompt: string,
  options: VideoGenerationOptions = {}
): Promise<HTMLVideoElement> {
  if (!window.puter) {
    throw new Error("Puter.js não está carregado. Por favor, recarrega a página.")
  }
  
  if (!window.puter.ai) {
    throw new Error("Puter.js AI não está disponível. Por favor, verifica a conexão.")
  }
  
  if (!window.puter.ai.txt2vid || typeof window.puter.ai.txt2vid !== 'function') {
    throw new Error("Função txt2vid não está disponível. Por favor, verifica a autenticação.")
  }

  const { testMode = false, ...videoOptions } = options

  try {
    let videoElement: HTMLVideoElement
    
    // Conforme documentação: txt2vid(prompt, testMode?) ou txt2vid(prompt, options?)
    // Se testMode é true e não há outras opções, passar como boolean
    // Se há opções, passar como objeto (com ou sem testMode dentro)
    if (testMode && Object.keys(videoOptions).length === 0) {
      // Apenas testMode, passar como boolean
      videoElement = await window.puter.ai.txt2vid(prompt, true)
    } else if (Object.keys(videoOptions).length > 0) {
      // Há opções, passar como objeto
      videoElement = await window.puter.ai.txt2vid(prompt, {
        ...videoOptions,
        ...(testMode ? { testMode: true } : {})
      })
    } else {
      // Sem opções e sem testMode, usar padrão (false = não usar testMode)
      videoElement = await window.puter.ai.txt2vid(prompt, false)
    }
    
    if (!videoElement || !(videoElement instanceof HTMLVideoElement)) {
      throw new Error("Puter.js retornou um elemento de vídeo inválido.")
    }
    
    return videoElement
  } catch (error: any) {
    console.error("Erro ao chamar txt2vid:", error)
    
    // Melhorar mensagem de erro
    if (error instanceof Error) {
      throw new Error(error.message || "Erro ao gerar vídeo com Puter.js. Verifica se estás autenticado.")
    } else if (typeof error === "string") {
      throw new Error(error)
    } else if (error && typeof error === "object") {
      const errorMsg = error.message || error.error || error.errorMessage || "Erro ao gerar vídeo com Puter.js."
      throw new Error(errorMsg)
    } else {
      throw new Error("Erro desconhecido ao gerar vídeo. Por favor, tenta novamente.")
    }
  }
}

/**
 * Convert HTMLVideoElement to data URL (for storage/sharing)
 * @param videoElement - The video element to convert
 * @returns Promise<string> - Data URL of the video
 */
export async function videoElementToDataURL(videoElement: HTMLVideoElement): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    canvas.width = videoElement.videoWidth || 1280
    canvas.height = videoElement.videoHeight || 720
    const ctx = canvas.getContext("2d")
    
    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    // Desenhar frame atual do vídeo no canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
    
    // Converter para data URL (thumbnail do vídeo)
    const dataURL = canvas.toDataURL("image/png")
    resolve(dataURL)
  })
}

/**
 * Get video URL from HTMLVideoElement
 * @param videoElement - The video element
 * @returns string - Video source URL
 */
export function getVideoURL(videoElement: HTMLVideoElement): string {
  return videoElement.src || videoElement.currentSrc || ""
}
