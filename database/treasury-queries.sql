-- ============================================
-- MIAO Treasury - Queries Úteis
-- ============================================

-- ============================================
-- 1. VER DISTRIBUIÇÃO DE UMA ENCOMENDA
-- ============================================
SELECT 
  e.id as execution_id,
  r.rule_name,
  e.total_amount_sol,
  e.total_amount_miao,
  e.distribution_summary,
  e.status,
  e.executed_at,
  e.created_at,
  -- Detalhes individuais
  d.id as detail_id,
  w.wallet_name,
  w.wallet_type,
  d.calculated_amount_sol,
  d.calculated_amount_miao,
  d.actual_amount_sol,
  d.actual_amount_miao,
  d.action_type,
  d.status as detail_status,
  d.transaction_signature,
  d.executed_at as detail_executed_at
FROM miao_distribution_executions e
JOIN miao_fund_distribution_rules r ON e.rule_id = r.id
LEFT JOIN miao_distribution_execution_details d ON e.id = d.execution_id
LEFT JOIN miao_treasury_wallets w ON d.wallet_id = w.id
WHERE e.source_type = 'shop_order' AND e.source_id = ?
ORDER BY d.id;

-- ============================================
-- 2. RESUMO DE DISTRIBUIÇÕES POR CARTEIRA
-- ============================================
SELECT 
  w.wallet_name,
  w.wallet_type,
  w.wallet_address,
  SUM(d.calculated_amount_sol) as total_received_sol,
  SUM(d.calculated_amount_miao) as total_received_miao,
  SUM(d.actual_amount_sol) as total_actual_sol,
  SUM(d.actual_amount_miao) as total_actual_miao,
  COUNT(DISTINCT d.execution_id) as distributions_count,
  COUNT(DISTINCT CASE WHEN d.status = 'completed' THEN d.id END) as completed_count,
  GROUP_CONCAT(DISTINCT d.action_type) as actions_performed
FROM miao_distribution_execution_details d
JOIN miao_treasury_wallets w ON d.wallet_id = w.id
WHERE d.executed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY w.id
ORDER BY total_received_sol DESC;

-- ============================================
-- 3. DISTRIBUIÇÕES POR TIPO DE ORIGEM
-- ============================================
SELECT 
  e.source_type,
  COUNT(DISTINCT e.source_id) as sources_count,
  COUNT(*) as executions_count,
  SUM(e.total_amount_sol) as total_sol_distributed,
  SUM(e.total_amount_miao) as total_miao_distributed,
  AVG(e.total_amount_sol) as avg_amount_sol,
  COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN e.status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN e.status = 'failed' THEN 1 END) as failed
FROM miao_distribution_executions e
WHERE e.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY e.source_type
ORDER BY total_sol_distributed DESC;

-- ============================================
-- 4. HISTÓRICO DE TRANSAÇÕES DA CARTEIRA
-- ============================================
SELECT 
  t.*,
  w_from.wallet_name as from_wallet_name,
  w_to.wallet_name as to_wallet_name,
  t.amount_sol,
  t.amount_miao,
  t.swap_rate,
  CASE 
    WHEN t.transaction_type = 'swap' THEN CONCAT('Swap: ', t.amount_sol, ' SOL ↔ ', t.amount_miao, ' MIAO')
    WHEN t.transaction_type = 'burn' THEN CONCAT('Burn: ', t.amount_miao, ' MIAO')
    WHEN t.transaction_type = 'transfer' THEN CONCAT('Transfer: ', t.amount_sol, ' SOL')
    ELSE t.transaction_type
  END as transaction_description
FROM miao_treasury_transactions t
LEFT JOIN miao_treasury_wallets w_from ON t.from_wallet_id = w_from.id
LEFT JOIN miao_treasury_wallets w_to ON t.to_wallet_id = w_to.id
WHERE t.from_wallet_id = ? OR t.to_wallet_id = ?
ORDER BY t.created_at DESC
LIMIT 100;

-- ============================================
-- 5. SALDO ATUAL DE TODAS AS CARTEIRAS
-- ============================================
SELECT 
  w.wallet_name,
  w.wallet_type,
  w.wallet_address,
  w.current_balance_sol,
  w.current_balance_miao,
  w.last_balance_check,
  -- Calcular saldo baseado em transações (verificação)
  COALESCE(SUM(CASE 
    WHEN t.to_wallet_id = w.id THEN t.amount_sol
    WHEN t.from_wallet_id = w.id THEN -t.amount_sol
    ELSE 0
  END), 0) as calculated_balance_sol,
  COALESCE(SUM(CASE 
    WHEN t.to_wallet_id = w.id THEN t.amount_miao
    WHEN t.from_wallet_id = w.id THEN -t.amount_miao
    ELSE 0
  END), 0) as calculated_balance_miao
FROM miao_treasury_wallets w
LEFT JOIN miao_treasury_transactions t ON (
  (t.from_wallet_id = w.id OR t.to_wallet_id = w.id)
  AND t.status = 'completed'
)
WHERE w.is_active = TRUE
GROUP BY w.id
ORDER BY w.wallet_type, w.wallet_name;

-- ============================================
-- 6. REGRAS DE DISTRIBUIÇÃO E SUAS SPLITS
-- ============================================
SELECT 
  r.id,
  r.rule_key,
  r.rule_name,
  r.source_type,
  r.priority,
  r.is_active,
  -- Distribuições
  GROUP_CONCAT(
    CONCAT(
      w.wallet_name, 
      ': ', 
      COALESCE(d.fixed_amount_sol, CONCAT(d.percentage, '%')), 
      ' - ', 
      d.action_type
    )
    ORDER BY d.sort_order
    SEPARATOR ' | '
  ) as distribution_splits,
  SUM(d.percentage) as total_percentage
FROM miao_fund_distribution_rules r
LEFT JOIN miao_fund_distributions d ON r.id = d.rule_id
LEFT JOIN miao_treasury_wallets w ON d.wallet_id = w.id
WHERE r.is_active = TRUE
GROUP BY r.id
ORDER BY r.priority DESC, r.rule_name;

-- ============================================
-- 7. EXECUÇÕES PENDENTES
-- ============================================
SELECT 
  e.*,
  r.rule_name,
  COUNT(d.id) as details_count,
  COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as pending_details,
  COUNT(CASE WHEN d.status = 'completed' THEN 1 END) as completed_details
FROM miao_distribution_executions e
JOIN miao_fund_distribution_rules r ON e.rule_id = r.id
LEFT JOIN miao_distribution_execution_details d ON e.id = d.execution_id
WHERE e.status IN ('pending', 'processing', 'partial')
GROUP BY e.id
ORDER BY e.created_at ASC;

-- ============================================
-- 8. QUEIMAS REALIZADAS
-- ============================================
SELECT 
  t.id,
  t.created_at,
  t.amount_miao,
  t.amount_sol,
  t.swap_rate,
  t.transaction_signature,
  t.notes,
  w_from.wallet_name as from_wallet,
  t.source_type,
  t.source_id
FROM miao_treasury_transactions t
JOIN miao_treasury_wallets w_from ON t.from_wallet_id = w_from.id
WHERE t.transaction_type = 'burn'
  AND t.status = 'completed'
ORDER BY t.created_at DESC;

-- ============================================
-- 9. SWAPS REALIZADOS
-- ============================================
SELECT 
  t.id,
  t.created_at,
  t.amount_sol,
  t.amount_miao,
  t.swap_rate,
  t.transaction_signature,
  w_from.wallet_name as from_wallet,
  w_to.wallet_name as to_wallet,
  CASE 
    WHEN t.amount_sol > 0 AND t.amount_miao > 0 THEN 'SOL → MIAO'
    WHEN t.amount_miao > 0 AND t.amount_sol > 0 THEN 'MIAO → SOL'
    ELSE 'Unknown'
  END as swap_direction
FROM miao_treasury_transactions t
JOIN miao_treasury_wallets w_from ON t.from_wallet_id = w_from.id
LEFT JOIN miao_treasury_wallets w_to ON t.to_wallet_id = w_to.id
WHERE t.transaction_type = 'swap'
  AND t.status = 'completed'
ORDER BY t.created_at DESC
LIMIT 100;

-- ============================================
-- 10. JUSTIFICATIVA DE DISTRIBUIÇÃO (Relatório Completo)
-- ============================================
SELECT 
  CONCAT('Origem: ', e.source_type, ' #', e.source_id) as source,
  CONCAT('Montante Total: ', e.total_amount_sol, ' SOL') as total_amount,
  CONCAT('Regra: ', r.rule_name) as rule,
  CONCAT('Status: ', e.status) as execution_status,
  CONCAT('Data: ', DATE_FORMAT(e.created_at, '%Y-%m-%d %H:%i:%s')) as created_at,
  -- Detalhes
  GROUP_CONCAT(
    CONCAT(
      w.wallet_name, 
      ' (', w.wallet_type, '): ',
      d.calculated_amount_sol, 
      ' SOL (', 
      d.percentage, 
      '%) → ',
      d.action_type,
      CASE 
        WHEN d.status = 'completed' THEN ' ✓'
        WHEN d.status = 'pending' THEN ' ⏳'
        WHEN d.status = 'failed' THEN ' ✗'
        ELSE ''
      END
    )
    ORDER BY d.id
    SEPARATOR '\n'
  ) as distribution_breakdown
FROM miao_distribution_executions e
JOIN miao_fund_distribution_rules r ON e.rule_id = r.id
LEFT JOIN miao_distribution_execution_details d ON e.id = d.execution_id
LEFT JOIN miao_treasury_wallets w ON d.wallet_id = w.id
WHERE e.source_type = ? AND e.source_id = ?
GROUP BY e.id;

-- ============================================
-- 11. VERIFICAR SE DISTRIBUIÇÃO ESTÁ COMPLETA
-- ============================================
SELECT 
  e.id,
  e.total_amount_sol,
  SUM(d.calculated_amount_sol) as total_distributed_sol,
  SUM(d.actual_amount_sol) as total_actual_sol,
  COUNT(d.id) as details_count,
  COUNT(CASE WHEN d.status = 'completed' THEN 1 END) as completed_count,
  COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN d.status = 'failed' THEN 1 END) as failed_count,
  CASE 
    WHEN SUM(d.calculated_amount_sol) = e.total_amount_sol 
      AND COUNT(CASE WHEN d.status = 'completed' THEN 1 END) = COUNT(d.id)
    THEN 'complete'
    WHEN COUNT(CASE WHEN d.status = 'failed' THEN 1 END) > 0 THEN 'has_errors'
    ELSE 'incomplete'
  END as distribution_status
FROM miao_distribution_executions e
LEFT JOIN miao_distribution_execution_details d ON e.id = d.execution_id
WHERE e.id = ?
GROUP BY e.id;

-- ============================================
-- 12. ATUALIZAR SALDO DA CARTEIRA
-- ============================================
UPDATE miao_treasury_wallets w
SET 
  current_balance_sol = (
    SELECT COALESCE(SUM(CASE 
      WHEN t.to_wallet_id = w.id THEN t.amount_sol
      WHEN t.from_wallet_id = w.id THEN -t.amount_sol
      ELSE 0
    END), 0)
    FROM miao_treasury_transactions t
    WHERE (t.from_wallet_id = w.id OR t.to_wallet_id = w.id)
      AND t.status = 'completed'
  ),
  current_balance_miao = (
    SELECT COALESCE(SUM(CASE 
      WHEN t.to_wallet_id = w.id THEN t.amount_miao
      WHEN t.from_wallet_id = w.id THEN -t.amount_miao
      ELSE 0
    END), 0)
    FROM miao_treasury_transactions t
    WHERE (t.from_wallet_id = w.id OR t.to_wallet_id = w.id)
      AND t.status = 'completed'
  ),
  last_balance_check = NOW()
WHERE w.id = ?;

