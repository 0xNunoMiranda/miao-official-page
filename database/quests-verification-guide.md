# Guia de Verificação de Quests - MIAO Tools

## Visão Geral

Este documento explica como implementar a verificação automática e manual de quests no sistema MIAO Tools.

## Tipos de Verificação

### 1. Verificação Automática - Meme Creation

Quando um usuário cria um meme através do Meme Studio:

```javascript
// app/api/memes/route.ts ou similar
export async function POST(request: Request) {
  const { walletAddress, prompt, imageUrl } = await request.json();
  
  // 1. Salvar meme no banco
  const meme = await db.query(`
    INSERT INTO miao_memes (wallet_address, prompt, image_url)
    VALUES (?, ?, ?)
  `, [walletAddress, prompt, imageUrl]);
  
  // 2. Verificar e atualizar quests relacionadas
  await verifyMemeCreationQuests(walletAddress, meme.id);
  
  return Response.json({ success: true, meme });
}

async function verifyMemeCreationQuests(walletAddress: string, memeId: number) {
  // Quests diárias
  await updateQuestProgress(walletAddress, 'daily_meme_creation', 1);
  
  // Quests semanais
  await updateQuestProgress(walletAddress, 'weekly_meme_creation_10', 1);
  
  // Quest one-time (primeiro meme)
  await checkAndCompleteQuest(walletAddress, 'one_time_first_meme');
  
  // Quest recurring
  await updateQuestProgress(walletAddress, 'recurring_meme_creation', 1);
}
```

### 2. Verificação Automática - Partilhas

Quando um usuário partilha um meme:

```javascript
// app/api/memes/[id]/share/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { walletAddress, platform } = await request.json();
  const memeId = params.id;
  
  // 1. Registrar partilha
  await db.query(`
    INSERT INTO miao_interactions (wallet_address, meme_id, interaction_type)
    VALUES (?, ?, 'share')
    ON DUPLICATE KEY UPDATE created_at = NOW()
  `, [walletAddress, memeId]);
  
  // 2. Atualizar contador de partilhas do meme
  await db.query(`
    UPDATE miao_memes
    SET shares_count = shares_count + 1
    WHERE id = ?
  `, [memeId]);
  
  // 3. Registrar atividade
  await db.query(`
    INSERT INTO miao_activities (wallet_address, activity_type, activity_data)
    VALUES (?, 'share', ?)
  `, [walletAddress, JSON.stringify({ meme_id: memeId, platform })]
  );
  
  // 4. Verificar quests de partilha
  await verifyShareQuests(walletAddress, platform);
  
  return Response.json({ success: true });
}

async function verifyShareQuests(walletAddress: string, platform: string) {
  // Quest diária
  await updateQuestProgress(walletAddress, 'daily_meme_share', 1);
  
  // Quest semanal
  await updateQuestProgress(walletAddress, 'weekly_meme_shares_5', 1);
  
  // Quest one-time (primeira partilha)
  await checkAndCompleteQuest(walletAddress, 'one_time_first_share');
  
  // Quest recurring
  await updateQuestProgress(walletAddress, 'recurring_meme_share', 1);
}
```

### 3. Verificação Automática - Likes

Quando um usuário curte um meme:

```javascript
// app/api/memes/[id]/like/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { walletAddress } = await request.json();
  const memeId = params.id;
  
  // 1. Registrar like
  await db.query(`
    INSERT INTO miao_interactions (wallet_address, meme_id, interaction_type)
    VALUES (?, ?, 'like')
    ON DUPLICATE KEY UPDATE created_at = NOW()
  `, [walletAddress, memeId]);
  
  // 2. Atualizar contador de likes do meme
  await db.query(`
    UPDATE miao_memes
    SET likes_count = likes_count + 1
    WHERE id = ?
  `, [memeId]);
  
  // 3. Verificar quests de like (quem curtiu)
  await verifyLikeQuests(walletAddress);
  
  // 4. Verificar quests de likes recebidos (dono do meme)
  const meme = await db.query(`
    SELECT wallet_address, likes_count FROM miao_memes WHERE id = ?
  `, [memeId]);
  
  if (meme.wallet_address !== walletAddress) {
    await verifyLikesReceivedQuests(meme.wallet_address, meme.likes_count);
  }
  
  return Response.json({ success: true });
}

async function verifyLikeQuests(walletAddress: string) {
  // Quest diária (curtir 3 memes)
  await updateQuestProgress(walletAddress, 'daily_meme_likes', 1);
}

async function verifyLikesReceivedQuests(walletAddress: string, totalLikes: number) {
  // Quest semanal (50 likes totais)
  await updateQuestProgress(walletAddress, 'weekly_50_likes', totalLikes);
  
  // Quest recurring (meme com 50 likes)
  if (totalLikes >= 50) {
    await checkAndCompleteQuest(walletAddress, 'recurring_meme_50_likes');
  }
  
  // Quest recurring (meme com 100 likes)
  if (totalLikes >= 100) {
    await checkAndCompleteQuest(walletAddress, 'recurring_meme_100_likes');
  }
  
  // Quest recurring (meme com 500 likes)
  if (totalLikes >= 500) {
    await checkAndCompleteQuest(walletAddress, 'recurring_meme_500_likes');
  }
}
```

### 4. Verificação Automática - Visita ao Dashboard

Quando um usuário acessa o dashboard:

```javascript
// app/api/user/[walletAddress]/dashboard-visit/route.ts
export async function POST(
  request: Request,
  { params }: { params: { walletAddress: string } }
) {
  const walletAddress = params.walletAddress;
  
  // Registrar visita
  await db.query(`
    INSERT INTO miao_activities (wallet_address, activity_type, activity_data)
    VALUES (?, 'dashboard_visit', ?)
  `, [walletAddress, JSON.stringify({ timestamp: new Date() })]
  );
  
  // Verificar quest diária
  await updateQuestProgress(walletAddress, 'daily_dashboard_visit', 1);
  
  return Response.json({ success: true });
}
```

### 5. Verificação Manual - Twitter API

Para quests que requerem verificação via Twitter API:

```javascript
// app/api/quests/[questKey]/verify/route.ts
export async function POST(
  request: Request,
  { params }: { params: { questKey: string } }
) {
  const { walletAddress, twitterHandle, tweetId } = await request.json();
  
  // Buscar quest
  const quest = await db.query(`
    SELECT * FROM miao_quests WHERE quest_key = ?
  `, [params.questKey]);
  
  if (quest.verification_type !== 'twitter_api') {
    return Response.json({ error: 'Invalid verification type' }, { status: 400 });
  }
  
  // Verificar via Twitter API
  const verified = await verifyTwitterAction(
    quest.verification_data,
    twitterHandle,
    tweetId
  );
  
  if (verified) {
    await completeQuest(walletAddress, params.questKey);
    return Response.json({ success: true, completed: true });
  }
  
  return Response.json({ success: false, verified: false });
}

async function verifyTwitterAction(
  verificationData: any,
  twitterHandle: string,
  tweetId?: string
) {
  // Exemplo: Verificar retweet
  if (verificationData.action === 'retweet') {
    const tweet = await twitterAPI.getTweet(verificationData.tweet_id);
    const userRetweets = await twitterAPI.getUserRetweets(twitterHandle);
    
    return userRetweets.some(rt => rt.id === verificationData.tweet_id);
  }
  
  // Exemplo: Verificar follow
  if (verificationData.action === 'follow') {
    const following = await twitterAPI.getFollowing(twitterHandle);
    return following.some(user => user.username === verificationData.username);
  }
  
  return false;
}
```

### 6. Verificação Manual - Discord API

Para quests que requerem verificação via Discord API:

```javascript
// app/api/quests/[questKey]/verify/route.ts
export async function POST(
  request: Request,
  { params }: { params: { questKey: string } }
) {
  const { walletAddress, discordUserId } = await request.json();
  
  // Buscar quest
  const quest = await db.query(`
    SELECT * FROM miao_quests WHERE quest_key = ?
  `, [params.questKey]);
  
  if (quest.verification_type !== 'discord_api') {
    return Response.json({ error: 'Invalid verification type' }, { status: 400 });
  }
  
  // Verificar via Discord API
  const verified = await verifyDiscordAction(
    quest.verification_data,
    discordUserId
  );
  
  if (verified) {
    await completeQuest(walletAddress, params.questKey);
    return Response.json({ success: true, completed: true });
  }
  
  return Response.json({ success: false, verified: false });
}

async function verifyDiscordAction(
  verificationData: any,
  discordUserId: string
) {
  // Exemplo: Verificar entrada no servidor
  if (verificationData.action === 'join_server') {
    const member = await discordAPI.getGuildMember(
      verificationData.server_id,
      discordUserId
    );
    return member !== null;
  }
  
  return false;
}
```

## Funções Auxiliares

### Atualizar Progresso da Quest

```javascript
async function updateQuestProgress(
  walletAddress: string,
  questKey: string,
  progressIncrement: number
) {
  // Buscar quest
  const quest = await db.query(`
    SELECT id, quest_type, verification_data FROM miao_quests WHERE quest_key = ?
  `, [questKey]);
  
  if (!quest) return;
  
  // Determinar reset_date baseado no tipo
  let resetDate = null;
  if (quest.quest_type === 'daily') {
    resetDate = new Date().toISOString().split('T')[0]; // Hoje
  } else if (quest.quest_type === 'weekly') {
    resetDate = getMondayOfWeek(); // Segunda-feira desta semana
  }
  
  // Buscar ou criar user_quest
  const target = quest.verification_data?.target || 1;
  
  await db.query(`
    INSERT INTO miao_user_quests 
      (wallet_address, quest_id, status, progress, target, reset_date)
    VALUES (?, ?, 'in_progress', ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      progress = LEAST(progress + ?, target),
      status = CASE
        WHEN progress + ? >= target THEN 'completed'
        ELSE 'in_progress'
      END,
      completed_at = CASE
        WHEN progress + ? >= target AND completed_at IS NULL THEN NOW()
        ELSE completed_at
      END
  `, [
    walletAddress,
    quest.id,
    progressIncrement,
    target,
    resetDate,
    progressIncrement,
    progressIncrement,
    progressIncrement
  ]);
}
```

### Completar Quest (One-Time)

```javascript
async function checkAndCompleteQuest(
  walletAddress: string,
  questKey: string
) {
  // Verificar se já foi completada (one-time)
  const existing = await db.query(`
    SELECT uq.status FROM miao_user_quests uq
    JOIN miao_quests q ON uq.quest_id = q.id
    WHERE q.quest_key = ? AND uq.wallet_address = ?
    AND uq.status = 'claimed'
  `, [questKey, walletAddress]);
  
  if (existing) return; // Já foi completada
  
  // Buscar quest
  const quest = await db.query(`
    SELECT id, reward_gems FROM miao_quests WHERE quest_key = ?
  `, [questKey]);
  
  if (!quest) return;
  
  // Completar quest
  await db.query(`
    INSERT INTO miao_user_quests 
      (wallet_address, quest_id, status, progress, target, completed_at)
    VALUES (?, ?, 'completed', 1, 1, NOW())
    ON DUPLICATE KEY UPDATE
      status = 'completed',
      completed_at = COALESCE(completed_at, NOW())
  `, [walletAddress, quest.id]);
}
```

### Reclamar Recompensa

```javascript
// app/api/user/[walletAddress]/quests/[questId]/claim/route.ts
export async function POST(
  request: Request,
  { params }: { params: { walletAddress: string, questId: string } }
) {
  const { walletAddress, questId } = params;
  
  // Verificar se quest está completa
  const userQuest = await db.query(`
    SELECT uq.*, q.reward_gems, q.quest_type
    FROM miao_user_quests uq
    JOIN miao_quests q ON uq.quest_id = q.id
    WHERE uq.wallet_address = ? AND uq.quest_id = ?
  `, [walletAddress, questId]);
  
  if (!userQuest || userQuest.status !== 'completed') {
    return Response.json({ error: 'Quest not completed' }, { status: 400 });
  }
  
  if (userQuest.status === 'claimed') {
    return Response.json({ error: 'Reward already claimed' }, { status: 400 });
  }
  
  // Adicionar gems
  await db.query(`
    UPDATE miao_users
    SET gems = gems + ?
    WHERE wallet_address = ?
  `, [userQuest.reward_gems, walletAddress]);
  
  // Registrar transação de gems
  await db.query(`
    INSERT INTO miao_gem_transactions 
      (wallet_address, amount, type, description)
    VALUES (?, ?, 'earn', ?)
  `, [
    walletAddress,
    userQuest.reward_gems,
    `Quest reward: ${userQuest.title}`
  ]);
  
  // Marcar como reclamada
  await db.query(`
    UPDATE miao_user_quests
    SET status = 'claimed',
        claimed_at = NOW()
    WHERE wallet_address = ? AND quest_id = ?
  `, [walletAddress, questId]);
  
  // Registrar atividade
  await db.query(`
    INSERT INTO miao_activities 
      (wallet_address, activity_type, activity_data)
    VALUES (?, 'quest_claimed', ?)
  `, [walletAddress, JSON.stringify({ quest_id: questId, reward: userQuest.reward_gems })]
  );
  
  return Response.json({ 
    success: true, 
    gems_earned: userQuest.reward_gems 
  });
}
```

## Reset de Quests Diárias/Semanais

### Job Diário (Cron)

```javascript
// jobs/reset-daily-quests.ts
export async function resetDailyQuests() {
  const today = new Date().toISOString().split('T')[0];
  
  await db.query(`
    UPDATE miao_user_quests uq
    JOIN miao_quests q ON uq.quest_id = q.id
    SET uq.status = 'pending',
        uq.progress = 0,
        uq.reset_date = ?
    WHERE q.quest_type = 'daily'
      AND (uq.reset_date IS NULL OR uq.reset_date < ?)
  `, [today, today]);
}
```

### Job Semanal (Cron)

```javascript
// jobs/reset-weekly-quests.ts
export async function resetWeeklyQuests() {
  const monday = getMondayOfWeek(); // Função para obter segunda-feira
  
  await db.query(`
    UPDATE miao_user_quests uq
    JOIN miao_quests q ON uq.quest_id = q.id
    SET uq.status = 'pending',
        uq.progress = 0,
        uq.reset_date = ?
    WHERE q.quest_type = 'weekly'
      AND (uq.reset_date IS NULL OR uq.reset_date < ?)
  `, [monday, monday]);
}

function getMondayOfWeek(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para segunda-feira
  const monday = new Date(today.setDate(diff));
  return monday.toISOString().split('T')[0];
}
```

## Notas Importantes

1. **Verificação Automática**: Quests de criação de meme, partilhas e likes são verificadas automaticamente
2. **Verificação Manual**: Quests de Twitter/Discord requerem botão "Verificar" do usuário
3. **Reset Automático**: Quests diárias resetam à meia-noite UTC, semanais toda segunda-feira
4. **One-Time**: Uma vez completadas, não podem ser repetidas
5. **Recurring**: Sempre disponíveis, podem ser completadas múltiplas vezes
6. **Progresso**: Sistema de progresso (0-target) para quests com múltiplas etapas

