# 🗄️ MIAO Tools - Arquitetura MySQL + Stored Procedures

## 📋 O que foi criado:

### 1. **Arquivo de Conexão** (`/lib/db.ts`)
- ✅ Pool de conexões MySQL com `mysql2/promise`
- ✅ Função `query()` para queries genéricas
- ✅ Função `execute()` para chamar Stored Procedures
- ✅ Tratamento de erros e conexões

### 2. **Stored Procedures Completos** (`/database/stored-procedures.sql`)

#### Tabelas Criadas:
- `miao_users` - Usuários e dados gerais
- `miao_gems_history` - Histórico de gems
- `miao_quests` - Definição das quests
- `miao_user_quests` - Progresso do usuário nas quests
- `miao_memes` - Memes criados
- `miao_user_activities` - Histórico de atividades
- `miao_user_features` - Features premium do usuário

#### Stored Procedures Criados:

**User Management:**
- `sp_user_create_or_update()` - Criar/atualizar usuário
- `sp_user_get()` - Obter dados do usuário
- `sp_user_get_stats()` - Obter estatísticas completas

**Gems Management:**
- `sp_gems_add()` - Adicionar gems com auditoria
- `sp_gems_spend()` - Gastar gems com verificação
- `sp_gems_history()` - Obter histórico de gems

**Quests Management:**
- `sp_quests_get_available()` - Listar quests disponíveis
- `sp_user_quests_get()` - Obter quests do usuário
- `sp_user_quests_initialize()` - Inicializar quests diárias/semanais
- `sp_user_quest_update_progress()` - Atualizar progresso
- `sp_user_quest_claim()` - Reclamar recompensa da quest

**Memes Management:**
- `sp_meme_create()` - Criar novo meme
- `sp_meme_publish()` - Publicar meme no feed
- `sp_memes_get_by_wallet()` - Listar memes do usuário
- `sp_memes_get_feed()` - Obter feed comunitário
- `sp_meme_like()` - Curtir meme

**Activities:**
- `sp_user_activities_get()` - Obter atividades recentes

### 3. **API Endpoints** (Next.js Route Handlers)

```
/api/user/[wallet]                          - GET/POST (criar/obter usuário)
/api/user/[wallet]/stats                    - GET (estatísticas)
/api/user/[wallet]/gems                     - GET/POST (obter/adicionar gems)
/api/user/[wallet]/gems/history             - GET (histórico de gems)
/api/quests                                 - GET (listar quests)
/api/user/[wallet]/quests                   - GET/POST (obter/inicializar)
/api/user/[wallet]/quests/[questId]/claim   - POST (reclamar recompensa)
/api/memes                                  - GET/POST (listar/criar memes)
/api/memes/[memeId]/publish                 - POST (publicar meme)
/api/memes/[memeId]/like                    - POST (curtir meme)
/api/feed                                   - GET (feed comunitário)
/api/user/[wallet]/activities               - GET (atividades recentes)
```

### 4. **Helper Functions** (`/lib/miao-api.ts`)

Funções TypeScript para facilitar chamadas à API:
- `createOrGetUser()`
- `getUser()`
- `getUserStats()`
- `getGems()`
- `addGems()`
- `getGemsHistory()`
- `getAvailableQuests()`
- `getUserQuests()`
- `initializeQuests()`
- `claimQuestReward()`
- `createMeme()`
- `getUserMemes()`
- `publishMeme()`
- `getMemesFeed()`
- `likeMeme()`
- `getUserActivities()`

### 5. **Configuração** (`.env.local`)

```env
DATABASE_HOST=62.193.192.12
DATABASE_USER=miaotoke_miranda
DATABASE_PASSWORD=_Miranda69_!
DATABASE_NAME=miao_db
DATABASE_PORT=3306
OPENAI_API_KEY=...
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### 6. **Documentação** (`DATABASE_SETUP.md`)

- Instruções de conexão à BD
- Como executar o script SQL
- Como verificar instalação
- Exemplos de uso
- Troubleshooting

---

## 🚀 Próximos Passos:

### 1. **Executar Script SQL na BD**
```bash
mysql -h 62.193.192.12 -u miaotoke_miranda -p_Miranda69_! -D miao_db < database/stored-procedures.sql
```

### 2. **Instalar Dependência**
```bash
npm install mysql2
```

### 3. **Integrar no ToolsPage.tsx**
- Usar funções de `/lib/miao-api.ts` para chamar APIs
- Conectar Dashboard, Meme Studio e Quests à BD
- Implementar loading states e error handling

### 4. **Testar Endpoints**
```bash
# Criar usuário
curl -X POST http://localhost:3000/api/user \
  -H "Content-Type: application/json" \
  -d '{"wallet_address":"0x123..."}'

# Obter gems
curl http://localhost:3000/api/user/0x123.../gems

# Adicionar gems
curl -X POST http://localhost:3000/api/user/0x123.../gems \
  -H "Content-Type: application/json" \
  -d '{"gems_amount":100,"reason":"Test"}'
```

---

## 📊 Arquitetura Visual:

```
┌─────────────────────────────────────────────────────────────┐
│                    MIAO TOOLS FRONTEND                      │
│                    (ToolsPage.tsx)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (import from)
┌─────────────────────────────────────────────────────────────┐
│                   MIAO API HELPER                           │
│                  (lib/miao-api.ts)                          │
│  - getUserStats()                                           │
│  - claimQuestReward()                                       │
│  - createMeme()                                             │
│  - publishMeme()                                            │
│  - likeMeme()                                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (fetch to)
┌─────────────────────────────────────────────────────────────┐
│                   API ENDPOINTS                             │
│                   (app/api/*)                               │
│  - /user/[wallet]                                           │
│  - /quests                                                  │
│  - /memes                                                   │
│  - /feed                                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (calls)
┌─────────────────────────────────────────────────────────────┐
│              DATABASE CONNECTION POOL                       │
│                  (lib/db.ts)                                │
│  - mysql2/promise                                           │
│  - Connection pooling                                       │
│  - Error handling                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (executes)
┌─────────────────────────────────────────────────────────────┐
│            MYSQL STORED PROCEDURES                          │
│        (database/stored-procedures.sql)                     │
│  - sp_user_*                                                │
│  - sp_gems_*                                                │
│  - sp_quests_*                                              │
│  - sp_meme_*                                                │
│  - sp_user_activities_*                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (reads/writes)
┌─────────────────────────────────────────────────────────────┐
│                   MYSQL DATABASE                            │
│              (62.193.192.12:3306)                           │
│            miaotoke_miranda@miao_db                         │
│  - miao_users                                               │
│  - miao_gems_history                                        │
│  - miao_quests                                              │
│  - miao_user_quests                                         │
│  - miao_memes                                               │
│  - miao_user_activities                                     │
│  - miao_user_features                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist:

- ✅ Criar arquivo de conexão MySQL
- ✅ Criar todos os Stored Procedures
- ✅ Criar API endpoints
- ✅ Criar helper functions
- ✅ Criar documentação
- ⏳ Executar script SQL na BD (PRÓXIMO PASSO)
- ⏳ Instalar mysql2
- ⏳ Integrar no ToolsPage.tsx
- ⏳ Testes e debug
- ⏳ Deploy

---

**Criado em**: 2025-12-04
**Status**: ✅ Estrutura Completa - Aguardando Setup da BD
