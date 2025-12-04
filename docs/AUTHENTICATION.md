# 🔐 Sistema de Autenticação MIAO Tools

## Visão Geral

O MIAO Tools utiliza um sistema de **dupla autenticação**:
- **Clientes**: Apenas wallet Web3 (MetaMask, WalletConnect, etc.)
- **Admins**: Wallet Web3 + Credenciais (username/password) armazenadas na BD

---

## 📊 Estrutura da Base de Dados

### Tabela: `miao_admins`

```sql
CREATE TABLE miao_admins (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,  -- SHA256
  email VARCHAR(100),
  status ENUM('active', 'inactive', 'suspended'),
  permissions JSON,
  created_at TIMESTAMP,
  last_login TIMESTAMP,
  created_by INT
);
```

### Stored Procedures

| Procedure | Descrição |
|-----------|-----------|
| `sp_admin_verify_credentials(username, password_hash)` | Valida credenciais de admin |
| `sp_admin_check_wallet(wallet_address)` | Verifica se wallet é admin |
| `sp_admin_create(wallet, username, password_hash, email, created_by)` | Cria novo admin |
| `sp_admin_list_all()` | Lista todos admins |
| `sp_admin_update_last_login(admin_id)` | Atualiza último login |

---

## 🔑 Fluxo de Autenticação

### 1️⃣ Cliente (User)

```typescript
// 1. Conectar wallet
const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = accounts[0]

// 2. Assinar mensagem
const message = `MIAO Login: ${Date.now()}`
const signature = await window.ethereum.request({
  method: 'personal_sign',
  params: [message, wallet]
})

// 3. Obter token JWT
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ wallet, signature, message })
})

const { token, isAdmin } = await response.json()

// 4. Usar token nas requisições
const userData = await fetch(`/api/user/${wallet}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### 2️⃣ Admin

```typescript
// 1-3: Mesmo processo de wallet do cliente

// 4. Adicionar credenciais admin
const adminData = await fetch('/api/admin/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Admin-Username': 'admin',
    'X-Admin-Password': 'miao2024'
  }
})
```

---

## 🛡️ Endpoints Protegidos

### Endpoints Admin (Requerem Wallet + Credenciais)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/admin/users` | GET, POST | Gestão de utilizadores |
| `/api/admin/gems` | GET, POST | Gestão de gems |
| `/api/admin/quests` | GET, POST | Gestão de quests |
| `/api/admin/memes` | GET, POST | Moderação de memes |
| `/api/admin/stats` | GET | Dashboard stats |
| `/api/admin/manage/admins` | GET, POST | Gestão de admins |

### Endpoints Cliente (Requerem Apenas Wallet)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/user/[wallet]` | GET, POST | Perfil do utilizador |
| `/api/user/[wallet]/stats` | GET | Estatísticas |
| `/api/user/[wallet]/gems` | GET, POST | Gestão de gems |
| `/api/user/[wallet]/quests` | GET, POST | Quests do utilizador |

---

## 🔧 Configuração

### 1. Executar SQL de criação

```bash
mysql -h 62.193.192.12 -u miaotoke_miranda -p_Miranda69_! -D miaotoke_website < database/admin-auth.sql
```

### 2. Verificar admin padrão

**Credenciais padrão:**
- Username: `admin`
- Password: `miao2024`
- Wallet: `0x0000000000000000000000000000000000000000`

### 3. Adicionar novo admin

**Linux/Mac:**
```bash
chmod +x database/add-admin.sh
./database/add-admin.sh 0x742d35Cc... nunoAdmin myPass123 nuno@miao.com
```

**Windows:**
```cmd
database\add-admin.bat 0x742d35Cc... nunoAdmin myPass123 nuno@miao.com
```

**Via API:**
```bash
curl -X POST http://localhost:3000/api/admin/manage/admins \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Admin-Username: admin" \
  -H "X-Admin-Password: miao2024" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7FA9946aF4",
    "username": "nunoAdmin",
    "password": "myPass123",
    "email": "nuno@miao.com"
  }'
```

---

## 🔐 Segurança

### Passwords

- ✅ Armazenadas com **SHA256 hash**
- ✅ Nunca enviadas em plain text
- ✅ Validadas contra hash na BD

### Tokens JWT

- ✅ Expiram em **24 horas**
- ✅ Incluem timestamp de criação
- ✅ Assinados com JWT_SECRET

### Proteções

- ✅ **Ownership verification**: Users só acedem aos seus dados
- ✅ **Admin verification**: Dupla validação (wallet + credenciais)
- ✅ **Status check**: Admins inativos não podem fazer login
- ✅ **Last login tracking**: Auditoria de acessos

---

## 📝 Variáveis de Ambiente

Criar `.env.local`:

```env
# JWT Secret (mudar em produção!)
JWT_SECRET=miao-secret-key-change-in-production

# Database
DB_HOST=62.193.192.12
DB_USER=miaotoke_miranda
DB_PASSWORD=_Miranda69_!
DB_NAME=miaotoke_website
```

---

## 🧪 Testes

### Testar login cliente
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7FA9946aF4",
    "signature": "0x...",
    "message": "MIAO Login: 1733299200000"
  }'
```

### Testar endpoint protegido
```bash
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Admin-Username: admin" \
  -H "X-Admin-Password: miao2024"
```

---

## 🚨 Troubleshooting

### Erro: "Wallet authentication required"
- ✅ Verificar se o header `Authorization: Bearer TOKEN` está presente
- ✅ Token pode ter expirado (válido por 24h)

### Erro: "Admin wallet required"
- ✅ Wallet não está na tabela `miao_admins`
- ✅ Status do admin não é 'active'

### Erro: "Invalid admin credentials"
- ✅ Username ou password incorretos
- ✅ Verificar hash SHA256 na BD

### Erro: "Unauthorized to access this wallet data"
- ✅ User está tentando acessar dados de outra wallet
- ✅ Token não corresponde ao parâmetro [wallet] da rota

---

## 📚 Referências

- Middleware: `lib/auth.ts`
- Endpoint Login: `app/api/auth/login/route.ts`
- SQL Scripts: `database/admin-auth.sql`
- Admin Management: `app/api/admin/manage/admins/route.ts`
