# 🔑 Chaves API Requeridas - Resumo Rápido

## ✅ Checklist de Configuração

### 🔴 OBRIGATÓRIAS (Mínimo para funcionar)

| Variável | Onde Obter | Link |
|----------|------------|------|
| `DATABASE_HOST` | Seu servidor MySQL/MariaDB | - |
| `DATABASE_USER` | Seu servidor MySQL/MariaDB | - |
| `DATABASE_PASSWORD` | Seu servidor MySQL/MariaDB | - |
| `DATABASE_NAME` | Seu servidor MySQL/MariaDB | - |
| `JWT_SECRET` | Gerar localmente | `openssl rand -base64 32` |

### 🟡 RECOMENDADAS (Para funcionalidades completas)

| Variável | Onde Obter | Link | Capacidade |
|----------|------------|------|------------|
| `HUGGINGFACE_API_KEY` | Hugging Face | https://huggingface.co/settings/tokens | 1.000 req/dia |
| `TELEGRAM_BOT_TOKEN` | BotFather | https://t.me/BotFather | - |
| `TELEGRAM_CHAT_ID` | Via API Telegram | Ver TELEGRAM_SETUP.md | - |
| `SOLANA_RPC_URL` | RPC Provider | Ver abaixo | - |

### 🟢 OPCIONAIS (Para recursos extras)

| Variável | Onde Obter | Link | Uso |
|----------|------------|------|-----|
| `HUGGINGFACE_API_KEY_2` | Hugging Face | https://huggingface.co/settings/tokens | +1.000 req/dia |
| `STABLE_HORDE_API_KEY` | Stable Horde | https://stablehorde.net/ | Imagens |
| `OPENAI_API_KEY` | OpenAI | https://platform.openai.com/api-keys | Imagens (pago) |
| `RUNWARE_API_KEY` | Runware | https://runware.ai/ | Imagens |

---

## 📍 Links Diretos para Obter Chaves

### 1. 🤗 Hugging Face
- **Criar Token:** https://huggingface.co/settings/tokens
- **Documentação:** https://huggingface.co/docs/hub/security-tokens
- **Capacidade:** 1.000 requests/dia por token (gratuito)

### 2. 📱 Telegram Bot
- **BotFather:** https://t.me/BotFather
- **Comando:** `/newbot`
- **Guia Completo:** Ver `TELEGRAM_SETUP.md`
- **Obter Chat ID:** `https://api.telegram.org/botSEU_TOKEN/getUpdates`

### 3. ⛓️ Solana RPC (Gratuito)
- **RPC Público:** `https://api.mainnet.solana.com` (padrão)
- **RPC Privado (Recomendado):**
  - Helius: https://www.helius.dev/
  - QuickNode: https://www.quicknode.com/
  - Alchemy: https://www.alchemy.com/

### 4. 🎨 Stable Horde
- **Site:** https://stablehorde.net/
- **Registro:** Gratuito
- **Uso:** Apenas imagens

### 5. 🤖 OpenAI
- **Dashboard:** https://platform.openai.com/api-keys
- **Preços:** https://openai.com/pricing
- **Uso:** Imagens DALL-E (pago)

### 6. 🎬 Runware
- **Site:** https://runware.ai/
- **Registro:** Gratuito
- **Uso:** Imagens alternativas

---

## 📝 Template de `.env.local`

```env
# ============================================
# BASE DE DADOS (OBRIGATÓRIO)
# ============================================
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=seu_usuario
DATABASE_PASSWORD=sua_password
DATABASE_NAME=miao_tools

# ============================================
# JWT SECRET (OBRIGATÓRIO)
# ============================================
# Gerar com: openssl rand -base64 32
JWT_SECRET=sua_chave_secreta_aqui

# ============================================
# SOLANA RPC (RECOMENDADO)
# ============================================
SOLANA_RPC_URL=https://api.mainnet.solana.com
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet.solana.com

# ============================================
# HUGGING FACE (RECOMENDADO)
# ============================================
# Obter em: https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=hf_your_key_here
HUGGINGFACE_API_KEY_2=hf_your_second_key_here

# ============================================
# TELEGRAM BOT (RECOMENDADO)
# ============================================
# Obter em: https://t.me/BotFather
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

# ============================================
# STABLE HORDE (OPCIONAL)
# ============================================
# Obter em: https://stablehorde.net/
STABLE_HORDE_API_KEY=lqICemPDKR3ocs7teOaq1g

# ============================================
# OPENAI (OPCIONAL - PAGO)
# ============================================
# Obter em: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your_key_here

# ============================================
# RUNWARE (OPCIONAL)
# ============================================
# Obter em: https://runware.ai/
RUNWARE_API_KEY=your_key_here

# ============================================
# SERVIDOR
# ============================================
PORT=3000
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

---

## 🚀 Passos Rápidos

1. **Copiar template:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Editar `.env.local`** com suas chaves reais

3. **Gerar JWT_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

4. **Obter Hugging Face Token:**
   - Acesse: https://huggingface.co/settings/tokens
   - Clique em "New Token"
   - Copie o token (formato: `hf_xxxxx`)

5. **Configurar Telegram (opcional):**
   - Ver `TELEGRAM_SETUP.md` para guia completo

---

## 📚 Documentação Completa

Para instruções detalhadas de cada serviço, consulte:
- **`ENV_SETUP_GUIDE.md`** - Guia completo com passo a passo
- **`TELEGRAM_SETUP.md`** - Configuração detalhada do Telegram
- **`README.md`** - Documentação principal

---

**Última atualização:** Dezembro 2024

