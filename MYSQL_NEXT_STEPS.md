# 🎯 MIAO Tools - MySQL Setup Completo

## ✅ O que foi feito hoje (2025-12-04):

### 1. **Estrutura Completa de MySQL + Stored Procedures**
   - ✅ Arquivo de conexão: `/lib/db.ts`
   - ✅ SQL com todas as tabelas e SPs: `/database/stored-procedures.sql`
   - ✅ 13 Stored Procedures principais
   - ✅ 12 API Endpoints
   - ✅ Helper functions: `/lib/miao-api.ts`
   - ✅ Configuração: `.env.local`
   - ✅ Documentação completa

### 2. **Credenciais Configuradas**
```
HOST: 62.193.192.12
USER: miaotoke_miranda
PASSWORD: _Miranda69_!
DATABASE: miao_db
PORT: 3306
```

---

## 🚀 Próximos Passos Imediatos:

### 1️⃣ Executar Script SQL na Base de Dados

**Via Terminal (Recomendado):**
```bash
mysql -h 62.193.192.12 -u miaotoke_miranda -p_Miranda69_! -D miaotoke_website < database/stored-procedures.sql
```

**Via Interface Web (cPanel/phpmyadmin):**
1. Login em cPanel
2. Aceder a phpmyadmin
3. Selecionar database `miao_db`
4. Clicar em "Import"
5. Selecionar arquivo `/database/stored-procedures.sql`
6. Clicar em "Go"

### 2️⃣ Instalar Dependência MySQL

```bash
npm install
```

Já foi adicionada ao `package.json`.

### 3️⃣ Testar Conexão

```bash
npm run dev
```

Verificar se não há erros de conexão MySQL nos logs.

---

## 📁 Arquivos Criados/Modificados:

```
✅ .env.local                              - Credenciais MySQL
✅ package.json                            - Adicionada dependência mysql2
✅ lib/db.ts                               - Conexão e pool MySQL
✅ lib/miao-api.ts                         - Helper functions para API
✅ database/stored-procedures.sql          - Todas as SPs e tabelas
✅ app/api/user/[wallet]/route.ts          - API user
✅ app/api/user/[wallet]/stats/route.ts    - API stats
✅ app/api/user/[wallet]/gems/route.ts     - API gems
✅ app/api/user/[wallet]/gems/history/route.ts - API gems history
✅ app/api/quests/route.ts                 - API quests
✅ app/api/user/[wallet]/quests/route.ts   - API user quests
✅ app/api/user/[wallet]/quests/[questId]/claim/route.ts - API claim quest
✅ app/api/memes/route.ts                  - API memes
✅ app/api/memes/[memeId]/publish/route.ts - API publish meme
✅ app/api/memes/[memeId]/like/route.ts    - API like meme
✅ app/api/feed/route.ts                   - API feed
✅ app/api/user/[wallet]/activities/route.ts - API activities
✅ DATABASE_SETUP.md                       - Guia de setup
✅ MYSQL_ARCHITECTURE.md                   - Documentação da arquitetura
```

---

## 🔧 Estrutura de Dados:

### Tabelas:
- `miao_users` - Dados dos usuários
- `miao_gems_history` - Histórico de gems
- `miao_quests` - Definição das quests
- `miao_user_quests` - Progresso nas quests
- `miao_memes` - Memes criados
- `miao_user_activities` - Atividades
- `miao_user_features` - Features premium

### Stored Procedures (13):
- `sp_user_create_or_update()` ↔️ Gerenciar usuários
- `sp_gems_add()` ↔️ Adicionar gems com auditoria
- `sp_gems_spend()` ↔️ Gastar gems com verificação
- `sp_quests_get_available()` ↔️ Listar quests
- `sp_user_quest_claim()` ↔️ Reclamar recompensa
- `sp_meme_create()` ↔️ Criar meme
- `sp_meme_publish()` ↔️ Publicar meme
- ... e mais 6

### API Endpoints (12):
```
GET/POST  /api/user/[wallet]
GET       /api/user/[wallet]/stats
GET/POST  /api/user/[wallet]/gems
GET       /api/user/[wallet]/gems/history
GET       /api/quests
GET/POST  /api/user/[wallet]/quests
POST      /api/user/[wallet]/quests/[questId]/claim
GET/POST  /api/memes
POST      /api/memes/[memeId]/publish
POST      /api/memes/[memeId]/like
GET       /api/feed
GET       /api/user/[wallet]/activities
```

---

## 💡 Como Usar no ToolsPage.tsx:

### Exemplo 1: Obter Stats do Usuário
```typescript
import { getUserStats, claimQuestReward } from '@/lib/miao-api'

// No ToolsPage.tsx
const stats = await getUserStats(walletState.address)
setPoints(stats.current_gems)
```

### Exemplo 2: Reclamar Recompensa de Quest
```typescript
const result = await claimQuestReward(walletState.address, questId)
if (result.success) {
  setPoints(prev => prev + result.data.gems_earned)
  alert(`+${result.data.gems_earned} Gems!`)
}
```

### Exemplo 3: Criar e Publicar Meme
```typescript
import { createMeme, publishMeme } from '@/lib/miao-api'

// Criar
const memeResult = await createMeme(
  walletState.address,
  prompt,
  imageUrl,
  topText,
  bottomText
)

// Publicar
const publishResult = await publishMeme(
  memeResult.data.meme_id,
  walletState.address
)
```

---

## ⚠️ Importante:

### NÃO fazer:
- ❌ Modificar SPs diretamente (fazer backup primeira)
- ❌ Deletar tabelas de produção
- ❌ Expor credenciais em código público
- ❌ Fazer queries diretas sem usar SPs

### Fazer:
- ✅ Usar SPs para toda a lógica de negócio
- ✅ Manter histórico de alterações no Git
- ✅ Testar em ambiente de desenvolvimento
- ✅ Fazer backup regularmente

---

## 📞 Troubleshooting:

**Erro: "Can't connect to MySQL server"**
```
→ Verificar credenciais em .env.local
→ Verificar se 62.193.192.12:3306 está acessível
→ Verificar firewall
```

**Erro: "Procedure not found"**
```
→ Executar o script SQL completo
→ Verificar com: SHOW PROCEDURES;
```

**Erro: "Out of memory"**
```
→ Otimizar queries
→ Adicionar índices
→ Considerar caching (Redis)
```

---

## 📊 Status do Projeto:

```
BACKEND:
  ✅ MySQL Setup
  ✅ Stored Procedures
  ✅ API Endpoints
  ✅ Helper Functions
  ⏳ Integração no Frontend
  ⏳ Twitter API Integration
  ⏳ Discord API Integration

FRONTEND:
  ✅ ToolsPage UI/UX
  ⏳ Conectar com APIs
  ⏳ Loading States
  ⏳ Error Handling

DADOS:
  ⏳ Popular Quests Iniciais
  ⏳ Configurar Ranks/Hierarchies
  ⏳ Configurar Features Premium
```

---

**Próxima Reunião**: Integração no ToolsPage.tsx
**Status**: 🟢 Pronto para Database Setup
**Data**: 2025-12-04
