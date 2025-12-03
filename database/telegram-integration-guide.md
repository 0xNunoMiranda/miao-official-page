# Integração Telegram - Interações Sociais MIAO

## Visão Geral

Todas as interações sociais dentro do MIAO são automaticamente enviadas para o Telegram, mostrando o conteúdo e o comentário.

## Estrutura

### Tabelas

1. **`miao_telegram_config`**: Configuração do Telegram
   - Bot token e chat ID
   - Tipos de interações habilitadas
   - Formato das mensagens

2. **`miao_telegram_messages`**: Histórico de mensagens enviadas
   - Rastreamento de todas as mensagens
   - Status (pending, sent, failed)
   - Retry automático

## Tipos de Interações Enviadas

### 1. Comentários em Memes
- ✅ Conteúdo do comentário
- ✅ Usuário que comentou
- ✅ Imagem do meme (se disponível)
- ✅ Prompt do meme

### 2. Reações em Memes
- ✅ Tipo de reação (like, love, laugh, etc.)
- ✅ Usuário que reagiu
- ✅ Imagem do meme (se disponível)
- ✅ Prompt do meme

### 3. Follow/Unfollow
- ✅ Usuário que seguiu
- ✅ Usuário seguido
- ✅ Carteira

### 4. Colaborações
- ✅ Colaborador
- ✅ Imagem do meme colaborativo
- ✅ Prompt do meme

### 5. Memes Criados
- ✅ Criador
- ✅ Prompt usado
- ✅ Imagem gerada

## Implementação

### Função Genérica para Enviar ao Telegram

```javascript
// lib/telegram-service.ts
export async function sendSocialInteractionToTelegram(
  interactionType: string,
  relatedType: string,
  relatedId: number,
  walletAddress: string,
  data: {
    content?: string
    imageUrl?: string
    username?: string
    memeUrl?: string
    memePrompt?: string
    reactionType?: string
  }
) {
  try {
    const response = await fetch('/api/telegram/send-social-interaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interactionType,
        relatedType,
        relatedId,
        walletAddress,
        ...data
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to send to Telegram:', error)
      return { success: false, error }
    }

    const result = await response.json()
    
    // Salvar no banco de dados
    await saveTelegramMessage({
      interactionType,
      relatedType,
      relatedId,
      walletAddress,
      telegramMessageId: result.messageId,
      status: 'sent'
    })

    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending to Telegram:', error)
    return { success: false, error }
  }
}
```

### Integração com Comentários

```javascript
// app/api/memes/[memeId]/comments/route.ts
export async function POST(
  request: Request,
  { params }: { params: { memeId: string } }
) {
  const { walletAddress, content, parentCommentId } = await request.json()
  
  // Buscar dados do meme
  const meme = await db.query(`
    SELECT m.*, u.username
    FROM miao_memes m
    LEFT JOIN miao_users u ON m.wallet_address = u.wallet_address
    WHERE m.id = ?
  `, [params.memeId])
  
  // Buscar username do comentador
  const user = await db.query(`
    SELECT username FROM miao_users WHERE wallet_address = ?
  `, [walletAddress])
  
  // Criar comentário
  const comment = await db.query(`
    INSERT INTO miao_meme_comments
      (meme_id, wallet_address, parent_comment_id, content)
    VALUES (?, ?, ?, ?)
  `, [params.memeId, walletAddress, parentCommentId, content])
  
  // Enviar ao Telegram
  await sendSocialInteractionToTelegram(
    'comment',
    'meme',
    params.memeId,
    walletAddress,
    {
      content,
      username: user.username || walletAddress.slice(0, 8),
      memeUrl: meme.image_url,
      memePrompt: meme.prompt
    }
  )
  
  return Response.json({ success: true, comment_id: comment.insertId })
}
```

### Integração com Reações

```javascript
// app/api/memes/[memeId]/reactions/route.ts
export async function POST(
  request: Request,
  { params }: { params: { memeId: string } }
) {
  const { walletAddress, reactionType } = await request.json()
  
  // Buscar dados do meme
  const meme = await db.query(`
    SELECT m.*, u.username
    FROM miao_memes m
    LEFT JOIN miao_users u ON m.wallet_address = u.wallet_address
    WHERE m.id = ?
  `, [params.memeId])
  
  // Buscar username
  const user = await db.query(`
    SELECT username FROM miao_users WHERE wallet_address = ?
  `, [walletAddress])
  
  // Adicionar reação
  await db.query(`
    INSERT INTO miao_meme_reactions
      (meme_id, wallet_address, reaction_type)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE reaction_type = VALUES(reaction_type)
  `, [params.memeId, walletAddress, reactionType])
  
  // Enviar ao Telegram
  await sendSocialInteractionToTelegram(
    'reaction',
    'meme',
    params.memeId,
    walletAddress,
    {
      reactionType,
      username: user.username || walletAddress.slice(0, 8),
      memeUrl: meme.image_url,
      memePrompt: meme.prompt
    }
  )
  
  return Response.json({ success: true })
}
```

### Integração com Follow

```javascript
// app/api/user/[walletAddress]/follow/route.ts
export async function POST(
  request: Request,
  { params }: { params: { walletAddress: string } }
) {
  const { followerWallet } = await request.json()
  const followingWallet = params.walletAddress
  
  // Buscar username
  const follower = await db.query(`
    SELECT username FROM miao_users WHERE wallet_address = ?
  `, [followerWallet])
  
  // Seguir
  await db.query(`
    INSERT INTO miao_user_follows
      (follower_wallet, following_wallet)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE notifications_enabled = TRUE
  `, [followerWallet, followingWallet])
  
  // Enviar ao Telegram
  await sendSocialInteractionToTelegram(
    'follow',
    'user',
    followingWallet,
    followerWallet,
    {
      username: follower.username || followerWallet.slice(0, 8)
    }
  )
  
  return Response.json({ success: true })
}
```

### Integração com Colaborações

```javascript
// app/api/memes/[memeId]/collaborate/route.ts
export async function POST(
  request: Request,
  { params }: { params: { memeId: string } }
) {
  const { walletAddress, role, contributionPercentage } = await request.json()
  
  // Buscar dados do meme
  const meme = await db.query(`
    SELECT m.*, u.username
    FROM miao_memes m
    LEFT JOIN miao_users u ON m.wallet_address = u.wallet_address
    WHERE m.id = ?
  `, [params.memeId])
  
  // Buscar username do colaborador
  const user = await db.query(`
    SELECT username FROM miao_users WHERE wallet_address = ?
  `, [walletAddress])
  
  // Adicionar colaborador
  await db.query(`
    INSERT INTO miao_meme_collaborations
      (meme_id, wallet_address, role, contribution_percentage)
    VALUES (?, ?, ?, ?)
  `, [params.memeId, walletAddress, role, contributionPercentage])
  
  // Enviar ao Telegram
  await sendSocialInteractionToTelegram(
    'collaboration',
    'meme',
    params.memeId,
    walletAddress,
    {
      username: user.username || walletAddress.slice(0, 8),
      memeUrl: meme.image_url,
      memePrompt: meme.prompt
    }
  )
  
  return Response.json({ success: true })
}
```

## Formato das Mensagens no Telegram

### Comentário
```
💬 Novo Comentário

👤 Usuário: @username
💭 Comentário:
[conteúdo do comentário]

🎨 Meme: [prompt do meme]
[imagem do meme]
```

### Reação
```
👍 Nova Reação

👤 Usuário: @username
👍 Reação: like

🎨 Meme: [prompt do meme]
[imagem do meme]
```

### Follow
```
👥 Novo Seguidor

👤 Seguidor: @username
📌 Carteira: 12345678...abcdef
```

### Colaboração
```
🤝 Nova Colaboração

👤 Colaborador: @username

🎨 Meme: [prompt do meme]
[imagem do meme]
```

## Configuração

### Variáveis de Ambiente

```env
TELEGRAM_BOT_TOKEN=seu_bot_token
TELEGRAM_CHAT_ID=seu_chat_id
```

### Configuração no Banco de Dados

```sql
UPDATE miao_telegram_config
SET bot_token = 'seu_token',
    chat_id = 'seu_chat_id',
    enabled_interactions = JSON_ARRAY('all'),
    is_active = TRUE
WHERE config_key = 'main_channel';
```

## Retry Automático

O sistema tenta reenviar mensagens que falharam:

```javascript
// Job para retry de mensagens falhadas
async function retryFailedTelegramMessages() {
  const failedMessages = await db.query(`
    SELECT * FROM miao_telegram_messages
    WHERE status = 'failed'
      AND retry_count < 3
      AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
  `)
  
  for (const msg of failedMessages) {
    // Tentar reenviar
    const result = await sendSocialInteractionToTelegram(...)
    
    if (result.success) {
      await db.query(`
        UPDATE miao_telegram_messages
        SET status = 'sent',
            sent_at = NOW(),
            telegram_message_id = ?,
            retry_count = retry_count + 1
        WHERE id = ?
      `, [result.messageId, msg.id])
    } else {
      await db.query(`
        UPDATE miao_telegram_messages
        SET retry_count = retry_count + 1,
            error_message = ?
        WHERE id = ?
      `, [result.error, msg.id])
    }
  }
}
```

## Notas Importantes

1. **Todas as interações sociais** são enviadas ao Telegram
2. **Conteúdo e comentários** são sempre incluídos
3. **Imagens dos memes** são enviadas quando disponíveis
4. **Retry automático** para mensagens que falharam
5. **Rastreamento completo** de todas as mensagens enviadas
6. **Formato HTML** para mensagens formatadas
7. **Suporte a data URLs** e URLs externas para imagens

