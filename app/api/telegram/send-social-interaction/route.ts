import { NextRequest, NextResponse } from "next/server"

interface TelegramMessage {
  interactionType: string
  relatedType: string
  relatedId: number
  walletAddress: string
  content?: string
  imageUrl?: string
  username?: string
  memeUrl?: string
  memePrompt?: string
}

export async function POST(request: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!botToken || !chatId) {
      console.error("Telegram credentials not configured")
      return NextResponse.json(
        { error: "Telegram credentials not configured" },
        { status: 503 }
      )
    }

    const body: TelegramMessage = await request.json()
    const {
      interactionType,
      relatedType,
      relatedId,
      walletAddress,
      content,
      imageUrl,
      username,
      memeUrl,
      memePrompt
    } = body

    // Construir mensagem baseada no tipo de interação
    let message = ""
    let sendImage = false

    switch (interactionType) {
      case "comment":
        message = buildCommentMessage({
          username: username || walletAddress.slice(0, 8),
          content: content || "",
          memeUrl,
          memePrompt
        })
        sendImage = !!memeUrl
        break

      case "reaction":
        message = buildReactionMessage({
          username: username || walletAddress.slice(0, 8),
          reactionType: content || "like",
          memeUrl,
          memePrompt
        })
        sendImage = !!memeUrl
        break

      case "follow":
        message = buildFollowMessage({
          followerUsername: username || walletAddress.slice(0, 8),
          followingWallet: walletAddress
        })
        break

      case "collaboration":
        message = buildCollaborationMessage({
          username: username || walletAddress.slice(0, 8),
          memeUrl,
          memePrompt
        })
        sendImage = !!memeUrl
        break

      case "meme_created":
        message = buildMemeCreatedMessage({
          username: username || walletAddress.slice(0, 8),
          memeUrl,
          memePrompt: memePrompt || ""
        })
        sendImage = !!memeUrl
        break

      default:
        message = `🔄 Nova interação: ${interactionType}\n\n👤 Usuário: ${username || walletAddress}\n📝 Conteúdo: ${content || "N/A"}`
    }

    // Enviar para o Telegram
    if (sendImage && memeUrl) {
      // Enviar com imagem
      const result = await sendPhotoToTelegram(
        botToken,
        chatId,
        memeUrl,
        message
      )
      return NextResponse.json({ success: true, messageId: result.message_id })
    } else {
      // Enviar apenas texto
      const result = await sendMessageToTelegram(botToken, chatId, message)
      return NextResponse.json({ success: true, messageId: result.message_id })
    }
  } catch (error) {
    console.error("Error sending social interaction to Telegram:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send to Telegram",
      },
      { status: 500 }
    )
  }
}

// Funções auxiliares para construir mensagens

function buildCommentMessage({
  username,
  content,
  memeUrl,
  memePrompt
}: {
  username: string
  content: string
  memeUrl?: string
  memePrompt?: string
}): string {
  let msg = `💬 <b>Novo Comentário</b>\n\n`
  msg += `👤 <b>Usuário:</b> @${username}\n`
  msg += `💭 <b>Comentário:</b>\n${escapeHtml(content)}\n\n`
  
  if (memePrompt) {
    msg += `🎨 <b>Meme:</b> ${escapeHtml(memePrompt)}\n`
  }
  
  return msg
}

function buildReactionMessage({
  username,
  reactionType,
  memeUrl,
  memePrompt
}: {
  username: string
  reactionType: string
  memeUrl?: string
  memePrompt?: string
}): string {
  const emojiMap: Record<string, string> = {
    like: "👍",
    love: "❤️",
    laugh: "😂",
    wow: "😮",
    sad: "😢",
    angry: "😠",
    fire: "🔥"
  }

  const emoji = emojiMap[reactionType] || "👍"
  
  let msg = `${emoji} <b>Nova Reação</b>\n\n`
  msg += `👤 <b>Usuário:</b> @${username}\n`
  msg += `${emoji} <b>Reação:</b> ${reactionType}\n\n`
  
  if (memePrompt) {
    msg += `🎨 <b>Meme:</b> ${escapeHtml(memePrompt)}\n`
  }
  
  return msg
}

function buildFollowMessage({
  followerUsername,
  followingWallet
}: {
  followerUsername: string
  followingWallet: string
}): string {
  return `👥 <b>Novo Seguidor</b>\n\n👤 <b>Seguidor:</b> @${followerUsername}\n📌 <b>Carteira:</b> ${followingWallet.slice(0, 8)}...${followingWallet.slice(-6)}`
}

function buildCollaborationMessage({
  username,
  memeUrl,
  memePrompt
}: {
  username: string
  memeUrl?: string
  memePrompt?: string
}): string {
  let msg = `🤝 <b>Nova Colaboração</b>\n\n`
  msg += `👤 <b>Colaborador:</b> @${username}\n\n`
  
  if (memePrompt) {
    msg += `🎨 <b>Meme:</b> ${escapeHtml(memePrompt)}\n`
  }
  
  return msg
}

function buildMemeCreatedMessage({
  username,
  memeUrl,
  memePrompt
}: {
  username: string
  memeUrl?: string
  memePrompt: string
}): string {
  let msg = `🎨 <b>Novo Meme Criado</b>\n\n`
  msg += `👤 <b>Criador:</b> @${username}\n`
  msg += `📝 <b>Prompt:</b> ${escapeHtml(memePrompt)}\n`
  
  return msg
}

// Funções para enviar ao Telegram

async function sendMessageToTelegram(
  botToken: string,
  chatId: string,
  message: string
) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.description || "Failed to send message")
  }

  const result = await response.json()
  if (!result.ok) {
    throw new Error(result.description || "Failed to send message")
  }

  return result.result
}

async function sendPhotoToTelegram(
  botToken: string,
  chatId: string,
  imageUrl: string,
  caption: string
) {
  // Se for data URL, converter para buffer
  if (imageUrl.startsWith("data:image")) {
    const base64Match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!base64Match || !base64Match[2]) {
      throw new Error("Invalid image format")
    }

    const imageFormat = base64Match[1]
    const imageBase64 = base64Match[2]
    const imageBuffer = Buffer.from(imageBase64, "base64")
    const normalizedFormat = imageFormat === "jpeg" ? "jpg" : imageFormat
    const mimeType = imageFormat === "jpeg" ? "image/jpeg" : `image/${imageFormat}`

    const boundary = `----formdata-next-${Date.now()}`
    const parts: Buffer[] = []

    parts.push(Buffer.from(`--${boundary}\r\n`))
    parts.push(Buffer.from(`Content-Disposition: form-data; name="chat_id"\r\n\r\n`))
    parts.push(Buffer.from(`${chatId}\r\n`))

    parts.push(Buffer.from(`--${boundary}\r\n`))
    parts.push(Buffer.from(`Content-Disposition: form-data; name="photo"; filename="miao.${normalizedFormat}"\r\n`))
    parts.push(Buffer.from(`Content-Type: ${mimeType}\r\n\r\n`))
    parts.push(imageBuffer)
    parts.push(Buffer.from(`\r\n`))

    parts.push(Buffer.from(`--${boundary}\r\n`))
    parts.push(Buffer.from(`Content-Disposition: form-data; name="caption"\r\n\r\n`))
    parts.push(Buffer.from(`${caption}\r\n`))

    parts.push(Buffer.from(`--${boundary}\r\n`))
    parts.push(Buffer.from(`Content-Disposition: form-data; name="parse_mode"\r\n\r\n`))
    parts.push(Buffer.from(`HTML\r\n`))

    parts.push(Buffer.from(`--${boundary}--\r\n`))

    const formDataBody = Buffer.concat(parts)

    const url = `https://api.telegram.org/bot${botToken}/sendPhoto`
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: formDataBody,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.description || "Failed to send photo")
    }

    const result = await response.json()
    if (!result.ok) {
      throw new Error(result.description || "Failed to send photo")
    }

    return result.result
  } else {
    // URL externa
    const url = `https://api.telegram.org/bot${botToken}/sendPhoto`
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo: imageUrl,
        caption: caption,
        parse_mode: "HTML",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.description || "Failed to send photo")
    }

    const result = await response.json()
    if (!result.ok) {
      throw new Error(result.description || "Failed to send photo")
    }

    return result.result
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

