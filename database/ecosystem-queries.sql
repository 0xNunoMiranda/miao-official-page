-- ============================================
-- MIAO Ecosystem - Queries Unificadas
-- ============================================
-- Transações de Shop, Tools e Games unificadas
-- ============================================

-- ============================================
-- 1. TODAS AS TRANSAÇÕES DO ECOSSISTEMA (Unificado)
-- ============================================
SELECT 
  t.id,
  t.category,
  CASE t.category
    WHEN 'shop' THEN '🛒 Shop'
    WHEN 'tools' THEN '🔧 Tools'
    WHEN 'games' THEN '🎮 Games'
    ELSE '📊 General'
  END as category_icon,
  t.source_type,
  t.source_id,
  t.reason,
  t.reason_details,
  t.amount_sol,
  t.amount_miao,
  t.transaction_signature,
  t.status,
  w_from.wallet_name as from_wallet,
  w_to.wallet_name as to_wallet,
  t.created_at,
  -- Links específicos
  CASE t.category
    WHEN 'shop' THEN (SELECT order_number FROM miao_shop_orders WHERE id = t.source_id)
    WHEN 'tools' THEN (SELECT feature_name FROM miao_features WHERE id = t.source_id)
    WHEN 'games' THEN (SELECT game_name FROM miao_games WHERE id = t.source_id)
    ELSE NULL
  END as source_name
FROM miao_treasury_transactions t
LEFT JOIN miao_treasury_wallets w_from ON t.from_wallet_id = w_from.id
LEFT JOIN miao_treasury_wallets w_to ON t.to_wallet_id = w_to.id
WHERE t.status = 'completed'
ORDER BY t.created_at DESC
LIMIT 100;

-- ============================================
-- 2. TRANSAÇÕES POR CATEGORIA
-- ============================================
SELECT 
  category,
  COUNT(*) as transactions_count,
  SUM(amount_sol) as total_sol,
  SUM(amount_miao) as total_miao,
  COUNT(DISTINCT source_id) as unique_items,
  MIN(created_at) as first_transaction,
  MAX(created_at) as last_transaction
FROM miao_treasury_transactions
WHERE status = 'completed'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY category
ORDER BY total_sol DESC;

-- ============================================
-- 3. TRANSAÇÕES SHOP (Detalhadas)
-- ============================================
SELECT 
  t.id,
  t.reason as product_name,
  t.amount_sol,
  t.transaction_signature,
  o.order_number,
  o.wallet_address,
  u.username,
  o.status as order_status,
  o.payment_method,
  JSON_EXTRACT(t.reason_details, '$.quantity') as quantity,
  t.created_at
FROM miao_treasury_transactions t
JOIN miao_shop_orders o ON t.source_id = o.id AND t.source_type = 'shop_order'
LEFT JOIN miao_users u ON o.wallet_address = u.wallet_address
WHERE t.category = 'shop'
  AND t.status = 'completed'
ORDER BY t.created_at DESC;

-- ============================================
-- 4. TRANSAÇÕES TOOLS (Detalhadas)
-- ============================================
SELECT 
  t.id,
  t.reason as tool_name,
  t.amount_miao,
  t.amount_sol,
  t.transaction_signature,
  f.feature_name,
  f.category as feature_category,
  uf.wallet_address,
  uf.payment_method,
  u.username,
  uf.activated_at,
  uf.expires_at,
  t.created_at
FROM miao_treasury_transactions t
JOIN miao_user_features uf ON t.source_id = uf.feature_id AND t.source_type = 'tool_purchase'
JOIN miao_features f ON uf.feature_id = f.id
LEFT JOIN miao_users u ON uf.wallet_address = u.wallet_address
WHERE t.category = 'tools'
  AND t.status = 'completed'
ORDER BY t.created_at DESC;

-- ============================================
-- 5. TRANSAÇÕES GAMES (Detalhadas)
-- ============================================
SELECT 
  t.id,
  t.reason as game_name,
  t.amount_sol,
  t.amount_miao,
  t.transaction_signature,
  g.game_name,
  ug.wallet_address,
  ug.score,
  ug.gems_spent,
  ug.gems_earned,
  u.username,
  t.created_at
FROM miao_treasury_transactions t
JOIN miao_user_games ug ON t.source_id = ug.game_id AND t.source_type = 'game_entry'
JOIN miao_games g ON ug.game_id = g.id
LEFT JOIN miao_users u ON ug.wallet_address = u.wallet_address
WHERE t.category = 'games'
  AND t.status = 'completed'
ORDER BY t.created_at DESC;

-- ============================================
-- 11. PROGRESSO DE JOGOS (Novo)
-- ============================================
SELECT 
  gp.wallet_address,
  u.username,
  g.game_name,
  gp.best_score,
  gp.current_level,
  gp.total_plays,
  gp.game_coins,
  gp.lives,
  gp.total_time_played,
  gp.last_played_at,
  gp.progress_data
FROM miao_user_game_progress gp
JOIN miao_games g ON gp.game_id = g.id
LEFT JOIN miao_users u ON gp.wallet_address = u.wallet_address
WHERE gp.wallet_address = ?
ORDER BY gp.last_played_at DESC;

-- ============================================
-- 6. TRANSAÇÕES POR CARTEIRA (Todas as Categorias)
-- ============================================
SELECT 
  t.*,
  CASE t.category
    WHEN 'shop' THEN CONCAT('🛒 Shop: ', t.reason)
    WHEN 'tools' THEN CONCAT('🔧 Tools: ', t.reason)
    WHEN 'games' THEN CONCAT('🎮 Games: ', t.reason)
    ELSE t.reason
  END as full_description,
  w_from.wallet_name as from_wallet_name,
  w_to.wallet_name as to_wallet_name
FROM miao_treasury_transactions t
LEFT JOIN miao_treasury_wallets w_from ON t.from_wallet_id = w_from.id
LEFT JOIN miao_treasury_wallets w_to ON t.to_wallet_id = w_to.id
WHERE (t.from_wallet_id = ? OR t.to_wallet_id = ?)
  AND t.status = 'completed'
ORDER BY t.created_at DESC;

-- ============================================
-- 7. RESUMO POR ITEM (Produto/Feature/Jogo)
-- ============================================
-- Shop: Produtos mais vendidos
SELECT 
  'shop' as category,
  JSON_EXTRACT(t.reason_details, '$.product_name') as item_name,
  COUNT(*) as transactions_count,
  SUM(t.amount_sol) as total_sol,
  AVG(t.amount_sol) as avg_sol
FROM miao_treasury_transactions t
WHERE t.category = 'shop'
  AND t.status = 'completed'
  AND t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY item_name
ORDER BY total_sol DESC

UNION ALL

-- Tools: Features mais compradas
SELECT 
  'tools' as category,
  t.reason as item_name,
  COUNT(*) as transactions_count,
  SUM(t.amount_miao) as total_miao,
  AVG(t.amount_miao) as avg_miao
FROM miao_treasury_transactions t
WHERE t.category = 'tools'
  AND t.status = 'completed'
  AND t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY t.reason
ORDER BY total_miao DESC

UNION ALL

-- Games: Jogos mais jogados
SELECT 
  'games' as category,
  t.reason as item_name,
  COUNT(*) as transactions_count,
  SUM(t.amount_sol) as total_sol,
  AVG(t.amount_sol) as avg_sol
FROM miao_treasury_transactions t
WHERE t.category = 'games'
  AND t.status = 'completed'
  AND t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY t.reason
ORDER BY transactions_count DESC;

-- ============================================
-- 8. DASHBOARD UNIFICADO (Resumo Completo)
-- ============================================
SELECT 
  'Total Transactions' as metric,
  COUNT(*) as value,
  SUM(amount_sol) as sol_value,
  SUM(amount_miao) as miao_value
FROM miao_treasury_transactions
WHERE status = 'completed'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

SELECT 
  'Shop Transactions' as metric,
  COUNT(*) as value,
  SUM(amount_sol) as sol_value,
  0 as miao_value
FROM miao_treasury_transactions
WHERE category = 'shop'
  AND status = 'completed'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

SELECT 
  'Tools Transactions' as metric,
  COUNT(*) as value,
  SUM(amount_sol) as sol_value,
  SUM(amount_miao) as miao_value
FROM miao_treasury_transactions
WHERE category = 'tools'
  AND status = 'completed'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

SELECT 
  'Games Transactions' as metric,
  COUNT(*) as value,
  SUM(amount_sol) as sol_value,
  SUM(amount_miao) as miao_value
FROM miao_treasury_transactions
WHERE category = 'games'
  AND status = 'completed'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- ============================================
-- 9. TRANSAÇÕES POR USUÁRIO (Todas as Categorias)
-- ============================================
SELECT 
  u.wallet_address,
  u.username,
  COUNT(DISTINCT CASE WHEN t.category = 'shop' THEN t.id END) as shop_transactions,
  COUNT(DISTINCT CASE WHEN t.category = 'tools' THEN t.id END) as tools_transactions,
  COUNT(DISTINCT CASE WHEN t.category = 'games' THEN t.id END) as games_transactions,
  SUM(CASE WHEN t.category = 'shop' THEN t.amount_sol ELSE 0 END) as shop_total_sol,
  SUM(CASE WHEN t.category = 'tools' THEN t.amount_miao ELSE 0 END) as tools_total_miao,
  SUM(CASE WHEN t.category = 'games' THEN t.amount_sol ELSE 0 END) as games_total_sol
FROM miao_users u
LEFT JOIN miao_shop_orders o ON u.wallet_address = o.wallet_address
LEFT JOIN miao_treasury_transactions t ON (
  (t.category = 'shop' AND t.source_id = o.id) OR
  (t.category = 'tools' AND t.source_id IN (SELECT feature_id FROM miao_user_features WHERE wallet_address = u.wallet_address)) OR
  (t.category = 'games' AND t.source_id IN (SELECT game_id FROM miao_user_games WHERE wallet_address = u.wallet_address))
)
WHERE t.status = 'completed'
  AND t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.wallet_address, u.username
HAVING shop_transactions > 0 OR tools_transactions > 0 OR games_transactions > 0
ORDER BY (shop_total_sol + tools_total_miao + games_total_sol) DESC;

-- ============================================
-- 10. VIEW UNIFICADA (Para Facilidade)
-- ============================================
CREATE OR REPLACE VIEW v_ecosystem_transactions AS
SELECT 
  t.id,
  t.category,
  t.source_type,
  t.source_id,
  t.reason,
  t.reason_details,
  t.amount_sol,
  t.amount_miao,
  t.transaction_signature,
  t.status,
  t.created_at,
  w_from.wallet_name as from_wallet_name,
  w_to.wallet_name as to_wallet_name,
  -- Links específicos
  CASE t.category
    WHEN 'shop' THEN (SELECT order_number FROM miao_shop_orders WHERE id = t.source_id)
    WHEN 'tools' THEN (SELECT feature_name FROM miao_features WHERE id = t.source_id)
    WHEN 'games' THEN (SELECT game_name FROM miao_games WHERE id = t.source_id)
    ELSE NULL
  END as source_name,
  -- Usuário
  CASE t.category
    WHEN 'shop' THEN (SELECT wallet_address FROM miao_shop_orders WHERE id = t.source_id)
    WHEN 'tools' THEN (SELECT wallet_address FROM miao_user_features WHERE feature_id = t.source_id ORDER BY activated_at DESC LIMIT 1)
    WHEN 'games' THEN (SELECT wallet_address FROM miao_user_games WHERE game_id = t.source_id ORDER BY played_at DESC LIMIT 1)
    ELSE NULL
    ELSE NULL
    ELSE NULL
  END as user_wallet
FROM miao_treasury_transactions t
LEFT JOIN miao_treasury_wallets w_from ON t.from_wallet_id = w_from.id
LEFT JOIN miao_treasury_wallets w_to ON t.to_wallet_id = w_to.id;

