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
    const { imageUrl, videoUrl, prompt, type } = requestBody

    const isVideo = type === "video"
    const mediaUrl = isVideo ? videoUrl : imageUrl

    if (!mediaUrl) {
      return NextResponse.json(
        { error: isVideo ? "Video URL is required" : "Image URL is required" },
        { status: 400 }
      )
    }

    // Log para debug
    const urlPreview = mediaUrl.substring(0, 100)
    console.log(`Received ${isVideo ? "video" : "image"} URL type:`, urlPreview + "...")
    console.log("Is data URL:", mediaUrl.startsWith(`data:${isVideo ? "video" : "image"}`))

    // Validar que é uma data URL de imagem ou vídeo
    const expectedPrefix = isVideo ? "data:video" : "data:image"
    if (!mediaUrl.startsWith(expectedPrefix)) {
      console.error(`Invalid ${isVideo ? "video" : "image"} format received:`, urlPreview)
      return NextResponse.json(
        { 
          error: `Invalid ${isVideo ? "video" : "image"} format. Expected ${expectedPrefix} URL.`,
          receivedType: mediaUrl.substring(0, 30)
        },
        { status: 400 }
      )
    }

    // Extrair o base64 da data URL
    // Formato esperado: data:image/png;base64,... ou data:video/mp4;base64,...
    const base64Match = mediaUrl.match(/^data:(image|video)\/(\w+);base64,(.+)$/)
    if (!base64Match || !base64Match[3]) {
      console.error("Failed to extract base64 from data URL. Format:", urlPreview)
      return NextResponse.json(
        { error: `Invalid ${isVideo ? "video" : "image"} format. Could not extract base64 data.` },
        { status: 400 }
      )
    }
    
    const mediaFormat = base64Match[2] // png, jpeg, webp, mp4, webm, etc.
    const mediaBase64 = base64Match[3]
    
    // Validar que temos dados
    if (!mediaBase64 || mediaBase64.length === 0) {
      return NextResponse.json(
        { error: `Empty ${isVideo ? "video" : "image"} data` },
        { status: 400 }
      )
    }

    // Construir a mensagem para o Telegram (sempre em inglês)
    const generatorLink = "https://miaotoken.vip/#generator"
    const caption = isVideo
      ? (prompt
          ? `🎬 New video generated in Miao Army Generator!\n\n📝 User Prompt: ${prompt}\n\n✨ Create your own unique Miao variants for FREE!\n🔗 ${generatorLink}`
          : `🎬 New video generated in Miao Army Generator!\n\n✨ Create your own unique Miao variants for FREE!\n🔗 ${generatorLink}`)
      : (prompt
          ? `🎨 New image generated in Miao Army Generator!\n\n📝 User Prompt: ${prompt}\n\n✨ Create your own unique Miao variants for FREE!\n🔗 ${generatorLink}`
          : `🎨 New image generated in Miao Army Generator!\n\n✨ Create your own unique Miao variants for FREE!\n🔗 ${generatorLink}`)

    // Converter base64 para Buffer
    const mediaBuffer = Buffer.from(mediaBase64, "base64")

    // Normalizar o formato (jpeg -> jpg para o filename)
    const normalizedFormat = mediaFormat === "jpeg" ? "jpg" : mediaFormat
    const mimeType = isVideo 
      ? `video/${mediaFormat}`
      : (mediaFormat === "jpeg" ? "image/jpeg" : `image/${mediaFormat}`)

    // Enviar para o Telegram usando sendPhoto ou sendVideo
    const telegramUrl = isVideo
      ? `https://api.telegram.org/bot${botToken}/sendVideo`
      : `https://api.telegram.org/bot${botToken}/sendPhoto`
    
    // Criar boundary único
    const boundary = `----formdata-next-${Date.now()}`
    
    // Construir o corpo multipart/form-data manualmente
    const parts: Buffer[] = []
    
    // chat_id
    parts.push(Buffer.from(`--${boundary}\r\n`))
    parts.push(Buffer.from(`Content-Disposition: form-data; name="chat_id"\r\n\r\n`))
    parts.push(Buffer.from(`${chatId}\r\n`))
    
    // photo ou video
    const fieldName = isVideo ? "video" : "photo"
    const filename = isVideo ? `miao-generated.${normalizedFormat}` : `miao-generated.${normalizedFormat}`
    parts.push(Buffer.from(`--${boundary}\r\n`))
    parts.push(Buffer.from(`Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n`))
    parts.push(Buffer.from(`Content-Type: ${mimeType}\r\n\r\n`))
    parts.push(mediaBuffer)
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
      throw new Error(errorData.description || `Failed to send ${isVideo ? "video" : "image"} to Telegram`)
    }

    const result = await response.json()
    
    if (!result.ok) {
      console.error("Telegram API returned error:", result)
      throw new Error(result.description || `Failed to send ${isVideo ? "video" : "image"} to Telegram`)
    }

    return NextResponse.json({ success: true, messageId: result.result?.message_id })
  } catch (error) {
    console.error("Error sending to Telegram:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send to Telegram",
      },
      { status: 500 }
    )
  }
}

