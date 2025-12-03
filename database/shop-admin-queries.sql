-- ============================================
-- MIAO Shop - Queries para Dashboard Admin
-- ============================================

-- ============================================
-- 1. RESUMO GERAL (Dashboard Principal)
-- ============================================
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
  COUNT(CASE WHEN status = 'payment_pending' THEN 1 END) as payment_pending,
  COUNT(CASE WHEN status = 'payment_received' THEN 1 END) as payment_received,
  COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
  COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
  SUM(total_sol) as total_revenue_sol,
  SUM(CASE WHEN payment_method = 'gems' THEN total_gems ELSE 0 END) as total_gems_spent,
  SUM(CASE WHEN payment_method = 'sol' AND payment_status = 'paid' THEN total_sol ELSE 0 END) as total_sol_received
FROM miao_shop_orders
WHERE DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- ============================================
-- 2. ENCOMENDAS RECENTES (Lista Principal)
-- ============================================
SELECT 
  o.id,
  o.order_number,
  o.wallet_address,
  u.username,
  o.status,
  o.payment_status,
  o.payment_method,
  o.total_sol,
  o.total_gems,
  COUNT(oi.id) as items_count,
  o.created_at,
  o.updated_at
FROM miao_shop_orders o
LEFT JOIN miao_users u ON o.wallet_address = u.wallet_address
LEFT JOIN miao_shop_order_items oi ON o.id = oi.order_id
WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 50;

-- ============================================
-- 3. DETALHES COMPLETOS DA ENCOMENDA
-- ============================================
SELECT 
  o.*,
  u.username,
  u.email as user_email,
  GROUP_CONCAT(
    CONCAT(oi.product_name, ' (x', oi.quantity, ')')
    SEPARATOR ', '
  ) as items_summary
FROM miao_shop_orders o
LEFT JOIN miao_users u ON o.wallet_address = u.wallet_address
LEFT JOIN miao_shop_order_items oi ON o.id = oi.order_id
WHERE o.id = ?
GROUP BY o.id;

-- ============================================
-- 4. ITENS DA ENCOMENDA
-- ============================================
SELECT 
  oi.*,
  p.product_key,
  p.image_url
FROM miao_shop_order_items oi
JOIN miao_shop_products p ON oi.product_id = p.id
WHERE oi.order_id = ?
ORDER BY oi.id;

-- ============================================
-- 5. HISTÓRICO DE STATUS
-- ============================================
SELECT 
  h.*,
  u.username as changed_by_username
FROM miao_shop_order_history h
LEFT JOIN miao_users u ON h.changed_by = u.wallet_address
WHERE h.order_id = ?
ORDER BY h.created_at DESC;

-- ============================================
-- 6. TRANSAÇÕES $SOL
-- ============================================
SELECT 
  t.*,
  o.order_number,
  o.wallet_address,
  u.username
FROM miao_shop_sol_transactions t
LEFT JOIN miao_shop_orders o ON t.order_id = o.id
LEFT JOIN miao_users u ON t.wallet_address = u.wallet_address
ORDER BY t.created_at DESC
LIMIT 100;

-- ============================================
-- 7. TRANSAÇÕES POR WALLET
-- ============================================
SELECT 
  t.*,
  o.order_number,
  o.status as order_status
FROM miao_shop_sol_transactions t
LEFT JOIN miao_shop_orders o ON t.order_id = o.id
WHERE t.wallet_address = ?
ORDER BY t.created_at DESC;

-- ============================================
-- 8. ENCOMENDAS POR STATUS
-- ============================================
SELECT 
  o.*,
  u.username,
  COUNT(oi.id) as items_count
FROM miao_shop_orders o
LEFT JOIN miao_users u ON o.wallet_address = u.wallet_address
LEFT JOIN miao_shop_order_items oi ON o.id = oi.order_id
WHERE o.status = ?
GROUP BY o.id
ORDER BY o.created_at DESC;

-- ============================================
-- 9. ENCOMENDAS AGUARDANDO AÇÃO
-- ============================================
SELECT 
  o.*,
  u.username,
  COUNT(oi.id) as items_count,
  TIMESTAMPDIFF(HOUR, o.created_at, NOW()) as hours_pending
FROM miao_shop_orders o
LEFT JOIN miao_users u ON o.wallet_address = u.wallet_address
LEFT JOIN miao_shop_order_items oi ON o.id = oi.order_id
WHERE o.status IN ('pending', 'payment_pending', 'payment_received', 'processing')
GROUP BY o.id
ORDER BY 
  CASE o.status
    WHEN 'payment_pending' THEN 1
    WHEN 'payment_received' THEN 2
    WHEN 'processing' THEN 3
    ELSE 4
  END,
  o.created_at ASC;

-- ============================================
-- 10. ESTATÍSTICAS DE VENDAS
-- ============================================
SELECT 
  DATE(created_at) as sale_date,
  COUNT(*) as orders_count,
  SUM(total_sol) as revenue_sol,
  SUM(CASE WHEN payment_method = 'sol' THEN total_sol ELSE 0 END) as sol_payments,
  SUM(CASE WHEN payment_method = 'gems' THEN total_gems ELSE 0 END) as gems_payments,
  AVG(total_sol) as avg_order_value
FROM miao_shop_orders
WHERE payment_status = 'paid'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

-- ============================================
-- 11. PRODUTOS MAIS VENDIDOS
-- ============================================
SELECT 
  p.id,
  p.product_key,
  p.name,
  p.category,
  SUM(oi.quantity) as total_sold,
  SUM(oi.total_price_sol) as total_revenue_sol,
  COUNT(DISTINCT oi.order_id) as orders_count
FROM miao_shop_products p
JOIN miao_shop_order_items oi ON p.id = oi.product_id
JOIN miao_shop_orders o ON oi.order_id = o.id
WHERE o.payment_status = 'paid'
  AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY p.id
ORDER BY total_sold DESC
LIMIT 20;

-- ============================================
-- 12. ATUALIZAR STATUS DA ENCOMENDA
-- ============================================
START TRANSACTION;

-- Atualizar status
UPDATE miao_shop_orders
SET 
  status = ?,
  tracking_number = ?,
  tracking_url = ?,
  admin_notes = ?,
  shipped_at = CASE WHEN ? = 'shipped' THEN NOW() ELSE shipped_at END,
  delivered_at = CASE WHEN ? = 'delivered' THEN NOW() ELSE delivered_at END,
  cancelled_at = CASE WHEN ? = 'cancelled' THEN NOW() ELSE cancelled_at END,
  updated_at = NOW()
WHERE id = ?;

-- Registrar histórico
INSERT INTO miao_shop_order_history 
  (order_id, status, action, changed_by, notes)
VALUES (?, ?, 'status_changed', ?, ?);

COMMIT;

-- ============================================
-- 13. VERIFICAR TRANSAÇÕES PENDENTES
-- ============================================
SELECT 
  t.*,
  o.order_number,
  o.total_sol as order_total,
  TIMESTAMPDIFF(MINUTE, t.created_at, NOW()) as minutes_pending
FROM miao_shop_sol_transactions t
JOIN miao_shop_orders o ON t.order_id = o.id
WHERE t.status = 'pending'
  AND t.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY t.created_at ASC;

-- ============================================
-- 14. ENCOMENDAS POR MÉTODO DE PAGAMENTO
-- ============================================
SELECT 
  payment_method,
  COUNT(*) as orders_count,
  SUM(total_sol) as total_sol,
  SUM(total_gems) as total_gems,
  AVG(total_sol) as avg_order_value
FROM miao_shop_orders
WHERE payment_status = 'paid'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY payment_method;

-- ============================================
-- 15. ENCOMENDAS POR PAÍS
-- ============================================
SELECT 
  shipping_country,
  COUNT(*) as orders_count,
  SUM(total_sol) as total_revenue
FROM miao_shop_orders
WHERE payment_status = 'paid'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY shipping_country
ORDER BY orders_count DESC;

