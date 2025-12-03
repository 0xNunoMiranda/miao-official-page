# Política de Gems - MIAO Tools

## ⚠️ IMPORTANTE: Gems NÃO são transacionáveis

As **Gems** no MIAO Tools são **pontos internos de gamificação**, não são tokens ou moedas transacionáveis.

## Características

### ✅ O que as Gems SÃO:
- **Pontos de recompensa** por atividades na plataforma
- **Sistema de gamificação** interno
- **Moeda virtual** para desbloquear features premium
- **Medida de progresso** e engajamento
- **Histórico de conquistas** do usuário

### ❌ O que as Gems NÃO SÃO:
- ❌ **Tokens** ou criptomoedas
- ❌ **Transacionáveis** entre usuários
- ❌ **Transferíveis** para outras carteiras
- ❌ **Negociáveis** ou vendáveis
- ❌ **Conversíveis** em $MIAO ou outras moedas

## Como Funcionam

### Ganhar Gems
- ✅ Completar quests
- ✅ Criar memes
- ✅ Compartilhar conteúdo
- ✅ Login diário
- ✅ Streak bonus
- ✅ Referir amigos
- ✅ Interações na comunidade

### Gastar Gems (Uso Interno)
- ✅ Desbloquear features premium
- ✅ Acesso a ferramentas avançadas
- ✅ Personalização de perfil
- ✅ Boosters temporários
- ✅ Badges especiais

### Não Pode
- ❌ Transferir gems para outro usuário
- ❌ Vender gems
- ❌ Trocar gems por tokens
- ❌ Retirar gems da plataforma

## Implementação Técnica

### No Banco de Dados
- Gems são armazenadas apenas no `wallet_address` do usuário
- Não há tabela de transferências entre usuários
- Todas as transações são unidirecionais (sistema → usuário ou usuário → sistema)

### Na API
- Não existe endpoint de transferência entre usuários
- Apenas endpoints de:
  - `POST /api/user/:wallet/gems/add` - Sistema adiciona gems
  - `POST /api/user/:wallet/gems/spend` - Usuário gasta gems em features

## Exemplo de Uso

```sql
-- ✅ CORRETO: Usuário ganha gems por completar quest
UPDATE miao_users SET current_gems = current_gems + 200 WHERE wallet_address = ?;

-- ✅ CORRETO: Usuário gasta gems para desbloquear feature
UPDATE miao_users SET current_gems = current_gems - 500 WHERE wallet_address = ?;

-- ❌ INCORRETO: Transferir gems entre usuários (NÃO EXISTE)
-- Não há suporte para isso no schema
```

## Nota Legal

As Gems são **pontos virtuais de gamificação** sem valor monetário real. Elas não podem ser convertidas, transferidas ou negociadas fora da plataforma MIAO Tools.

