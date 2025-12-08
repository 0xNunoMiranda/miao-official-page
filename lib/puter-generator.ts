/**
 * Unified helper functions for Puter.js image and video generation
 * Based on official Puter.js documentation: https://docs.puter.com/
 */

/**
 * Special error class for quota exceeded (402) errors
 * This allows the UI to detect and handle quota errors specially
 */
export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "QuotaExceededError"
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, QuotaExceededError)
    }
  }
}

export interface ImageGenerationOptions {
  model?: string
  quality?: "low" | "medium" | "high" | "ultra"
  testMode?: boolean
  input_reference?: File | Blob | string
}

export interface VideoGenerationOptions {
  model?: "sora-2" | "sora-2-pro"
  seconds?: 4 | 8 | 12
  duration?: 4 | 8 | 12
  size?: "720x1280" | "1280x720" | "1024x1792" | "1792x1024"
  resolution?: "720x1280" | "1280x720" | "1024x1792" | "1792x1024"
  input_reference?: File | Blob | string
  testMode?: boolean
}

/**
 * Generate an image using Puter.js txt2img
 * Conforme documentação oficial: txt2img(prompt, options?)
 * Docs: https://docs.puter.com/AI/txt2img/
 * Exemplo: puter.ai.txt2img("a cat playing the piano", { model: "gpt-image-1", quality: "low" })
 * @param prompt - Text description for image generation
 * @param options - Optional image generation options (model, quality, testMode)
 * @returns Promise<HTMLImageElement> - Image element ready to be appended to DOM
 */
// Helper para obter tradução
function getQuotaExceededMessage(): string {
  try {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("language") || "en"
      // Importação dinâmica para evitar problemas de SSR
      const { getTranslation } = require("./translations")
      return getTranslation(savedLang as any, "generator.quotaExceeded")
    }
  } catch (e) {
    // Fallback
  }
  return "Quota diária atingida. Por favor, autentica-te com outra conta para continuar a gerar imagens."
}

export async function generateImageWithPuter(
  prompt: string,
  options: ImageGenerationOptions = {}
): Promise<HTMLImageElement> {
  if (!window.puter) {
    throw new Error("Puter.js não está carregado. Por favor, recarrega a página.")
  }
  
  if (!window.puter.ai) {
    throw new Error("Puter.js AI não está disponível. Por favor, verifica a conexão.")
  }
  
  if (!window.puter.ai.txt2img || typeof window.puter.ai.txt2img !== 'function') {
    throw new Error("Função txt2img não está disponível. Por favor, verifica a autenticação.")
  }

  try {
    // Conforme documentação: txt2img(prompt, options?)
    // Log das opções que serão passadas (sem serializar input_reference se for string longa)
    const optionsForLog = options ? { 
      ...options, 
      input_reference: options.input_reference 
        ? (typeof options.input_reference === "string" 
            ? (options.input_reference.length > 100 ? "[DataURL...]" : options.input_reference.substring(0, 100))
            : "[File/Blob]")
        : undefined 
    } : undefined
    console.log("Chamando txt2img com opções:", JSON.stringify(optionsForLog))
    
    // Se não há opções ou o objeto está vazio, passar undefined
    const finalOptions = (options && Object.keys(options).length > 0) ? options : undefined
    const finalOptionsForLog = finalOptions ? { 
      ...finalOptions, 
      input_reference: finalOptions.input_reference 
        ? (typeof finalOptions.input_reference === "string" 
            ? (finalOptions.input_reference.length > 100 ? "[DataURL...]" : finalOptions.input_reference.substring(0, 100))
            : "[File/Blob]")
        : undefined 
    } : undefined
    console.log("Opções finais a passar:", finalOptionsForLog ? JSON.stringify(finalOptionsForLog) : "undefined")
    
    const imageElement = await window.puter.ai.txt2img(prompt, finalOptions)
    
    if (!imageElement || !(imageElement instanceof HTMLImageElement)) {
      throw new Error("Puter.js retornou um elemento de imagem inválido.")
    }
    
    return imageElement
  } catch (error: any) {
    console.error("Erro ao chamar txt2img:", error)
    console.error("Error type:", typeof error)
    console.error("Error constructor:", error?.constructor?.name)
    
    // Tentar serializar o erro para debug
    try {
      const errorSerialized = JSON.stringify(error, Object.getOwnPropertyNames(error))
      console.error("Erro serializado:", errorSerialized)
    } catch (e) {
      console.error("Não foi possível serializar o erro:", e)
    }
    
    // Melhorar mensagem de erro
    let errorMessage = "Erro ao gerar imagem com Puter.js"
    
    if (error instanceof Error) {
      errorMessage = error.message || error.name || errorMessage
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    } else if (typeof error === "string") {
      errorMessage = error
    } else if (error && typeof error === "object") {
      // Verificar formato específico do Puter.js: {success: false, error: {...}}
      if (error.success === false) {
        console.error("Puter.js retornou success: false")
        
        // Tentar extrair informações do objeto error
        if (error.error && typeof error.error === "object") {
          const errorObj = error.error
          
          // Verificar se é erro 402 (insufficient_funds) - quota diária atingida
          if (errorObj.status === 402 || errorObj.code === "insufficient_funds") {
            console.error("Erro 402 detectado - quota diária atingida")
            errorMessage = getQuotaExceededMessage()
            // Lançar erro especial para que o UI possa detectar e mostrar botão de autenticação
            throw new QuotaExceededError(errorMessage)
          } else {
            // Verificar propriedades do objeto error
            const errorMsg = errorObj.message 
              || errorObj.error 
              || errorObj.errorMessage 
              || errorObj.msg 
              || errorObj.description
              || errorObj.reason
              || errorObj.details
              || errorObj.code
              || errorObj.status
            
            if (errorMsg) {
              errorMessage = String(errorMsg)
            } else {
              // Objeto error vazio - verificar outras propriedades do erro principal
              const errorKeys = Object.keys(error)
              console.error("Chaves do objeto de erro:", errorKeys)
              
              // Verificar se há outras propriedades úteis
              if (error.message) {
                errorMessage = String(error.message)
              } else if (error.code) {
                errorMessage = `Erro ${error.code}: Falha ao gerar imagem.`
              } else if (error.status) {
                errorMessage = `Erro ${error.status}: Falha ao gerar imagem.`
              } else {
                // Erro vazio do Puter.js - verificar estado de autenticação
                if (window.puter?.auth?.isSignedIn && !window.puter.auth.isSignedIn()) {
                  errorMessage = "Por favor, autentica-te primeiro para gerar imagens."
                } else {
                  errorMessage = "Falha ao gerar imagem. O Puter.js retornou um erro vazio. Por favor, verifica a autenticação e tenta novamente."
                }
              }
            }
          }
        } else if (error.error && typeof error.error === "string") {
          errorMessage = error.error
        } else {
          // success: false mas sem objeto error útil
          errorMessage = "Falha ao gerar imagem. Por favor, verifica a autenticação e tenta novamente."
        }
      } else {
        // Tentar todas as propriedades possíveis
        errorMessage = error.message 
          || error.error 
          || error.errorMessage 
          || error.msg 
          || error.description
          || error.reason
          || error.details
          || error.code
          || error.status
          || errorMessage
        
        // Se ainda não tem mensagem, verificar se é um erro vazio
        if (!errorMessage || errorMessage === "Erro ao gerar imagem com Puter.js") {
          try {
            const errorStr = JSON.stringify(error)
            console.error("String do erro:", errorStr)
            
            if (errorStr === "{}" || errorStr.trim() === "" || errorStr === "null") {
              // Erro vazio - verificar estado do Puter
              if (window.puter?.auth?.isSignedIn && !window.puter.auth.isSignedIn()) {
                errorMessage = "Por favor, autentica-te primeiro para gerar imagens."
              } else {
                errorMessage = "Erro desconhecido ao gerar imagem. Por favor, verifica a autenticação e tenta novamente."
              }
            } else if (errorStr.includes("auth") || errorStr.includes("sign") || errorStr.includes("login") || errorStr.includes("unauthorized")) {
              errorMessage = "Por favor, autentica-te primeiro para gerar imagens."
            } else if (errorStr.includes("quota") || errorStr.includes("limit") || errorStr.includes("rate")) {
              errorMessage = "Limite de gerações atingido. Por favor, tenta mais tarde."
            } else if (errorStr.includes("success") && errorStr.includes("false")) {
              errorMessage = "Falha ao gerar imagem. Por favor, verifica a autenticação e tenta novamente."
            } else {
              errorMessage = `Erro ao gerar imagem: ${errorStr.substring(0, 100)}`
            }
          } catch (e) {
            console.error("Erro ao processar objeto de erro:", e)
            errorMessage = "Erro ao gerar imagem. Verifica se estás autenticado e tenta novamente."
          }
        }
      }
    } else if (error !== null && error !== undefined) {
      errorMessage = String(error)
    }
    
    // Garantir que temos uma mensagem útil e que é uma string
    if (!errorMessage || typeof errorMessage !== "string" || (errorMessage.trim && errorMessage.trim() === "") || errorMessage === "{}") {
      errorMessage = "Erro desconhecido ao gerar imagem. Por favor, verifica a autenticação e tenta novamente."
    }
    
    // Garantir que errorMessage é sempre uma string
    if (typeof errorMessage !== "string") {
      errorMessage = String(errorMessage) || "Erro desconhecido ao gerar imagem. Por favor, verifica a autenticação e tenta novamente."
    }
    
    throw new Error(errorMessage)
  }
}

/**
 * Generate a video using Puter.js txt2vid
 * Conforme documentação oficial: txt2vid(prompt, options?)
 * Docs: https://docs.puter.com/AI/txt2vid/
 * Exemplo: puter.ai.txt2vid("A fox sprinting...", { model: "sora-2-pro", seconds: 8, size: "1280x720" })
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

  try {
    // Conforme documentação: txt2vid(prompt, options?)
    // Se não há opções, passar objeto vazio ou undefined
    // Nota: input_reference pode ser File, Blob ou string (data URL)
    // Para vídeos, parece que o Puter.js internamente espera string (URL) baseado no erro "input.startsWith is not a function"
    const videoElement = await window.puter.ai.txt2vid(prompt, options)
    
    if (!videoElement || !(videoElement instanceof HTMLVideoElement)) {
      throw new Error("Puter.js retornou um elemento de vídeo inválido.")
    }
    
    return videoElement
  } catch (error: any) {
    console.error("Erro ao chamar txt2vid:", error)
    console.error("Error type:", typeof error)
    console.error("Error constructor:", error?.constructor?.name)
    
    // Tentar serializar o erro para debug
    try {
      const errorSerialized = JSON.stringify(error, Object.getOwnPropertyNames(error))
      console.error("Erro serializado:", errorSerialized)
    } catch (e) {
      console.error("Não foi possível serializar o erro:", e)
    }
    
    // Melhorar mensagem de erro
    let errorMessage = "Erro ao gerar vídeo com Puter.js"
    
    if (error instanceof Error) {
      errorMessage = error.message || error.name || errorMessage
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    } else if (typeof error === "string") {
      errorMessage = error
    } else if (error && typeof error === "object") {
      // Verificar formato específico do Puter.js: {success: false, error: {...}}
      if (error.success === false) {
        console.error("Puter.js retornou success: false")
        
        // Tentar extrair informações do objeto error
        if (error.error && typeof error.error === "object") {
          const errorObj = error.error
          
          // Verificar se é erro 402 (insufficient_funds) - quota diária atingida
          if (errorObj.status === 402 || errorObj.code === "insufficient_funds") {
            console.error("Erro 402 detectado - quota diária atingida")
            errorMessage = getQuotaExceededMessage()
            // Lançar erro especial para que o UI possa detectar e mostrar botão de autenticação
            throw new QuotaExceededError(errorMessage)
          } else {
            // Verificar propriedades do objeto error
            const errorMsg = errorObj.message 
              || errorObj.error 
              || errorObj.errorMessage 
              || errorObj.msg 
              || errorObj.description
              || errorObj.reason
              || errorObj.details
              || errorObj.code
              || errorObj.status
            
            if (errorMsg) {
              errorMessage = String(errorMsg)
            } else {
              // Objeto error vazio - verificar outras propriedades do erro principal
              const errorKeys = Object.keys(error)
              console.error("Chaves do objeto de erro:", errorKeys)
              
              // Verificar se há outras propriedades úteis
              if (error.message) {
                errorMessage = String(error.message)
              } else if (error.code) {
                errorMessage = `Erro ${error.code}: Falha ao gerar vídeo.`
              } else if (error.status) {
                errorMessage = `Erro ${error.status}: Falha ao gerar vídeo.`
              } else {
                // Erro vazio do Puter.js - verificar estado de autenticação
                if (window.puter?.auth?.isSignedIn && !window.puter.auth.isSignedIn()) {
                  errorMessage = "Por favor, autentica-te primeiro para gerar vídeos."
                } else {
                  errorMessage = "Falha ao gerar vídeo. O Puter.js retornou um erro vazio. Por favor, verifica a autenticação e tenta novamente."
                }
              }
            }
          }
        } else if (error.error && typeof error.error === "string") {
          errorMessage = error.error
        } else {
          // success: false mas sem objeto error útil
          errorMessage = "Falha ao gerar vídeo. Por favor, verifica a autenticação e tenta novamente."
        }
      } else {
        // Tentar todas as propriedades possíveis
        errorMessage = error.message 
          || error.error 
          || error.errorMessage 
          || error.msg 
          || error.description
          || error.reason
          || error.details
          || error.code
          || error.status
          || errorMessage
        
        // Se ainda não tem mensagem, verificar se é um erro vazio
        if (!errorMessage || errorMessage === "Erro ao gerar vídeo com Puter.js") {
          try {
            const errorStr = JSON.stringify(error)
            console.error("String do erro:", errorStr)
            
            if (errorStr === "{}" || errorStr.trim() === "" || errorStr === "null") {
              // Erro vazio - verificar estado do Puter
              if (window.puter?.auth?.isSignedIn && !window.puter.auth.isSignedIn()) {
                errorMessage = "Por favor, autentica-te primeiro para gerar vídeos."
              } else {
                errorMessage = "Erro desconhecido ao gerar vídeo. Por favor, verifica a autenticação e tenta novamente."
              }
            } else if (errorStr.includes("auth") || errorStr.includes("sign") || errorStr.includes("login") || errorStr.includes("unauthorized")) {
              errorMessage = "Por favor, autentica-te primeiro para gerar vídeos."
            } else if (errorStr.includes("quota") || errorStr.includes("limit") || errorStr.includes("rate")) {
              errorMessage = "Limite de gerações atingido. Por favor, tenta mais tarde."
            } else if (errorStr.includes("success") && errorStr.includes("false")) {
              errorMessage = "Falha ao gerar vídeo. Por favor, verifica a autenticação e tenta novamente."
            } else {
              errorMessage = `Erro ao gerar vídeo: ${errorStr.substring(0, 100)}`
            }
          } catch (e) {
            console.error("Erro ao processar objeto de erro:", e)
            errorMessage = "Erro ao gerar vídeo. Verifica se estás autenticado e tenta novamente."
          }
        }
      }
    } else if (error !== null && error !== undefined) {
      errorMessage = String(error)
    }
    
    // Garantir que errorMessage é sempre uma string
    if (typeof errorMessage !== "string") {
      errorMessage = String(errorMessage) || "Erro desconhecido ao gerar vídeo. Por favor, tenta novamente."
    }
    
    // Verificar se está vazio
    if (!errorMessage || (errorMessage.trim && errorMessage.trim() === "") || errorMessage === "{}") {
      errorMessage = "Erro desconhecido ao gerar vídeo. Por favor, verifica a autenticação e tenta novamente."
    }
    
    throw new Error(errorMessage)
  }
}

/**
 * Get video URL from HTMLVideoElement
 * @param videoElement - The video element
 * @returns string - Video source URL
 */
export function getVideoURL(videoElement: HTMLVideoElement): string {
  return videoElement.src || videoElement.currentSrc || ""
}

/**
 * Get image URL from HTMLImageElement
 * @param imageElement - The image element
 * @returns string - Image source URL
 */
export function getImageURL(imageElement: HTMLImageElement): string {
  return imageElement.src || imageElement.currentSrc || ""
}
