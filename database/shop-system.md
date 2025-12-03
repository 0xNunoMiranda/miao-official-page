# Sistema de Shop - MIAO

## Visão Geral

Shop separada do MIAO Tools, mas usando a mesma base de dados. Sistema completo de encomendas com controle administrativo estilo PrestaShop.

## Características Principais

### Pagamento
- **Principal**: $SOL (transações reais na Solana)
- **Alternativo**: Gems (preços muito altos para desencorajar)
- Verificação automática de transações blockchain

### Controle de Encomendas
- Estados completos (pending → payment_received → processing → shipped → delivered)
- Histórico de mudanças de status
- Rastreamento de envio
- Dashboard administrativa

## Estrutura de Tabelas

### 1. `miao_shop_products` - Produtos
- Informações do produto
- Preços: SOL (principal) e Gems (opcional, muito alto)
- Stock, categorias, imagens
- Peso e dimensões para cálculo de envio

### 2. `miao_shop_orders` - Encomendas
- Dados completos da encomenda
- Endereço de envio e faturação
- Status e payment_status
- Transação Solana vinculada
- Tracking number

### 3. `miao_shop_order_items` - Itens da Encomenda
- Produtos comprados
- Quantidades e preços no momento da compra
- Snapshot dos preços (não muda mesmo se produto mudar)

### 4. `miao_shop_sol_transactions` - Transações $SOL
- Todas as transações SOL
- Verificação blockchain
- Links com encomendas

### 5. `miao_shop_order_history` - Histórico
- Todas as mudanças de status
- Quem fez a mudança
- Notas e timestamps

### 6. `miao_shop_settings` - Configurações
- Configurações da shop
- Wallet SOL para receber pagamentos
- Multiplicador de gems
- Custos de envio

## Estados da Encomenda

```
pending           → Encomenda criada, aguardando pagamento
payment_pending   → Aguardando confirmação do pagamento
payment_received  → Pagamento confirmado
processing        → Em processamento
preparing         → Preparando para envio
shipped           → Enviado
in_transit        → Em trânsito
delivered         → Entregue
cancelled         → Cancelada
refunded          → Reembolsada
```

## Fluxo de Compra

### 1. Criar Encomenda
```sql
START TRANSACTION;

-- Gerar número da encomenda
SET @order_number = CONCAT('ORD-', YEAR(NOW()), '-', LPAD((SELECT COUNT(*) + 1 FROM miao_shop_orders WHERE YEAR(created_at) = YEAR(NOW())), 6, '0'));

-- Criar encomenda
INSERT INTO miao_shop_orders 
  (order_number, wallet_address, email, shipping_name, shipping_address, ...)
VALUES (...);

SET @order_id = LAST_INSERT_ID();

-- Adicionar itens
INSERT INTO miao_shop_order_items 
  (order_id, product_id, product_name, quantity, unit_price_sol, total_price_sol)
VALUES 
  (@order_id, ?, ?, ?, ?, ?);

-- Calcular totais
UPDATE miao_shop_orders
SET 
  subtotal_sol = (SELECT SUM(total_price_sol) FROM miao_shop_order_items WHERE order_id = @order_id),
  shipping_cost_sol = CASE 
    WHEN subtotal_sol >= (SELECT CAST(setting_value AS DECIMAL(18,9)) FROM miao_shop_settings WHERE setting_key = 'free_shipping_threshold_sol')
    THEN 0
    ELSE (SELECT CAST(setting_value AS DECIMAL(18,9)) FROM miao_shop_settings WHERE setting_key = 'default_shipping_cost_sol')
  END,
  total_sol = subtotal_sol + shipping_cost_sol
WHERE id = @order_id;

-- Registrar histórico
INSERT INTO miao_shop_order_history 
  (order_id, status, action, notes)
VALUES (@order_id, 'pending', 'order_created', 'Encomenda criada');

COMMIT;
```

### 2. Pagamento com $SOL
```sql
-- Usuário faz transação na Solana
-- Frontend envia assinatura

START TRANSACTION;

-- Verificar transação na blockchain (via API)
-- Se confirmada:

-- Registrar transação
INSERT INTO miao_shop_sol_transactions 
  (order_id, wallet_address, transaction_signature, amount_sol, status, blockchain_verified)
VALUES (?, ?, ?, ?, 'confirmed', TRUE);

-- Atualizar encomenda
UPDATE miao_shop_orders
SET 
  transaction_signature = ?,
  payment_status = 'paid',
  status = 'payment_received',
  blockchain_verified = TRUE,
  verified_at = NOW(),
  paid_at = NOW()
WHERE id = ?;

-- Registrar histórico
INSERT INTO miao_shop_order_history 
  (order_id, status, action, notes)
VALUES (?, 'payment_received', 'payment_confirmed', CONCAT('Transação: ', ?));

COMMIT;
```

### 3. Pagamento com Gems
```sql
START TRANSACTION;

-- Verificar gems suficientes
SELECT current_gems, total_gems FROM miao_users WHERE wallet_address = ?;

-- Se suficiente, processar:
-- Deduzir gems
UPDATE miao_users 
SET current_gems = current_gems - ?
WHERE wallet_address = ?;

-- Registrar transação gems
INSERT INTO miao_gem_transactions 
  (wallet_address, amount, type, source, payment_method)
VALUES (?, -?, 'spend', CONCAT('shop_order_', ?), 'gems');

-- Atualizar encomenda
UPDATE miao_shop_orders
SET 
  payment_status = 'paid',
  status = 'payment_received',
  paid_at = NOW()
WHERE id = ?;

-- Registrar histórico
INSERT INTO miao_shop_order_history 
  (order_id, status, action, notes)
VALUES (?, 'payment_received', 'payment_gems', 'Pagamento com gems');

COMMIT;
```

### 4. Atualizar Status (Dashboard Admin)
```sql
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
  cancelled_at = CASE WHEN ? = 'cancelled' THEN NOW() ELSE cancelled_at END
WHERE id = ?;

-- Registrar histórico
INSERT INTO miao_shop_order_history 
  (order_id, status, action, changed_by, notes)
VALUES (?, ?, 'status_changed', ?, ?);

COMMIT;
```

## Cálculo de Preços

### Preço em Gems (Muito Alto)
```sql
-- Multiplicador configurável (padrão: 100x)
SELECT 
  price_sol,
  price_gems,
  COALESCE(price_gems, price_sol * (SELECT CAST(setting_value AS DECIMAL) FROM miao_shop_settings WHERE setting_key = 'gems_multiplier')) as calculated_gems_price
FROM miao_shop_products
WHERE id = ?;
```

**Exemplo:**
- Produto: 1 SOL
- Multiplicador: 100x
- Preço em gems: 100 gems (muito alto para desencorajar)

## Dashboard Administrativa

### Queries para Dashboard

#### Resumo Geral
```sql
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
  COUNT(CASE WHEN status = 'payment_pending' THEN 1 END) as payment_pending,
  COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
  COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped,
  SUM(total_sol) as total_revenue_sol,
  SUM(CASE WHEN payment_method = 'gems' THEN total_gems ELSE 0 END) as total_gems_spent
FROM miao_shop_orders
WHERE DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 30 DAY);
```

#### Encomendas Recentes
```sql
SELECT 
  o.order_number,
  o.wallet_address,
  u.username,
  o.status,
  o.payment_status,
  o.total_sol,
  o.payment_method,
  o.created_at,
  COUNT(oi.id) as items_count
FROM miao_shop_orders o
LEFT JOIN miao_users u ON o.wallet_address = u.wallet_address
LEFT JOIN miao_shop_order_items oi ON o.id = oi.order_id
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 50;
```

#### Transações $SOL
```sql
SELECT 
  t.transaction_signature,
  t.amount_sol,
  t.status,
  t.blockchain_verified,
  o.order_number,
  t.created_at
FROM miao_shop_sol_transactions t
LEFT JOIN miao_shop_orders o ON t.order_id = o.id
ORDER BY t.created_at DESC
LIMIT 100;
```

#### Histórico de Encomenda
```sql
SELECT 
  status,
  action,
  changed_by,
  notes,
  created_at
FROM miao_shop_order_history
WHERE order_id = ?
ORDER BY created_at DESC;
```

## API Endpoints Sugeridos

### Shop Pública
```
GET    /api/shop/products              - Listar produtos
GET    /api/shop/products/:id         - Detalhes do produto
GET    /api/shop/categories            - Categorias
POST   /api/shop/cart/calculate        - Calcular totais do carrinho
POST   /api/shop/orders                - Criar encomenda
GET    /api/shop/orders/:orderNumber   - Status da encomenda (público)
POST   /api/shop/orders/:id/payment    - Processar pagamento
```

### Dashboard Admin
```
GET    /api/admin/orders               - Listar encomendas (filtros)
GET    /api/admin/orders/:id           - Detalhes completos
PUT    /api/admin/orders/:id/status    - Atualizar status
PUT    /api/admin/orders/:id/tracking  - Adicionar tracking
GET    /api/admin/transactions         - Transações SOL
GET    /api/admin/stats                - Estatísticas
GET    /api/admin/products             - Gerenciar produtos
POST   /api/admin/products             - Criar produto
PUT    /api/admin/products/:id         - Atualizar produto
```

## Verificação de Transações $SOL

```javascript
// Exemplo de verificação Solana
import { Connection, PublicKey } from '@solana/web3.js';

async function verifySolTransaction(signature, expectedAmount, recipientAddress) {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const tx = await connection.getTransaction(signature, {
    commitment: 'confirmed',
    maxSupportedTransactionVersion: 0
  });
  
  if (!tx || !tx.meta) return false;
  if (tx.meta.err) return false;
  
  // Verificar se foi para o endereço correto
  const recipient = new PublicKey(recipientAddress);
  const postBalances = tx.meta.postBalances;
  const preBalances = tx.meta.preBalances;
  
  // Verificar se o valor corresponde
  // ... lógica de verificação
  
  return true;
}
```

## Exemplo de Produto

```sql
INSERT INTO miao_shop_products 
  (product_key, name, description, category, price_sol, price_gems, allows_gems, stock_quantity)
VALUES 
  (
    'miao_t_shirt_black',
    'MIAO T-Shirt Black',
    'Camiseta oficial do MIAO Token - Cor Preta',
    'merchandise',
    0.5,  -- 0.5 SOL
    5000, -- 5000 gems (muito alto!)
    TRUE, -- Permite gems (mas desencorajado)
    100   -- Stock limitado
  );
```

## Notas Importantes

1. **Preços em Gems**: Muito altos para incentivar pagamento com SOL
2. **Snapshot de Preços**: Preços são salvos no momento da compra
3. **Verificação Blockchain**: Todas as transações SOL são verificadas
4. **Histórico Completo**: Todas as mudanças são registradas
5. **Dashboard Admin**: Controle total sobre encomendas
6. **Rastreamento**: Sistema completo de tracking

