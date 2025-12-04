import http from 'http'
import { parse } from 'url'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const port = parseInt(process.env.PORT || '3000', 10)

async function start() {
    const app = next({ dev })
    const handle = app.getRequestHandler()

    await app.prepare()

    const server = http.createServer((req, res) => {
        const parsedUrl = parse(req.url || '', true)
        handle(req, res, parsedUrl)
    })

    server.listen(port, (err) => {
        if (err) {
            console.error('Server failed to start:', err)
            process.exit(1)
        }
        console.log(`Next.js server running on http://localhost:${port}`)
    })
}

start().catch((err) => {
    console.error('Fatal startup error:', err)
    process.exit(1)
})
