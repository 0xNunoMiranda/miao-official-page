// server.js para cPanel - Next.js
// Este arquivo é usado pelo cPanel Node.js Selector para iniciar a aplicação
// Usa CommonJS mesmo com "type": "module" no package.json
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')
const path = require('path')

const hostname = process.env.HOSTNAME || '0.0.0.0'
const port = process.env.PORT || 3000

// Verificar se o build existe
const buildIdPath = path.join(process.cwd(), '.next', 'BUILD_ID')
const hasBuild = fs.existsSync(buildIdPath)

if (!hasBuild) {
  console.warn('WARNING: Production build not found!')
  console.warn('Starting maintenance server. Run "npm run build" to build the application.')
  console.warn('Build ID file not found at:', buildIdPath)
  
  // Servidor de manutenção - permite que o cPanel passe na verificação após npm install
  // Retorna 200 para passar na verificação do cPanel, mas indica que o build precisa ser feito
  createServer((req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Application Building</title>
        <meta charset="UTF-8">
      </head>
      <body>
        <h1>Application Building</h1>
        <p>Application is being built. Please wait for the build to complete.</p>
        <p>If you are the administrator, run "npm run build" to build the application.</p>
      </body>
      </html>
    `)
  }).listen(port, hostname, (err) => {
    if (err) {
      console.error('Failed to start maintenance server:', err)
      process.exit(1)
    }
    console.log(`> Maintenance server running on http://${hostname}:${port}`)
    console.log(`> Waiting for build to complete...`)
  })
} else {
  // Build existe - iniciar servidor Next.js normalmente
  console.log('Starting Next.js production server...')
  console.log('Build ID found:', fs.readFileSync(buildIdPath, 'utf8').trim())

  // Forçar modo production no cPanel
  const dev = false
  const app = next({ dev, hostname, port })
  const handle = app.getRequestHandler()

  app.prepare().then(() => {
    console.log('Next.js app prepared successfully')
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('Error occurred handling', req.url, err)
        res.statusCode = 500
        res.setHeader('Content-Type', 'text/html; charset=UTF-8')
        res.end('internal server error')
      }
    }).listen(port, hostname, (err) => {
      if (err) {
        console.error('Failed to start server:', err)
        process.exit(1)
      }
      console.log(`> Ready on http://${hostname}:${port}`)
    })
  }).catch((err) => {
    console.error('Failed to prepare Next.js app:', err)
    process.exit(1)
  })
}

