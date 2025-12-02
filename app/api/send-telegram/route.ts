import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!botToken || !chatId) {
      console.error("Telegram credentials not configured")
      return NextResponse.json(
        { error: "Telegram credentials not configured" },
        { status: 503 }
      )
    }

    const requestBody = await request.json()
    const { imageUrl, prompt } = requestBody

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      )
    }

    // Log para debug
    const urlPreview = imageUrl.substring(0, 100)
    console.log("Received image URL type:", urlPreview + "...")
    console.log("Is data URL:", imageUrl.startsWith("data:image"))

    // Validar que é uma data URL de imagem
    if (!imageUrl.startsWith("data:image")) {
      console.error("Invalid image format received:", urlPreview)
      return NextResponse.json(
        { 
          error: "Invalid image format. Expected data:image URL.",
          receivedType: imageUrl.substring(0, 30)
        },
        { status: 400 }
      )
    }

    // Extrair o base64 da data URL
    // Formato esperado: data:image/png;base64,iVBORw0KGgo...
    const base64Match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!base64Match || !base64Match[2]) {
      console.error("Failed to extract base64 from data URL. Format:", urlPreview)
      return NextResponse.json(
        { error: "Invalid image format. Could not extract base64 data." },
        { status: 400 }
      )
    }
    
    const imageFormat = base64Match[1] // png, jpeg, webp, etc.
    const imageBase64 = base64Match[2]
    
    // Validar que temos dados
    if (!imageBase64 || imageBase64.length === 0) {
      return NextResponse.json(
        { error: "Empty image data" },
        { status: 400 }
      )
    }

    // Construir a mensagem para o Telegram (em inglês)
    const caption = prompt
      ? `🎨 New image generated in Miao Army Generator!\n\n📝 Prompt: ${prompt}`
      : "🎨 New image generated in Miao Army Generator!"

    // Converter base64 para Buffer
    const imageBuffer = Buffer.from(imageBase64, "base64")

    // Normalizar o formato da imagem (jpeg -> jpg para o filename)
    const normalizedFormat = imageFormat === "jpeg" ? "jpg" : imageFormat
    const mimeType = imageFormat === "jpeg" ? "image/jpeg" : `image/${imageFormat}`

    // Enviar para o Telegram usando sendPhoto
    // O Telegram aceita multipart/form-data
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`
    
    // Criar boundary único
    const boundary = `----formdata-next-${Date.now()}`
    
    // Construir o corpo multipart/form-data manualmente
    const parts: Buffer[] = []
    
    // chat_id
    parts.push(Buffer.from(`--${boundary}\r\n`))
    parts.push(Buffer.from(`Content-Disposition: form-data; name="chat_id"\r\n\r\n`))
    parts.push(Buffer.from(`${chatId}\r\n`))
    
    // photo
    parts.push(Buffer.from(`--${boundary}\r\n`))
    parts.push(Buffer.from(`Content-Disposition: form-data; name="photo"; filename="miao-generated.${normalizedFormat}"\r\n`))
    parts.push(Buffer.from(`Content-Type: ${mimeType}\r\n\r\n`))
    parts.push(imageBuffer)
    parts.push(Buffer.from(`\r\n`))
    
    // caption
    parts.push(Buffer.from(`--${boundary}\r\n`))
    parts.push(Buffer.from(`Content-Disposition: form-data; name="caption"\r\n\r\n`))
    parts.push(Buffer.from(`${caption}\r\n`))
    
    // parse_mode
    parts.push(Buffer.from(`--${boundary}\r\n`))
    parts.push(Buffer.from(`Content-Disposition: form-data; name="parse_mode"\r\n\r\n`))
    parts.push(Buffer.from(`HTML\r\n`))
    
    // Fechar boundary
    parts.push(Buffer.from(`--${boundary}--\r\n`))
    
    const formDataBody = Buffer.concat(parts)

    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: formDataBody,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Telegram API error:", errorData)
      throw new Error(errorData.description || "Failed to send image to Telegram")
    }

    const result = await response.json()
    
    if (!result.ok) {
      console.error("Telegram API returned error:", result)
      throw new Error(result.description || "Failed to send image to Telegram")
    }

    return NextResponse.json({ success: true, messageId: result.result?.message_id })
  } catch (error) {
    console.error("Error sending image to Telegram:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send image to Telegram",
      },
      { status: 500 }
    )
  }
}

