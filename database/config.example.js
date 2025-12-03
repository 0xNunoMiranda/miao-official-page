// ============================================
// MIAO Tools - Database Configuration
// ============================================
// Renomeie este arquivo para config.js e preencha com suas credenciais
// ============================================

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'your_username',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'miao_tools',
  charset: 'utf8mb4',
  timezone: '+00:00',
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  // Para produção
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
}

// ============================================
// Exemplo de uso com mysql2 (Node.js)
// ============================================
/*
import mysql from 'mysql2/promise';

const pool = mysql.createPool(dbConfig);

export async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}

export default pool;
*/

