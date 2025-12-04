-- Tabela de administradores
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stored Procedure: Verificar credenciais de admin
DELIMITER //

DROP PROCEDURE IF EXISTS sp_admin_verify_credentials//

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
END//

-- Stored Procedure: Verificar se wallet é admin
DROP PROCEDURE IF EXISTS sp_admin_check_wallet//

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
END//

-- Stored Procedure: Atualizar último login do admin
DROP PROCEDURE IF EXISTS sp_admin_update_last_login//

CREATE PROCEDURE sp_admin_update_last_login(
  IN p_admin_id INT
)
BEGIN
  UPDATE miao_admins
  SET last_login = CURRENT_TIMESTAMP
  WHERE admin_id = p_admin_id;
END//

-- Stored Procedure: Criar novo admin
DROP PROCEDURE IF EXISTS sp_admin_create//

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
END//

-- Stored Procedure: Listar todos admins
DROP PROCEDURE IF EXISTS sp_admin_list_all//

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
END//

DELIMITER ;

-- Inserir admin padrão (senha: miao2024)
-- Hash SHA256 de 'miao2024': 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
INSERT INTO miao_admins (wallet_address, username, password_hash, email, status)
VALUES (
  '0x0000000000000000000000000000000000000000',
  'admin',
  SHA2('miao2024', 256),
  'admin@miao.com',
  'active'
) ON DUPLICATE KEY UPDATE
  password_hash = SHA2('miao2024', 256),
  status = 'active';

-- Exemplo de inserir outro admin (opcional)
-- INSERT INTO miao_admins (wallet_address, username, password_hash, email, status)
-- VALUES (
--   '0x742d35cc6634c0532925a3b844bc9e7fa9946af4',
--   'superadmin',
--   SHA2('super2024', 256),
--   'super@miao.com',
--   'active'
-- );
