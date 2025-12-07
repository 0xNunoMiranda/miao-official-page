# APIs Gratuitas para Geração de Texto

Lista de alternativas gratuitas para geração de texto (além de Hugging Face):

## 🆓 APIs Completamente Gratuitas

### 1. **Hugging Face Inference API** ✅ (Já implementado)
- **Status**: Implementado
- **Gratuito**: Sim (1000 req/dia com token, alguns modelos sem token)
- **Limite**: 1000 requests/dia por conta
- **Rotação**: Suportado (múltiplas contas = mais capacidade)
- **Vantagem**: Já está funcionando, modelos pequenos funcionam sem token

### 2. **Google Gemini API** ⭐ (Recomendado)
- **Gratuito**: Sim, tier gratuito disponível (SEM cartão de crédito necessário)
- **Limite GRATUITO**: 
  - **Gemini 2.5 Flash**: 15 req/min, 1M tokens/min, 1,500 req/dia
  - **Gemini 2.5 Pro**: 2 req/min, 32k tokens/min, 50 req/dia
- **Requer**: API Key (grátis no Google AI Studio: https://aistudio.google.com)
- **Qualidade**: Excelente (modelo avançado)
- **Vantagem**: Modelo muito mais poderoso que gpt2

#### 💰 Preços (Tier Pago - quando exceder o limite gratuito):

**Gemini 2.5 Flash** (Modelo mais rápido e barato):
- **Input**: $0.30 por milhão de tokens (texto/imagem/vídeo), $1.00 por milhão (áudio)
- **Output**: $2.50 por milhão de tokens
- **Exemplo**: ~1000 palavras geradas ≈ $0.0025

**Gemini 2.5 Pro** (Modelo mais avançado):
- **Input**: $1.25 por milhão de tokens (até 200k tokens), $2.50 por milhão (+200k tokens)
- **Output**: $10.00 por milhão de tokens (até 200k), $15.00 por milhão (+200k)
- **Exemplo**: ~1000 palavras geradas ≈ $0.01

**Modo Batch** (50% desconto - para processamento não-em-tempo-real):
- Pro: Input $0.625-1.25, Output $5.00-7.50 por milhão de tokens

**Resumo**: O tier gratuito é muito generoso (1,500 req/dia Flash). Se exceder, os preços são baixos: ~$0.0025-0.01 por resposta curta.

### 3. **Cohere API** (Free Developer Tier)
- **Gratuito**: Sim (tier gratuito para desenvolvimento)
- **Limite**: Rate-limited (não especificado)
- **Requer**: API Key (grátis)
- **Qualidade**: Boa
- **Limitação**: Apenas para uso não-comercial

## 🔄 Alternativas Locais (Sem API)

### 4. **Modelos Locais via Hugging Face Transformers**
- **Gratuito**: 100%
- **Requer**: Servidor com GPU ou CPU poderosa
- **Modelos**: GPT-2, GPT-Neo, etc.
- **Desvantagem**: Requer recursos computacionais próprios

### 5. **Ollama** (Open Source)
- **Gratuito**: 100%
- **Requer**: Instalação local
- **Modelos**: Llama, Mistral, etc.
- **Desvantagem**: Precisa rodar servidor próprio

## 📊 Comparação Rápida

| API | Gratuito | Limite | Qualidade | Implementação |
|-----|----------|--------|-----------|---------------|
| Hugging Face | ✅ | 1000/dia | Boa | ✅ Implementado |
| Google Gemini | ✅ | 15-2 req/min | Excelente | ⚠️ Pode adicionar |
| Cohere | ✅ | Rate-limited | Boa | ⚠️ Pode adicionar |
| Modelos Locais | ✅ | Ilimitado | Boa | ❌ Requer servidor |

## 💡 Recomendação

**Para o seu caso, as melhores opções são:**

1. **Continuar com Hugging Face** (já implementado)
   - Rotação de múltiplas keys aumenta capacidade
   - Funciona bem para chat curto

2. **Adicionar Google Gemini como fallback** (recomendado)
   - Muito melhor qualidade
   - 15 req/min no tier gratuito
   - Fácil de implementar

3. **Combinar ambas** (melhor estratégia)
   - Hugging Face como primário (gratuito, múltiplas keys)
   - Gemini como fallback para melhor qualidade
   - Distribuição de carga
