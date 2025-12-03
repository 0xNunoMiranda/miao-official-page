# Sistema de Itens de Jogo - MIAO Tools

## Visão Geral

Sistema completo para itens de jogo que podem ser pagos com **gems** ou **SOL**. A maioria dos itens será paga principalmente com SOL, mas gems estarão disponíveis a preços muito altos para desencorajar seu uso.

## Estrutura

### Tabela `miao_resources` (Atualizada)

Agora suporta pagamento híbrido:

```sql
- cost_gems: Custo em gems (NULL = não disponível com gems)
- cost_sol: Custo em SOL (NULL = não disponível com SOL)
- payment_options: gems_only, sol_only, both
- category: Inclui 'game' para itens de jogo
```

### Tabela `miao_user_resources` (Atualizada)

Rastreia o método de pagamento usado:

```sql
- payment_method: 'gems' ou 'sol'
- gem_transaction_id: ID da transação de gems (se pagamento com gems)
- treasury_transaction_id: ID da transação treasury (se pagamento com SOL)
```

## Tipos de Itens de Jogo

### 1. Itens Permanentes
- **Exemplos**: Skins, avatares, temas
- **Duração**: NULL (permanente)
- **Pagamento**: Principalmente SOL, gems a preço muito alto

### 2. Itens Temporários
- **Exemplos**: Boosts, power-ups, buffs
- **Duração**: X dias
- **Pagamento**: SOL ou gems

### 3. Itens Consumíveis
- **Exemplos**: Vidas extras, moedas do jogo, itens especiais
- **Duração**: NULL (consumível)
- **max_uses**: Número de usos
- **Pagamento**: SOL ou gems

## Exemplos de Itens de Jogo

### 1. Skin Premium (Permanente)
```sql
INSERT INTO miao_resources 
  (resource_key, resource_name, description, category, cost_sol, cost_gems, payment_options, duration_days, is_consumable)
VALUES (
  'game_skin_premium',
  'Skin Premium',
  'Skin exclusiva para o jogo',
  'game',
  0.5,  -- 0.5 SOL
  50000, -- 50,000 gems (preço absurdo)
  'both',
  NULL,  -- Permanente
  FALSE
);
```

### 2. Boost de XP (Temporário)
```sql
INSERT INTO miao_resources 
  (resource_key, resource_name, description, category, cost_sol, cost_gems, payment_options, duration_days, is_consumable)
VALUES (
  'game_xp_boost_7d',
  'Boost de XP 7 Dias',
  'Ganhe 2x XP por 7 dias',
  'game',
  0.1,  -- 0.1 SOL
  10000, -- 10,000 gems
  'both',
  7,     -- 7 dias
  FALSE
);
```

### 3. Vidas Extras (Consumível)
```sql
INSERT INTO miao_resources 
  (resource_key, resource_name, description, category, cost_sol, cost_gems, payment_options, duration_days, is_consumable, max_uses)
VALUES (
  'game_extra_lives',
  'Vidas Extras (Pack de 5)',
  '5 vidas extras para usar no jogo',
  'game',
  0.05, -- 0.05 SOL
  5000,  -- 5,000 gems
  'both',
  NULL,  -- Consumível
  TRUE,
  5      -- 5 usos
);
```

### 4. Moedas do Jogo (Consumível)
```sql
INSERT INTO miao_resources 
  (resource_key, resource_name, description, category, cost_sol, cost_gems, payment_options, duration_days, is_consumable, max_uses)
VALUES (
  'game_coins_1000',
  '1000 Moedas do Jogo',
  '1000 moedas para usar no jogo',
  'game',
  0.2,  -- 0.2 SOL
  20000, -- 20,000 gems
  'both',
  NULL,  -- Consumível
  TRUE,
  1      -- 1 uso (mas adiciona 1000 moedas)
);
```

## Fluxo de Compra

### 1. Compra com Gems

```javascript
// app/api/resources/[resourceId]/purchase/route.ts
export async function POST(
  request: Request,
  { params }: { params: { resourceId: string } }
) {
  const { walletAddress, paymentMethod } = await request.json();
  
  if (paymentMethod !== 'gems') {
    return Response.json({ error: 'Invalid payment method' }, { status: 400 });
  }
  
  // Buscar recurso
  const resource = await db.query(`
    SELECT * FROM miao_resources WHERE id = ?
  `, [params.resourceId]);
  
  if (!resource || !resource.cost_gems) {
    return Response.json({ error: 'Resource not available with gems' }, { status: 400 });
  }
  
  // Verificar gems do usuário
  const user = await db.query(`
    SELECT gems FROM miao_users WHERE wallet_address = ?
  `, [walletAddress]);
  
  if (user.gems < resource.cost_gems) {
    return Response.json({ error: 'Insufficient gems' }, { status: 400 });
  }
  
  // Deduzir gems
  await db.query(`
    UPDATE miao_users
    SET gems = gems - ?
    WHERE wallet_address = ?
  `, [resource.cost_gems, walletAddress]);
  
  // Registrar transação de gems
  const gemTransaction = await db.query(`
    INSERT INTO miao_gem_transactions 
      (wallet_address, amount, type, description)
    VALUES (?, ?, 'spend', ?)
  `, [
    walletAddress,
    -resource.cost_gems,
    `Purchase: ${resource.resource_name}`
  ]);
  
  // Adicionar recurso ao usuário
  const expiresAt = resource.duration_days 
    ? new Date(Date.now() + resource.duration_days * 24 * 60 * 60 * 1000)
    : null;
  
  await db.query(`
    INSERT INTO miao_user_resources 
      (wallet_address, resource_id, payment_method, gem_transaction_id, expires_at, uses_remaining)
    VALUES (?, ?, 'gems', ?, ?, ?)
  `, [
    walletAddress,
    resource.id,
    gemTransaction.insertId,
    expiresAt,
    resource.is_consumable ? resource.max_uses : null
  ]);
  
  return Response.json({ success: true });
}
```

### 2. Compra com SOL

```javascript
// app/api/resources/[resourceId]/purchase/route.ts
export async function POST(
  request: Request,
  { params }: { params: { resourceId: string } }
) {
  const { walletAddress, paymentMethod, transactionSignature } = await request.json();
  
  if (paymentMethod !== 'sol') {
    return Response.json({ error: 'Invalid payment method' }, { status: 400 });
  }
  
  // Buscar recurso
  const resource = await db.query(`
    SELECT * FROM miao_resources WHERE id = ?
  `, [params.resourceId]);
  
  if (!resource || !resource.cost_sol) {
    return Response.json({ error: 'Resource not available with SOL' }, { status: 400 });
  }
  
  // Verificar transação Solana
  const verified = await verifySolanaTransaction(
    transactionSignature,
    walletAddress,
    resource.cost_sol
  );
  
  if (!verified) {
    return Response.json({ error: 'Transaction not verified' }, { status: 400 });
  }
  
  // Criar transação treasury
  const treasuryTransaction = await db.query(`
    INSERT INTO miao_treasury_transactions 
      (transaction_type, category, source_type, source_id, reason, reason_details, amount_sol, from_wallet_id, to_wallet_id, transaction_signature, status)
    VALUES (
      'incoming',
      'games',
      'game_item_purchase',
      ?,
      ?,
      ?,
      ?,
      NULL,
      (SELECT id FROM miao_treasury_wallets WHERE wallet_key = 'treasure_chest'),
      ?,
      'completed'
    )
  `, [
    resource.id,
    resource.resource_name,
    JSON.stringify({ resource_id: resource.id, resource_key: resource.resource_key }),
    resource.cost_sol,
    transactionSignature
  ]);
  
  // Adicionar recurso ao usuário
  const expiresAt = resource.duration_days 
    ? new Date(Date.now() + resource.duration_days * 24 * 60 * 60 * 1000)
    : null;
  
  await db.query(`
    INSERT INTO miao_user_resources 
      (wallet_address, resource_id, payment_method, treasury_transaction_id, expires_at, uses_remaining)
    VALUES (?, ?, 'sol', ?, ?, ?)
  `, [
    walletAddress,
    resource.id,
    treasuryTransaction.insertId,
    expiresAt,
    resource.is_consumable ? resource.max_uses : null
  ]);
  
  return Response.json({ success: true });
}
```

## Verificação de Recursos Ativos

### Verificar se Usuário Tem Recurso Ativo

```javascript
// app/api/user/[walletAddress]/resources/[resourceKey]/check/route.ts
export async function GET(
  request: Request,
  { params }: { params: { walletAddress: string, resourceKey: string } }
) {
  const { walletAddress, resourceKey } = params;
  
  const resource = await db.query(`
    SELECT ur.*, r.resource_key, r.resource_name, r.is_consumable
    FROM miao_user_resources ur
    JOIN miao_resources r ON ur.resource_id = r.id
    WHERE ur.wallet_address = ?
      AND r.resource_key = ?
      AND ur.is_active = TRUE
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      AND (ur.uses_remaining IS NULL OR ur.uses_remaining > 0)
  `, [walletAddress, resourceKey]);
  
  if (!resource) {
    return Response.json({ has_resource: false });
  }
  
  return Response.json({
    has_resource: true,
    resource: {
      key: resource.resource_key,
      name: resource.resource_name,
      expires_at: resource.expires_at,
      uses_remaining: resource.uses_remaining,
      is_consumable: resource.is_consumable
    }
  });
}
```

### Usar Recurso Consumível

```javascript
// app/api/user/[walletAddress]/resources/[resourceId]/use/route.ts
export async function POST(
  request: Request,
  { params }: { params: { walletAddress: string, resourceId: string } }
) {
  const { walletAddress, resourceId } = params;
  
  // Buscar recurso
  const userResource = await db.query(`
    SELECT ur.*, r.is_consumable, r.max_uses
    FROM miao_user_resources ur
    JOIN miao_resources r ON ur.resource_id = r.id
    WHERE ur.wallet_address = ?
      AND ur.resource_id = ?
      AND ur.is_active = TRUE
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  `, [walletAddress, resourceId]);
  
  if (!userResource) {
    return Response.json({ error: 'Resource not found or expired' }, { status: 404 });
  }
  
  if (!userResource.is_consumable) {
    return Response.json({ error: 'Resource is not consumable' }, { status: 400 });
  }
  
  if (userResource.uses_remaining !== null && userResource.uses_remaining <= 0) {
    return Response.json({ error: 'No uses remaining' }, { status: 400 });
  }
  
  // Decrementar usos
  await db.query(`
    UPDATE miao_user_resources
    SET uses_remaining = uses_remaining - 1,
        is_active = CASE
          WHEN uses_remaining - 1 <= 0 THEN FALSE
          ELSE TRUE
        END
    WHERE id = ?
  `, [userResource.id]);
  
  return Response.json({ success: true, uses_remaining: userResource.uses_remaining - 1 });
}
```

## Queries Úteis

### Listar Itens de Jogo Disponíveis

```sql
SELECT 
  id,
  resource_key,
  resource_name,
  description,
  cost_sol,
  cost_gems,
  payment_options,
  duration_days,
  is_consumable,
  max_uses
FROM miao_resources
WHERE category = 'game'
  AND is_active = TRUE
ORDER BY sort_order, cost_sol;
```

### Itens Comprados por Usuário

```sql
SELECT 
  ur.id,
  r.resource_key,
  r.resource_name,
  ur.payment_method,
  ur.purchased_at,
  ur.expires_at,
  ur.uses_remaining,
  ur.is_active
FROM miao_user_resources ur
JOIN miao_resources r ON ur.resource_id = r.id
WHERE ur.wallet_address = ?
  AND r.category = 'game'
ORDER BY ur.purchased_at DESC;
```

### Itens Ativos do Usuário

```sql
SELECT 
  r.resource_key,
  r.resource_name,
  ur.expires_at,
  ur.uses_remaining
FROM miao_user_resources ur
JOIN miao_resources r ON ur.resource_id = r.id
WHERE ur.wallet_address = ?
  AND r.category = 'game'
  AND ur.is_active = TRUE
  AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  AND (ur.uses_remaining IS NULL OR ur.uses_remaining > 0)
ORDER BY ur.purchased_at DESC;
```

## Estratégia de Preços

### Preços em SOL (Principal)
- **Itens Permanentes**: 0.1 - 1.0 SOL
- **Itens Temporários**: 0.05 - 0.5 SOL
- **Itens Consumíveis**: 0.01 - 0.2 SOL

### Preços em Gems (Desencorajador)
- **Multiplicador**: 100x - 1000x o valor em SOL
- **Exemplo**: Item de 0.1 SOL = 10,000 - 100,000 gems
- **Objetivo**: Incentivar pagamento com SOL

## Notas Importantes

1. **Pagamento Híbrido**: Todos os itens podem ter opção de pagamento com gems ou SOL
2. **Rastreamento**: Todas as compras são rastreadas em `miao_treasury_transactions` (SOL) ou `miao_gem_transactions` (gems)
3. **Categoria**: Itens de jogo usam `category = 'game'`
4. **Consumíveis**: Itens consumíveis têm `uses_remaining` que decrementa a cada uso
5. **Temporários**: Itens temporários têm `expires_at` que verifica expiração
6. **Permanentes**: Itens permanentes têm `expires_at = NULL` e `is_consumable = FALSE`

