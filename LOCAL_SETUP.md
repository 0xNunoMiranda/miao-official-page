# 🚀 Guia de Inicialização Local

## Início Rápido

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=seu_usuario
DATABASE_PASSWORD=sua_senha
DATABASE_NAME=miao_tools

# JWT
JWT_SECRET=chave-secreta-jwt-mude-em-producao

# Solana (opcional)
SOLANA_RPC_URL=https://api.mainnet.solana.com

# OpenAI (para geração de imagens)
OPENAI_API_KEY=sua_chave_openai

# Porta (opcional)
PORT=3000
```

### 3. Configurar Base de Dados

Execute o script SQL completo:
```bash
# No MySQL/MariaDB, execute:
mysql -u seu_usuario -p miao_tools < database/complete-setup.sql
```

Ou execute manualmente no cliente MySQL:
```sql
-- Conecte-se à base de dados
USE miao_tools;

-- Execute o conteúdo de database/complete-setup.sql
```

### 4. Iniciar o Servidor

**Modo Desenvolvimento (recomendado):**
```bash
npm run dev
```

**Modo Produção (servidor customizado):**
```bash
npm run start
```

O servidor estará disponível em: **http://localhost:3000**

## Verificação

Após iniciar, verifique:
- ✅ Servidor responde em `http://localhost:3000`
- ✅ Base de dados conectada (sem erros no console)
- ✅ Páginas carregam corretamente

## Troubleshooting

### Erro de conexão à base de dados
- Verifique se MySQL/MariaDB está rodando
- Confirme as credenciais em `.env.local`
- Verifique se a base de dados `miao_tools` existe

### Erro de porta em uso
- Mude a porta em `.env.local`: `PORT=3001`
- Ou pare o processo que está usando a porta 3000

### Erro de módulos não encontrados
- Execute `npm install` novamente
- Verifique se está usando Node.js >= 18.0.0

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento Next.js
- `npm run build` - Compila para produção
- `npm run start` - Inicia servidor customizado (app.js)
- `npm run lint` - Executa linter

