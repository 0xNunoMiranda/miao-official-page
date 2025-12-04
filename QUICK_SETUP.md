# ⚡ Setup Rápido - Variáveis de Ambiente

## Criar ficheiro `.env.local`

Na raiz do projeto, cria um ficheiro chamado `.env.local` com o seguinte conteúdo:

```env
# ============================================
# Base de Dados MySQL/MariaDB
# ============================================
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=teu_usuario_mysql
DATABASE_PASSWORD=tu_password_mysql
DATABASE_NAME=miao_tools

# ============================================
# JWT Secret (muda em produção!)
# ============================================
JWT_SECRET=chave-secreta-jwt-mude-em-producao-123456

# ============================================
# Solana RPC (opcional)
# ============================================
SOLANA_RPC_URL=https://api.mainnet.solana.com

# ============================================
# OpenAI (para geração de imagens - opcional)
# ============================================
OPENAI_API_KEY=sk-tua-chave-openai-aqui

# ============================================
# Porta do Servidor (opcional)
# ============================================
PORT=3000
```

## ⚠️ Importante

1. **Substitui os valores:**
   - `teu_usuario_mysql` → teu utilizador MySQL/MariaDB
   - `tu_password_mysql` → tua password MySQL/MariaDB
   - `miao_tools` → nome da base de dados (ou outro se diferente)

2. **O ficheiro `.env.local` não deve ser commitado no Git!**
   - Já deve estar no `.gitignore`
   - Contém informações sensíveis

3. **Depois de criar o ficheiro:**
   - Reinicia o servidor (`npm run dev`)
   - As variáveis são carregadas automaticamente

## ✅ Verificar se está a funcionar

Depois de configurar, testa:
1. Conecta a wallet
2. Verifica os logs do servidor
3. Deve aparecer `[DB] Executing stored procedure: sp_user_get_or_create`

Se aparecer erro de conexão, verifica:
- MySQL/MariaDB está a correr?
- As credenciais estão corretas?
- A base de dados `miao_tools` existe?

