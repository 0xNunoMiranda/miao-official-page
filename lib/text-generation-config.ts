// Configuração centralizada para geração de texto
// Otimizado para máxima escalabilidade e economia

export interface TextGenerationConfig {
  maxLength: number
  temperature: number
  topP: number
  model: string
}

// Configurações otimizadas por tipo de uso
export const TEXT_GENERATION_CONFIGS = {
  // Chat/Conversa - Respostas curtas e rápidas (otimizado para escalabilidade)
  CHAT: {
    maxLength: 20, // Reduzido de 32 para 20 - respostas mais curtas, mais rápido, mais escalável
    temperature: 0.6, // Ligeiramente mais criativo
    topP: 0.85,
    model: "gpt-neo-125M", // Modelo mais leve
  } as TextGenerationConfig,

  // Meme/Conteúdo criativo - Um pouco mais de tokens para criatividade
  CREATIVE: {
    maxLength: 30, // Reduzido de 50 para 30 - ainda criativo, mas mais eficiente
    temperature: 0.7,
    topP: 0.9,
    model: "gpt-neo-125M",
  } as TextGenerationConfig,

  // Conteúdo mais longo quando necessário
  LONG_FORM: {
    maxLength: 50,
    temperature: 0.5,
    topP: 0.8,
    model: "gpt-neo-125M",
  } as TextGenerationConfig,
} as const

// Configuração padrão (mais econômica)
export const DEFAULT_CONFIG = TEXT_GENERATION_CONFIGS.CHAT

/**
 * BENEFÍCIOS DE REDUZIR TOKENS:
 * 
 * 1. VELOCIDADE ⚡
 *    - Menos tokens = menos tempo de processamento
 *    - Respostas instantâneas melhoram UX
 * 
 * 2. ESCALABILIDADE 📈
 *    - Mais requests dentro dos mesmos limites de rate
 *    - Exemplo: 32 tokens vs 20 tokens = 60% mais requests possíveis
 * 
 * 3. DISPONIBILIDADE DE WORKERS 👷
 *    - Workers preferem requests menores (mais rápido de processar)
 *    - Requests menores têm mais chance de serem aceitos
 *    - Menos "No available workers" errors
 * 
 * 4. ECONOMIA 💰
 *    - Menos computação = menos recursos consumidos
 *    - Se usar APIs pagas no futuro, custo proporcionalmente menor
 * 
 * 5. CONFIABILIDADE ✅
 *    - Requests menores são mais confiáveis
 *    - Menos timeouts e falhas
 * 
 * 6. HUGGING FACE FREE TIER 🆓
 *    - Com 1000 req/dia: 20 tokens = 50k tokens/dia vs 32 tokens = 32k tokens/dia
 *    - 56% mais capacidade com tokens menores!
 * 
 * EXEMPLO DE IMPACTO:
 * - Antes: 32 tokens × 1000 req = 32.000 tokens/dia
 * - Agora:  20 tokens × 1000 req = 20.000 tokens/dia (mas 60% mais requests cabem)
 * - Em teoria: 20 tokens × 1600 req = 32.000 tokens/dia (mesmo total, mais requests!)
 */
