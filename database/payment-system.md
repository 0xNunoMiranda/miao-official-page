# Sistema de Pagamento - MIAO Tools

## Tipos de Pagamento

O sistema suporta **3 tipos de pagamento** para features/premium:

### 1. Apenas $MIAO (Transação Real na Solana)
- **Obrigatório** usar $MIAO tokens
- Transação real na blockchain Solana
- Verificação via assinatura da transação
- Exemplo: Features premium exclusivas

### 2. Apenas Gems (Pontos Internos)
- **Obrigatório** usar gems
- Gasto interno, sem transação blockchain
- Exemplo: Features básicas, personalizações

### 3. Escolha do Usuário (Gems OU $MIAO)
- Usuário **escolhe** entre gems ou $MIAO
- Flexibilidade de pagamento
- Exemplo: Acesso premium, ferramentas avançadas

## Estrutura de Preços

### Tabela `miao_features`
```sql
price_gems      INT NULL        -- Preço em gems (NULL = não aceita gems)
price_miao      DECIMAL(18,9)   -- Preço em $MIAO (NULL = não aceita $MIAO)
payment_options ENUM            -- 'gems_only', 'miao_only', 'both'
```

### Exemplos de Configuração

#### Apenas $MIAO
```sql
price_gems = NULL
price_miao = 500.0
payment_options = 'miao_only'
```

#### Apenas Gems
```sql
price_gems = 1000
price_miao = NULL
payment_options = 'gems_only'
```

#### Escolha do Usuário
```sql
price_gems = 1000
price_miao = 100.0
payment_options = 'both'
```

## Fluxo de Pagamento

### 1. Pagamento com Gems
```sql
-- Verificar gems suficientes
SELECT current_gems FROM miao_users WHERE wallet_address = ?;

-- Se suficiente, processar:
START TRANSACTION;
  -- Deduzir gems
  UPDATE miao_users SET current_gems = current_gems - ? WHERE wallet_address = ?;
  
  -- Registrar transação
  INSERT INTO miao_gem_transactions (wallet_address, amount, type, payment_method)
  VALUES (?, -?, 'spend', 'gems');
  
  -- Ativar feature
  INSERT INTO miao_user_features (wallet_address, feature_id, payment_method, gem_transaction_id)
  VALUES (?, ?, 'gems', LAST_INSERT_ID());
COMMIT;
```

### 2. Pagamento com $MIAO
```sql
-- 1. Usuário inicia transação na Solana
-- 2. Frontend envia assinatura da transação
-- 3. Backend verifica transação na blockchain
-- 4. Se confirmada, processar:

START TRANSACTION;
  -- Registrar transação $MIAO
  INSERT INTO miao_token_transactions 
    (wallet_address, transaction_signature, amount, type, feature_id, status, blockchain_verified)
  VALUES (?, ?, ?, 'payment', ?, 'confirmed', TRUE);
  
  -- Ativar feature
  INSERT INTO miao_user_features (wallet_address, feature_id, payment_method, transaction_id)
  VALUES (?, ?, 'miao', LAST_INSERT_ID());
COMMIT;
```

### 3. Pagamento Híbrido (Usuário Escolhe)
```javascript
// Frontend oferece opção
if (feature.payment_options === 'both') {
  // Mostrar botões: "Pagar com Gems" ou "Pagar com $MIAO"
  // Usuário escolhe
  if (userChoice === 'gems') {
    // Processar como gems
  } else {
    // Processar como $MIAO
  }
}
```

## Verificação de Transações $MIAO

### Verificação na Blockchain
```javascript
// Exemplo de verificação Solana
import { Connection, PublicKey } from '@solana/web3.js';

async function verifyTransaction(signature, expectedAmount, recipientAddress) {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const tx = await connection.getTransaction(signature);
  
  // Verificar se transação foi confirmada
  if (!tx.meta.confirmed) return false;
  
  // Verificar se foi para o endereço correto
  // Verificar se valor corresponde
  // Verificar se token é $MIAO
  
  return true;
}
```

## API Endpoints Sugeridos

### Listar Features Disponíveis
```
GET /api/features
GET /api/features/:category
```

### Verificar Feature Ativa
```
GET /api/user/:wallet/features/:featureKey
GET /api/user/:wallet/features
```

### Comprar Feature (Gems)
```
POST /api/user/:wallet/features/:featureId/purchase
Body: { paymentMethod: 'gems' }
```

### Comprar Feature ($MIAO)
```
POST /api/user/:wallet/features/:featureId/purchase
Body: { 
  paymentMethod: 'miao',
  transactionSignature: '...',
  amount: 100.0
}
```

### Verificar Transação $MIAO
```
POST /api/transactions/verify
Body: {
  signature: '...',
  expectedAmount: 100.0,
  recipientAddress: '...'
}
```

## Exemplos de Features

### Feature: Premium Meme Generator
- **Gems**: 1000 gems
- **$MIAO**: 100 tokens
- **Opção**: Ambos (usuário escolhe)
- **Duração**: 30 dias

### Feature: Advanced Tools
- **Gems**: Não aceita
- **$MIAO**: 500 tokens
- **Opção**: Apenas $MIAO
- **Duração**: Permanente

### Feature: Profile Badge
- **Gems**: 2000 gems
- **$MIAO**: Não aceita
- **Opção**: Apenas gems
- **Duração**: Permanente

## Segurança

1. **Verificação Blockchain**: Sempre verificar transações $MIAO na blockchain
2. **Validação de Assinatura**: Verificar assinatura da transação
3. **Prevenção de Replay**: Verificar se transação já foi usada
4. **Rate Limiting**: Limitar tentativas de verificação
5. **Validação de Saldo**: Verificar gems suficientes antes de processar

