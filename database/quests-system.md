# Sistema de Quests - MIAO Tools

## Visão Geral

Sistema completo de quests (missões) para gamificação e engajamento dos usuários. As quests são categorizadas em **diárias**, **semanais**, **one-time** e **recurring**.

## Tipos de Quests

### 1. Daily (Diárias)
- Resetam todos os dias à meia-noite (UTC)
- Recompensas menores mas consistentes
- Exemplos: Gerar 1 meme, Partilhar 1 meme, Curtir 3 memes

### 2. Weekly (Semanais)
- Resetam toda segunda-feira à meia-noite (UTC)
- Recompensas maiores
- Exemplos: Gerar 10 memes, Partilhar 5 memes, Completar 7 quests diárias

### 3. One-Time (Únicas)
- Completadas apenas uma vez por usuário
- Recompensas grandes
- Exemplos: Primeira conexão de carteira, Primeiro meme criado, Primeira partilha

### 4. Recurring (Recorrentes)
- Sempre disponíveis, podem ser completadas múltiplas vezes
- Exemplos: Cada meme criado, Cada partilha, Cada nível alcançado

## Tipos de Verificação

### 1. Manual
- Usuário marca como completa
- Requer aprovação administrativa (opcional)
- Exemplos: Quest de seguir no Twitter, Quest de entrar no Discord

### 2. Twitter API
- Verificação automática via Twitter API
- Exemplos: Retweet do post fixado, Tweet com hashtag #MIAO

### 3. Discord API
- Verificação automática via Discord API
- Exemplos: Entrar no servidor Discord, Reagir a mensagem

### 4. Wallet Balance
- Verificação baseada em saldo da carteira
- Exemplos: Ter X $MIAO tokens, Ter X SOL

### 5. Meme Creation
- Verificação automática quando meme é criado
- Exemplos: Criar 1 meme, Criar 5 memes, Criar meme com X likes

### 6. Activity Based
- Verificação baseada em atividades registradas
- Exemplos: Partilhar meme, Curtir meme, Comentar meme

## Estrutura de Dados

### Tabela `miao_quests`
```sql
- quest_key: Identificador único (ex: "daily_meme_creation")
- title: Título da quest
- description: Descrição detalhada
- reward_gems: Gems de recompensa
- quest_type: daily, weekly, one_time, recurring
- verification_type: Tipo de verificação
- verification_data: JSON com dados adicionais
```

### Tabela `miao_user_quests`
```sql
- wallet_address: Carteira do usuário
- quest_id: ID da quest
- status: pending, in_progress, completed, claimed
- progress: Progresso atual (0-100 ou 0-target)
- target: Meta para completar
- reset_date: Data de reset (para daily/weekly)
```

## Quests Prontas

### Quests Diárias

#### 1. Criar Meme (Daily)
- **quest_key**: `daily_meme_creation`
- **title**: "Criar 1 Meme"
- **description**: "Use o Meme Studio para criar um meme incrível!"
- **reward_gems**: 10
- **quest_type**: daily
- **verification_type**: meme_creation
- **target**: 1

#### 2. Partilhar Meme (Daily)
- **quest_key**: `daily_meme_share`
- **title**: "Partilhar 1 Meme"
- **description**: "Partilhe um meme no Twitter ou Telegram!"
- **reward_gems**: 15
- **quest_type**: daily
- **verification_type**: activity_based
- **verification_data**: `{"activity_type": "share", "platform": "twitter|telegram"}`
- **target**: 1

#### 3. Curtir Memes (Daily)
- **quest_key**: `daily_meme_likes`
- **title**: "Curtir 3 Memes"
- **description**: "Mostre amor à comunidade curtindo memes!"
- **reward_gems**: 5
- **quest_type**: daily
- **verification_type**: activity_based
- **verification_data**: `{"activity_type": "like"}`
- **target**: 3

#### 4. Retweet Post Fixado (Daily)
- **quest_key**: `daily_retweet_pinned`
- **title**: "Retweet Post Fixado"
- **description**: "Retweete o post fixado do @MIAO no Twitter!"
- **reward_gems**: 20
- **quest_type**: daily
- **verification_type**: twitter_api
- **verification_data**: `{"tweet_id": "pinned_tweet_id", "action": "retweet"}`

#### 5. Visitar Dashboard (Daily)
- **quest_key**: `daily_dashboard_visit`
- **title**: "Visitar Dashboard"
- **description**: "Acesse o MIAO Tools Dashboard!"
- **reward_gems**: 5
- **quest_type**: daily
- **verification_type**: activity_based
- **verification_data**: `{"activity_type": "dashboard_visit"}`

### Quests Semanais

#### 1. Criar 10 Memes (Weekly)
- **quest_key**: `weekly_meme_creation_10`
- **title**: "Criar 10 Memes"
- **description**: "Crie 10 memes incríveis esta semana!"
- **reward_gems**: 150
- **quest_type**: weekly
- **verification_type**: meme_creation
- **target**: 10

#### 2. Partilhar 5 Memes (Weekly)
- **quest_key**: `weekly_meme_shares_5`
- **title**: "Partilhar 5 Memes"
- **description**: "Partilhe 5 memes nas redes sociais!"
- **reward_gems**: 100
- **quest_type**: weekly
- **verification_type**: activity_based
- **verification_data**: `{"activity_type": "share"}`
- **target**: 5

#### 3. Completar 7 Quests Diárias (Weekly)
- **quest_key**: `weekly_complete_7_dailies`
- **title**: "Completar 7 Quests Diárias"
- **description**: "Complete todas as quests diárias por 7 dias!"
- **reward_gems**: 200
- **quest_type**: weekly
- **verification_type**: activity_based
- **verification_data**: `{"activity_type": "daily_quest_completion", "required_days": 7}`

#### 4. Alcançar 50 Likes (Weekly)
- **quest_key**: `weekly_50_likes`
- **title**: "Alcançar 50 Likes"
- **description**: "Seus memes devem receber 50 likes no total!"
- **reward_gems**: 120
- **quest_type**: weekly
- **verification_type**: activity_based
- **verification_data**: `{"activity_type": "total_likes_received"}`
- **target**: 50

### Quests One-Time

#### 1. Primeira Conexão (One-Time)
- **quest_key**: `one_time_wallet_connect`
- **title**: "Conectar Carteira"
- **description**: "Conecte sua carteira pela primeira vez!"
- **reward_gems**: 50
- **quest_type**: one_time
- **verification_type**: activity_based
- **verification_data**: `{"activity_type": "wallet_connect", "first_time": true}`

#### 2. Primeiro Meme (One-Time)
- **quest_key**: `one_time_first_meme`
- **title**: "Criar Primeiro Meme"
- **description**: "Crie seu primeiro meme no Meme Studio!"
- **reward_gems**: 100
- **quest_type**: one_time
- **verification_type**: meme_creation
- **verification_data**: `{"first_meme": true}`

#### 3. Primeira Partilha (One-Time)
- **quest_key**: `one_time_first_share`
- **title**: "Partilhar Primeiro Meme"
- **description**: "Partilhe seu primeiro meme nas redes sociais!"
- **reward_gems**: 75
- **quest_type**: one_time
- **verification_type**: activity_based
- **verification_data**: `{"activity_type": "share", "first_share": true}`

#### 4. Seguir no Twitter (One-Time)
- **quest_key**: `one_time_twitter_follow`
- **title**: "Seguir @MIAO no Twitter"
- **description**: "Siga @MIAO no Twitter para ficar atualizado!"
- **reward_gems**: 50
- **quest_type**: one_time
- **verification_type**: twitter_api
- **verification_data**: `{"action": "follow", "username": "@MIAO"}`

#### 5. Entrar no Discord (One-Time)
- **quest_key**: `one_time_discord_join`
- **title**: "Entrar no Discord"
- **description**: "Junte-se à comunidade no Discord!"
- **reward_gems**: 50
- **quest_type**: one_time
- **verification_type**: discord_api
- **verification_data**: `{"action": "join_server", "server_id": "discord_server_id"}`

#### 6. Alcançar Nível 5 (One-Time)
- **quest_key**: `one_time_level_5`
- **title**: "Alcançar Nível 5"
- **description**: "Suba de nível e alcance o nível 5!"
- **reward_gems**: 200
- **quest_type**: one_time
- **verification_type**: activity_based
- **verification_data**: `{"activity_type": "level_up", "target_level": 5}`

#### 7. Ter 1000 Gems (One-Time)
- **quest_key**: `one_time_1000_gems`
- **title**: "Acumular 1000 Gems"
- **description**: "Acumule 1000 gems através das suas atividades!"
- **reward_gems**: 500
- **quest_type**: one_time
- **verification_type**: activity_based
- **verification_data**: `{"activity_type": "gem_balance", "target_gems": 1000}`

### Quests Recurring

#### 1. Criar Meme (Recurring)
- **quest_key**: `recurring_meme_creation`
- **title**: "Criar Meme"
- **description**: "Crie um meme e ganhe gems!"
- **reward_gems**: 5
- **quest_type**: recurring
- **verification_type**: meme_creation
- **target**: 1

#### 2. Partilhar Meme (Recurring)
- **quest_key**: `recurring_meme_share`
- **title**: "Partilhar Meme"
- **description**: "Partilhe um meme e ganhe gems!"
- **reward_gems**: 10
- **quest_type**: recurring
- **verification_type**: activity_based
- **verification_data**: `{"activity_type": "share"}`

#### 3. Alcançar X Likes (Recurring)
- **quest_key**: `recurring_meme_100_likes`
- **title**: "Meme com 100 Likes"
- **description**: "Crie um meme que alcance 100 likes!"
- **reward_gems**: 50
- **quest_type**: recurring
- **verification_type**: activity_based
- **verification_data**: `{"activity_type": "meme_likes", "target_likes": 100}`

## Sistema de Verificação

### 1. Verificação Automática (Meme Creation)
```javascript
// Quando um meme é criado
async function onMemeCreated(walletAddress, memeId) {
  // Atualizar quests de criação de meme
  await updateQuestProgress(walletAddress, 'daily_meme_creation', 1);
  await updateQuestProgress(walletAddress, 'weekly_meme_creation_10', 1);
  await updateQuestProgress(walletAddress, 'recurring_meme_creation', 1);
  
  // Verificar one-time first meme
  await checkAndCompleteQuest(walletAddress, 'one_time_first_meme');
}
```

### 2. Verificação Automática (Activity Based)
```javascript
// Quando uma atividade é registrada
async function onActivity(walletAddress, activityType, activityData) {
  // Partilha
  if (activityType === 'share') {
    await updateQuestProgress(walletAddress, 'daily_meme_share', 1);
    await updateQuestProgress(walletAddress, 'weekly_meme_shares_5', 1);
    await checkAndCompleteQuest(walletAddress, 'one_time_first_share');
  }
  
  // Likes
  if (activityType === 'like') {
    await updateQuestProgress(walletAddress, 'daily_meme_likes', 1);
  }
  
  // Likes recebidos
  if (activityType === 'like_received') {
    await updateQuestProgress(walletAddress, 'weekly_50_likes', activityData.likes);
    await checkAndCompleteQuest(walletAddress, 'recurring_meme_100_likes', activityData.totalLikes);
  }
}
```

### 3. Verificação Manual (Twitter/Discord)
```javascript
// Usuário clica em "Verificar" na quest
async function verifyTwitterQuest(walletAddress, questKey, verificationData) {
  // Chamar Twitter API para verificar
  const verified = await twitterAPI.verifyRetweet(
    verificationData.tweet_id,
    walletAddress
  );
  
  if (verified) {
    await completeQuest(walletAddress, questKey);
  }
}
```

### 4. Reset de Quests Diárias/Semanais
```javascript
// Job diário (meia-noite UTC)
async function resetDailyQuests() {
  const today = new Date().toISOString().split('T')[0];
  
  // Resetar progresso de quests diárias
  await db.query(`
    UPDATE miao_user_quests
    SET status = 'pending',
        progress = 0,
        reset_date = ?
    WHERE quest_id IN (
      SELECT id FROM miao_quests WHERE quest_type = 'daily'
    )
    AND reset_date < ?
  `, [today, today]);
}

// Job semanal (segunda-feira meia-noite UTC)
async function resetWeeklyQuests() {
  const monday = getMondayOfWeek();
  
  await db.query(`
    UPDATE miao_user_quests
    SET status = 'pending',
        progress = 0,
        reset_date = ?
    WHERE quest_id IN (
      SELECT id FROM miao_quests WHERE quest_type = 'weekly'
    )
    AND reset_date < ?
  `, [monday, monday]);
}
```

## API Endpoints Sugeridos

```
GET    /api/quests                          - Listar todas as quests disponíveis
GET    /api/quests/daily                    - Quests diárias
GET    /api/quests/weekly                   - Quests semanais
GET    /api/quests/one-time                 - Quests únicas
GET    /api/user/:walletAddress/quests      - Progresso do usuário
GET    /api/user/:walletAddress/quests/:id  - Detalhes de uma quest específica
POST   /api/user/:walletAddress/quests/:id/claim - Reclamar recompensa
POST   /api/user/:walletAddress/quests/:id/verify - Verificar quest manual (Twitter/Discord)
```

## Estratégia de Recompensas

### Quests Diárias
- **Recompensas**: 5-20 gems
- **Objetivo**: Engajamento diário
- **Streak Bonus**: Completar 3+ quests diárias = bônus extra

### Quests Semanais
- **Recompensas**: 100-200 gems
- **Objetivo**: Engajamento consistente
- **Bônus**: Completar todas as semanais = bônus semanal

### Quests One-Time
- **Recompensas**: 50-500 gems
- **Objetivo**: Onboarding e marcos importantes
- **Estratégia**: Recompensas maiores para incentivar ações importantes

### Quests Recurring
- **Recompensas**: 5-50 gems
- **Objetivo**: Incentivar ações repetidas
- **Estratégia**: Recompensas menores mas sempre disponíveis

## Streak System

### Streak de Quests Diárias
- Completar 3+ quests diárias = +10 gems bônus
- Completar 7 dias seguidos = +50 gems bônus
- Completar 30 dias seguidos = +200 gems bônus

### Streak de Visitas
- Visitar dashboard 3 dias seguidos = +5 gems
- Visitar dashboard 7 dias seguidos = +20 gems

## Notas Importantes

1. **Reset Automático**: Quests diárias resetam à meia-noite UTC
2. **Reset Semanal**: Quests semanais resetam toda segunda-feira
3. **One-Time**: Uma vez completada, não pode ser repetida
4. **Recurring**: Sempre disponíveis, podem ser completadas múltiplas vezes
5. **Verificação**: Algumas quests requerem verificação manual (Twitter/Discord)
6. **Progresso**: Sistema de progresso (0-target) para quests com múltiplas etapas

