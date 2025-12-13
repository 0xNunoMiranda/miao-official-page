import { config } from 'dotenv'
import mysql from 'mysql2/promise'
import { join } from 'path'

config({ path: join(process.cwd(), '.env.local') })

async function createDatabase() {
  let connection
  try {
    console.log('🔌 Connecting to MySQL server...')
    console.log(`Host: ${process.env.DATABASE_HOST}`)
    console.log(`User: ${process.env.DATABASE_USER}\n`)

    // Connect without database
    connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      port: parseInt(process.env.DATABASE_PORT || '3306'),
    })

    console.log('✅ Connected to MySQL server\n')

    // 1. Create database
    console.log(`🗂️  Creating database: ${process.env.DATABASE_NAME}`)
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DATABASE_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    console.log('✅ Database created\n')

    // 2. Use the database
    console.log(`📍 Selecting database: ${process.env.DATABASE_NAME}`)
    await connection.execute(`USE ${process.env.DATABASE_NAME}`)
    console.log('✅ Database selected\n')

    // 3. Create table
    console.log('📋 Creating miao_admins table...')
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS miao_admins (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        wallet_address VARCHAR(42) NOT NULL UNIQUE,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        permissions JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        created_by INT DEFAULT NULL,
        INDEX idx_wallet (wallet_address),
        INDEX idx_username (username),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ Table created\n')

    // 4. Create stored procedures
    console.log('📝 Creating stored procedures...')

    // sp_admin_verify_credentials
    await connection.execute(`
      DROP PROCEDURE IF EXISTS sp_admin_verify_credentials
    `)
    await connection.execute(`
      CREATE PROCEDURE sp_admin_verify_credentials(
        IN p_username VARCHAR(50),
        IN p_password_hash VARCHAR(255)
      )
      BEGIN
        SELECT 
          admin_id,
          wallet_address,
          username,
          email,
          status,
          permissions
        FROM miao_admins
        WHERE username = p_username
          AND password_hash = p_password_hash
          AND status = 'active'
        LIMIT 1;
      END
    `)
    console.log('  ✅ sp_admin_verify_credentials')

    // sp_admin_check_wallet
    await connection.execute(`
      DROP PROCEDURE IF EXISTS sp_admin_check_wallet
    `)
    await connection.execute(`
      CREATE PROCEDURE sp_admin_check_wallet(
        IN p_wallet_address VARCHAR(42)
      )
      BEGIN
        SELECT 
          admin_id,
          wallet_address,
          username,
          status
        FROM miao_admins
        WHERE wallet_address = LOWER(p_wallet_address)
          AND status = 'active'
        LIMIT 1;
      END
    `)
    console.log('  ✅ sp_admin_check_wallet')

    // sp_admin_update_last_login
    await connection.execute(`
      DROP PROCEDURE IF EXISTS sp_admin_update_last_login
    `)
    await connection.execute(`
      CREATE PROCEDURE sp_admin_update_last_login(
        IN p_admin_id INT
      )
      BEGIN
        UPDATE miao_admins
        SET last_login = CURRENT_TIMESTAMP
        WHERE admin_id = p_admin_id;
      END
    `)
    console.log('  ✅ sp_admin_update_last_login')

    // sp_admin_create
    await connection.execute(`
      DROP PROCEDURE IF EXISTS sp_admin_create
    `)
    await connection.execute(`
      CREATE PROCEDURE sp_admin_create(
        IN p_wallet_address VARCHAR(42),
        IN p_username VARCHAR(50),
        IN p_password_hash VARCHAR(255),
        IN p_email VARCHAR(100),
        IN p_created_by INT
      )
      BEGIN
        INSERT INTO miao_admins (
          wallet_address,
          username,
          password_hash,
          email,
          created_by
        ) VALUES (
          LOWER(p_wallet_address),
          p_username,
          p_password_hash,
          p_email,
          p_created_by
        );
        
        SELECT LAST_INSERT_ID() as admin_id;
      END
    `)
    console.log('  ✅ sp_admin_create')

    // sp_admin_list_all
    await connection.execute(`
      DROP PROCEDURE IF EXISTS sp_admin_list_all
    `)
    await connection.execute(`
      CREATE PROCEDURE sp_admin_list_all()
      BEGIN
        SELECT 
          admin_id,
          wallet_address,
          username,
          email,
          status,
          permissions,
          created_at,
          last_login
        FROM miao_admins
        ORDER BY created_at DESC;
      END
    `)
    console.log('  ✅ sp_admin_list_all\n')

    // 5. Insert default admin
    console.log('👤 Creating default admin user...')
    await connection.execute(`
      INSERT INTO miao_admins (wallet_address, username, password_hash, email, status)
      VALUES (
        '0x0000000000000000000000000000000000000000',
        'admin',
        SHA2('miao2024', 256),
        'admin@miao.com',
        'active'
      ) ON DUPLICATE KEY UPDATE
        password_hash = SHA2('miao2024', 256),
        status = 'active'
    `)
    console.log('✅ Default admin created\n')

    // 6. Verify setup
    console.log('🔍 Verifying setup...')
    const [tables] = await connection.execute(
      'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
      [process.env.DATABASE_NAME, 'miao_admins']
    )
    console.log(`✅ Table verified: ${(tables as any[]).length > 0 ? 'miao_admins exists' : 'Error'}\n`)

    const [procs] = await connection.execute(
      'SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = "PROCEDURE"',
      [process.env.DATABASE_NAME]
    )
    const procCount = (procs as any[]).length
    console.log(`✅ Stored procedures verified: ${procCount} found\n`)

    console.log('🎉 Database setup completed successfully!')
    console.log('\n📋 Default Admin Credentials:')
    console.log('   Username: admin')
    console.log('   Password: miao2024')
    console.log('   Wallet: 0x0000000000000000000000000000000000000000')

    await connection.end()
  } catch (err: any) {
    console.error('❌ Error:', err.message)
    if (err.code) console.error(`   Error Code: ${err.code}`)
    if (err.errno) console.error(`   Error Number: ${err.errno}`)
    if (connection) await connection.end()
    process.exit(1)
  }
}

createDatabase()
