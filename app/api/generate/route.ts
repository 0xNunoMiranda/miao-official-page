import { NextRequest, NextResponse } from "next/server"

// Rate limiting storage (em produção, use Redis ou banco de dados)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const MAX_GENERATIONS_PER_DAY = 3
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000 // 24 horas em milissegundos

// Limpar rate limit store quando o limite mudar (útil durante desenvolvimento)
function resetRateLimitStore() {
  rateLimitStore.clear()
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
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitStore.get(ip)

  if (!record || now > record.resetTime) {
    // Primeira requisição ou janela expirada - resetar
    const resetTime = now + RATE_LIMIT_WINDOW
    rateLimitStore.set(ip, { count: 0, resetTime })
    return { allowed: true, remaining: MAX_GENERATIONS_PER_DAY, resetTime }
  }

  // Se o count antigo exceder o novo limite, resetar (útil quando o limite aumenta)
  if (record.count >= MAX_GENERATIONS_PER_DAY) {
    // Limite excedido
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  // NÃO incrementar aqui - só verificar se pode gerar
  return {
    allowed: true,
    remaining: MAX_GENERATIONS_PER_DAY - record.count,
    resetTime: record.resetTime,
  }
}

// Confirmar geração (incrementar contador após sucesso)
function confirmGeneration(ip: string): { success: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitStore.get(ip)

  if (!record || now > record.resetTime) {
    // Se não há record, criar um novo
    const resetTime = now + RATE_LIMIT_WINDOW
    rateLimitStore.set(ip, { count: 1, resetTime })
    return { success: true, remaining: MAX_GENERATIONS_PER_DAY - 1 }
  }

  // Verificar se ainda pode incrementar (proteção extra)
  if (record.count >= MAX_GENERATIONS_PER_DAY) {
    return { success: false, remaining: 0 }
  }

  // Incrementar contador
  record.count++
  rateLimitStore.set(ip, record)
  
  return {
    success: true,
    remaining: MAX_GENERATIONS_PER_DAY - record.count,
  }
}

// Endpoint para verificar se pode gerar (sem incrementar)
export async function POST(request: NextRequest) {
  try {
    let action = "check"
    try {
      const body = await request.json()
      action = body.action || "check"
    } catch {
      // Se não conseguir fazer parse, assume "check" (compatibilidade com requisições antigas)
      action = "check"
    }
    
    const ip = getClientIP(request)

    // Se for confirmação de geração bem-sucedida, incrementar
    if (action === "confirm") {
      const result = confirmGeneration(ip)
      
      if (!result.success) {
        return NextResponse.json(
          {
            error: "Daily limit reached",
            message: `You have reached the daily limit of ${MAX_GENERATIONS_PER_DAY} generations.`,
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

    // Garantir que o remaining nunca seja negativo e sempre use o limite atual
    const remaining = Math.max(0, MAX_GENERATIONS_PER_DAY - record.count)
    
    return NextResponse.json({
      count: record.count,
      limit: MAX_GENERATIONS_PER_DAY,
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

