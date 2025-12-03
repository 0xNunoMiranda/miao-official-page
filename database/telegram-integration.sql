-- ============================================
-- MIAO Telegram Integration - Interações Sociais
-- ============================================
-- Todas as interações sociais são enviadas ao Telegram
-- ============================================

-- ============================================
-- TABELA: Configuração do Telegram
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_telegram_config` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `config_key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Identificador da configuração',
  `bot_token` VARCHAR(200) NOT NULL COMMENT 'Token do bot Telegram (criptografado)',
  `chat_id` VARCHAR(50) NOT NULL COMMENT 'Chat ID do canal/grupo',
  `chat_type` ENUM('private', 'group', 'channel', 'supergroup') NOT NULL DEFAULT 'channel',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `enabled_interactions` JSON NULL COMMENT 'Tipos de interações habilitadas: ["comment", "reaction", "follow", "collaboration", "all"]',
  `message_format` ENUM('simple', 'detailed', 'rich') NOT NULL DEFAULT 'detailed' COMMENT 'Formato das mensagens',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Mensagens Enviadas ao Telegram
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_telegram_messages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `interaction_type` ENUM('comment', 'reaction', 'follow', 'collaboration', 'governance_vote', 'event', 'meme_created', 'other') NOT NULL,
  `related_type` VARCHAR(50) NOT NULL COMMENT 'Tipo relacionado: meme, comment, user, etc.',
  `related_id` BIGINT UNSIGNED NOT NULL COMMENT 'ID do item relacionado',
  `wallet_address` VARCHAR(44) NOT NULL COMMENT 'Usuário que fez a interação',
  `telegram_message_id` INT NULL COMMENT 'ID da mensagem no Telegram',
  `telegram_chat_id` VARCHAR(50) NULL COMMENT 'Chat ID onde foi enviado',
  `message_content` TEXT NULL COMMENT 'Conteúdo da mensagem enviada',
  `image_url` VARCHAR(500) NULL COMMENT 'URL da imagem (se aplicável)',
  `status` ENUM('pending', 'sent', 'failed', 'retrying') NOT NULL DEFAULT 'pending',
  `error_message` TEXT NULL COMMENT 'Mensagem de erro (se falhou)',
  `retry_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `sent_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_interaction` (`interaction_type`, `related_type`, `related_id`),
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created` (`created_at`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DADOS INICIAIS: Configuração do Telegram
-- ============================================
INSERT INTO `miao_telegram_config` 
  (`config_key`, `bot_token`, `chat_id`, `chat_type`, `is_active`, `enabled_interactions`, `message_format`) 
VALUES
  ('main_channel', '', '', 'channel', TRUE, JSON_ARRAY('all'), 'detailed')
ON DUPLICATE KEY UPDATE `config_key` = VALUES(`config_key`);

