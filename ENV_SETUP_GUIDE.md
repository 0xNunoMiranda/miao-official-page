# 🔑 Guia Completo de Configuração de Variáveis de Ambiente

Este guia explica onde obter cada chave API e como configurá-las.

## 📋 Índice

1. [Base de Dados MySQL/MariaDB](#base-de-dados)
2. [JWT Secret](#jwt-secret)
3. [Solana RPC](#solana-rpc)
4. [Hugging Face](#hugging-face)
5. [Stable Horde](#stable-horde)
6. [OpenAI](#openai)
7. [Telegram Bot](#telegram-bot)
8. [Runware](#runware)

---

## 🗄️ Base de Dados MySQL/MariaDB

### Variáveis Necessárias:
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`

### Onde Configurar:
- **Local:** Configure no seu servidor MySQL/MariaDB local
- **Produção:** Use as credenciais do seu provedor de hospedagem (cPanel, Vercel, etc.)

### Como Obter:
1. Se estiver usando localhost:
   - `DATABASE_HOST=localhost`
   - `DATABASE_PORT=3306` (padrão MySQL)
   - `DATABASE_USER` = seu usuário MySQL
   - `DATABASE_PASSWORD` = sua senha MySQL
   - `DATABASE_NAME=miao_tools` (ou o nome que preferir)

2. Se estiver usando cPanel ou outro provedor:
   - Acesse o painel de controle
   - Vá em "MySQL Databases" ou "Bases de Dados"
   - Crie um novo banco de dados e usuário
   - Use as credenciais fornecidas

---

## 🔐 JWT Secret

### Variável Necessária:
- `JWT_SECRET`

### Onde Obter:
**Gere uma chave secreta forte!**

**Opção 1 - Usando OpenSSL (recomendado):**
```bash
openssl rand -base64 32
```

**Opção 2 - Usando Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Opção 3 - Gerador Online:**
- Acesse: https://randomkeygen.com/
- Use uma "CodeIgniter Encryption Keys" ou "Fort Knox Password"

### ⚠️ IMPORTANTE:
- **NUNCA** use a mesma chave em desenvolvimento e produção
- **NUNCA** commite a chave no Git
- Use uma chave diferente para cada ambiente

---

## ⛓️ Solana RPC

### Variáveis Necessárias:
- `SOLANA_RPC_URL`
- `NEXT_PUBLIC_SOLANA_RPC_URL`

### Onde Obter:

**Opção 1 - RPC Público (Gratuito mas Limitado):**
```
SOLANA_RPC_URL=https://api.mainnet.solana.com
```

**Opção 2 - RPC Privado (Recomendado para Produção):**
- **Helius:** https://www.helius.dev/
- **QuickNode:** https://www.quicknode.com/
- **Alchemy:** https://www.alchemy.com/
- **Triton:** https://triton.one/

**Como Configurar:**
1. Crie uma conta em um dos serviços acima
2. Crie um novo projeto/app
3. Copie a URL do RPC fornecida
4. Cole no `.env.local`

---

## 🤗 Hugging Face

### Variáveis Necessárias:
- `HUGGINGFACE_API_KEY` (obrigatória para imagens avançadas)
- `HUGGINGFACE_API_KEY_2` (opcional - aumenta capacidade)
- `HUGGINGFACE_API_KEY_3`, `HUGGINGFACE_API_KEY_4`, etc. (opcional)

### Onde Obter:

**Passo a Passo:**
1. Acesse: https://huggingface.co/
2. Crie uma conta (gratuita)
3. Vá em: **Settings** → **Access Tokens**
4. Clique em **New Token**
5. Dê um nome ao token (ex: "Miao Tools")
6. Selecione o tipo: **Read** (para uso básico) ou **Write** (se precisar fazer upload)
7. Clique em **Generate Token**
8. **COPIE O TOKEN IMEDIATAMENTE** (não será mostrado novamente!)
9. Formato: `hf_xxxxxxxxxxxxx`

### 💡 Dicas:
- **Capacidade:** Cada token = 1.000 requests/dia (gratuito)
- **Rotação:** Adicione múltiplas keys para aumentar capacidade
- **Texto:** Modelos básicos (gpt2, distilgpt2) funcionam sem token mas são limitados
- **Imagens:** Requer token para modelos avançados

**Links Úteis:**
- Criar Token: https://huggingface.co/settings/tokens
- Documentação: https://huggingface.co/docs/hub/security-tokens

---

## 🎨 Stable Horde

### Variável Necessária:
- `STABLE_HORDE_API_KEY` (opcional)

### Onde Obter:

**Passo a Passo:**
1. Acesse: https://stablehorde.net/
2. Clique em **Register** ou **Login**
3. Crie uma conta (gratuita)
4. Vá em **Account** → **API Keys**
5. Clique em **Create API Key**
6. Copie a chave gerada

### 💡 Dicas:
- **Gratuito:** Sim, mas com rate limits
- **Uso:** Apenas para geração de imagens (não texto)
- **Key Padrão:** Pode usar `lqICemPDKR3ocs7teOaq1g` para testes, mas é recomendado criar sua própria

**Links Úteis:**
- Site: https://stablehorde.net/
- Documentação: https://stablehorde.net/api

---

## 🤖 OpenAI

### Variável Necessária:
- `OPENAI_API_KEY` (opcional)

### Onde Obter:

**Passo a Passo:**
1. Acesse: https://platform.openai.com/
2. Crie uma conta ou faça login
3. Vá em **API Keys** (menu lateral)
4. Clique em **Create new secret key**
5. Dê um nome à chave (ex: "Miao Tools")
6. **COPIE A CHAVE IMEDIATAMENTE** (não será mostrada novamente!)
7. Formato: `sk-xxxxxxxxxxxxx`

### 💰 Custos:
- **Pago:** OpenAI cobra por uso
- **DALL-E:** ~$0.020 por imagem (1024x1024)
- **Recomendação:** Use apenas se precisar de alta qualidade

**Links Úteis:**
- Dashboard: https://platform.openai.com/api-keys
- Preços: https://openai.com/pricing
- Documentação: https://platform.openai.com/docs

---

## 📱 Telegram Bot

### Variáveis Necessárias:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

### Onde Obter:

#### 1. Obter TELEGRAM_BOT_TOKEN:

**Passo a Passo:**
1. Abra o Telegram (app ou web)
2. Procure por: `@BotFather`
3. Clique em **Start** ou **Iniciar**
4. Envie o comando: `/newbot`
5. Digite um nome para o bot (ex: "Miao Image Bot")
6. Digite um username (deve terminar com "bot", ex: "miao_image_bot")
7. O BotFather responderá com o token
8. **COPIE O TOKEN** (formato: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### 2. Obter TELEGRAM_CHAT_ID:

**Opção A - Chat Privado:**
1. Procure pelo bot que você criou (ex: `@miao_image_bot`)
2. Envie qualquer mensagem (ex: "Hello")
3. Abra no navegador: `https://api.telegram.org/botSEU_BOT_TOKEN/getUpdates`
   - Substitua `SEU_BOT_TOKEN` pelo token que você copiou
4. Procure por `"chat":{"id":` no JSON
5. O número após `"id":` é o seu `TELEGRAM_CHAT_ID`

**Opção B - Grupo/Canal:**
1. Crie um grupo ou abra um existente
2. Adicione o bot ao grupo
3. Envie uma mensagem no grupo
4. Acesse: `https://api.telegram.org/botSEU_BOT_TOKEN/getUpdates`
5. Procure por `"chat":{"id":` - será um número negativo (ex: `-1001234567890`)

### 📖 Guia Completo:
Veja `TELEGRAM_SETUP.md` para instruções detalhadas.

**Links Úteis:**
- BotFather: https://t.me/BotFather
- API Docs: https://core.telegram.org/bots/api

---

## 🎬 Runware

### Variável Necessária:
- `RUNWARE_API_KEY` (opcional)

### Onde Obter:

**Passo a Passo:**
1. Acesse: https://runware.ai/
2. Crie uma conta (gratuita)
3. Vá em **Settings** → **API Keys**
4. Clique em **Generate New Key**
5. Copie a chave gerada

### 💡 Dicas:
- **Alternativa:** Para geração de imagens
- **Gratuito:** Sim, com limites
- **Uso:** Opcional - apenas se quiser usar Runware como alternativa

**Links Úteis:**
- Site: https://runware.ai/
- Documentação: https://docs.runware.ai/

---

## 🚀 Configuração Rápida

### 1. Copiar o arquivo de exemplo:
```bash
cp .env.example .env.local
```

### 2. Editar `.env.local`:
Substitua os valores `your_*` e `seu_*` pelas suas chaves reais.

### 3. Variáveis Mínimas Necessárias:
Para funcionar localmente, você precisa pelo menos:
- `DATABASE_HOST`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`
- `JWT_SECRET`

### 4. Variáveis Opcionais (mas Recomendadas):
- `HUGGINGFACE_API_KEY` - Para geração de imagens/texto avançada
- `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` - Para envio automático
- `SOLANA_RPC_URL` - Para funcionalidades de wallet

---

## ✅ Checklist de Configuração

- [ ] Base de dados MySQL/MariaDB configurada
- [ ] JWT_SECRET gerado e configurado
- [ ] (Opcional) Hugging Face API Key obtida
- [ ] (Opcional) Stable Horde API Key obtida
- [ ] (Opcional) OpenAI API Key obtida
- [ ] (Opcional) Telegram Bot Token e Chat ID configurados
- [ ] (Opcional) Runware API Key obtida
- [ ] Arquivo `.env.local` criado e configurado
- [ ] Arquivo `.env.local` adicionado ao `.gitignore` (não commitar!)

---

## 🔒 Segurança

⚠️ **IMPORTANTE:**
- **NUNCA** commite o arquivo `.env.local` no Git
- **NUNCA** compartilhe suas chaves API publicamente
- Use chaves diferentes para desenvolvimento e produção
- Revogue chaves comprometidas imediatamente
- Use variáveis de ambiente do servidor em produção (Vercel, Netlify, etc.)

---

## 📚 Recursos Adicionais

- **README.md** - Documentação principal do projeto
- **TELEGRAM_SETUP.md** - Guia detalhado do Telegram
- **QUICK_SETUP.md** - Setup rápido
- **LOCAL_SETUP.md** - Configuração local detalhada

---

## 🆘 Problemas Comuns

### Erro: "Database connection failed"
- Verifique se MySQL/MariaDB está rodando
- Confirme as credenciais em `.env.local`
- Verifique se a base de dados existe

### Erro: "API key invalid"
- Verifique se copiou a chave completa
- Confirme que não há espaços extras
- Verifique se a chave não expirou

### Erro: "Telegram credentials not configured"
- Verifique se `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` estão configurados
- Confirme que o bot foi criado corretamente
- Verifique se enviou uma mensagem para o bot antes de obter o Chat ID

---

**Última atualização:** Dezembro 2024

