import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'
import mysql from 'mysql2/promise'

// Carregar variáveis de ambiente
config({ path: path.join(process.cwd(), '.env.local') })

async function executeSQL() {
  let connection

  try {
    console.log('🔌 Connecting to database...')
    console.log('Host:', process.env.DATABASE_HOST)
    console.log('Database:', process.env.DATABASE_NAME)
    
    const pool = mysql.createPool({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
    })
    
    connection = await pool.getConnection()
    console.log('✅ Connected successfully!')

    // Ler o arquivo SQL
    const sqlPath = path.join(process.cwd(), 'database', 'admin-auth.sql')
    let sql = fs.readFileSync(sqlPath, 'utf8')

    console.log('📄 Executing admin-auth.sql...')
    
    // Separar os comandos SQL (remover DELIMITER)
    sql = sql.replace(/DELIMITER \/\//g, '')
    sql = sql.replace(/DELIMITER ;/g, '')
    
    // Executar statement por statement
    const statements = sql
      .split('//\n')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))
    
    for (const statement of statements) {
      if (statement) {
        try {
          await connection.query(statement)
          console.log('✅ Executed statement')
        } catch (err: any) {
          if (err.code === 'ER_DUP_ENTRY') {
            console.log('⚠️  Entry already exists (skipped)')
          } else {
            console.error('Statement error:', err.message)
          }
        }
      }
    }
    
    console.log('\n✅ SQL executed successfully!')

    // Verificar se admin foi criado
    console.log('\n🔍 Checking admin table...')
    const [admins] = await connection.query('SELECT admin_id, wallet_address, username, email, status, created_at FROM miao_admins')
    console.log('👥 Admins in database:')
    console.table(admins)

    console.log('\n✅ Database setup completed successfully!')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    if (connection) {
      connection.release()
      console.log('\n🔌 Connection closed')
    }
    process.exit(0)
  }
}

executeSQL()
