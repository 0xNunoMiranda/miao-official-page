// server.js para cPanel - Next.js
// Este arquivo é usado pelo cPanel Node.js Selector para iniciar a aplicação
// Usa CommonJS mesmo com "type": "module" no package.json
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')
const path = require('path')

const hostname = process.env.HOSTNAME || '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

// Função para garantir que sempre retornamos o mesmo content type
function setStandardHeaders(res) {
  res.setHeader('Content-Type', 'text/html; charset=UTF-8')
  res.setHeader('X-Content-Type-Options', 'nosniff')
}

// Verificar se o build existe
const buildIdPath = path.join(process.cwd(), '.next', 'BUILD_ID')
const hasBuild = fs.existsSync(buildIdPath)

// HTML de manutenção padrão
const maintenanceHTML = `<!DOCTYPE html>
<html>
<head>
  <title>Application Building</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <h1>Application Building</h1>
  <p>Application is being built. Please wait for the build to complete.</p>
  <p>If you are the administrator, run "npm run build" to build the application.</p>
</body>
</html>`

// Criar servidor que sempre responde com o mesmo formato
const server = createServer(async (req, res) => {
  try {
    setStandardHeaders(res)
    
    // Se não há build ou handle não está pronto, sempre retornar página de manutenção
    if (!hasBuild || !handle) {
      res.statusCode = 200
      res.end(maintenanceHTML)
      return
    }

    // Se há build e handle está pronto, tentar usar Next.js
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  } catch (err) {
    console.error('Server error:', err)
    setStandardHeaders(res)
    res.statusCode = 500
    res.end('internal server error')
  }
})

// Inicializar Next.js apenas se houver build
let handle = null
if (hasBuild) {
  console.log('Starting Next.js production server...')
  try {
    const buildId = fs.readFileSync(buildIdPath, 'utf8').trim()
    console.log('Build ID found:', buildId)
  } catch (err) {
    console.warn('Could not read BUILD_ID:', err.message)
  }

  const dev = false
  const app = next({ dev, hostname, port })
  handle = app.getRequestHandler()

  app.prepare()
    .then(() => {
      console.log('Next.js app prepared successfully')
    })
    .catch((err) => {
      console.error('Failed to prepare Next.js app:', err)
      // Não fazer exit, deixar servidor de manutenção rodar
      handle = null
    })
} else {
  console.warn('WARNING: Production build not found!')
  console.warn('Starting maintenance server. Run "npm run build" to build the application.')
  console.warn('Build ID file not found at:', buildIdPath)
}

// Iniciar servidor
server.listen(port, hostname, (err) => {
  if (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
  if (hasBuild && handle) {
    console.log(`> Next.js server ready on http://${hostname}:${port}`)
  } else {
    console.log(`> Maintenance server running on http://${hostname}:${port}`)
    console.log(`> Waiting for build to complete...`)
  }
})

// Tratamento de erros não capturados
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
  // Não fazer exit para manter servidor rodando
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason)
  // Não fazer exit para manter servidor rodando
})

