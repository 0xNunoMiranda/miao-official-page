# Programa de Recompensas - MIAO Tools

## Visão Geral

Sistema de recompensas **exclusivamente em Gems** (pontos internos) por:
- ✅ Realizar quests
- ✅ Responder polls (votações)
- ✅ Partilhar conteúdo
- ✅ Participar em jogos

As gems podem ser gastas em:
- 🎮 Recursos da plataforma
- 🎯 Boosts e melhorias
- 🎨 Personalizações
- 🕹️ Jogos (entrada e power-ups)

## Como Ganhar Gems

### 1. Quests (Missões)
```sql
-- Completar quest diária
Reward: 200-1000 gems (dependendo da quest)
Type: 'quest'
```

### 2. Polls (Votações)
```sql
-- Responder poll da comunidade
Reward: 10-100 gems (configurável por poll)
Type: 'poll_response'
```

### 3. Partilhar Conteúdo
```sql
-- Partilhar memes/conteúdo nas redes sociais
Reward: 30-50 gems por partilha
Type: 'content_share'
```

### 4. Jogos
```sql
-- Completar jogos
Reward: Variável (dependendo do jogo)
Type: 'game_reward'
```

### 5. Outras Atividades
- Login diário: 10 gems
- Streak bonus: 50-500 gems
- Criar memes: 50 gems
- Referir amigos: 10% das gems deles

## Como Gastar Gems

### Recursos da Plataforma

#### Meme Studio
- **Extra Meme Slot**: 100 gems (permanente)
- **Meme Generator Boost**: 200 gems (1 dia)
- **Premium Templates**: 150 gems (7 dias)

#### Quests
- **Quest Boost**: 500 gems (7 dias - +50% recompensas)
- **Quest Reroll**: 50 gems (consumível - reroll uma quest)

#### Profile
- **Premium Theme**: 300 gems (permanente)
- **Special Badge**: 1000 gems (permanente)
- **Custom Avatar Frame**: 250 gems (permanente)

#### Jogos
- **Extra Life**: 100 gems (consumível)
- **Power Up**: 150 gems (consumível)
- **Entry Fee**: Variável por jogo

## Fluxo de Recompensas

### 1. Responder Poll
```sql
START TRANSACTION;

-- Verificar se já respondeu
SELECT id FROM miao_poll_responses 
WHERE poll_id = ? AND wallet_address = ?;

-- Se não respondeu, processar:
INSERT INTO miao_poll_responses 
  (poll_id, wallet_address, selected_option_id, gems_rewarded)
VALUES (?, ?, ?, (SELECT reward_gems FROM miao_polls WHERE id = ?));

-- Adicionar gems
UPDATE miao_users 
SET current_gems = current_gems + (SELECT reward_gems FROM miao_polls WHERE id = ?)
WHERE wallet_address = ?;

-- Registrar transação
INSERT INTO miao_gem_transactions 
  (wallet_address, amount, type, source, description)
VALUES (?, (SELECT reward_gems FROM miao_polls WHERE id = ?), 'poll_response', CONCAT('poll_', ?), 'Poll response reward');

-- Registrar atividade
INSERT INTO miao_activities 
  (wallet_address, activity_type, gems_earned, activity_data)
VALUES (?, 'gem_earned', (SELECT reward_gems FROM miao_polls WHERE id = ?), JSON_OBJECT('poll_id', ?, 'type', 'poll_response'));

COMMIT;
```

### 2. Partilhar Conteúdo
```sql
START TRANSACTION;

-- Adicionar gems
UPDATE miao_users 
SET current_gems = current_gems + 30
WHERE wallet_address = ?;

-- Registrar transação
INSERT INTO miao_gem_transactions 
  (wallet_address, amount, type, source, description)
VALUES (?, 30, 'content_share', ?, 'Content shared on social media');

-- Registrar atividade
INSERT INTO miao_activities 
  (wallet_address, activity_type, gems_earned, activity_data)
VALUES (?, 'gem_earned', 30, JSON_OBJECT('type', 'content_share', 'platform', ?));

COMMIT;
```

### 3. Comprar Recurso
```sql
START TRANSACTION;

-- Verificar gems suficientes
SELECT current_gems, cost_gems 
FROM miao_users u, miao_resources r
WHERE u.wallet_address = ? AND r.id = ?;

-- Se suficiente, processar:
-- Deduzir gems
UPDATE miao_users 
SET current_gems = current_gems - (SELECT cost_gems FROM miao_resources WHERE id = ?)
WHERE wallet_address = ?;

-- Registrar transação
INSERT INTO miao_gem_transactions 
  (wallet_address, amount, type, source, payment_method)
VALUES (?, -(SELECT cost_gems FROM miao_resources WHERE id = ?), 'resource_purchase', CONCAT('resource_', ?), 'gems');

SET @gem_tx_id = LAST_INSERT_ID();

-- Ativar recurso
INSERT INTO miao_user_resources 
  (wallet_address, resource_id, gem_transaction_id, expires_at, uses_remaining)
VALUES (
  ?, 
  ?, 
  @gem_tx_id,
  CASE 
    WHEN (SELECT duration_days FROM miao_resources WHERE id = ?) IS NULL THEN NULL
    ELSE DATE_ADD(NOW(), INTERVAL (SELECT duration_days FROM miao_resources WHERE id = ?) DAY)
  END,
  CASE 
    WHEN (SELECT is_consumable FROM miao_resources WHERE id = ?) = TRUE 
    THEN (SELECT max_uses FROM miao_resources WHERE id = ?)
    ELSE NULL
  END
);

COMMIT;
```

### 4. Jogar Jogo (Com Custo)
```sql
START TRANSACTION;

-- Verificar se tem gems suficientes (se houver custo)
-- Deduzir gems de entrada (se aplicável)
UPDATE miao_users 
SET current_gems = current_gems - COALESCE((SELECT entry_cost_gems FROM miao_games WHERE id = ?), 0)
WHERE wallet_address = ?;

-- Registrar jogo
INSERT INTO miao_user_games 
  (wallet_address, game_id, score, gems_spent, gems_earned)
VALUES (
  ?, 
  ?, 
  ?,
  COALESCE((SELECT entry_cost_gems FROM miao_games WHERE id = ?), 0),
  COALESCE((SELECT reward_gems FROM miao_games WHERE id = ?), 0)
);

-- Se ganhou gems, adicionar
UPDATE miao_users 
SET current_gems = current_gems + COALESCE((SELECT reward_gems FROM miao_games WHERE id = ?), 0)
WHERE wallet_address = ?;

-- Registrar transações
-- Gasto (se houver)
INSERT INTO miao_gem_transactions 
  (wallet_address, amount, type, source, payment_method)
SELECT ?, -entry_cost_gems, 'game_purchase', CONCAT('game_', ?), 'gems'
FROM miao_games WHERE id = ? AND entry_cost_gems IS NOT NULL;

-- Ganho (se houver)
INSERT INTO miao_gem_transactions 
  (wallet_address, amount, type, source)
SELECT ?, reward_gems, 'game_reward', CONCAT('game_', ?)
FROM miao_games WHERE id = ? AND reward_gems IS NOT NULL;

COMMIT;
```

## API Endpoints Sugeridos

### Polls
```
GET    /api/polls                    - Listar polls ativas
GET    /api/polls/:id                - Detalhes da poll
POST   /api/polls/:id/respond        - Responder poll
GET    /api/polls/:id/results        - Resultados (se permitido)
```

### Recursos
```
GET    /api/resources                - Listar recursos disponíveis
GET    /api/resources/:category      - Recursos por categoria
GET    /api/user/:wallet/resources   - Recursos ativos do usuário
POST   /api/user/:wallet/resources/:id/purchase - Comprar recurso
```

### Jogos
```
GET    /api/games                    - Listar jogos disponíveis
GET    /api/games/:id                - Detalhes do jogo
POST   /api/user/:wallet/games/:id/play - Jogar (registrar pontuação)
GET    /api/user/:wallet/games       - Histórico de jogos
```

### Partilhar Conteúdo
```
POST   /api/user/:wallet/share       - Registrar partilha
Body: { type: 'meme'|'content', id: 123, platform: 'twitter'|'telegram' }
```

## Exemplos de Recursos

### Boosters Temporários
- Quest Boost (7 dias): 500 gems
- Meme Generator Boost (1 dia): 200 gems
- XP Multiplier (3 dias): 300 gems

### Consumíveis
- Quest Reroll: 50 gems
- Extra Life (jogos): 100 gems
- Power Up (jogos): 150 gems

### Permanentes
- Extra Meme Slot: 100 gems
- Premium Theme: 300 gems
- Special Badge: 1000 gems

## Sistema de Polls

### Criar Poll
```sql
INSERT INTO miao_polls 
  (poll_key, title, question, options, reward_gems, start_date, end_date)
VALUES (
  'community_vote_001',
  'Qual feature você quer ver primeiro?',
  'Qual das seguintes features você gostaria de ver implementada primeiro?',
  JSON_ARRAY(
    JSON_OBJECT('id', 1, 'text', 'Novo jogo'),
    JSON_OBJECT('id', 2, 'text', 'Sistema de NFTs'),
    JSON_OBJECT('id', 3, 'text', 'Marketplace de memes')
  ),
  50,  -- 50 gems por responder
  NOW(),
  DATE_ADD(NOW(), INTERVAL 7 DAY)
);
```

### Verificar Respostas
```sql
-- Verificar se usuário já respondeu
SELECT id FROM miao_poll_responses 
WHERE poll_id = ? AND wallet_address = ?;

-- Estatísticas da poll
SELECT 
  pr.selected_option_id,
  COUNT(*) as votes,
  JSON_EXTRACT(p.options, CONCAT('$[', pr.selected_option_id - 1, '].text')) as option_text
FROM miao_poll_responses pr
JOIN miao_polls p ON pr.poll_id = p.id
WHERE pr.poll_id = ?
GROUP BY pr.selected_option_id;
```

## Notas Importantes

1. **Apenas Gems**: Todas as recompensas são em gems (não $MIAO)
2. **Não Transacionáveis**: Gems não podem ser transferidas entre usuários
3. **Gastos Internos**: Gems são gastas apenas em recursos/jogos da plataforma
4. **Rastreável**: Todas as transações são registradas
5. **Gamificação**: Sistema completo de progresso e recompensas

