# MIAO Tools - Setup Database MySQL

## Acesso à Base de Dados

```
HOST: 62.193.192.12
USER: miaotoke_miranda
PASSWORD: _Miranda69_!
DATABASE: miaotoke_website
PORT: 3306
```

## Passo 1: Conectar à Base de Dados

### Via MySQL CLI:
```bash
mysql -h 62.193.192.12 -u miaotoke_miranda -p_Miranda69_! -D miaotoke_website
```

### Via MySQL Workbench:
1. New Connection
2. Hostname: `62.193.192.12`
3. Port: `3306`
4. Username: `miaotoke_miranda`
5. Password: `_Miranda69_!`
6. Default Schema: `miaotoke_website`

### Via DBeaver:
1. New Database Connection → MySQL
2. Host: `62.193.192.12`
3. Port: `3306`
4. Database: `miaotoke_website`
5. Username: `miaotoke_miranda`
6. Password: `_Miranda69_!`

## Passo 2: Executar o Script SQL

O script completo está em: `/database/stored-procedures.sql`

### Opção 1: Via MySQL CLI
```bash
mysql -h 62.193.192.12 -u miaotoke_miranda -p_Miranda69_! -D miaotoke_website < database/stored-procedures.sql
```

### Opção 2: Via phpmyadmin/cPanel
1. Aceder ao cPanel
2. phpmyadmin
3. Selecionar database `miaotoke_website`
4. Clicar em "Import"
5. Selecionar o arquivo `stored-procedures.sql`
6. Clicar em "Go"

### Opção 3: Via MySQL Workbench/DBeaver
1. Abrir o arquivo `database/stored-procedures.sql`
2. Executar o script completo

## Passo 3: Verificar Instalação

### Verificar Tabelas:
```sql
USE miao_db;
SHOW TABLES;
```

Deve aparecer:
- miao_users
- miao_gems_history
- miao_quests
- miao_user_quests
- miao_memes
- miao_user_activities
- miao_user_features

### Verificar Stored Procedures:
```sql
SHOW PROCEDURES;
```

Deve aparecer todos os `sp_*` procedures.

## Passo 4: Testar Conexão Node.js

```bash
npm install mysql2
```

A função de conexão está em `/lib/db.ts` e foi criada com `mysql2/promise`.

### Testar:
```bash
node -e "require('./lib/db').default.getConnection().then(() => console.log('✅ Connected')).catch(e => console.log('❌ Error:', e.message))"
```

## Passo 5: Iniciar Dados de Quests

### Inserir Quests Padrão:
```sql
-- Quests Diárias
INSERT INTO miao_quests (quest_key, title, description, reward_gems, quest_type, verification_type, target_value) VALUES
('daily_meme_creation', 'Criar 1 Meme', 'Use o Meme Studio para criar um meme incrível!', 10, 'daily', 'meme_creation', 1),
('daily_meme_share', 'Partilhar 1 Meme', 'Partilhe um meme no Twitter ou Telegram!', 15, 'daily', 'activity_based', 1),
('daily_meme_likes', 'Curtir 3 Memes', 'Mostre amor à comunidade curtindo memes!', 5, 'daily', 'activity_based', 3),
('daily_retweet_pinned', 'Retweet Post Fixado', 'Retweete o post fixado do @MIAO no Twitter!', 20, 'daily', 'twitter_api', 1),
('daily_dashboard_visit', 'Visitar Dashboard', 'Acesse o MIAO Tools Dashboard!', 5, 'daily', 'activity_based', 1);

-- Quests Semanais
INSERT INTO miao_quests (quest_key, title, description, reward_gems, quest_type, verification_type, target_value) VALUES
('weekly_meme_creation_10', 'Criar 10 Memes', 'Crie 10 memes incríveis esta semana!', 150, 'weekly', 'meme_creation', 10),
('weekly_meme_shares_5', 'Partilhar 5 Memes', 'Partilhe 5 memes nas redes sociais!', 100, 'weekly', 'activity_based', 5);

-- Quests One-Time
INSERT INTO miao_quests (quest_key, title, description, reward_gems, quest_type, verification_type, target_value) VALUES
('onetime_first_meme', 'Criar Primeiro Meme', 'Crie seu primeiro meme e entre no Miao Army!', 50, 'one_time', 'meme_creation', 1),
('onetime_first_share', 'Primeira Partilha', 'Partilhe seu primeiro meme com o mundo!', 100, 'one_time', 'activity_based', 1),
('onetime_wallet_connect', 'Conectar Carteira', 'Conecte sua carteira ao MIAO Tools!', 25, 'one_time', 'activity_based', 1);
```

## Arquitetura

### Fluxo de Requisição:

```
Frontend (ToolsPage.tsx)
    ↓
API Route (/api/*)
    ↓
MySQL Connection Pool (/lib/db.ts)
    ↓
Stored Procedure (MySQL)
    ↓
Database (MyISAM/InnoDB)
    ↓
Response JSON
```

### Arquivo Helper:

O arquivo `/lib/miao-api.ts` contém todas as funções de chamada à API:

```typescript
// Exemplo de uso no ToolsPage.tsx:
import { createOrGetUser, getUser, getUserStats, addGems, claimQuestReward } from '@/lib/miao-api'

// Criar usuário quando conecta carteira
await createOrGetUser(walletAddress)

// Obter stats
const stats = await getUserStats(walletAddress)

// Adicionar gems por quest
await addGems(walletAddress, 100, 'Quest Completed')

// Reclamar recompensa
await claimQuestReward(walletAddress, questId)
```

## Troubleshooting

### Erro: "Can't connect to MySQL server"
- Verificar credenciais
- Verificar IP/firewall
- Verificar se MySQL está rodando

### Erro: "Procedure not found"
- Verificar se os stored procedures foram criados
- Executar `SHOW PROCEDURES;`
- Re-executar o script de instalação

### Erro: "SQLSTATE[HY000]: General error: 1030"
- Pode ser problema de espaço em disco
- Verificar espaço disponível na BD

### Performance lenta
- Adicionar índices conforme necessário
- Otimizar queries
- Considerar caching com Redis

## Próximos Passos

1. ✅ Criar Stored Procedures
2. ✅ Criar API Endpoints
3. ✅ Criar Helper Functions
4. 🔄 Integrar no ToolsPage.tsx
5. 🔄 Implementar Twitter API Integration
6. 🔄 Implementar Discord API Integration
7. 🔄 Implementar Sistema de Referrals
8. 🔄 Adicionar Caching (Redis)
9. 🔄 Testes Completos
10. 🔄 Deploy em Produção

---

**Data de Setup**: 2025-12-04
**Versão**: 1.0
**Última Atualização**: 2025-12-04
