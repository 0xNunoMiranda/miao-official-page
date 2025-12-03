# Sistema de Treasury e Distribuição de Fundos - MIAO

## Visão Geral

Sistema de carteiras intermediárias para gerenciar transações automáticas, conversões MIAO ↔ SOL, e distribuição rastreável de fundos.

## Características Principais

### Carteiras Intermediárias
- Múltiplas carteiras para diferentes propósitos
- Rastreamento de saldos (SOL e MIAO)
- Transações automáticas entre carteiras

### Distribuição de Fundos
- Regras configuráveis de distribuição
- Splits percentuais ou valores fixos
- Rastreamento completo de cada parcela
- Justificativa fácil de destinos

### Transações Automáticas
- Conversões MIAO ↔ SOL
- Queima automática de tokens
- Adição de liquidez
- Staking automático

## Estrutura de Tabelas

### 1. `miao_treasury_wallets` - Carteiras Intermediárias
- Carteiras do treasury
- Tipos: treasury, burn, liquidity, operations, reserve, staking, rewards
- Saldos atualizados periodicamente

### 2. `miao_fund_distribution_rules` - Regras de Distribuição
- Regras configuráveis
- Triggers por tipo de evento
- Prioridade de execução

### 3. `miao_fund_distributions` - Splits de Fundos
- Como dividir cada montante
- Percentuais ou valores fixos
- Ações: transfer, burn, swap, add_liquidity, stake

### 4. `miao_treasury_transactions` - Transações Automáticas
- Todas as transações entre carteiras
- Swaps, conversões, queimas
- Verificação blockchain

### 5. `miao_distribution_executions` - Execuções de Distribuição
- Histórico de cada distribuição
- Resumo em JSON
- Status de execução

### 6. `miao_distribution_execution_details` - Detalhes de Execução
- Cada parcela da distribuição
- Valores calculados vs. reais
- Transações individuais

## Exemplo: Pagamento na Shop

### Cenário: Cliente paga 1 SOL na shop

#### 1. Regra de Distribuição Configurada
```sql
-- Regra: shop_payment_sol
-- Distribuições:
-- - 30% para burn wallet (queimar MIAO)
-- - 40% para treasury
-- - 20% para liquidity pool
-- - 10% para operations
```

#### 2. Processar Distribuição
```sql
START TRANSACTION;

-- Criar execução de distribuição
INSERT INTO miao_distribution_executions 
  (rule_id, source_type, source_id, total_amount_sol, distribution_summary, status)
VALUES (
  (SELECT id FROM miao_fund_distribution_rules WHERE rule_key = 'shop_payment_sol'),
  'shop_order',
  123,  -- order_id
  1.0,  -- 1 SOL recebido
  JSON_ARRAY(
    JSON_OBJECT('wallet', 'burn_wallet', 'amount', 0.3, 'percentage', 30, 'action', 'burn'),
    JSON_OBJECT('wallet', 'main_treasury', 'amount', 0.4, 'percentage', 40, 'action', 'transfer'),
    JSON_OBJECT('wallet', 'liquidity_pool', 'amount', 0.2, 'percentage', 20, 'action', 'add_liquidity'),
    JSON_OBJECT('wallet', 'operations', 'amount', 0.1, 'percentage', 10, 'action', 'transfer')
  ),
  'processing'
);

SET @execution_id = LAST_INSERT_ID();

-- Processar cada distribuição
-- 1. Burn Wallet (30% = 0.3 SOL)
INSERT INTO miao_distribution_execution_details 
  (execution_id, distribution_id, wallet_id, calculated_amount_sol, action_type, status)
VALUES (
  @execution_id,
  (SELECT id FROM miao_fund_distributions WHERE rule_id = (SELECT id FROM miao_fund_distribution_rules WHERE rule_key = 'shop_payment_sol') AND wallet_id = (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'burn_wallet')),
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'burn_wallet'),
  0.3,
  'burn',
  'pending'
);

-- 2. Main Treasury (40% = 0.4 SOL)
INSERT INTO miao_distribution_execution_details 
  (execution_id, distribution_id, wallet_id, calculated_amount_sol, action_type, status)
VALUES (
  @execution_id,
  (SELECT id FROM miao_fund_distributions WHERE rule_id = (SELECT id FROM miao_fund_distribution_rules WHERE rule_key = 'shop_payment_sol') AND wallet_id = (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'main_treasury')),
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'main_treasury'),
  0.4,
  'transfer',
  'pending'
);

-- 3. Liquidity Pool (20% = 0.2 SOL)
INSERT INTO miao_distribution_execution_details 
  (execution_id, distribution_id, wallet_id, calculated_amount_sol, action_type, status)
VALUES (
  @execution_id,
  (SELECT id FROM miao_fund_distributions WHERE rule_id = (SELECT id FROM miao_fund_distribution_rules WHERE rule_key = 'shop_payment_sol') AND wallet_id = (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'liquidity_pool')),
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'liquidity_pool'),
  0.2,
  'add_liquidity',
  'pending'
);

-- 4. Operations (10% = 0.1 SOL)
INSERT INTO miao_distribution_execution_details 
  (execution_id, distribution_id, wallet_id, calculated_amount_sol, action_type, status)
VALUES (
  @execution_id,
  (SELECT id FROM miao_fund_distributions WHERE rule_id = (SELECT id FROM miao_fund_distribution_rules WHERE rule_key = 'shop_payment_sol') AND wallet_id = (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'operations')),
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'operations'),
  0.1,
  'transfer',
  'pending'
);

COMMIT;
```

#### 3. Executar Transações Automáticas
```sql
-- Para cada detalhe pendente, executar transação na Solana
-- Exemplo: Burn Wallet (queimar MIAO equivalente a 0.3 SOL)

-- 1. Converter 0.3 SOL para MIAO (via swap automático)
INSERT INTO miao_treasury_transactions 
  (transaction_type, from_wallet_id, to_wallet_id, amount_sol, swap_rate, status)
VALUES (
  'swap',
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'main_treasury'),
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'burn_wallet'),
  0.3,
  (SELECT current_price FROM miao_token_prices ORDER BY created_at DESC LIMIT 1),  -- Taxa atual
  'pending'
);

-- 2. Queimar MIAO
INSERT INTO miao_treasury_transactions 
  (transaction_type, from_wallet_id, amount_miao, status, notes)
VALUES (
  'burn',
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'burn_wallet'),
  (0.3 * (SELECT current_price FROM miao_token_prices ORDER BY created_at DESC LIMIT 1)),  -- MIAO equivalente
  'pending',
  'Burn automático de 30% do pagamento da shop'
);

-- 3. Transferir para outras carteiras
-- Treasury
INSERT INTO miao_treasury_transactions 
  (transaction_type, from_wallet_id, to_wallet_id, amount_sol, status)
VALUES (
  'transfer',
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'main_treasury'),
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'main_treasury'),
  0.4,
  'pending'
);

-- Liquidity Pool
INSERT INTO miao_treasury_transactions 
  (transaction_type, from_wallet_id, to_wallet_id, amount_sol, action_type, status)
VALUES (
  'distribution',
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'main_treasury'),
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'liquidity_pool'),
  0.2,
  'add_liquidity',
  'pending'
);

-- Operations
INSERT INTO miao_treasury_transactions 
  (transaction_type, from_wallet_id, to_wallet_id, amount_sol, status)
VALUES (
  'transfer',
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'main_treasury'),
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'operations'),
  0.1,
  'pending'
);
```

## Visualização de Distribuição

### Query: Ver Distribuição de uma Encomenda
```sql
SELECT 
  e.id as execution_id,
  r.rule_name,
  e.total_amount_sol,
  e.distribution_summary,
  e.status,
  e.created_at,
  -- Detalhes
  GROUP_CONCAT(
    CONCAT(
      w.wallet_name, 
      ': ', 
      d.calculated_amount_sol, 
      ' SOL (', 
      d.percentage, 
      '%) - ', 
      d.action_type
    )
    SEPARATOR ' | '
  ) as distribution_details
FROM miao_distribution_executions e
JOIN miao_fund_distribution_rules r ON e.rule_id = r.id
LEFT JOIN miao_distribution_execution_details d ON e.id = d.execution_id
LEFT JOIN miao_treasury_wallets w ON d.wallet_id = w.id
WHERE e.source_type = 'shop_order' AND e.source_id = ?
GROUP BY e.id;
```

### Query: Resumo de Distribuições
```sql
SELECT 
  w.wallet_name,
  w.wallet_type,
  SUM(d.calculated_amount_sol) as total_received_sol,
  SUM(d.calculated_amount_miao) as total_received_miao,
  COUNT(DISTINCT d.execution_id) as distributions_count,
  GROUP_CONCAT(DISTINCT d.action_type) as actions
FROM miao_distribution_execution_details d
JOIN miao_treasury_wallets w ON d.wallet_id = w.id
WHERE d.status = 'completed'
  AND d.executed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY w.id
ORDER BY total_received_sol DESC;
```

## Configuração de Regras

### Exemplo: Regra de Pagamento Shop (SOL)
```sql
-- Criar regra
INSERT INTO miao_fund_distribution_rules 
  (rule_key, rule_name, source_type, priority)
VALUES ('shop_payment_sol', 'Shop Payment (SOL)', 'shop_payment', 10);

SET @rule_id = LAST_INSERT_ID();

-- Configurar distribuições
-- 30% para burn
INSERT INTO miao_fund_distributions 
  (rule_id, wallet_id, percentage, action_type, description)
VALUES (
  @rule_id,
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'burn_wallet'),
  30.0,
  'burn',
  '30% do pagamento será usado para queimar MIAO'
);

-- 40% para treasury
INSERT INTO miao_fund_distributions 
  (rule_id, wallet_id, percentage, action_type, description)
VALUES (
  @rule_id,
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'main_treasury'),
  40.0,
  'transfer',
  '40% vai para o treasury principal'
);

-- 20% para liquidity
INSERT INTO miao_fund_distributions 
  (rule_id, wallet_id, percentage, action_type, description)
VALUES (
  @rule_id,
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'liquidity_pool'),
  20.0,
  'add_liquidity',
  '20% adicionado à pool de liquidez'
);

-- 10% para operations
INSERT INTO miao_fund_distributions 
  (rule_id, wallet_id, percentage, action_type, description)
VALUES (
  @rule_id,
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'operations'),
  10.0,
  'transfer',
  '10% para operações do dia a dia'
);
```

## Conversões Automáticas

### SOL → MIAO (Para Queima)
```sql
-- Quando precisa queimar MIAO mas recebeu SOL
-- 1. Fazer swap automático
INSERT INTO miao_treasury_transactions 
  (transaction_type, from_wallet_id, to_wallet_id, amount_sol, amount_miao, swap_rate, status)
VALUES (
  'swap',
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'main_treasury'),
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'burn_wallet'),
  0.3,  -- SOL
  0,    -- Será calculado
  (SELECT current_price FROM miao_token_prices ORDER BY created_at DESC LIMIT 1),
  'pending'
);

-- 2. Queimar MIAO
INSERT INTO miao_treasury_transactions 
  (transaction_type, from_wallet_id, amount_miao, status, notes)
VALUES (
  'burn',
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'burn_wallet'),
  (0.3 * (SELECT current_price FROM miao_token_prices ORDER BY created_at DESC LIMIT 1)),
  'pending',
  'Queima automática após swap SOL→MIAO'
);
```

### MIAO → SOL (Para Operações)
```sql
-- Quando precisa de SOL mas tem MIAO
INSERT INTO miao_treasury_transactions 
  (transaction_type, from_wallet_id, to_wallet_id, amount_sol, amount_miao, swap_rate, status)
VALUES (
  'swap',
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'main_treasury'),
  (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'operations'),
  0,  -- Será calculado
  1000,  -- MIAO
  (SELECT current_price FROM miao_token_prices ORDER BY created_at DESC LIMIT 1),
  'pending'
);
```

## Dashboard de Treasury

### Resumo de Carteiras
```sql
SELECT 
  w.wallet_name,
  w.wallet_type,
  w.current_balance_sol,
  w.current_balance_miao,
  w.last_balance_check,
  COUNT(DISTINCT t.id) as transactions_count,
  SUM(CASE WHEN t.transaction_type = 'incoming' THEN t.amount_sol ELSE 0 END) as total_incoming_sol,
  SUM(CASE WHEN t.transaction_type = 'outgoing' THEN t.amount_sol ELSE 0 END) as total_outgoing_sol
FROM miao_treasury_wallets w
LEFT JOIN miao_treasury_transactions t ON (
  t.from_wallet_id = w.id OR t.to_wallet_id = w.id
) AND t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY w.id
ORDER BY w.wallet_type, w.wallet_name;
```

### Distribuições por Origem
```sql
SELECT 
  e.source_type,
  e.source_id,
  COUNT(*) as distributions_count,
  SUM(e.total_amount_sol) as total_amount_sol,
  e.status,
  e.created_at
FROM miao_distribution_executions e
WHERE e.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY e.source_type, e.source_id, e.status, e.created_at
ORDER BY e.created_at DESC;
```

## API Endpoints Sugeridos

### Treasury
```
GET    /api/treasury/wallets           - Listar carteiras
GET    /api/treasury/wallets/:id       - Detalhes da carteira
GET    /api/treasury/transactions      - Transações
POST   /api/treasury/swap              - Executar swap
POST   /api/treasury/burn              - Queimar tokens
```

### Distribuições
```
GET    /api/distributions/rules        - Regras de distribuição
GET    /api/distributions/executions   - Execuções
GET    /api/distributions/:id           - Detalhes da distribuição
GET    /api/distributions/source/:type/:id - Distribuição por origem
POST   /api/distributions/execute      - Executar distribuição
```

## Notas Importantes

1. **Rastreabilidade**: Cada parcela é rastreada individualmente
2. **Justificativa**: Fácil verificar destino de cada montante
3. **Automação**: Transações podem ser executadas automaticamente
4. **Flexibilidade**: Regras configuráveis por tipo de evento
5. **Transparência**: Histórico completo de todas as operações

