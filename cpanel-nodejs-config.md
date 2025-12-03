# Configuração cPanel para Node.js

## Problema: cPanel detectando Python em vez de Node.js

Se você está recebendo o erro:
```
No such application or it's broken. Unable to find app venv folder by this path
```

Isso significa que o cPanel está tentando usar Python em vez de Node.js.

## Solução

### 1. No cPanel, vá para "Node.js Selector"

1. Acesse o cPanel
2. Procure por **"Node.js Selector"** ou **"Setup Node.js App"**
3. Se já existe uma aplicação configurada, **delete-a**
4. Crie uma nova aplicação Node.js:
   - **Node.js version**: 18.x ou superior
   - **Application root**: `/home/miaotoke/apps/miao-official-page`
   - **Application URL**: Seu domínio
   - **Application startup file**: `server.js` ou deixe vazio (Next.js usa `next start`)
   - **Passenger log file**: `/home/miaotoke/apps/miao-official-page/logs/passenger.log`

### 2. Criar arquivo `server.js` (opcional, se necessário)

Se o cPanel precisar de um arquivo de entrada, crie `server.js` na raiz:

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

### 3. Verificar arquivos de configuração

Certifique-se de que existem:
- ✅ `package.json` (com `engines` especificando Node.js)
- ✅ `.node-version` ou `.nvmrc` (versão do Node.js)
- ✅ `.htaccess` (desabilitando Python)
- ✅ `cpanel.yml` (configurado para Node.js)

### 4. Variáveis de Ambiente

No cPanel Node.js Selector, configure as variáveis de ambiente:
- `NODE_ENV=production`
- `PORT=3000` (ou a porta que o cPanel atribuir)
- `TELEGRAM_BOT_TOKEN` (se necessário)
- `TELEGRAM_CHAT_ID` (se necessário)

### 5. Após deploy

1. No cPanel Node.js Selector, clique em **"Restart App"**
2. Verifique os logs em caso de erro
3. Acesse seu domínio para testar

## Estrutura de Pastas Esperada

```
/home/miaotoke/apps/miao-official-page/
├── .next/              # Build do Next.js
├── public/             # Arquivos estáticos
├── app/                # App Router do Next.js
├── components/         # Componentes React
├── lib/                # Utilitários
├── package.json        # Dependências Node.js
├── server.js           # (Opcional) Entry point
└── node_modules/       # Dependências instaladas
```

## Troubleshooting

### Se ainda detectar Python:

1. **Verifique se há arquivos Python no projeto:**
   ```bash
   find . -name "*.py" -o -name "requirements.txt"
   ```
   Se encontrar, remova-os ou adicione ao `.gitignore`

2. **No cPanel, desabilite Python para este diretório:**
   - Vá em "Python Selector" ou "Setup Python App"
   - Remova qualquer aplicação Python deste diretório

3. **Force Node.js no `.htaccess`:**
   ```apache
   # Forçar Passenger para Node.js
   PassengerNodejs /opt/cpanel/ea-nodejs18/bin/node
   ```

4. **Verifique permissões:**
   ```bash
   chmod 755 /home/miaotoke/apps/miao-official-page
   chmod 644 /home/miaotoke/apps/miao-official-page/package.json
   ```

## Notas Importantes

- ✅ Este é um projeto **Node.js/Next.js**, não Python
- ✅ Não deve haver arquivos `requirements.txt` ou `.py`
- ✅ O cPanel deve usar **Node.js Selector**, não Python Selector
- ✅ O `.cpanel.yml` está configurado para Node.js

