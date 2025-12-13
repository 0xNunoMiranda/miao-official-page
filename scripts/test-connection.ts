import { config } from 'dotenv'
import mysql from 'mysql2/promise'
import { join } from 'path'

config({ path: join(process.cwd(), '.env.local') })

async function testConnection() {
  let connection
  try {
    console.log('🔌 Connecting to MySQL server...')
    console.log(`Host: ${process.env.DATABASE_HOST}`)
    console.log(`User: ${process.env.DATABASE_USER}`)

    connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      port: parseInt(process.env.DATABASE_PORT || '3306'),
    })

    console.log('✅ Connected!\n')

    // List available databases
    console.log('📋 Available databases for this user:')
    const [databases] = await connection.execute('SHOW DATABASES')
    ;(databases as any[]).forEach(db => {
      console.log(`   - ${Object.values(db)[0]}`)
    })

    await connection.end()
  } catch (err: any) {
    console.error('❌ Error:', err.message)
    if (connection) await connection.end()
    process.exit(1)
  }
}

testConnection()
