import { NextRequest, NextResponse } from "next/server"

// Rate limiting storage (em produção, use Redis ou banco de dados)
const rateLimitStoreImages = new Map<string, { count: number; resetTime: number }>()
const rateLimitStoreVideos = new Map<string, { count: number; resetTime: number }>()

// Verificar se está em modo de desenvolvimento
const isDevelopment = process.env.NODE_ENV === "development"

const MAX_IMAGES_PER_DAY = isDevelopment ? 999 : 3
const MAX_VIDEOS_PER_DAY = isDevelopment ? 999 : 1
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000 // 24 horas em milissegundos

// Limpar rate limit store quando o limite mudar (útil durante desenvolvimento)
function resetRateLimitStore() {
  rateLimitStoreImages.clear()
  rateLimitStoreVideos.clear()
}

function getClientIP(request: NextRequest): string {
  // Tenta obter o IP real do cliente
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  // Fallback para desenvolvimento local
  return request.ip || "unknown"
}

// Verificar rate limit sem incrementar (para verificar se pode gerar)
function checkRateLimit(ip: string, type: "image" | "video" = "image"): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const store = type === "image" ? rateLimitStoreImages : rateLimitStoreVideos
  const maxLimit = type === "image" ? MAX_IMAGES_PER_DAY : MAX_VIDEOS_PER_DAY
  const record = store.get(ip)

  if (!record || now > record.resetTime) {
    // Primeira requisição ou janela expirada - resetar
    const resetTime = now + RATE_LIMIT_WINDOW
    store.set(ip, { count: 0, resetTime })
    return { allowed: true, remaining: maxLimit, resetTime }
  }

  // Se o count antigo exceder o novo limite, resetar (útil quando o limite aumenta)
  if (record.count >= maxLimit) {
    // Limite excedido
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  // NÃO incrementar aqui - só verificar se pode gerar
  return {
    allowed: true,
    remaining: maxLimit - record.count,
    resetTime: record.resetTime,
  }
}

// Confirmar geração (incrementar contador após sucesso)
function confirmGeneration(ip: string, type: "image" | "video" = "image"): { success: boolean; remaining: number } {
  const now = Date.now()
  const store = type === "image" ? rateLimitStoreImages : rateLimitStoreVideos
  const maxLimit = type === "image" ? MAX_IMAGES_PER_DAY : MAX_VIDEOS_PER_DAY
  const record = store.get(ip)

  if (!record || now > record.resetTime) {
    // Se não há record, criar um novo
    const resetTime = now + RATE_LIMIT_WINDOW
    store.set(ip, { count: 1, resetTime })
    return { success: true, remaining: maxLimit - 1 }
  }

  // Verificar se ainda pode incrementar (proteção extra)
  if (record.count >= maxLimit) {
    return { success: false, remaining: 0 }
  }

  // Incrementar contador
  record.count++
  store.set(ip, record)
  
  return {
    success: true,
    remaining: maxLimit - record.count,
  }
}

// Endpoint para verificar se pode gerar (sem incrementar)
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    
    // Obter action e type do body
    let action = "check"
    let type: "image" | "video" = "image"
    try {
      const body = await request.json()
      action = body.action || "check"
      type = body.type === "video" ? "video" : "image"
    } catch {
      // Se não conseguir fazer parse, assume valores padrão
      action = "check"
      type = "image"
    }

    // Se for confirmação de geração bem-sucedida, incrementar
    if (action === "confirm") {
      const result = confirmGeneration(ip, type)
      const maxLimit = type === "image" ? MAX_IMAGES_PER_DAY : MAX_VIDEOS_PER_DAY
      
      if (!result.success) {
        return NextResponse.json(
          {
            error: "Daily limit reached",
            message: `You have reached the daily limit of ${maxLimit} ${type}s.`,
          },
          { status: 429 }
        )
      }

      return NextResponse.json({
        success: true,
        remaining: result.remaining,
      })
    }

    // Caso contrário, apenas verificar (sem incrementar)
    const rateLimit = checkRateLimit(ip, type)
    const maxLimit = type === "image" ? MAX_IMAGES_PER_DAY : MAX_VIDEOS_PER_DAY

    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetTime)
      return NextResponse.json(
        {
          error: "Daily limit reached",
          message: `You have reached the daily limit of ${maxLimit} ${type}s. Please try again after ${resetDate.toLocaleString()}`,
          resetTime: rateLimit.resetTime,
        },
        { status: 429 }
      )
    }

    return NextResponse.json({
      success: true,
      allowed: true,
      remaining: rateLimit.remaining,
      resetTime: rateLimit.resetTime,
    })
  } catch (error) {
    console.error("Rate limit check error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to check rate limit",
      },
      { status: 500 }
    )
  }
}

// Endpoint para obter o status do rate limit
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const url = new URL(request.url)
    const type = url.searchParams.get("type") === "video" ? "video" : "image"
    
    const store = type === "image" ? rateLimitStoreImages : rateLimitStoreVideos
    const maxLimit = type === "image" ? MAX_IMAGES_PER_DAY : MAX_VIDEOS_PER_DAY
    const record = store.get(ip)
    const now = Date.now()

    if (!record || now > record.resetTime) {
      return NextResponse.json({
        count: 0,
        limit: maxLimit,
        remaining: maxLimit,
        resetTime: now + RATE_LIMIT_WINDOW,
      })
    }

    // Garantir que o remaining nunca seja negativo e sempre use o limite atual
    const remaining = Math.max(0, maxLimit - record.count)
    
    return NextResponse.json({
      count: record.count,
      limit: maxLimit,
      remaining: remaining,
      resetTime: record.resetTime,
    })
  } catch (error) {
    console.error("Rate limit status error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    )
  }
}

