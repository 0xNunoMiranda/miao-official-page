# Transações do Ecossistema MIAO

## Visão Geral

Sistema unificado de rastreamento de transações para **Shop**, **MIAO Tools** e **MIAO Games**. Todas as transações passam pelo **MIAO Treasure Chest** (baú do tesouro) e são categorizadas e rastreadas.

## 🏆 MIAO Treasure Chest

O **MIAO Treasure Chest** é o baú do tesouro principal do ecossistema. É a carteira intermediária central onde:
- ✅ Todas as transações do ecossistema são recebidas
- ✅ Fundos são distribuídos automaticamente (burn, liquidity, operations)
- ✅ Transparência total de todas as operações
- ✅ Rastreamento completo por categoria (shop, tools, games)

## Categorias de Transações

### 1. Shop (`category = 'shop'`)
- **source_type**: `shop_order`, `shop_refund`
- **source_id**: `order_id`
- **reason**: Nome do produto (ex: "MIAO T-Shirt Black")
- **reason_details**: `{"product_id": 1, "product_name": "MIAO T-Shirt Black", "quantity": 2}`

### 2. MIAO Tools (`category = 'tools'`)
- **source_type**: `tool_purchase`, `feature_unlock`, `resource_purchase`
- **source_id**: `feature_id` ou `resource_id`
- **reason**: Nome da feature/tool (ex: "Premium Meme Generator")
- **reason_details**: `{"feature_id": 1, "feature_name": "Premium Meme Generator", "payment_method": "miao"}`

### 3. MIAO Games (`category = 'games'`)
- **source_type**: `game_entry`, `game_reward`, `game_purchase`
- **source_id**: `game_id`
- **reason**: Nome do jogo (ex: "MIAO Game #1")
- **reason_details**: `{"game_id": 1, "game_name": "MIAO Game #1", "score": 1500}`

## Estrutura de Rastreamento

### Tabela Principal: `miao_treasury_transactions`
Cada transação tem:
- **category**: shop, tools, games
- **source_type**: Tipo específico (shop_order, tool_purchase, game_entry)
- **source_id**: ID da origem (order_id, feature_id, game_id)
- **reason**: Motivo legível
- **reason_details**: JSON com detalhes

### Links com Tabelas Específicas

#### Shop
```sql
-- Transação treasury vinculada à encomenda
miao_shop_orders.treasury_transaction_id → miao_treasury_transactions.id
miao_shop_sol_transactions → miao_treasury_transactions (via order_id)
```

#### Tools
```sql
-- Transação treasury vinculada à feature
miao_user_features.treasury_transaction_id → miao_treasury_transactions.id
miao_token_transactions → miao_treasury_transactions (via source_id)
```

#### Games
```sql
-- Transação treasury vinculada ao jogo
miao_user_games.treasury_transaction_id → miao_treasury_transactions.id
```

## Exemplos de Transações

### Shop: Compra de T-Shirt
```sql
INSERT INTO miao_treasury_transactions 
  (transaction_type, category, source_type, source_id, reason, reason_details, amount_sol, from_wallet_id, to_wallet_id, status)
VALUES (
  'incoming',
  'shop',
  'shop_order',
  123,
  'MIAO T-Shirt Black',
  JSON_OBJECT('product_id', 1, 'product_name', 'MIAO T-Shirt Black', 'quantity', 1, 'order_id', 123),
  0.5,
  NULL,  -- Cliente
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'treasure_chest'),
  'completed'
);
```

### Tools: Compra de Feature Premium
```sql
INSERT INTO miao_treasury_transactions 
  (transaction_type, category, source_type, source_id, reason, reason_details, amount_miao, from_wallet_id, to_wallet_id, status)
VALUES (
  'incoming',
  'tools',
  'tool_purchase',
  5,  -- feature_id
  'Premium Meme Generator',
  JSON_OBJECT('feature_id', 5, 'feature_name', 'Premium Meme Generator', 'payment_method', 'miao', 'user_wallet', '...'),
  100.0,  -- 100 MIAO
  NULL,  -- Cliente
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'treasure_chest'),
  'completed'
);
```

### Games: Entrada em Jogo
```sql
INSERT INTO miao_treasury_transactions 
  (transaction_type, category, source_type, source_id, reason, reason_details, amount_sol, from_wallet_id, to_wallet_id, status)
VALUES (
  'incoming',
  'games',
  'game_entry',
  2,  -- game_id
  'MIAO Game #1',
  JSON_OBJECT('game_id', 2, 'game_name', 'MIAO Game #1', 'entry_fee', 0.1),
  0.1,  -- 0.1 SOL
  NULL,  -- Cliente
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'treasure_chest'),
  'completed'
);
```

## Queries para Dashboard

### Transações por Categoria
```sql
SELECT 
  category,
  COUNT(*) as transactions_count,
  SUM(amount_sol) as total_sol,
  SUM(amount_miao) as total_miao,
  COUNT(DISTINCT source_id) as unique_sources
FROM miao_treasury_transactions
WHERE status = 'completed'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY category
ORDER BY total_sol DESC;
```

### Transações Shop (Detalhadas)
```sql
SELECT 
  t.id,
  t.reason as product_name,
  t.amount_sol,
  t.transaction_signature,
  o.order_number,
  o.wallet_address,
  u.username,
  t.created_at
FROM miao_treasury_transactions t
LEFT JOIN miao_shop_orders o ON t.source_id = o.id AND t.source_type = 'shop_order'
LEFT JOIN miao_users u ON o.wallet_address = u.wallet_address
WHERE t.category = 'shop'
  AND t.status = 'completed'
ORDER BY t.created_at DESC;
```

### Transações Tools (Detalhadas)
```sql
SELECT 
  t.id,
  t.reason as tool_name,
  t.amount_miao,
  t.amount_sol,
  t.transaction_signature,
  f.feature_name,
  uf.wallet_address,
  u.username,
  t.created_at
FROM miao_treasury_transactions t
LEFT JOIN miao_user_features uf ON t.source_id = uf.feature_id AND t.source_type = 'tool_purchase'
LEFT JOIN miao_features f ON uf.feature_id = f.id
LEFT JOIN miao_users u ON uf.wallet_address = u.wallet_address
WHERE t.category = 'tools'
  AND t.status = 'completed'
ORDER BY t.created_at DESC;
```

### Transações Games (Detalhadas)
```sql
SELECT 
  t.id,
  t.reason as game_name,
  t.amount_sol,
  t.amount_miao,
  t.transaction_signature,
  g.game_name,
  ug.wallet_address,
  ug.score,
  u.username,
  t.created_at
FROM miao_treasury_transactions t
LEFT JOIN miao_user_games ug ON t.source_id = ug.game_id AND t.source_type = 'game_entry'
LEFT JOIN miao_games g ON ug.game_id = g.id
LEFT JOIN miao_users u ON ug.wallet_address = u.wallet_address
WHERE t.category = 'games'
  AND t.status = 'completed'
ORDER BY t.created_at DESC;
```

### Resumo Completo do Ecossistema
```sql
SELECT 
  category,
  source_type,
  COUNT(*) as count,
  SUM(amount_sol) as total_sol,
  SUM(amount_miao) as total_miao,
  GROUP_CONCAT(DISTINCT reason ORDER BY reason SEPARATOR ', ') as items
FROM miao_treasury_transactions
WHERE status = 'completed'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY category, source_type
ORDER BY category, total_sol DESC;
```

## Acesso por Carteira (MIAO Tools)

### View: Transações Visíveis para Cada Carteira
```sql
-- Criar view para facilitar acesso
CREATE OR REPLACE VIEW v_ecosystem_transactions AS
SELECT 
  t.*,
  CASE t.category
    WHEN 'shop' THEN CONCAT('Shop: ', t.reason)
    WHEN 'tools' THEN CONCAT('Tools: ', t.reason)
    WHEN 'games' THEN CONCAT('Games: ', t.reason)
    ELSE t.reason
  END as full_reason,
  w_from.wallet_name as from_wallet_name,
  w_to.wallet_name as to_wallet_name,
  -- Links específicos
  CASE t.category
    WHEN 'shop' THEN (SELECT order_number FROM miao_shop_orders WHERE id = t.source_id)
    WHEN 'tools' THEN (SELECT feature_name FROM miao_features WHERE id = t.source_id)
    WHEN 'games' THEN (SELECT game_name FROM miao_games WHERE id = t.source_id)
    ELSE NULL
  END as source_name
FROM miao_treasury_transactions t
LEFT JOIN miao_treasury_wallets w_from ON t.from_wallet_id = w_from.id
LEFT JOIN miao_treasury_wallets w_to ON t.to_wallet_id = w_to.id;
```

### Query: Transações por Carteira (Todas as Categorias)
```sql
SELECT 
  t.*,
  CASE t.category
    WHEN 'shop' THEN '🛒 Shop'
    WHEN 'tools' THEN '🔧 Tools'
    WHEN 'games' THEN '🎮 Games'
    ELSE '📊 General'
  END as category_icon,
  t.reason,
  t.reason_details
FROM miao_treasury_transactions t
WHERE (t.from_wallet_id = ? OR t.to_wallet_id = ?)
  AND t.status = 'completed'
ORDER BY t.created_at DESC;
```

## Dashboard Unificado

### Resumo do Ecossistema
```sql
SELECT 
  'Shop' as category,
  COUNT(DISTINCT o.id) as transactions_count,
  SUM(o.total_sol) as total_sol,
  COUNT(DISTINCT oi.product_id) as unique_products
FROM miao_shop_orders o
JOIN miao_shop_order_items oi ON o.id = oi.order_id
WHERE o.payment_status = 'paid'
  AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

SELECT 
  'Tools' as category,
  COUNT(DISTINCT uf.id) as transactions_count,
  SUM(CASE WHEN uf.payment_method = 'miao' THEN f.price_miao ELSE 0 END) as total_miao,
  COUNT(DISTINCT uf.feature_id) as unique_features
FROM miao_user_features uf
JOIN miao_features f ON uf.feature_id = f.id
WHERE uf.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

SELECT 
  'Games' as category,
  COUNT(DISTINCT ug.id) as transactions_count,
  SUM(ug.sol_spent) as total_sol,
  COUNT(DISTINCT ug.game_id) as unique_games
FROM miao_user_games ug
WHERE ug.played_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## API Endpoints Sugeridos

### Transações do Ecossistema
```
GET    /api/transactions                    - Todas as transações
GET    /api/transactions/category/:category  - Por categoria (shop, tools, games)
GET    /api/transactions/source/:type/:id    - Por origem específica
GET    /api/transactions/wallet/:walletId    - Por carteira
GET    /api/transactions/summary             - Resumo do ecossistema
```

### Por Categoria
```
GET    /api/shop/transactions                - Transações da shop
GET    /api/tools/transactions               - Transações de tools
GET    /api/games/transactions               - Transações de games
```

## Notas Importantes

1. **Categoria Obrigatória**: Todas as transações têm categoria
2. **Motivo Específico**: Cada transação tem reason e reason_details
3. **Rastreabilidade**: Fácil identificar origem e destino
4. **Unificação**: Todas passam pela mesma carteira intermediária
5. **Acesso**: Cada carteira pode ver todas as transações do ecossistema

