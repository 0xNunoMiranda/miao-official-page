# Sistema de Hierarquias - MIAO Tools

## Visão Geral

O sistema de hierarquias define o status e privilégios de cada membro do Exército Miao. Cada hierarquia requer um **nível mínimo** e **gems totais acumuladas**.

## Tabela de Hierarquias

| Hierarquia | Nível Mínimo | Gems Mínimas | Título | Descrição |
|------------|--------------|--------------|--------|-----------|
| **Recruit** | 1 | 0 | Recruta | Novo membro do exército Miao |
| **Soldier** | 2 | 500 | Soldado | Soldado dedicado do exército |
| **Sergeant** | 3 | 2,000 | Sargento | Sargento experiente e confiável |
| **Captain** | 4 | 5,000 | Capitão | Capitão respeitado e líder |
| **General** | 5 | 15,000 | General | General do exército, comandante de elite |
| **Legend** | 6 | 50,000 | Lenda | Lenda do MIAO, membro fundador |

## Requisitos para Promoção

Para ser promovido a uma hierarquia, o usuário precisa:
1. ✅ Alcançar o **nível mínimo** necessário
2. ✅ Ter acumulado as **gems totais** necessárias
3. ✅ Ambos os requisitos devem ser atendidos simultaneamente

### Exemplo
Para ser promovido a **Captain**:
- Nível: 4 ou superior
- Gems totais: 5,000 ou mais
- Ambos devem ser verdadeiros ao mesmo tempo

## Benefícios por Hierarquia

### 🟢 Recruit (Nível 1, 0 gems)
- **Quests diárias**: 3
- **Slots de memes**: 5
- **Acesso**: Básico

### 🟡 Soldier (Nível 2, 500 gems)
- **Quests diárias**: 5
- **Slots de memes**: 10
- **Acesso**: Padrão
- **Bônus de recompensa**: +10% em quests
- **Bônus de referência**: 10% das gems dos referidos

### 🟠 Sergeant (Nível 3, 2,000 gems)
- **Quests diárias**: 7
- **Slots de memes**: 15
- **Acesso**: Padrão
- **Bônus de recompensa**: +15% em quests
- **Bônus de referência**: 20% das gems dos referidos

### 🔵 Captain (Nível 4, 5,000 gems)
- **Quests diárias**: 10
- **Slots de memes**: 25
- **Acesso**: Premium
- **Bônus de recompensa**: +25% em quests
- **Bônus de referência**: 30% das gems dos referidos
- **Features exclusivas**: Advanced Tools, Priority Support

### 🟣 General (Nível 5, 15,000 gems)
- **Quests diárias**: 15
- **Slots de memes**: 50
- **Acesso**: Premium
- **Bônus de recompensa**: +50% em quests
- **Bônus de referência**: 50% das gems dos referidos
- **Features exclusivas**: Advanced Tools, Priority Support, Beta Access, Governance Voting

### ⭐ Legend (Nível 6, 50,000 gems)
- **Quests diárias**: Ilimitadas
- **Slots de memes**: Ilimitados
- **Acesso**: Legendary
- **Bônus de recompensa**: +100% em quests
- **Bônus de referência**: 100% das gems dos referidos
- **Features exclusivas**: Todas as features, Priority Support, Beta Access, Governance Voting, Exclusive NFTs, Custom Badge
- **Título especial**: "MIAO Legend"

## Verificação e Promoção Automática

### Query para Verificar Hierarquia Atual
```sql
SELECT 
  h.hierarchy,
  h.title,
  h.required_level,
  h.required_gems,
  u.level as user_level,
  u.total_gems as user_total_gems,
  CASE 
    WHEN u.level >= h.required_level AND u.total_gems >= h.required_gems THEN TRUE
    ELSE FALSE
  END as can_promote
FROM miao_hierarchies h
CROSS JOIN miao_users u
WHERE u.wallet_address = ?
ORDER BY h.required_level DESC
LIMIT 1;
```

### Query para Encontrar Próxima Hierarquia
```sql
SELECT 
  h.*
FROM miao_hierarchies h
WHERE h.required_level > (SELECT level FROM miao_users WHERE wallet_address = ?)
   OR (h.required_level = (SELECT level FROM miao_users WHERE wallet_address = ?) 
       AND h.required_gems > (SELECT total_gems FROM miao_users WHERE wallet_address = ?))
ORDER BY h.required_level ASC, h.required_gems ASC
LIMIT 1;
```

### Procedimento de Promoção Automática
```sql
-- Verificar e promover automaticamente
UPDATE miao_users u
JOIN miao_hierarchies h ON (
  h.required_level <= u.level 
  AND h.required_gems <= u.total_gems
  AND (h.required_level > u.hierarchy_level OR h.required_gems > u.hierarchy_gems)
)
SET 
  u.hierarchy = h.hierarchy,
  u.updated_at = NOW()
WHERE u.wallet_address = ?
ORDER BY h.required_level DESC, h.required_gems DESC
LIMIT 1;
```

## Progresso Visual

### Calcular Progresso para Próxima Hierarquia
```sql
SELECT 
  u.hierarchy as current_hierarchy,
  u.level as current_level,
  u.total_gems as current_gems,
  h_next.hierarchy as next_hierarchy,
  h_next.title as next_title,
  h_next.required_level as next_level_required,
  h_next.required_gems as next_gems_required,
  ROUND((u.level / h_next.required_level) * 100, 2) as level_progress,
  ROUND((u.total_gems / h_next.required_gems) * 100, 2) as gems_progress,
  CASE 
    WHEN u.level >= h_next.required_level AND u.total_gems >= h_next.required_gems THEN 'ready'
    WHEN u.level >= h_next.required_level THEN 'need_gems'
    WHEN u.total_gems >= h_next.required_gems THEN 'need_level'
    ELSE 'need_both'
  END as promotion_status
FROM miao_users u
LEFT JOIN miao_hierarchies h_current ON u.hierarchy = h_current.hierarchy
LEFT JOIN miao_hierarchies h_next ON (
  h_next.required_level > h_current.required_level 
  OR (h_next.required_level = h_current.required_level AND h_next.required_gems > h_current.required_gems)
)
WHERE u.wallet_address = ?
ORDER BY h_next.required_level ASC, h_next.required_gems ASC
LIMIT 1;
```

## API Endpoints Sugeridos

```
GET    /api/hierarchies                    - Listar todas as hierarquias
GET    /api/hierarchies/:hierarchy         - Detalhes de uma hierarquia
GET    /api/user/:wallet/hierarchy         - Hierarquia atual do usuário
GET    /api/user/:wallet/hierarchy/next    - Próxima hierarquia e progresso
POST   /api/user/:wallet/hierarchy/check   - Verificar e promover (se elegível)
```

## Notas Importantes

1. **Promoção Automática**: A hierarquia é atualizada automaticamente quando os requisitos são atendidos
2. **Não Retrocesso**: Uma vez promovido, não há retrocesso (mesmo se gems diminuírem)
3. **Gems Totais**: Usa `total_gems` (histórico), não `current_gems` (disponíveis)
4. **Ambos Requisitos**: Nível E gems devem ser atendidos simultaneamente
5. **Benefícios Imediatos**: Benefícios são aplicados assim que promovido

## Exemplo de Uso

```javascript
// Verificar hierarquia atual
const user = await getUser(walletAddress);
console.log(`Hierarquia atual: ${user.hierarchy}`); // "recruit"

// Verificar progresso
const progress = await getHierarchyProgress(walletAddress);
console.log(`Progresso para ${progress.next_hierarchy}:`);
console.log(`- Nível: ${progress.level_progress}%`);
console.log(`- Gems: ${progress.gems_progress}%`);

// Quando usuário atinge requisitos, promover automaticamente
if (progress.promotion_status === 'ready') {
  await promoteUser(walletAddress);
}
```

