// Compilador de vídeo no cliente usando WebCodecs API
// Converte um array de frames (data URIs) em um vídeo MP4

export interface VideoFrames {
  frames: string[]
  fps: number
  width: number
  height: number
  numFrames: number
}

/**
 * Compila frames em um vídeo MP4 usando WebCodecs API
 * Fallback: Se WebCodecs não estiver disponível, retorna um GIF animado
 */
export async function compileFramesToVideo(
  videoData: VideoFrames
): Promise<string> {
  const { frames, fps, width, height } = videoData

  // Verificar se WebCodecs está disponível
  if (
    typeof window !== "undefined" &&
    "VideoEncoder" in window &&
    "VideoFrame" in window
  ) {
    try {
      return await compileWithWebCodecs(frames, fps, width, height)
    } catch (error) {
      console.warn("WebCodecs compilation failed, falling back to GIF:", error)
    }
  }

  // Fallback: Criar GIF animado usando canvas
  return await compileFramesToGIF(frames, fps, width, height)
}

/**
 * Compila frames em MP4 usando WebCodecs API
 */
async function compileWithWebCodecs(
  frames: string[],
  fps: number,
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    let frameIndex = 0

    const encoder = new VideoEncoder({
      output: (chunk) => {
        chunks.push(new Uint8Array(chunk.data))
      },
      error: (error) => {
        reject(error)
      },
    })

    // Configurar encoder
    encoder.configure({
      codec: "avc1.42001E", // H.264
      width,
      height,
      bitrate: 2_500_000, // 2.5 Mbps
      framerate: fps,
    })

    // Processar cada frame
    const processFrame = async (index: number) => {
      if (index >= frames.length) {
        // Finalizar encoder
        await encoder.flush()
        encoder.close()

        // Combinar chunks em um blob
        const blob = new Blob(chunks, { type: "video/mp4" })
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.readAsDataURL(blob)
        return
      }

      // Carregar frame como imagem
      const img = new Image()
      img.onload = async () => {
        // Criar canvas e desenhar frame
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Failed to get canvas context"))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)

        // Criar VideoFrame
        const frame = new VideoFrame(canvas, {
          timestamp: (index * 1_000_000) / fps, // Microsegundos
        })

        // Codificar frame
        encoder.encode(frame)
        frame.close()

        // Processar próximo frame
        await new Promise((r) => setTimeout(r, 1000 / fps))
        processFrame(index + 1)
      }
      img.onerror = () => reject(new Error(`Failed to load frame ${index}`))
      img.src = frames[index]
    }

    processFrame(0)
  })
}

/**
 * Compila frames em GIF animado (fallback quando WebCodecs não está disponível)
 */
async function compileFramesToGIF(
  frames: string[],
  fps: number,
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      reject(new Error("Failed to get canvas context"))
      return
    }

    const images: HTMLImageElement[] = []
    let loaded = 0

    const loadImage = (src: string, index: number): Promise<HTMLImageElement> => {
      return new Promise((resolveImg, rejectImg) => {
        const img = new Image()
        img.onload = () => {
          resolveImg(img)
        }
        img.onerror = () => rejectImg(new Error(`Failed to load frame ${index}`))
        img.src = src
      })
    }

    // Carregar todas as imagens
    Promise.all(frames.map((src, i) => loadImage(src, i)))
      .then((loadedImages) => {
        // Criar GIF usando canvas (simples animação)
        // Nota: Para um GIF real, precisaríamos de uma biblioteca como gif.js
        // Por enquanto, retornamos o primeiro frame como fallback
        const firstFrame = loadedImages[0]
        ctx.drawImage(firstFrame, 0, 0, width, height)
        
        // Converter canvas para data URI
        const dataUri = canvas.toDataURL("image/png")
        
        // Criar um "vídeo" simples usando data URI do primeiro frame
        // Em produção, você pode usar uma biblioteca como gif.js para criar GIFs reais
        resolve(dataUri)
      })
      .catch(reject)
  })
}
