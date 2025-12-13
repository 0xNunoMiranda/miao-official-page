import { config } from 'dotenv'
import mysql from 'mysql2/promise'
import { readFileSync } from 'fs'
import { join } from 'path'

config({ path: join(process.cwd(), '.env.local') })

async function executeSqlSetup() {
  let connection
  try {
    console.log('🔌 Connecting to database...')
    console.log(`Host: ${process.env.DATABASE_HOST}`)
    console.log(`Database: ${process.env.DATABASE_NAME}`)

    connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      multipleStatements: true,
    })

    console.log('✅ Connected to database')

    // Read SQL file
    const sqlFile = join(process.cwd(), 'database', 'admin-auth.sql')
    const sqlContent = readFileSync(sqlFile, 'utf-8')

    console.log('📝 Executing SQL statements...')

    // Split by semicolon and filter empty statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('DELIMITER'))

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (statement) {
        try {
          console.log(`[${i + 1}/${statements.length}] Executing...`)
          await connection.execute(statement)
          console.log(`✅ Statement ${i + 1} executed`)
        } catch (err: any) {
          // Ignore duplicate key errors for idempotent execution
          if (err.code === 'ER_DUP_ENTRY' || err.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists)`)
          } else {
            throw err
          }
        }
      }
    }

    console.log('✅ All statements executed successfully!')
    console.log('\n📋 Default Admin Created:')
    console.log('   Username: admin')
    console.log('   Password: miao2024')

    await connection.end()
  } catch (err: any) {
    console.error('❌ Error:', err.message)
    if (connection) await connection.end()
    process.exit(1)
  }
}

executeSqlSetup()
