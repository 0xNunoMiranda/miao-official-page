// Sistema compartilhado de rotação de API keys
// Usado tanto para texto quanto para imagens

interface KeyUsage {
  key: string
  requestCount: number
  lastReset: number
  dailyLimit: number
  errors: number
  lastUsed: number
  serviceType: "huggingface" | "stablehorde"
  monthlyLimitReached?: number // Timestamp quando limite mensal foi atingido (null = não atingido)
}

export class ApiKeyRotator {
  private keys: KeyUsage[] = []
  private currentIndex: number = 0
  private readonly DAILY_RESET_MS = 24 * 60 * 60 * 1000 // 24 horas

  constructor(apiKeys: string[], serviceType: "huggingface" | "stablehorde", dailyLimit: number = 1000) {
    const now = Date.now()
    this.keys = apiKeys.map((key) => ({
      key,
      requestCount: 0,
      lastReset: now,
      dailyLimit,
      errors: 0,
      lastUsed: 0,
      serviceType,
    }))
    
    if (this.keys.length > 0) {
      const serviceName = serviceType === "huggingface" ? "Hugging Face" : "Stable Horde"
      console.log(`${serviceName}: ${this.keys.length} API key(s) configurada(s) = ${this.keys.length * dailyLimit} requests/dia disponíveis`)
    }
  }

  private resetIfNeeded(keyUsage: KeyUsage): void {
    const now = Date.now()
    const timeSinceLastReset = now - keyUsage.lastReset
    
    // Reset diário (24 horas) - para limites diários
    if (timeSinceLastReset >= this.DAILY_RESET_MS) {
      const wasExhausted = keyUsage.errors >= 999
      const wasMonthlyLimit = keyUsage.monthlyLimitReached !== undefined
      
      console.log(`Resetting daily limit for ${keyUsage.serviceType} key ${keyUsage.key.substring(0, 8)}...${wasExhausted ? ' (was exhausted)' : ''}${wasMonthlyLimit ? ' (monthly limit was reached)' : ''}`)
      
      keyUsage.requestCount = 0
      keyUsage.lastReset = now
      
      // Se foi limite mensal, verificar se já passou 1 mês (30 dias)
      if (keyUsage.monthlyLimitReached) {
        const MONTHLY_RESET_MS = 30 * 24 * 60 * 60 * 1000 // 30 dias
        const timeSinceMonthlyLimit = now - keyUsage.monthlyLimitReached
        
        if (timeSinceMonthlyLimit >= MONTHLY_RESET_MS) {
          console.log(`Monthly limit reset for key ${keyUsage.key.substring(0, 8)}... (30 days passed)`)
          keyUsage.errors = 0
          keyUsage.monthlyLimitReached = undefined
        } else {
          const daysRemaining = Math.ceil((MONTHLY_RESET_MS - timeSinceMonthlyLimit) / (24 * 60 * 60 * 1000))
          console.log(`Key ${keyUsage.key.substring(0, 8)}... still has monthly limit (${daysRemaining} days remaining)`)
          // Manter errors = 999 para continuar ignorando esta key
        }
      } else {
        // Reset normal de erros (não era limite mensal)
        keyUsage.errors = 0
      }
    }
  }

  getNextAvailableKey(): string | null {
    if (this.keys.length === 0) {
      return null
    }

    if (this.keys.length === 1) {
      const key = this.keys[0]
      this.resetIfNeeded(key)
      // Mesmo com uma key, verificar se não está esgotada
      if (key.errors >= 999) {
        console.warn(`Only API key is exhausted (errors: ${key.errors})`)
        return key.key // Retornar mesmo assim se for a única
      }
      return key.key
    }

    // Rotação round-robin - ignorar keys esgotadas (errors >= 999)
    let attempts = 0
    while (attempts < this.keys.length) {
      const keyUsage = this.keys[this.currentIndex]
      this.resetIfNeeded(keyUsage)

      // Ignorar keys esgotadas (marcadas com errors >= 999)
      if (keyUsage.errors >= 999) {
        this.currentIndex = (this.currentIndex + 1) % this.keys.length
        attempts++
        continue
      }

      if (keyUsage.requestCount < keyUsage.dailyLimit && keyUsage.errors < 10) {
        keyUsage.lastUsed = Date.now()
        return keyUsage.key
      }

      this.currentIndex = (this.currentIndex + 1) % this.keys.length
      attempts++
    }

    // Se todas excederam limite ou estão esgotadas, tentar usar a que tem menos erros e menos requests
    const availableKey = this.keys
      .filter(key => {
        this.resetIfNeeded(key)
        return key.errors < 999 // Ignorar keys esgotadas
      })
      .reduce((min, key) => {
        // Priorizar keys com menos erros, depois menos requests
        if (key.errors < min.errors) return key
        if (key.errors === min.errors && key.requestCount < min.requestCount) return key
        return min
      }, this.keys[0])

    if (availableKey && availableKey.errors < 999) {
      availableKey.lastUsed = Date.now()
      return availableKey.key
    }

    // Último recurso: usar qualquer key disponível (mesmo esgotada)
    console.warn(`All ${this.keys[0].serviceType} API keys have reached limit or are exhausted`)
    const leastExhausted = this.keys.reduce((min, key) => {
      this.resetIfNeeded(key)
      return key.errors < min.errors ? key : min
    })
    return leastExhausted.key
  }

  recordUsage(key: string, success: boolean): void {
    const keyUsage = this.keys.find(k => k.key === key)
    if (keyUsage) {
      if (success) {
        keyUsage.requestCount++
        keyUsage.errors = Math.max(0, keyUsage.errors - 1)
      } else {
        keyUsage.errors++
        // Se houver muitos erros, marcar como esgotada temporariamente
        if (keyUsage.errors >= 10) {
          console.warn(`Key ${key.substring(0, 8)}... has ${keyUsage.errors} errors, marking as exhausted`)
          keyUsage.requestCount = keyUsage.dailyLimit // Marcar como no limite
        }
      }
      
      if (this.keys.length > 1) {
        this.currentIndex = (this.currentIndex + 1) % this.keys.length
      }
    }
  }

  // Método para marcar uma key como esgotada (limite mensal atingido)
  markKeyAsExhausted(key: string, isMonthlyLimit: boolean = true): void {
    const keyUsage = this.keys.find(k => k.key === key)
    if (keyUsage) {
      const limitType = isMonthlyLimit ? "monthly" : "daily"
      console.log(`Marking key ${key.substring(0, 8)}... as exhausted (${limitType} usage limit reached)`)
      keyUsage.errors = 999 // Marcar com muitos erros
      keyUsage.requestCount = keyUsage.dailyLimit // Marcar como no limite
      
      // Se for limite mensal, guardar timestamp
      if (isMonthlyLimit) {
        keyUsage.monthlyLimitReached = Date.now()
        console.log(`Key ${key.substring(0, 8)}... will be available again in ~30 days (monthly limit)`)
      }
      
      // Avançar para próxima key
      if (this.keys.length > 1) {
        this.currentIndex = (this.currentIndex + 1) % this.keys.length
      }
    }
  }

  // Método público para acessar keys (para marcar como esgotadas)
  getKeys(): KeyUsage[] {
    return this.keys
  }

  getStats(): { totalKeys: number; totalRequests: number; totalCapacity: number } {
    let totalRequests = 0
    this.keys.forEach(key => {
      this.resetIfNeeded(key)
      totalRequests += key.requestCount
    })
    
    return {
      totalKeys: this.keys.length,
      totalRequests,
      totalCapacity: this.keys.length * this.keys[0]?.dailyLimit || 0,
    }
  }
}

// Função helper para obter múltiplas keys de environment variables
export function getApiKeysFromEnv(
  baseKeyName: string,
  startIndex: number = 2 // Começar em 2 porque _2 é a segunda key
): string[] {
  const keys: string[] = []
  
  // Key principal (sem número)
  if (process.env[baseKeyName]) {
    keys.push(process.env[baseKeyName] as string)
  }
  
  // Keys adicionais (com número: _2, _3, etc.)
  let index = startIndex
  while (process.env[`${baseKeyName}_${index}`]) {
    keys.push(process.env[`${baseKeyName}_${index}`] as string)
    index++
  }
  
  return keys
}
