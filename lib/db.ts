import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function query(sql: string, values?: any[]) {
  try {
    const connection = await pool.getConnection()
    try {
      const [results] = await connection.execute(sql, values || [])
      return results
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
}

export async function execute(procedureName: string, params: any[] = []) {
  try {
    const connection = await pool.getConnection()
    try {
      const placeholders = params.map(() => '?').join(',')
      const sql = `CALL ${procedureName}(${placeholders})`
      console.log('[DB] Executing stored procedure:', procedureName, 'with params:', params)
      const [results] = await connection.execute(sql, params)
      console.log('[DB] Stored procedure result:', JSON.stringify(results, null, 2))
      return results
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('[DB] Database error in execute:', error)
    if (error instanceof Error) {
      console.error('[DB] Error message:', error.message)
      console.error('[DB] Error stack:', error.stack)
    }
    throw error
  }
}

export async function getConnection() {
  return await pool.getConnection()
}

export default pool
