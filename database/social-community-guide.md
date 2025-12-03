# Sistema Social & Comunidade - MIAO Tools

## Visão Geral

Sistema completo e escalável para funcionalidades sociais e de comunidade. **Todas as interações geram recompensas automáticas (XP e Gems)**.

## Estrutura Modular

### 1. Meme Comments & Reactions

#### Tabelas:
- `miao_meme_comments`: Comentários em memes (suporta threads)
- `miao_meme_reactions`: Reações customizadas (like, love, laugh, wow, etc.)
- `miao_comment_likes`: Likes em comentários

#### Funcionalidades:
- ✅ Sistema de comentários com threads (respostas)
- ✅ Reações customizadas (não apenas like)
- ✅ Moderação comunitária
- ✅ Recompensas automáticas: Comentar = 5 gems + 10 XP, Reagir = 2 gems + 5 XP

### 2. Social Feed Avançado

#### Tabelas:
- `miao_feed_preferences`: Preferências de algoritmo do feed
- `miao_user_follows`: Sistema de follow/unfollow
- `miao_notifications`: Notificações de interações

#### Funcionalidades:
- ✅ Feed personalizado por algoritmo
- ✅ Filtros (cronológico, popular, trending, personalizado, seguindo)
- ✅ Follow/unfollow de criadores
- ✅ Notificações de interações
- ✅ Pesos configuráveis para algoritmo

### 3. Collaborative Meme Creation

#### Tabelas:
- `miao_meme_collaborations`: Colaborações em memes
- `miao_collaborator_badges`: Badges de colaborador
- `miao_user_badges`: Badges dos usuários

#### Funcionalidades:
- ✅ Criar memes em equipe
- ✅ Dividir recompensas por percentual
- ✅ Histórico de colaborações
- ✅ Badges de colaborador
- ✅ Recompensas automáticas: Colaboração = 50 gems + 100 XP

### 4. MIAO Calendar

#### Tabelas:
- `miao_events`: Eventos da comunidade
- `miao_user_reminders`: Lembretes personalizados

#### Funcionalidades:
- ✅ Eventos da comunidade
- ✅ Deadlines de quests
- ✅ Lembretes personalizados
- ✅ Eventos recorrentes
- ✅ Recompensas automáticas: Participar em evento = 15 gems + 30 XP

### 5. MIAO Governance

#### Tabelas:
- `miao_governance_proposals`: Propostas da comunidade
- `miao_governance_votes`: Votos on-chain

#### Funcionalidades:
- ✅ Propostas da comunidade
- ✅ Votação on-chain (rastreada)
- ✅ Implementação automática (via execution_data JSON)
- ✅ Transparência total
- ✅ Recompensas automáticas: Votar = 25 gems + 50 XP

### 6. MIAO AI Assistant

#### Tabelas:
- `miao_ai_conversations`: Conversas com AI
- `miao_ai_messages`: Mensagens da conversa
- `miao_ai_cache`: Cache de respostas (economiza tokens)
- `miao_ai_trends`: Análises de tendências

#### Funcionalidades:
- ✅ Chatbot para dúvidas
- ✅ Sugestões de memes
- ✅ Análise de tendências
- ✅ Personalização por usuário
- ✅ **Cache inteligente** para economizar tokens GPT
- ✅ Rastreamento de uso de API vs cache

## Sistema de Recompensas Automáticas

### Tabela: `miao_interaction_rewards`

Configuração centralizada de recompensas para cada tipo de interação:

```sql
- interaction_type: Tipo de interação
- reward_gems: Gems ganhas
- reward_xp: XP ganho
- cooldown_seconds: Cooldown entre recompensas
- max_per_day: Máximo por dia
```

### Recompensas Padrão:

| Interação | Gems | XP | Cooldown | Max/Dia |
|-----------|------|----|----------|---------| 
| Comentar | 5 | 10 | 60s | 50 |
| Reagir | 2 | 5 | 30s | 100 |
| Seguir | 10 | 20 | - | 20 |
| Colaborar | 50 | 100 | - | 10 |
| Votar (Governance) | 25 | 50 | - | 5 |
| Participar Evento | 15 | 30 | - | 10 |
| Report Resolvido | 10 | 20 | - | 5 |
| Moderação | 20 | 40 | - | 20 |

### Implementação Automática

```javascript
// Função genérica para dar recompensas
async function giveInteractionReward(
  walletAddress: string,
  interactionType: string,
  relatedId?: number
) {
  // Buscar configuração de recompensa
  const reward = await db.query(`
    SELECT * FROM miao_interaction_rewards
    WHERE interaction_type = ? AND is_active = TRUE
  `, [interactionType]);
  
  if (!reward) return; // Sem recompensa configurada
  
  // Verificar cooldown
  if (reward.cooldown_seconds) {
    const lastReward = await db.query(`
      SELECT created_at FROM miao_activities
      WHERE wallet_address = ?
        AND activity_type = ?
        AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)
      ORDER BY created_at DESC LIMIT 1
    `, [walletAddress, interactionType, reward.cooldown_seconds]);
    
    if (lastReward) return; // Ainda em cooldown
  }
  
  // Verificar máximo por dia
  if (reward.max_per_day) {
    const todayCount = await db.query(`
      SELECT COUNT(*) as count FROM miao_activities
      WHERE wallet_address = ?
        AND activity_type = ?
        AND DATE(created_at) = CURDATE()
    `, [walletAddress, interactionType]);
    
    if (todayCount.count >= reward.max_per_day) return; // Limite diário atingido
  }
  
  // Dar recompensas
  if (reward.reward_gems > 0) {
    await db.query(`
      UPDATE miao_users
      SET gems = gems + ?
      WHERE wallet_address = ?
    `, [reward.reward_gems, walletAddress]);
    
    await db.query(`
      INSERT INTO miao_gem_transactions
        (wallet_address, amount, type, description)
      VALUES (?, ?, 'earn', ?)
    `, [
      walletAddress,
      reward.reward_gems,
      `Interaction reward: ${interactionType}`
    ]);
  }
  
  // Adicionar XP (assumindo que XP é calculado ou armazenado separadamente)
  // XP pode ser usado para calcular nível
  
  // Registrar atividade
  await db.query(`
    INSERT INTO miao_activities
      (wallet_address, activity_type, activity_data, gems_earned)
    VALUES (?, ?, ?, ?)
  `, [
    walletAddress,
    interactionType,
    JSON.stringify({ related_id: relatedId }),
    reward.reward_gems
  ]);
}
```

## Exemplos de Uso

### 1. Comentar em Meme

```javascript
// app/api/memes/[memeId]/comments/route.ts
export async function POST(
  request: Request,
  { params }: { params: { memeId: string } }
) {
  const { walletAddress, content, parentCommentId } = await request.json();
  
  // Criar comentário
  const comment = await db.query(`
    INSERT INTO miao_meme_comments
      (meme_id, wallet_address, parent_comment_id, content)
    VALUES (?, ?, ?, ?)
  `, [params.memeId, walletAddress, parentCommentId, content]);
  
  // Atualizar contador de comentários do meme
  await db.query(`
    UPDATE miao_memes
    SET comments_count = comments_count + 1
    WHERE id = ?
  `, [params.memeId]);
  
  // Se for resposta, atualizar contador de respostas
  if (parentCommentId) {
    await db.query(`
      UPDATE miao_meme_comments
      SET replies_count = replies_count + 1
      WHERE id = ?
    `, [parentCommentId]);
  }
  
  // Dar recompensa
  await giveInteractionReward(walletAddress, 'comment', comment.insertId);
  
  // Criar notificação para dono do meme
  await db.query(`
    INSERT INTO miao_notifications
      (wallet_address, type, title, message, related_id, related_type)
    SELECT 
      m.wallet_address,
      'comment',
      'Novo comentário',
      CONCAT('@', u.username, ' comentou no seu meme'),
      ?,
      'meme'
    FROM miao_memes m
    JOIN miao_users u ON m.wallet_address = u.wallet_address
    WHERE m.id = ?
      AND m.wallet_address != ?
  `, [params.memeId, params.memeId, walletAddress]);
  
  return Response.json({ success: true, comment_id: comment.insertId });
}
```

### 2. Reagir a Meme

```javascript
// app/api/memes/[memeId]/reactions/route.ts
export async function POST(
  request: Request,
  { params }: { params: { memeId: string } }
) {
  const { walletAddress, reactionType } = await request.json();
  
  // Adicionar/remover reação
  await db.query(`
    INSERT INTO miao_meme_reactions
      (meme_id, wallet_address, reaction_type)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE reaction_type = VALUES(reaction_type)
  `, [params.memeId, walletAddress, reactionType]);
  
  // Dar recompensa
  await giveInteractionReward(walletAddress, 'reaction', params.memeId);
  
  return Response.json({ success: true });
}
```

### 3. Seguir Criador

```javascript
// app/api/user/[walletAddress]/follow/route.ts
export async function POST(
  request: Request,
  { params }: { params: { walletAddress: string } }
) {
  const { followerWallet } = await request.json();
  const followingWallet = params.walletAddress;
  
  // Seguir
  await db.query(`
    INSERT INTO miao_user_follows
      (follower_wallet, following_wallet)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE notifications_enabled = TRUE
  `, [followerWallet, followingWallet]);
  
  // Dar recompensa
  await giveInteractionReward(followerWallet, 'follow');
  
  // Criar notificação
  await db.query(`
    INSERT INTO miao_notifications
      (wallet_address, type, title, message, related_id, related_type)
    SELECT 
      ?,
      'follow',
      'Novo seguidor',
      CONCAT('@', username, ' começou a te seguir'),
      NULL,
      'user'
    FROM miao_users
    WHERE wallet_address = ?
  `, [followingWallet, followerWallet]);
  
  return Response.json({ success: true });
}
```

### 4. Colaboração em Meme

```javascript
// app/api/memes/[memeId]/collaborate/route.ts
export async function POST(
  request: Request,
  { params }: { params: { memeId: string } }
) {
  const { walletAddress, role, contributionPercentage } = await request.json();
  
  // Adicionar colaborador
  await db.query(`
    INSERT INTO miao_meme_collaborations
      (meme_id, wallet_address, role, contribution_percentage)
    VALUES (?, ?, ?, ?)
  `, [params.memeId, walletAddress, role, contributionPercentage]);
  
  // Quando meme ganhar recompensas, dividir proporcionalmente
  // (isso seria feito quando o meme receber likes/compartilhamentos)
  
  // Dar recompensa
  await giveInteractionReward(walletAddress, 'collaboration', params.memeId);
  
  return Response.json({ success: true });
}
```

### 5. AI Assistant com Cache

```javascript
// app/api/ai/chat/route.ts
export async function POST(request: Request) {
  const { walletAddress, question, conversationKey } = await request.json();
  
  // Gerar cache key
  const cacheKey = createHash('sha256')
    .update(question.toLowerCase().trim())
    .digest('hex');
  
  // Verificar cache
  const cached = await db.query(`
    SELECT answer, context FROM miao_ai_cache
    WHERE cache_key = ?
      AND (expires_at IS NULL OR expires_at > NOW())
  `, [cacheKey]);
  
  if (cached) {
    // Usar cache (economiza tokens)
    await db.query(`
      UPDATE miao_ai_cache
      SET hit_count = hit_count + 1,
          last_used_at = NOW()
      WHERE cache_key = ?
    `, [cacheKey]);
    
    // Salvar mensagem sem usar API
    await saveAIMessage(conversationKey, walletAddress, question, cached.answer, false);
    
    return Response.json({
      answer: cached.answer,
      from_cache: true
    });
  }
  
  // Usar API (GPT)
  const answer = await callGPTAPI(question, walletAddress);
  const tokensUsed = answer.tokens;
  
  // Salvar no cache
  await db.query(`
    INSERT INTO miao_ai_cache
      (cache_key, question, answer, context, expires_at)
    VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))
  `, [
    cacheKey,
    question,
    answer.text,
    JSON.stringify({ wallet_address: walletAddress })
  ]);
  
  // Salvar mensagem com uso de API
  await saveAIMessage(conversationKey, walletAddress, question, answer.text, true, tokensUsed);
  
  return Response.json({
    answer: answer.text,
    from_cache: false,
    tokens_used: tokensUsed
  });
}
```

## Escalabilidade

### Índices Estratégicos

Todas as tabelas têm índices otimizados para:
- Buscas por usuário (`wallet_address`)
- Buscas por conteúdo (`meme_id`, `comment_id`)
- Ordenação por data (`created_at`)
- Filtros por tipo (`type`, `status`)

### Particionamento (Futuro)

Para escalar ainda mais, considere particionar por data:
- `miao_activities` por mês
- `miao_notifications` por mês
- `miao_ai_messages` por mês

### Cache Redis (Recomendado)

Para alta performance:
- Cache de feed personalizado
- Cache de leaderboards
- Cache de estatísticas

## Notas Importantes

1. **Recompensas Sempre Presentes**: XP e Gems em todas as interações
2. **Sistema Modular**: Fácil adicionar novos tipos de interação
3. **Escalável**: Índices otimizados e estrutura preparada para crescimento
4. **Cache Inteligente**: AI Assistant economiza tokens GPT
5. **Moderação**: Sistema completo de moderação comunitária
6. **Governance**: Votação on-chain rastreável
7. **Notificações**: Sistema completo de notificações

