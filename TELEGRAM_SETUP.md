# Configuração do Telegram Bot

Para que as imagens geradas sejam automaticamente enviadas para o Telegram, é necessário configurar as seguintes variáveis de ambiente:

## 📋 Passo a Passo Completo

### 1. Obter o `TELEGRAM_BOT_TOKEN`

#### Passo 1: Abrir o BotFather
1. Abra o Telegram (no celular ou desktop)
2. Na barra de pesquisa, procure por: `@BotFather`
3. **IMPORTANTE:** Você não precisa "adicionar" o BotFather como contato
   - Apenas clique nele na lista de resultados
   - Ou digite `@BotFather` na barra de pesquisa e pressione Enter
   - O BotFather aparecerá como uma conversa (não precisa adicionar)
4. Clique em "Iniciar" ou "Start" para começar a conversar

#### Passo 2: Criar um novo bot
1. Envie o comando: `/newbot`
2. O BotFather vai pedir um nome para o bot (ex: "Miao Image Bot")
   - Envie o nome desejado
3. Depois vai pedir um username (deve terminar com "bot", ex: "miao_image_bot")
   - Envie o username desejado
4. O BotFather vai responder com uma mensagem como:
   ```
   Done! Congratulations on your new bot. You will find it at t.me/miao_image_bot. 
   Use this token to access the HTTP API:
   
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   
   Keep your token secure and store it safely...
   ```

#### Passo 3: Copiar o Token
- Copie o token que aparece na mensagem (ex: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)
- Este é o seu `TELEGRAM_BOT_TOKEN`

---

### 2. Obter o `TELEGRAM_CHAT_ID`

Você tem duas opções: enviar para uma conversa privada ou para um grupo/canal.

#### Opção A: Chat Privado (Conversa com você mesmo)

1. **Enviar mensagem para o bot:**
   - Abra o Telegram
   - Procure pelo bot que você criou (ex: `@miao_image_bot`)
   - Clique nele e envie qualquer mensagem (ex: "Hello" ou "/start")
   - **Nota:** O bot não vai responder nada - isso é normal! O bot ainda não tem comandos programados.
   - O importante é que você enviou a mensagem, isso já é suficiente.

2. **Obter o Chat ID:**
   - Abra o navegador (Chrome, Firefox, etc.)
   - Acesse esta URL (substitua `SEU_BOT_TOKEN` pelo token que você copiou do BotFather):
     ```
     https://api.telegram.org/botSEU_BOT_TOKEN/getUpdates
     ```
   - **Exemplo prático:** Se seu token for `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`, a URL seria:
     ```
     https://api.telegram.org/bot1234567890:ABCdefGHIjklMNOpqrsTUVwxyz/getUpdates
     ```
   - **IMPORTANTE:** O token completo do BotFather tem o formato `número:hash` (ex: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)
   - Cole a URL completa na barra de endereços e pressione Enter
   - **Se der erro:** Verifique se copiou o token completo do BotFather (deve ter dois pontos `:` no meio)
   
3. **Encontrar o Chat ID:**
   - Você verá uma página com texto JSON
   - **Se você ver `{"ok":true,"result":[]}`:**
     - Isso significa que não há mensagens ainda ou as mensagens foram consumidas
     - **Solução:** Envie uma mensagem para o bot AGORA (ex: "test" ou "hello")
     - **IMPORTANTE:** Envie a mensagem DEPOIS de acessar a URL pela primeira vez
     - Aguarde 2-3 segundos
     - Recarregue a página do navegador (F5 ou Ctrl+R)
     - Agora você deve ver o JSON com as informações
   - Procure por `"chat":{"id":` (use Ctrl+F para buscar)
   - O número logo após `"id":` é o seu `TELEGRAM_CHAT_ID`
   - **Exemplo:** Se você ver `"chat":{"id":123456789,` → o chat_id é `123456789`
   - Copie esse número (pode ser positivo ou negativo)
   
   **Dica:** Se ainda não aparecer nada, tente enviar outra mensagem para o bot e recarregue a página novamente.

#### Opção B: Grupo ou Canal (Recomendado para compartilhar imagens)

1. **Adicionar o bot ao grupo:**
   - Crie um grupo no Telegram ou abra um grupo existente
   - No grupo, clique no nome do grupo no topo (ou nas configurações do grupo)
   - Vá em "Adicionar membros" ou "Add Members"
   - Na barra de pesquisa, digite: `@miao_image_bot` (ou o username do seu bot)
   - Selecione o bot e adicione ao grupo
   - **IMPORTANTE:** O bot precisa estar no grupo para receber as atualizações

2. **Enviar mensagem no grupo:**
   - Envie qualquer mensagem no grupo (pode ser você mesmo, ex: "test" ou "hello")
   - Isso é necessário para que o bot "veja" o grupo e obtenha o chat_id

3. **Obter o Chat ID do grupo:**
   - Abra o navegador
   - Acesse a mesma URL: `https://api.telegram.org/botSEU_BOT_TOKEN/getUpdates`
   - Procure por `"chat":{"id":` (use Ctrl+F)
   - **IMPORTANTE:** Para grupos, o ID será um número negativo (ex: `-1001234567890`)
   - Procure pelo número que começa com `-` (sinal negativo)
   - Copie esse número **incluindo o sinal negativo** (ex: `-1001234567890`)
   - Este é o seu `TELEGRAM_CHAT_ID` para o grupo

4. **Verificar se está correto:**
   - O chat_id de grupos sempre começa com `-` (negativo)
   - Grupos normais: começam com `-` (ex: `-123456789`)
   - Supergrupos: começam com `-100` (ex: `-1001234567890`)

---

## 🔧 Configuração Final

Depois de obter ambos os valores, adicione-os ao seu arquivo `.env.local` (desenvolvimento) ou nas variáveis de ambiente do servidor (produção):

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

**Para produção (Vercel, Netlify, etc.):**
- Vá nas configurações do projeto
- Seção "Environment Variables" ou "Variáveis de Ambiente"
- Adicione as duas variáveis com os valores obtidos

---

## ✅ Teste Rápido

Para testar se está funcionando:

1. Configure as variáveis de ambiente
2. Gere uma imagem no Miao Army Generator
3. Verifique se a imagem aparece no chat do Telegram configurado

---

## 🔒 Segurança

⚠️ **IMPORTANTE:**
- Nunca compartilhe seu bot token publicamente
- Nunca commite o arquivo `.env.local` no Git
- Mantenha o token seguro e não o exponha em código público

## Configuração

Adicione as variáveis ao seu arquivo `.env.local` (ou `.env` em produção):

```env
TELEGRAM_BOT_TOKEN=seu_token_aqui
TELEGRAM_CHAT_ID=seu_chat_id_aqui
```

## Como Funciona

Quando uma imagem é gerada no **Miao Army Generator**:
1. A imagem é gerada normalmente
2. Automaticamente (em background), a imagem é enviada para o chat do Telegram configurado
3. A mensagem inclui o prompt usado para gerar a imagem
4. Se o envio falhar, não afeta a experiência do usuário (apenas loga um aviso no console)

## Segurança

⚠️ **IMPORTANTE:** Nunca commite o arquivo `.env.local` ou `.env` com as credenciais reais. Essas variáveis devem ser configuradas apenas no servidor de produção através das configurações de ambiente da plataforma de hospedagem (Vercel, Netlify, etc.).

