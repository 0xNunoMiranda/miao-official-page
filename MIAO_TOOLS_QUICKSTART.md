# 🎮 QUICK START - MIAO TOOLS

## Para Usar AGORA

### 1. Importar no App.tsx

```typescript
import ToolsPageNew from '@/components/ToolsPageNew'

// No seu componente principal
<ToolsPageNew 
  onBack={() => setPage('home')}
  walletState={yourWalletState}
/>
```

### 2. Acessar Painel Admin

Dentro da página de Tools, clique na aba **"Admin"** (canto superior direito).

**Login:**
```
Username: admin
Password: miao_admin_2025
```

---

## 📑 Componentes Principais

### Dashboard do Cliente
```tsx
<ClientDashboard walletState={wallet} />
```
- Level e XP
- Gems balance
- Achievements
- Stats do mês
- Quick actions

### Meme Studio
```tsx
<MemeStudio onBack={() => {}} />
```
- Gerador de imagens com IA
- Editor de texto
- Preview em tempo real
- Publish to feed
- Share no Twitter

### Quests
```tsx
<QuestsPage onBack={() => {}} />
```
- Daily/Weekly/One-time missions
- Progress tracking
- Rewards claiming
- Leaderboard

### Social Feed
```tsx
<MemesFeed onBack={() => {}} />
```
- Discover memes
- Filter by category
- Like/comment/share
- Trending ranking

### Admin Panel
```tsx
<AdminPanel />
```
- Dashboard analytics
- User management
- Gems auditing
- Quest creation
- Meme moderation

---

## 🎨 Customização

### Mudar Cores Principais

Em qualquer componente:
```tsx
// Substitua a cor primária
className="bg-green-600"    // Verde (padrão)
className="bg-blue-600"     // Azul
className="bg-purple-600"   // Roxo
```

### Adicionar Novos Tabs

Em `ToolsPageNew.tsx`:
```tsx
const [activeTab, setActiveTab] = useState<string>("dashboard")

// Adicionar novo case
case "new_feature":
  return <NewFeatureComponent onBack={() => setActiveTab("dashboard")} />

// Adicionar botão
<TabButton
  icon={<Icon size={20} />}
  label="New Feature"
  active={activeTab === "new_feature"}
  onClick={() => setActiveTab("new_feature" as any)}
/>
```

### Modificar Admin Credentials

Em `lib/admin-auth.ts`:
```tsx
const ADMIN_USERNAME = "seu_user"
const ADMIN_PASSWORD = "sua_senha"
```

---

## 🔄 Integração com APIs

### Substituir dados mockados

**Antes (mockado):**
```tsx
const [users, setUsers] = useState<User[]>([
  { id: "1", username: "User1", ... },
])
```

**Depois (com API):**
```tsx
useEffect(() => {
  fetchUsers().then(setUsers)
}, [])

async function fetchUsers() {
  const res = await fetch('/api/admin/users')
  return res.json()
}
```

### Exemplo de Integração

```tsx
// Em AdminUsersPage.tsx
useEffect(() => {
  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }
  loadUsers()
}, [])
```

---

## 🎯 Funcionalidades por Usuário

### Cliente/Jogador
1. ✅ Ver dashboard com seus stats
2. ✅ Criar memes no studio
3. ✅ Completar quests
4. ✅ Explorar feed de memes
5. ✅ Ganhar gems e level up
6. ✅ Desbloquear achievements

### Admin
1. ✅ Ver analytics do sistema
2. ✅ Gerenciar usuários (ban/delete)
3. ✅ Auditar transações de gems
4. ✅ Criar/editar quests
5. ✅ Moderar memes (flagged/remove)
6. ✅ Monitorar saúde do sistema

---

## 📊 Mock Data

Todos os dados estão em `useState()` dentro dos componentes. Para usar dados reais:

1. Remover `useState`
2. Adicionar `useEffect`
3. Fazer fetch da API
4. Popular com dados reais

### Exemplo:
```tsx
// Mock
const [quests, setQuests] = useState<Quest[]>([...])

// Real
const [quests, setQuests] = useState<Quest[]>([])

useEffect(() => {
  fetchQuests().then(setQuests)
}, [])
```

---

## 🐛 Debugging

### Browser DevTools
```
1. F12 para abrir
2. Console para verificar erros
3. Network para ver API calls
4. Inspect Element para ver DOM
```

### Logs úteis
```tsx
console.log('Active tab:', activeTab)
console.log('User stats:', stats)
console.log('Quests loaded:', quests)
console.log('Admin authenticated:', isAdminAuthenticated())
```

---

## 📱 Responsividade

Todos os componentes já são responsivos:
- Mobile (< 640px): Stack vertical
- Tablet (640-1024px): 2 colunas
- Desktop (>1024px): 3+ colunas

---

## 🔐 Segurança

### Admin
- ⚠️ Credentials no localStorage (MUDAR em produção)
- ⚠️ Usar JWT tokens no backend
- ⚠️ Validar permissions server-side
- ⚠️ Rate limiting nas APIs

### Frontend
- ✅ Type safety com TypeScript
- ✅ Input validation
- ✅ Error boundaries
- ✅ CORS headers

---

## 🚀 Deployment

### 1. Build
```bash
npm run build
```

### 2. Deploy no Vercel
```bash
git push origin main
```

### 3. Verificar
- Visit app URL
- Connect wallet
- Access /tools
- Try admin panel

---

## 📞 Troubleshooting

**"Componente não carrega"**
→ Checar imports em ToolsPageNew.tsx

**"Admin login não funciona"**
→ Verificar credenciais em admin-auth.ts

**"Dados não aparecem"**
→ Verificar console para erros
→ Checar useState inicialização

**"Estilos estranhos"**
→ Limpar node_modules: `rm -rf node_modules && npm install`
→ Rebuildar Tailwind

---

## ✅ Checklist de Uso

- [ ] Importar ToolsPageNew no App
- [ ] Testar navegação entre tabs
- [ ] Logar no admin (admin/miao_admin_2025)
- [ ] Explorar cada página
- [ ] Testar responsividade (F12)
- [ ] Verificar dark mode
- [ ] Testar interactions (buttons, forms)
- [ ] Conectar com API real quando pronto

---

**Status:** ✅ Ready to Use

**Versão:** 1.0.0

**Data:** Dezembro 2024
