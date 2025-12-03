# Sistema de Progresso de Jogos - MIAO Tools

## Visão Geral

Sistema completo para salvar progresso, pontuações e dados de cada jogo por carteira, **mesmo quando o jogo é grátis**. O progresso é persistente e mantido entre sessões.

## Estrutura

### 1. `miao_user_game_progress` - Progresso Persistente

Armazena o progresso geral do usuário em cada jogo:

```sql
- wallet_address: Carteira do usuário
- game_id: ID do jogo
- best_score: Melhor pontuação alcançada
- current_level: Nível atual no jogo
- total_plays: Total de vezes jogado
- total_time_played: Tempo total jogado (segundos)
- game_coins: Moedas do jogo acumuladas
- lives: Vidas disponíveis
- progress_data: JSON com dados específicos (níveis desbloqueados, conquistas, etc.)
- last_played_at: Última vez que jogou
```

**UNIQUE**: Uma entrada por usuário/jogo (garante progresso persistente)

### 2. `miao_user_games` - Histórico de Jogadas (Sessões)

Armazena cada sessão de jogo individual:

```sql
- wallet_address: Carteira do usuário
- game_id: ID do jogo
- session_id: ID único da sessão
- score: Pontuação desta jogada
- level_reached: Nível alcançado nesta jogada
- time_played: Tempo jogado nesta sessão
- session_data: JSON com dados específicos da sessão
- played_at: Data/hora da jogada
```

**Múltiplas entradas**: Uma entrada por sessão de jogo

## Fluxo de Uso

### 1. Iniciar Jogo (Primeira Vez ou Retomar)

```javascript
// app/api/games/[gameId]/start/route.ts
export async function POST(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  const { walletAddress } = await request.json();
  
  // Buscar ou criar progresso
  let progress = await db.query(`
    SELECT * FROM miao_user_game_progress
    WHERE wallet_address = ? AND game_id = ?
  `, [walletAddress, params.gameId]);
  
  if (!progress) {
    // Primeira vez jogando - criar progresso inicial
    progress = await db.query(`
      INSERT INTO miao_user_game_progress
        (wallet_address, game_id, best_score, current_level, total_plays, game_coins, lives, progress_data)
      VALUES (?, ?, 0, 1, 0, 0, 3, ?)
    `, [
      walletAddress,
      params.gameId,
      JSON.stringify({
        unlocked_levels: [1],
        achievements: [],
        inventory: [],
        settings: {}
      })
    ]);
  }
  
  // Gerar session_id único
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return Response.json({
    success: true,
    progress: {
      best_score: progress.best_score,
      current_level: progress.current_level,
      game_coins: progress.game_coins,
      lives: progress.lives,
      progress_data: progress.progress_data,
      session_id: sessionId
    }
  });
}
```

### 2. Salvar Progresso Durante o Jogo

```javascript
// app/api/games/[gameId]/progress/route.ts
export async function POST(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  const {
    walletAddress,
    sessionId,
    score,
    level,
    coins,
    lives,
    timePlayed,
    progressData
  } = await request.json();
  
  // Buscar progresso atual
  const currentProgress = await db.query(`
    SELECT * FROM miao_user_game_progress
    WHERE wallet_address = ? AND game_id = ?
  `, [walletAddress, params.gameId]);
  
  if (!currentProgress) {
    return Response.json({ error: 'Progress not found' }, { status: 404 });
  }
  
  // Atualizar progresso persistente
  const newBestScore = Math.max(currentProgress.best_score || 0, score || 0);
  const newLevel = Math.max(currentProgress.current_level || 1, level || 1);
  
  await db.query(`
    UPDATE miao_user_game_progress
    SET best_score = ?,
        current_level = ?,
        game_coins = COALESCE(?, game_coins),
        lives = COALESCE(?, lives),
        progress_data = COALESCE(?, progress_data),
        total_time_played = total_time_played + COALESCE(?, 0),
        last_played_at = NOW(),
        updated_at = NOW()
    WHERE wallet_address = ? AND game_id = ?
  `, [
    newBestScore,
    newLevel,
    coins,
    lives,
    progressData ? JSON.stringify(progressData) : null,
    timePlayed,
    walletAddress,
    params.gameId
  ]);
  
  return Response.json({ success: true });
}
```

### 3. Finalizar Sessão de Jogo

```javascript
// app/api/games/[gameId]/finish/route.ts
export async function POST(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  const {
    walletAddress,
    sessionId,
    score,
    levelReached,
    timePlayed,
    gemsEarned,
    solEarned,
    sessionData
  } = await request.json();
  
  // Atualizar progresso persistente
  const currentProgress = await db.query(`
    SELECT * FROM miao_user_game_progress
    WHERE wallet_address = ? AND game_id = ?
  `, [walletAddress, params.gameId]);
  
  if (currentProgress) {
    const newBestScore = Math.max(currentProgress.best_score || 0, score || 0);
    const newLevel = Math.max(currentProgress.current_level || 1, levelReached || 1);
    
    await db.query(`
      UPDATE miao_user_game_progress
      SET best_score = ?,
          current_level = ?,
          total_plays = total_plays + 1,
          total_time_played = total_time_played + COALESCE(?, 0),
          last_played_at = NOW(),
          updated_at = NOW()
      WHERE wallet_address = ? AND game_id = ?
    `, [
      newBestScore,
      newLevel,
      timePlayed,
      walletAddress,
      params.gameId
    ]);
  }
  
  // Registrar sessão no histórico
  await db.query(`
    INSERT INTO miao_user_games
      (wallet_address, game_id, session_id, score, level_reached, time_played, gems_earned, sol_earned, session_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    walletAddress,
    params.gameId,
    sessionId,
    score,
    levelReached,
    timePlayed,
    gemsEarned,
    solEarned,
    sessionData ? JSON.stringify(sessionData) : null
  ]);
  
  // Se ganhou gems, adicionar ao usuário
  if (gemsEarned && gemsEarned > 0) {
    await db.query(`
      UPDATE miao_users
      SET gems = gems + ?
      WHERE wallet_address = ?
    `, [gemsEarned, walletAddress]);
    
    // Registrar transação de gems
    await db.query(`
      INSERT INTO miao_gem_transactions
        (wallet_address, amount, type, description)
      VALUES (?, ?, 'earn', ?)
    `, [
      walletAddress,
      gemsEarned,
      `Game reward: ${params.gameId}`
    ]);
  }
  
  return Response.json({ success: true });
}
```

### 4. Obter Progresso do Usuário

```javascript
// app/api/user/[walletAddress]/games/[gameId]/progress/route.ts
export async function GET(
  request: Request,
  { params }: { params: { walletAddress: string, gameId: string } }
) {
  const { walletAddress, gameId } = params;
  
  // Buscar progresso persistente
  const progress = await db.query(`
    SELECT 
      gp.*,
      g.game_name,
      g.game_key
    FROM miao_user_game_progress gp
    JOIN miao_games g ON gp.game_id = g.id
    WHERE gp.wallet_address = ? AND gp.game_id = ?
  `, [walletAddress, gameId]);
  
  if (!progress) {
    return Response.json({
      has_progress: false,
      progress: {
        best_score: 0,
        current_level: 1,
        total_plays: 0,
        game_coins: 0,
        lives: 3,
        progress_data: {
          unlocked_levels: [1],
          achievements: [],
          inventory: []
        }
      }
    });
  }
  
  // Buscar histórico de jogadas recentes
  const recentPlays = await db.query(`
    SELECT 
      id,
      score,
      level_reached,
      time_played,
      gems_earned,
      played_at
    FROM miao_user_games
    WHERE wallet_address = ? AND game_id = ?
    ORDER BY played_at DESC
    LIMIT 10
  `, [walletAddress, gameId]);
  
  return Response.json({
    has_progress: true,
    progress: {
      best_score: progress.best_score,
      current_level: progress.current_level,
      total_plays: progress.total_plays,
      total_time_played: progress.total_time_played,
      game_coins: progress.game_coins,
      lives: progress.lives,
      progress_data: progress.progress_data,
      last_played_at: progress.last_played_at
    },
    recent_plays: recentPlays
  });
}
```

## Exemplos de Dados JSON

### progress_data (Progresso Persistente)

```json
{
  "unlocked_levels": [1, 2, 3, 4, 5],
  "achievements": [
    {
      "id": "first_1000",
      "unlocked_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "level_10",
      "unlocked_at": "2024-01-20T14:20:00Z"
    }
  ],
  "inventory": [
    {
      "item_id": "power_up_1",
      "quantity": 5
    },
    {
      "item_id": "extra_life",
      "quantity": 2
    }
  ],
  "settings": {
    "sound_enabled": true,
    "difficulty": "normal",
    "theme": "default"
  },
  "stats": {
    "total_kills": 150,
    "total_deaths": 25,
    "favorite_weapon": "sword"
  }
}
```

### session_data (Dados da Sessão)

```json
{
  "start_time": "2024-01-20T15:00:00Z",
  "end_time": "2024-01-20T15:15:00Z",
  "items_collected": [
    {"item_id": "coin", "quantity": 50},
    {"item_id": "power_up", "quantity": 2}
  ],
  "enemies_defeated": 25,
  "bosses_defeated": 1,
  "checkpoints_reached": [1, 2, 3],
  "deaths": 2,
  "final_score": 1250
}
```

## Queries Úteis

### Leaderboard (Melhores Pontuações)

```sql
SELECT 
  u.wallet_address,
  u.username,
  gp.best_score,
  gp.current_level,
  gp.total_plays,
  gp.last_played_at
FROM miao_user_game_progress gp
JOIN miao_users u ON gp.wallet_address = u.wallet_address
WHERE gp.game_id = ?
ORDER BY gp.best_score DESC
LIMIT 100;
```

### Estatísticas do Jogo

```sql
SELECT 
  COUNT(DISTINCT wallet_address) as total_players,
  AVG(best_score) as avg_best_score,
  MAX(best_score) as max_score,
  AVG(current_level) as avg_level,
  SUM(total_plays) as total_plays_all_players,
  SUM(total_time_played) as total_time_played_all
FROM miao_user_game_progress
WHERE game_id = ?;
```

### Progresso de um Usuário em Todos os Jogos

```sql
SELECT 
  g.game_name,
  g.game_key,
  gp.best_score,
  gp.current_level,
  gp.total_plays,
  gp.last_played_at
FROM miao_user_game_progress gp
JOIN miao_games g ON gp.game_id = g.id
WHERE gp.wallet_address = ?
ORDER BY gp.last_played_at DESC;
```

## API Endpoints

```
POST   /api/games/:gameId/start              - Iniciar jogo (buscar/criar progresso)
POST   /api/games/:gameId/progress           - Salvar progresso durante o jogo
POST   /api/games/:gameId/finish             - Finalizar sessão de jogo
GET    /api/user/:walletAddress/games/:gameId/progress - Obter progresso do usuário
GET    /api/user/:walletAddress/games        - Listar progresso em todos os jogos
GET    /api/games/:gameId/leaderboard        - Leaderboard do jogo
GET    /api/games/:gameId/stats              - Estatísticas gerais do jogo
```

## Notas Importantes

1. **Progresso Persistente**: `miao_user_game_progress` mantém o estado geral do jogo
2. **Histórico de Sessões**: `miao_user_games` registra cada jogada individual
3. **Gratuito ou Pago**: Progresso é salvo independente de ter pago ou não
4. **JSON Flexível**: `progress_data` e `session_data` permitem dados específicos de cada jogo
5. **Sincronização**: Progresso é atualizado em tempo real durante o jogo
6. **Leaderboards**: Sistema de rankings baseado em `best_score`

