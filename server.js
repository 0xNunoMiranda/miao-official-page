// server.js para cPanel - Next.js
// Este arquivo é usado pelo cPanel Node.js Selector para iniciar a aplicação
// Usa CommonJS mesmo com "type": "module" no package.json
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')
const path = require('path')

// Verificar se o build existe
const buildIdPath = path.join(process.cwd(), '.next', 'BUILD_ID')
if (!fs.existsSync(buildIdPath)) {
  console.error('ERROR: Production build not found!')
  console.error('Please run "npm run build" before starting the production server.')
  console.error('Build ID file not found at:', buildIdPath)
  process.exit(1)
}

// Forçar modo production no cPanel
const dev = false
const hostname = process.env.HOSTNAME || '0.0.0.0'
const port = process.env.PORT || 3000

console.log('Starting Next.js production server...')
console.log('Build ID found:', fs.readFileSync(buildIdPath, 'utf8').trim())

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

