// Reference cat: Green cartoon cat with big black eyes, wide smile with sharp teeth
// Estrutura melhorada do prompt base - define APENAS a constituição física do gato
const MIAO_CAT_BASE = `[CAT PHYSICAL CONSTITUTION - ONLY REFERS TO THE CAT'S APPEARANCE:]

green cat, bright green teal mint emerald green cartoon cat character, ENTIRE BODY IS SOLID GREEN COLOR;

bright green teal body, green cat body, green mascot character;

big round black eyes with white highlight dots, NOT green eyes;

wide open mouth showing sharp white teeth, pink inner mouth and pink tongue;

pointy cat ears with darker green inner ear;

black whiskers on both sides of the face;

long curved green tail (same green color as the body);

simple flat cartoon style, mascot-style, no fur texture, bold black outlines;

playful, energetic, joyful expression;

stands on two legs, green paws, all body parts are green.

🔧 RULE TO APPLY ADDITIONAL USER INSTRUCTIONS (ANY LANGUAGE):

After this base description, accept and integrate ANY user instructions written in ANY language.

Additional user prompts may modify:

pose;

action;

environment / background;

props;

clothing / accessories;

emotion;

camera angle;

rendering style (2D, vector, 3D, cel-shaded, etc.).`

// Runware API endpoint
const RUNWARE_API_URL = "https://api.runware.ai/v1"
const RUNWARE_IMAGE_ENDPOINT = "/image-inference"

// Função para ler e converter imagem do gato para base64
import { readFileSync } from "fs"
import { join } from "path"

function getCatReferenceImageDataURI(): string {
  try {
    // Caminho para a imagem de referência do gato
    const imagePath = join(process.cwd(), "public", "images", "cat.png")
    const imageBuffer = readFileSync(imagePath)
    const base64 = imageBuffer.toString("base64")
    // Retornar como data URI (formato: data:image/png;base64,<base64_string>)
    // A API do Runware aceita data URI, base64 puro, UUID ou URL
    return `data:image/png;base64,${base64}`
  } catch (error) {
    console.warn("Failed to load cat reference image:", error)
    return ""
  }
}

export interface GenerateImageOptions {
  prompt?: string
  width?: number
  height?: number
  model?: string
}

export async function generateImageFromText(
  userPrompt: string = "",
  options: GenerateImageOptions = {}
): Promise<string> {
  try {
    const apiKey = process.env.RUNWARE_API_KEY
    
    if (!apiKey) {
      throw new Error("RUNWARE_API_KEY not found in environment variables. Please set RUNWARE_API_KEY in your .env.local file.")
    }
    
    // Construir prompt final
    // IMPORTANTE: A descrição do gato (MIAO_CAT_BASE) define APENAS a constituição física do gato
    // O prompt do usuário define o resto: background, pose, cenário, ações, etc.
    let finalPrompt: string
    if (userPrompt.trim()) {
      // Estrutura: [Constituição do gato com regras] + [Prompt do usuário para tudo mais]
      // O prompt base já inclui as instruções sobre como aplicar o prompt do usuário
      finalPrompt = `${MIAO_CAT_BASE}

[USER INSTRUCTIONS TO APPLY: ${userPrompt.trim()}]

High quality, detailed, beautiful illustration.`
    } else {
      finalPrompt = `${MIAO_CAT_BASE}

[DEFAULT SCENE: standing confident pose with hands on hips, mischievous smile, rebellious attitude]

Simple cartoon illustration, white or transparent background.`
    }

    // Usar proporções quadradas para evitar achatamento (1:1)
    // Dimensões padrão: 1024x1024 para melhor qualidade
    const width = options.width || 1024
    const height = options.height || 1024
    // Modelo fixo: FLUX.1 Dev
    const model = "runware:101@1"

    // Obter imagem de referência do gato como data URI
    const catReferenceImage = getCatReferenceImageDataURI()
    
    if (catReferenceImage) {
      console.log("Cat reference image loaded, length:", catReferenceImage.length, "prefix:", catReferenceImage.substring(0, 50))
    } else {
      console.warn("Cat reference image not loaded")
    }

    // Chamar API REST do Runware diretamente (sem SDK)
    // Formato baseado na documentação oficial do Runware - Text-to-image
    // IMPORTANTE: A API requer que o payload seja um array de objetos
    // Formato simples como no exemplo da documentação
    const requestBody: any = {
      taskType: "imageInference",
      taskUUID: crypto.randomUUID(),
      model: model,
      positivePrompt: finalPrompt, // Prompt base do gato + input do usuário
      width: width,
      height: height,
      steps: 60, // Mais steps para melhor qualidade
      deliveryMethod: "sync", // Garantir resposta síncrona
      outputType: "URL", // Especificar que queremos URL
    }

    // FLUX.1 Dev não suporta IP-Adapter, então usamos apenas o prompt detalhado
    // A imagem de referência do gato está incorporada na descrição do prompt
    if (catReferenceImage) {
      console.log("FLUX.1 Dev: using detailed prompt with cat reference description (IP-Adapter not available for FLUX)")
    }

    const requestBodyArray = [requestBody]

    const endpoint = `${RUNWARE_API_URL}${RUNWARE_IMAGE_ENDPOINT}`
    console.log("Runware API request:", { url: endpoint, body: requestBodyArray })

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBodyArray),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData: any = {}
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText || `HTTP ${response.status}` }
      }
      console.error("Runware API error response:", errorData)
      throw new Error(errorData.error || errorData.message || `Runware API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("Runware API response (raw):", JSON.stringify(result, null, 2))
    
    // Verificar se há erros na resposta
    if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
      const errorMsg = result.errors.map((e: any) => e.message || e.code).join(", ")
      throw new Error(`Runware API errors: ${errorMsg}`)
    }
    
    // A resposta do Runware quando o payload é um array, retorna também um array
    // Formato esperado: [{ data: [{ imageURL: "..." }] }] ou [{ imageURL: "..." }]
    // Ou pode ser: { data: [{ imageURL: "..." }] } ou { data: [] }
    let imageUrl: string | undefined
    let taskUUID: string | undefined
    
    // Se a resposta é um array (que deve ser, já que enviamos um array)
    if (Array.isArray(result) && result.length > 0) {
      const firstResult = result[0]
      taskUUID = firstResult.taskUUID
      
      // Verificar se tem data dentro
      if (firstResult.data && Array.isArray(firstResult.data) && firstResult.data.length > 0) {
        imageUrl = firstResult.data[0]?.imageURL || firstResult.data[0]?.url || firstResult.data[0]?.imageUrl
      } else if (firstResult.imageURL) {
        imageUrl = firstResult.imageURL
      } else if (firstResult.imageUrl) {
        imageUrl = firstResult.imageUrl
      } else if (firstResult.url) {
        imageUrl = firstResult.url
      } else if (firstResult.response && Array.isArray(firstResult.response) && firstResult.response.length > 0) {
        imageUrl = firstResult.response[0]?.imageURL || firstResult.response[0]?.url || firstResult.response[0]?.imageUrl
      }
    } else if (result.data !== undefined) {
      // Formato: { data: [{ imageURL: "..." }] } ou { data: [] }
      taskUUID = result.taskUUID
      
      if (Array.isArray(result.data) && result.data.length > 0) {
        imageUrl = result.data[0]?.imageURL || result.data[0]?.url || result.data[0]?.imageUrl
      } else if (Array.isArray(result.data) && result.data.length === 0) {
        // Array vazio - a tarefa pode estar processando ou falhou
        console.warn("Runware API returned empty data array")
        
        // Se temos taskUUID, tentar fazer polling
        if (taskUUID) {
          console.log(`Task UUID: ${taskUUID}, attempting to poll for results...`)
          // Tentar fazer polling algumas vezes
          for (let i = 0; i < 5; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000)) // Esperar 2 segundos
            
            try {
              const pollResponse = await fetch(`${RUNWARE_API_URL}/image-inference/${taskUUID}`, {
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${apiKey}`,
                },
              })
              
              if (pollResponse.ok) {
                const pollResult = await pollResponse.json()
                console.log(`Poll attempt ${i + 1}:`, JSON.stringify(pollResult, null, 2))
                
                if (pollResult.data && Array.isArray(pollResult.data) && pollResult.data.length > 0) {
                  imageUrl = pollResult.data[0]?.imageURL || pollResult.data[0]?.url || pollResult.data[0]?.imageUrl
                  if (imageUrl) break
                }
              }
            } catch (pollError) {
              console.warn(`Poll attempt ${i + 1} failed:`, pollError)
            }
          }
        }
        
        if (!imageUrl) {
          throw new Error("Image generation task completed but no image was generated. Please check your prompt and try again.")
        }
      }
    } else if (result.imageURL) {
      imageUrl = result.imageURL
    } else if (result.url) {
      imageUrl = result.url
    }

    if (!imageUrl) {
      console.error("Runware API response (full):", JSON.stringify(result, null, 2))
      throw new Error(`No image URL in Runware API response. Response: ${JSON.stringify(result).substring(0, 500)}`)
    }

    return imageUrl
  } catch (error) {
    console.error("Runware image generation error:", error)
    throw error instanceof Error ? error : new Error("Failed to generate image with Runware")
  }
}
