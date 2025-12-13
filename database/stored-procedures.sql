-- ============================================================
-- MIAO TOOLS - DATABASE SETUP & STORED PROCEDURES
-- ============================================================

-- ============================================================
-- 1. TABELAS BASE
-- ============================================================

CREATE TABLE IF NOT EXISTS miao_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  wallet_address VARCHAR(255) UNIQUE NOT NULL,
  current_gems INT DEFAULT 0,
  current_level INT DEFAULT 1,
  total_xp INT DEFAULT 0,
  referral_code VARCHAR(32) UNIQUE,
  referred_by_wallet VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS miao_gems_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  wallet_address VARCHAR(255) NOT NULL,
  gems_amount INT NOT NULL,
  gems_type ENUM('add', 'spend') NOT NULL,
  reason VARCHAR(255),
  reason_details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_address) REFERENCES miao_users(wallet_address),
  INDEX idx_wallet_date (wallet_address, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS miao_quests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quest_key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reward_gems INT NOT NULL,
  quest_type ENUM('daily', 'weekly', 'one_time', 'recurring') NOT NULL,
  verification_type VARCHAR(50), -- manual, twitter_api, discord_api, wallet_balance, meme_creation, activity_based
  verification_data JSON,
  target_value INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_quest_key (quest_key),
  INDEX idx_type (quest_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS miao_user_quests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  wallet_address VARCHAR(255) NOT NULL,
  quest_id INT NOT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'claimed') DEFAULT 'pending',
  progress INT DEFAULT 0,
  target INT DEFAULT 1,
  completed_at TIMESTAMP NULL,
  claimed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_address) REFERENCES miao_users(wallet_address),
  FOREIGN KEY (quest_id) REFERENCES miao_quests(id),
  UNIQUE KEY uk_user_quest (wallet_address, quest_id),
  INDEX idx_wallet_status (wallet_address, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS miao_memes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  wallet_address VARCHAR(255) NOT NULL,
  prompt TEXT NOT NULL,
  top_text VARCHAR(255),
  bottom_text VARCHAR(255),
  image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  likes_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_address) REFERENCES miao_users(wallet_address),
  INDEX idx_wallet_published (wallet_address, is_published),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS miao_user_activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  wallet_address VARCHAR(255) NOT NULL,
  activity_type VARCHAR(50), -- meme_creation, meme_share, quest_complete, referral, etc
  activity_data JSON,
  gems_earned INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_address) REFERENCES miao_users(wallet_address),
  INDEX idx_wallet_type (wallet_address, activity_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS miao_user_features (
  id INT PRIMARY KEY AUTO_INCREMENT,
  wallet_address VARCHAR(255) NOT NULL,
  feature_key VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP NULL,
  payment_method VARCHAR(50), -- gems, sol
  treasury_transaction_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_address) REFERENCES miao_users(wallet_address),
  UNIQUE KEY uk_user_feature (wallet_address, feature_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 2. STORED PROCEDURES - USER MANAGEMENT
-- ============================================================

DELIMITER $$

-- Criar ou atualizar usuário
CREATE PROCEDURE IF NOT EXISTS sp_user_create_or_update(
  IN p_wallet_address VARCHAR(255),
  OUT p_user_id INT
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  IF NOT EXISTS (SELECT 1 FROM miao_users WHERE wallet_address = p_wallet_address) THEN
    INSERT INTO miao_users (wallet_address) VALUES (p_wallet_address);
  END IF;

  SELECT id INTO p_user_id FROM miao_users WHERE wallet_address = p_wallet_address;

  COMMIT;
END$$

-- Obter dados do usuário
CREATE PROCEDURE IF NOT EXISTS sp_user_get(
  IN p_wallet_address VARCHAR(255)
)
BEGIN
  SELECT
    id,
    wallet_address,
    current_gems,
    current_level,
    total_xp,
    referral_code,
    referred_by_wallet,
    created_at,
    updated_at
  FROM miao_users
  WHERE wallet_address = p_wallet_address;
END$$

-- Obter todos os dados do usuário com estatísticas
CREATE PROCEDURE IF NOT EXISTS sp_user_get_stats(
  IN p_wallet_address VARCHAR(255)
)
BEGIN
  SELECT
    u.id,
    u.wallet_address,
    u.current_gems,
    u.current_level,
    u.total_xp,
    u.referral_code,
    u.referred_by_wallet,
    u.created_at,
    COALESCE((SELECT COUNT(*) FROM miao_memes WHERE wallet_address = p_wallet_address AND is_published = TRUE), 0) as memes_created,
    COALESCE((SELECT COUNT(*) FROM miao_user_quests WHERE wallet_address = p_wallet_address AND status = 'completed'), 0) as quests_completed,
    COALESCE((SELECT COUNT(*) FROM miao_user_quests WHERE wallet_address = p_wallet_address AND status = 'claimed'), 0) as quests_claimed,
    COALESCE((SELECT SUM(likes_count) FROM miao_memes WHERE wallet_address = p_wallet_address), 0) as total_likes,
    COALESCE((SELECT COUNT(DISTINCT referred_by_wallet) FROM miao_users WHERE referred_by_wallet = p_wallet_address), 0) as referrals_count
  FROM miao_users u
  WHERE u.wallet_address = p_wallet_address;
END$$

-- ============================================================
-- 3. STORED PROCEDURES - GEMS MANAGEMENT
-- ============================================================

-- Adicionar gems (com auditoria)
CREATE PROCEDURE IF NOT EXISTS sp_gems_add(
  IN p_wallet_address VARCHAR(255),
  IN p_gems_amount INT,
  IN p_reason VARCHAR(255),
  IN p_reason_details JSON
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Criar usuário se não existir
  IF NOT EXISTS (SELECT 1 FROM miao_users WHERE wallet_address = p_wallet_address) THEN
    INSERT INTO miao_users (wallet_address) VALUES (p_wallet_address);
  END IF;

  -- Adicionar gems
  UPDATE miao_users SET current_gems = current_gems + p_gems_amount WHERE wallet_address = p_wallet_address;

  -- Registrar na história
  INSERT INTO miao_gems_history (wallet_address, gems_amount, gems_type, reason, reason_details)
  VALUES (p_wallet_address, p_gems_amount, 'add', p_reason, p_reason_details);

  COMMIT;
END$$

-- Gastar gems
CREATE PROCEDURE IF NOT EXISTS sp_gems_spend(
  IN p_wallet_address VARCHAR(255),
  IN p_gems_amount INT,
  IN p_reason VARCHAR(255),
  IN p_reason_details JSON,
  OUT p_success BOOLEAN
)
BEGIN
  DECLARE v_current_gems INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET p_success = FALSE;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT current_gems INTO v_current_gems FROM miao_users WHERE wallet_address = p_wallet_address FOR UPDATE;

  IF v_current_gems < p_gems_amount THEN
    SET p_success = FALSE;
    ROLLBACK;
  ELSE
    UPDATE miao_users SET current_gems = current_gems - p_gems_amount WHERE wallet_address = p_wallet_address;

    INSERT INTO miao_gems_history (wallet_address, gems_amount, gems_type, reason, reason_details)
    VALUES (p_wallet_address, p_gems_amount, 'spend', p_reason, p_reason_details);

    SET p_success = TRUE;
    COMMIT;
  END IF;
END$$

-- Obter histórico de gems
CREATE PROCEDURE IF NOT EXISTS sp_gems_history(
  IN p_wallet_address VARCHAR(255),
  IN p_limit INT
)
BEGIN
  SELECT
    id,
    wallet_address,
    gems_amount,
    gems_type,
    reason,
    reason_details,
    created_at
  FROM miao_gems_history
  WHERE wallet_address = p_wallet_address
  ORDER BY created_at DESC
  LIMIT p_limit;
END$$

-- ============================================================
-- 4. STORED PROCEDURES - QUESTS MANAGEMENT
-- ============================================================

-- Listar quests disponíveis
CREATE PROCEDURE IF NOT EXISTS sp_quests_get_available(
  IN p_quest_type VARCHAR(50)
)
BEGIN
  SELECT
    id,
    quest_key,
    title,
    description,
    reward_gems,
    quest_type,
    verification_type,
    verification_data,
    target_value
  FROM miao_quests
  WHERE is_active = TRUE
    AND (p_quest_type IS NULL OR quest_type = p_quest_type)
  ORDER BY quest_type, id;
END$$

-- Obter progresso de quests do usuário
CREATE PROCEDURE IF NOT EXISTS sp_user_quests_get(
  IN p_wallet_address VARCHAR(255),
  IN p_status VARCHAR(50)
)
BEGIN
  SELECT
    uq.id,
    uq.wallet_address,
    uq.quest_id,
    q.quest_key,
    q.title,
    q.description,
    q.reward_gems,
    q.quest_type,
    uq.status,
    uq.progress,
    uq.target,
    uq.completed_at,
    uq.claimed_at,
    uq.created_at
  FROM miao_user_quests uq
  JOIN miao_quests q ON uq.quest_id = q.id
  WHERE uq.wallet_address = p_wallet_address
    AND (p_status IS NULL OR uq.status = p_status)
  ORDER BY uq.created_at DESC;
END$$

-- Inicializar quests do usuário (chamado na primeira vez ou reset diário/semanal)
CREATE PROCEDURE IF NOT EXISTS sp_user_quests_initialize(
  IN p_wallet_address VARCHAR(255),
  IN p_quest_type VARCHAR(50)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Criar usuário se não existir
  IF NOT EXISTS (SELECT 1 FROM miao_users WHERE wallet_address = p_wallet_address) THEN
    INSERT INTO miao_users (wallet_address) VALUES (p_wallet_address);
  END IF;

  -- Inserir quests que não existem ainda
  INSERT INTO miao_user_quests (wallet_address, quest_id, status, target)
  SELECT p_wallet_address, q.id, 'pending', q.target_value
  FROM miao_quests q
  WHERE q.quest_type = p_quest_type
    AND q.is_active = TRUE
    AND NOT EXISTS (
      SELECT 1 FROM miao_user_quests uq
      WHERE uq.wallet_address = p_wallet_address
        AND uq.quest_id = q.id
        AND DATE(uq.created_at) = CURDATE()
    )
  ON DUPLICATE KEY UPDATE
    status = CASE WHEN status = 'claimed' THEN 'claimed' ELSE 'pending' END;

  COMMIT;
END$$

-- Atualizar progresso da quest
CREATE PROCEDURE IF NOT EXISTS sp_user_quest_update_progress(
  IN p_wallet_address VARCHAR(255),
  IN p_quest_id INT,
  IN p_progress_increment INT
)
BEGIN
  DECLARE v_target INT;
  DECLARE v_current_progress INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT target, progress INTO v_target, v_current_progress
  FROM miao_user_quests
  WHERE wallet_address = p_wallet_address AND quest_id = p_quest_id
  FOR UPDATE;

  UPDATE miao_user_quests
  SET progress = LEAST(progress + p_progress_increment, target),
      status = IF(progress + p_progress_increment >= target, 'completed', 'in_progress'),
      completed_at = IF(progress + p_progress_increment >= target, NOW(), completed_at)
  WHERE wallet_address = p_wallet_address AND quest_id = p_quest_id;

  COMMIT;
END$$

-- Reclamar recompensa da quest
CREATE PROCEDURE IF NOT EXISTS sp_user_quest_claim(
  IN p_wallet_address VARCHAR(255),
  IN p_quest_id INT,
  OUT p_gems_earned INT,
  OUT p_success BOOLEAN
)
BEGIN
  DECLARE v_quest_status VARCHAR(50);
  DECLARE v_reward_gems INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET p_success = FALSE;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT uq.status, q.reward_gems
  INTO v_quest_status, v_reward_gems
  FROM miao_user_quests uq
  JOIN miao_quests q ON uq.quest_id = q.id
  WHERE uq.wallet_address = p_wallet_address AND uq.quest_id = p_quest_id
  FOR UPDATE;

  IF v_quest_status != 'completed' THEN
    SET p_success = FALSE;
    ROLLBACK;
  ELSE
    -- Adicionar gems
    UPDATE miao_users SET current_gems = current_gems + v_reward_gems WHERE wallet_address = p_wallet_address;

    -- Atualizar status da quest
    UPDATE miao_user_quests
    SET status = 'claimed', claimed_at = NOW()
    WHERE wallet_address = p_wallet_address AND quest_id = p_quest_id;

    -- Registrar atividade
    INSERT INTO miao_user_activities (wallet_address, activity_type, activity_data, gems_earned)
    VALUES (p_wallet_address, 'quest_completed', JSON_OBJECT('quest_id', p_quest_id), v_reward_gems);

    -- Registrar gems
    INSERT INTO miao_gems_history (wallet_address, gems_amount, gems_type, reason, reason_details)
    VALUES (p_wallet_address, v_reward_gems, 'add', 'Quest Reward', JSON_OBJECT('quest_id', p_quest_id));

    SET p_gems_earned = v_reward_gems;
    SET p_success = TRUE;
    COMMIT;
  END IF;
END$$

-- ============================================================
-- 5. STORED PROCEDURES - MEMES
-- ============================================================

-- Criar meme
CREATE PROCEDURE IF NOT EXISTS sp_meme_create(
  IN p_wallet_address VARCHAR(255),
  IN p_prompt TEXT,
  IN p_top_text VARCHAR(255),
  IN p_bottom_text VARCHAR(255),
  IN p_image_url TEXT,
  OUT p_meme_id INT
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Criar usuário se não existir
  IF NOT EXISTS (SELECT 1 FROM miao_users WHERE wallet_address = p_wallet_address) THEN
    INSERT INTO miao_users (wallet_address) VALUES (p_wallet_address);
  END IF;

  -- Inserir meme
  INSERT INTO miao_memes (wallet_address, prompt, top_text, bottom_text, image_url)
  VALUES (p_wallet_address, p_prompt, p_top_text, p_bottom_text, p_image_url);

  SET p_meme_id = LAST_INSERT_ID();

  -- Registrar atividade
  INSERT INTO miao_user_activities (wallet_address, activity_type, activity_data)
  VALUES (p_wallet_address, 'meme_creation', JSON_OBJECT('meme_id', p_meme_id));

  -- Atualizar progresso da quest de criação de meme
  UPDATE miao_user_quests
  SET progress = progress + 1,
      status = IF(progress + 1 >= target, 'completed', status),
      completed_at = IF(progress + 1 >= target, NOW(), completed_at)
  WHERE wallet_address = p_wallet_address
    AND quest_id IN (SELECT id FROM miao_quests WHERE quest_type = 'daily' AND quest_key LIKE '%meme_creation%')
    AND status IN ('pending', 'in_progress');

  COMMIT;
END$$

-- Publicar meme
CREATE PROCEDURE IF NOT EXISTS sp_meme_publish(
  IN p_meme_id INT,
  IN p_wallet_address VARCHAR(255),
  OUT p_success BOOLEAN
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET p_success = FALSE;
    RESIGNAL;
  END;

  START TRANSACTION;

  UPDATE miao_memes
  SET is_published = TRUE
  WHERE id = p_meme_id AND wallet_address = p_wallet_address;

  IF ROW_COUNT() = 0 THEN
    SET p_success = FALSE;
    ROLLBACK;
  ELSE
    -- Registrar atividade
    INSERT INTO miao_user_activities (wallet_address, activity_type, activity_data, gems_earned)
    VALUES (p_wallet_address, 'meme_published', JSON_OBJECT('meme_id', p_meme_id), 50);

    -- Adicionar gems
    CALL sp_gems_add(p_wallet_address, 50, 'Meme Published', JSON_OBJECT('meme_id', p_meme_id));

    SET p_success = TRUE;
    COMMIT;
  END IF;
END$$

-- Obter memes do usuário
CREATE PROCEDURE IF NOT EXISTS sp_memes_get_by_wallet(
  IN p_wallet_address VARCHAR(255),
  IN p_published_only BOOLEAN,
  IN p_limit INT
)
BEGIN
  SELECT
    id,
    wallet_address,
    prompt,
    top_text,
    bottom_text,
    image_url,
    is_published,
    likes_count,
    shares_count,
    created_at
  FROM miao_memes
  WHERE wallet_address = p_wallet_address
    AND (p_published_only = FALSE OR is_published = TRUE)
  ORDER BY created_at DESC
  LIMIT p_limit;
END$$

-- Obter feed de memes (comunidade)
CREATE PROCEDURE IF NOT EXISTS sp_memes_get_feed(
  IN p_limit INT,
  IN p_offset INT
)
BEGIN
  SELECT
    id,
    wallet_address,
    prompt,
    top_text,
    bottom_text,
    image_url,
    likes_count,
    shares_count,
    created_at
  FROM miao_memes
  WHERE is_published = TRUE
  ORDER BY likes_count DESC, created_at DESC
  LIMIT p_limit OFFSET p_offset;
END$$

-- Curtir meme
CREATE PROCEDURE IF NOT EXISTS sp_meme_like(
  IN p_meme_id INT,
  IN p_wallet_address VARCHAR(255)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  UPDATE miao_memes SET likes_count = likes_count + 1 WHERE id = p_meme_id;

  -- Registrar atividade
  INSERT INTO miao_user_activities (wallet_address, activity_type, activity_data)
  VALUES (p_wallet_address, 'meme_like', JSON_OBJECT('meme_id', p_meme_id));

  COMMIT;
END$$

-- ============================================================
-- 6. STORED PROCEDURES - ACTIVITIES
-- ============================================================

-- Obter atividades recentes
CREATE PROCEDURE IF NOT EXISTS sp_user_activities_get(
  IN p_wallet_address VARCHAR(255),
  IN p_limit INT
)
BEGIN
  SELECT
    id,
    wallet_address,
    activity_type,
    activity_data,
    gems_earned,
    created_at
  FROM miao_user_activities
  WHERE wallet_address = p_wallet_address
  ORDER BY created_at DESC
  LIMIT p_limit;
END$$

DELIMITER ;
