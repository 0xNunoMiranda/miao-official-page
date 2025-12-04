-- ============================================================
-- STORED PROCEDURES PARA MARIADB
-- ============================================================
-- Este arquivo contém as stored procedures formatadas para MariaDB
-- Execute cada stored procedure individualmente se o DELIMITER não funcionar
-- ============================================================

-- ============================================================
-- PROCEDURE: sp_user_get_or_create
-- ============================================================
-- Execute este bloco completo de uma vez
-- ============================================================

DROP PROCEDURE IF EXISTS sp_user_get_or_create;

DELIMITER $$

CREATE PROCEDURE sp_user_get_or_create(
  IN p_wallet_address VARCHAR(44)
)
BEGIN
  DECLARE v_user_exists INT DEFAULT 0;
  DECLARE v_referral_code VARCHAR(20);
  
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Validar input
  IF p_wallet_address IS NULL OR TRIM(p_wallet_address) = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Wallet address cannot be NULL or empty';
  END IF;

  -- Normalizar wallet (lowercase, trim)
  SET p_wallet_address = LOWER(TRIM(p_wallet_address));

  -- Verificar se usuário existe
  SELECT COUNT(*) INTO v_user_exists 
  FROM miao_users 
  WHERE wallet_address = p_wallet_address;

  -- Se não existir, criar novo usuário
  IF v_user_exists = 0 THEN
    -- Gerar referral code único
    SET v_referral_code = SUBSTRING(MD5(CONCAT(p_wallet_address, UNIX_TIMESTAMP(), RAND())), 1, 12);
    
    -- Garantir que o referral code é único
    WHILE EXISTS (SELECT 1 FROM miao_users WHERE referral_code = v_referral_code) DO
      SET v_referral_code = SUBSTRING(MD5(CONCAT(p_wallet_address, UNIX_TIMESTAMP(), RAND())), 1, 12);
    END WHILE;

    -- Inserir novo usuário
    INSERT INTO miao_users (
      wallet_address,
      username,
      avatar_url,
      level,
      total_gems,
      current_gems,
      hierarchy,
      streak_days,
      last_activity,
      referral_code,
      referred_by,
      total_referrals,
      miao_balance,
      last_balance_check,
      created_at,
      updated_at
    ) VALUES (
      p_wallet_address,
      NULL,
      NULL,
      1,
      0,
      0,
      'recruit',
      0,
      NOW(),
      v_referral_code,
      NULL,
      0,
      0.000000000,
      NULL,
      NOW(),
      NOW()
    );
  ELSE
    -- Se existir, atualizar last_activity
    UPDATE miao_users 
    SET last_activity = NOW(),
        updated_at = NOW()
    WHERE wallet_address = p_wallet_address;
  END IF;

  COMMIT;

  -- Retornar dados completos do usuário (fora da transação)
  SELECT 
    wallet_address,
    username,
    avatar_url,
    level,
    total_gems,
    current_gems,
    hierarchy,
    streak_days,
    last_activity,
    referral_code,
    referred_by,
    total_referrals,
    miao_balance,
    last_balance_check,
    created_at,
    updated_at
  FROM miao_users
  WHERE wallet_address = p_wallet_address;

END$$

DELIMITER ;

