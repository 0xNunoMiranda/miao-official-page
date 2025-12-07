# Capacidade de Tokens da API - Cálculos de Uso

## 📊 Limites do Hugging Face (Tier Gratuito)

### Por Token/Conta:
- **1000 requisições por dia** (reseta a cada 24 horas)
- **Rate limit**: ~100-500 req/min (depende do modelo)

### Sistema de Rotação Implementado:
- **1 key padrão** sempre disponível
- **Keys adicionais** via variáveis de ambiente (`HUGGINGFACE_API_KEY`, `HUGGINGFACE_API_KEY_2`, etc.)
- Cada key adicional = +1000 requisições/dia

## 💬 Capacidade de Conversa

### Cenário 1: 1 Token (1000 req/dia)

**Conversa casual** (10-15 mensagens por conversa):
- 1000 requisições ÷ 15 mensagens = **~66 conversas/dia**
- Se cada conversa dura ~10 minutos = **~11 horas de conversa/dia**

**Conversa intensa** (5-8 mensagens por conversa):
- 1000 requisições ÷ 6 mensagens = **~166 conversas/dia**
- Se cada conversa dura ~5 minutos = **~13 horas de conversa/dia**

**Chat rápido** (2-3 mensagens por conversa):
- 1000 requisições ÷ 2.5 mensagens = **~400 conversas/dia**

### Cenário 2: 2 Tokens (2000 req/dia)

**Com rotação de keys:**
- 2000 requisições/dia = **2x a capacidade**
- **~132 conversas/dia** (casual)
- **~332 conversas/dia** (intensa)
- **~800 conversas/dia** (rápida)

### Cenário 3: 5 Tokens (5000 req/dia)

**Múltiplas contas:**
- 5000 requisições/dia = **5x a capacidade**
- **~330 conversas/dia** (casual)
- **~830 conversas/dia** (intensa)
- **~2000 conversas/dia** (rápida)

## 📈 Estimativas Práticas

### Por Mês (30 dias):

**1 Token:**
- Conversas casuais: **~1,980 conversas/mês** (66/dia × 30)
- Horas de conversa: **~330 horas/mês**

**2 Tokens:**
- Conversas casuais: **~3,960 conversas/mês**
- Horas de conversa: **~660 horas/mês**

**5 Tokens:**
- Conversas casuais: **~9,900 conversas/mês**
- Horas de conversa: **~1,650 horas/mês**

## ⚡ Fatores que Afetam o Uso

### 1. **Tamanho das Respostas**
- **maxLength: 250 tokens** (padrão atual)
- Respostas curtas (50 tokens) = mais requisições possíveis
- Respostas longas (500 tokens) = menos requisições possíveis

### 2. **Retry Logic**
- Sistema tenta novamente em caso de erro (até 2 retries)
- Erros temporários podem usar 2-3 requisições por tentativa
- **Impacto**: Reduz capacidade real em ~5-10% em casos de instabilidade

### 3. **Rate Limits**
- Hugging Face tem limite de requisições por minuto
- Se excedido, requisições são rejeitadas (429 error)
- **Solução**: Sistema de rotação distribui carga entre múltiplas keys

## 🎯 Recomendações

### Para Uso Pessoal/Projeto Pequeno:
- **1-2 tokens**: Suficiente para desenvolvimento e testes
- Capacidade: ~60-130 conversas/dia

### Para Uso Médio:
- **3-5 tokens**: Bom para uso moderado
- Capacidade: ~200-330 conversas/dia

### Para Uso Alto/Produção:
- **10+ tokens**: Para uso intensivo
- Capacidade: ~660+ conversas/dia
- **Alternativa**: Considerar upgrade para tier pago (muito barato: ~$0.0025/resposta)

## 💰 Custo Real (quando exceder gratuito)

Se exceder o limite gratuito:
- **Gemini 2.5 Flash**: $0.0025 por resposta curta (~1000 palavras)
- **1000 respostas extras**: ~$2.50
- Muito barato para produção!

## 📝 Nota Importante

**Os limites são por dia, não por mês!**
- Reseta a cada 24 horas
- Se usar 1000 requisições em 1 dia, terá 1000 novas no dia seguinte
- Não acumula - é um limite diário fixo
