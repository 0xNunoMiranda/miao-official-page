import { NextRequest, NextResponse } from "next/server"

// Rate limiting storage (em produção, use Redis ou banco de dados)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const MAX_GENERATIONS_PER_DAY = 3
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000 // 24 horas em milissegundos

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

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitStore.get(ip)

  if (!record || now > record.resetTime) {
    // Primeira requisição ou janela expirada - resetar
    const resetTime = now + RATE_LIMIT_WINDOW
    rateLimitStore.set(ip, { count: 0, resetTime })
    return { allowed: true, remaining: MAX_GENERATIONS_PER_DAY, resetTime }
  }

  if (record.count >= MAX_GENERATIONS_PER_DAY) {
    // Limite excedido
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  // Incrementar contador
  record.count++
  rateLimitStore.set(ip, record)
  
  return {
    allowed: true,
    remaining: MAX_GENERATIONS_PER_DAY - record.count,
    resetTime: record.resetTime,
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const rateLimit = checkRateLimit(ip)

    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetTime)
      return NextResponse.json(
        {
          error: "Daily limit reached",
          message: `You have reached the daily limit of ${MAX_GENERATIONS_PER_DAY} generations. Please try again after ${resetDate.toLocaleString()}`,
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
    const record = rateLimitStore.get(ip)
    const now = Date.now()

    if (!record || now > record.resetTime) {
      return NextResponse.json({
        count: 0,
        limit: MAX_GENERATIONS_PER_DAY,
        remaining: MAX_GENERATIONS_PER_DAY,
        resetTime: now + RATE_LIMIT_WINDOW,
      })
    }

    return NextResponse.json({
      count: record.count,
      limit: MAX_GENERATIONS_PER_DAY,
      remaining: MAX_GENERATIONS_PER_DAY - record.count,
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

