-- ============================================
-- MIAO Social & Comunidade - Sistema Escalável
-- ============================================
-- Todas as interações dão recompensas (XP e Gems)
-- ============================================

-- ============================================
-- TABELA: Comentários em Memes
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_meme_comments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `meme_id` BIGINT UNSIGNED NOT NULL,
  `wallet_address` VARCHAR(44) NOT NULL,
  `parent_comment_id` BIGINT UNSIGNED NULL COMMENT 'Para threads (respostas a comentários)',
  `content` TEXT NOT NULL,
  `is_edited` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
  `deleted_at` DATETIME NULL,
  `likes_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `replies_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `reports_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_moderated` BOOLEAN NOT NULL DEFAULT FALSE,
  `moderated_at` DATETIME NULL,
  `moderator_wallet` VARCHAR(44) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_meme` (`meme_id`),
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_parent` (`parent_comment_id`),
  INDEX `idx_created` (`created_at`),
  INDEX `idx_moderated` (`is_moderated`),
  FOREIGN KEY (`meme_id`) REFERENCES `miao_memes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_comment_id`) REFERENCES `miao_meme_comments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Reações Customizadas em Memes
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_meme_reactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `meme_id` BIGINT UNSIGNED NOT NULL,
  `wallet_address` VARCHAR(44) NOT NULL,
  `reaction_type` VARCHAR(50) NOT NULL COMMENT 'like, love, laugh, wow, sad, angry, fire, etc.',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_meme_reaction` (`meme_id`, `wallet_address`, `reaction_type`),
  INDEX `idx_meme` (`meme_id`),
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_reaction` (`reaction_type`),
  FOREIGN KEY (`meme_id`) REFERENCES `miao_memes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Likes em Comentários
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_comment_likes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `comment_id` BIGINT UNSIGNED NOT NULL,
  `wallet_address` VARCHAR(44) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_comment_like` (`comment_id`, `wallet_address`),
  INDEX `idx_comment` (`comment_id`),
  INDEX `idx_wallet` (`wallet_address`),
  FOREIGN KEY (`comment_id`) REFERENCES `miao_meme_comments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Follow/Unfollow de Criadores
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_user_follows` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `follower_wallet` VARCHAR(44) NOT NULL COMMENT 'Quem segue',
  `following_wallet` VARCHAR(44) NOT NULL COMMENT 'Quem é seguido',
  `notifications_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_follow` (`follower_wallet`, `following_wallet`),
  INDEX `idx_follower` (`follower_wallet`),
  INDEX `idx_following` (`following_wallet`),
  FOREIGN KEY (`follower_wallet`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE,
  FOREIGN KEY (`following_wallet`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE,
  CHECK (`follower_wallet` != `following_wallet`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Notificações
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_address` VARCHAR(44) NOT NULL,
  `type` ENUM('comment', 'reaction', 'follow', 'mention', 'collaboration', 'governance', 'event', 'quest', 'achievement') NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NULL,
  `related_id` BIGINT UNSIGNED NULL COMMENT 'ID relacionado (meme_id, comment_id, etc.)',
  `related_type` VARCHAR(50) NULL COMMENT 'Tipo relacionado (meme, comment, proposal, etc.)',
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `read_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_type` (`type`),
  INDEX `idx_read` (`is_read`, `created_at`),
  INDEX `idx_created` (`created_at`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Colaborações em Memes
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_meme_collaborations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `meme_id` BIGINT UNSIGNED NOT NULL,
  `wallet_address` VARCHAR(44) NOT NULL COMMENT 'Colaborador',
  `role` ENUM('creator', 'editor', 'contributor', 'reviewer') NOT NULL DEFAULT 'contributor',
  `contribution_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Percentual de contribuição (0-100)',
  `gems_earned` INT UNSIGNED NULL COMMENT 'Gems ganhas nesta colaboração',
  `xp_earned` INT UNSIGNED NULL COMMENT 'XP ganho nesta colaboração',
  `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_meme` (`meme_id`),
  INDEX `idx_wallet` (`wallet_address`),
  FOREIGN KEY (`meme_id`) REFERENCES `miao_memes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Badges de Colaborador
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_collaborator_badges` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `badge_key` VARCHAR(100) NOT NULL UNIQUE,
  `badge_name` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `icon_url` VARCHAR(500) NULL,
  `requirement_type` ENUM('collaborations_count', 'gems_earned', 'memes_created', 'custom') NOT NULL,
  `requirement_value` INT UNSIGNED NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Badges dos Usuários
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_user_badges` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_address` VARCHAR(44) NOT NULL,
  `badge_id` INT UNSIGNED NOT NULL,
  `earned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_displayed` BOOLEAN NOT NULL DEFAULT TRUE,
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_badge` (`badge_id`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE,
  FOREIGN KEY (`badge_id`) REFERENCES `miao_collaborator_badges`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Calendário de Eventos
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_events` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `event_key` VARCHAR(100) NOT NULL UNIQUE,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `event_type` ENUM('community', 'quest_deadline', 'governance', 'collaboration', 'competition', 'announcement') NOT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NULL,
  `is_recurring` BOOLEAN NOT NULL DEFAULT FALSE,
  `recurrence_pattern` VARCHAR(100) NULL COMMENT 'daily, weekly, monthly, etc.',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by_wallet` VARCHAR(44) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_dates` (`start_date`, `end_date`),
  INDEX `idx_type` (`event_type`),
  INDEX `idx_active` (`is_active`),
  FOREIGN KEY (`created_by_wallet`) REFERENCES `miao_users`(`wallet_address`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Lembretes Personalizados
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_user_reminders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_address` VARCHAR(44) NOT NULL,
  `event_id` INT UNSIGNED NULL COMMENT 'Relacionado a um evento',
  `reminder_type` ENUM('event', 'quest_deadline', 'governance_vote', 'custom') NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NULL,
  `reminder_date` DATETIME NOT NULL,
  `is_sent` BOOLEAN NOT NULL DEFAULT FALSE,
  `sent_at` DATETIME NULL,
  `is_recurring` BOOLEAN NOT NULL DEFAULT FALSE,
  `recurrence_pattern` VARCHAR(100) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_reminder_date` (`reminder_date`, `is_sent`),
  INDEX `idx_event` (`event_id`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE,
  FOREIGN KEY (`event_id`) REFERENCES `miao_events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Propostas de Governance
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_governance_proposals` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `proposal_key` VARCHAR(100) NOT NULL UNIQUE,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `proposal_type` ENUM('feature', 'parameter', 'treasury', 'governance', 'other') NOT NULL,
  `proposed_by_wallet` VARCHAR(44) NOT NULL,
  `on_chain_proposal_id` VARCHAR(100) NULL COMMENT 'ID da proposta on-chain',
  `status` ENUM('draft', 'active', 'voting', 'passed', 'rejected', 'executed', 'cancelled') NOT NULL DEFAULT 'draft',
  `voting_start` DATETIME NULL,
  `voting_end` DATETIME NULL,
  `quorum_required` DECIMAL(5, 2) NULL COMMENT 'Quorum necessário (%)',
  `votes_for` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `votes_against` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `votes_abstain` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `total_votes` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `execution_data` JSON NULL COMMENT 'Dados para execução automática',
  `executed_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_voting` (`voting_start`, `voting_end`),
  INDEX `idx_proposer` (`proposed_by_wallet`),
  INDEX `idx_created` (`created_at`),
  FOREIGN KEY (`proposed_by_wallet`) REFERENCES `miao_users`(`wallet_address`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Votos em Propostas
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_governance_votes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `proposal_id` INT UNSIGNED NOT NULL,
  `wallet_address` VARCHAR(44) NOT NULL,
  `vote_type` ENUM('for', 'against', 'abstain') NOT NULL,
  `voting_power` DECIMAL(18, 9) NOT NULL COMMENT 'Poder de voto (baseado em $MIAO tokens)',
  `on_chain_tx_signature` VARCHAR(88) NULL COMMENT 'Assinatura da transação on-chain',
  `reason` TEXT NULL COMMENT 'Razão do voto (opcional)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_proposal_vote` (`proposal_id`, `wallet_address`),
  INDEX `idx_proposal` (`proposal_id`),
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_vote_type` (`vote_type`),
  FOREIGN KEY (`proposal_id`) REFERENCES `miao_governance_proposals`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: AI Assistant - Conversas
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_ai_conversations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_address` VARCHAR(44) NOT NULL,
  `conversation_key` VARCHAR(100) NOT NULL,
  `context_data` JSON NULL COMMENT 'Contexto da conversa (preferências, histórico, etc.)',
  `last_interaction_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_conversation` (`wallet_address`, `conversation_key`),
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_last_interaction` (`last_interaction_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: AI Assistant - Mensagens
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_ai_messages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` BIGINT UNSIGNED NOT NULL,
  `role` ENUM('user', 'assistant', 'system') NOT NULL,
  `content` TEXT NOT NULL,
  `message_type` ENUM('question', 'suggestion', 'analysis', 'help', 'trend', 'other') NOT NULL,
  `used_api` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Se usou API externa (GPT) ou cache',
  `api_cost_tokens` INT UNSIGNED NULL COMMENT 'Tokens usados (se usou API)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_conversation` (`conversation_id`),
  INDEX `idx_created` (`created_at`),
  FOREIGN KEY (`conversation_id`) REFERENCES `miao_ai_conversations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: AI Assistant - Cache de Respostas
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_ai_cache` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `cache_key` VARCHAR(200) NOT NULL UNIQUE COMMENT 'Hash da pergunta ou contexto',
  `question` TEXT NOT NULL,
  `answer` TEXT NOT NULL,
  `context` JSON NULL COMMENT 'Contexto usado para gerar resposta',
  `hit_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Quantas vezes foi usado',
  `last_used_at` DATETIME NULL,
  `expires_at` DATETIME NULL COMMENT 'Data de expiração do cache',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_cache_key` (`cache_key`),
  INDEX `idx_expires` (`expires_at`),
  INDEX `idx_hit_count` (`hit_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: AI Assistant - Análises de Tendências
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_ai_trends` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `trend_key` VARCHAR(100) NOT NULL UNIQUE,
  `trend_type` ENUM('meme', 'topic', 'hashtag', 'creator', 'reaction') NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `data` JSON NOT NULL COMMENT 'Dados da análise',
  `confidence_score` DECIMAL(5, 2) NULL COMMENT 'Score de confiança (0-100)',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `analyzed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NULL,
  INDEX `idx_type` (`trend_type`),
  INDEX `idx_active` (`is_active`, `analyzed_at`),
  INDEX `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Moderação Comunitária
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_moderation_actions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `moderator_wallet` VARCHAR(44) NOT NULL,
  `target_type` ENUM('meme', 'comment', 'user', 'proposal') NOT NULL,
  `target_id` BIGINT UNSIGNED NOT NULL,
  `action_type` ENUM('approve', 'reject', 'delete', 'warn', 'ban', 'unban') NOT NULL,
  `reason` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_moderator` (`moderator_wallet`),
  INDEX `idx_target` (`target_type`, `target_id`),
  INDEX `idx_created` (`created_at`),
  FOREIGN KEY (`moderator_wallet`) REFERENCES `miao_users`(`wallet_address`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Reports de Conteúdo
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_content_reports` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `reporter_wallet` VARCHAR(44) NOT NULL,
  `target_type` ENUM('meme', 'comment', 'user') NOT NULL,
  `target_id` BIGINT UNSIGNED NOT NULL,
  `report_type` ENUM('spam', 'inappropriate', 'harassment', 'copyright', 'other') NOT NULL,
  `description` TEXT NULL,
  `status` ENUM('pending', 'reviewed', 'resolved', 'dismissed') NOT NULL DEFAULT 'pending',
  `reviewed_by_wallet` VARCHAR(44) NULL,
  `reviewed_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_reporter` (`reporter_wallet`),
  INDEX `idx_target` (`target_type`, `target_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created` (`created_at`),
  FOREIGN KEY (`reporter_wallet`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE,
  FOREIGN KEY (`reviewed_by_wallet`) REFERENCES `miao_users`(`wallet_address`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Feed Personalizado (Algoritmo)
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_feed_preferences` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_address` VARCHAR(44) NOT NULL,
  `algorithm_type` ENUM('chronological', 'popular', 'trending', 'personalized', 'following') NOT NULL DEFAULT 'personalized',
  `filters` JSON NULL COMMENT 'Filtros personalizados (categorias, tags, etc.)',
  `weight_following` DECIMAL(3, 2) NOT NULL DEFAULT 0.4 COMMENT 'Peso para conteúdo de seguidos (0-1)',
  `weight_likes` DECIMAL(3, 2) NOT NULL DEFAULT 0.3 COMMENT 'Peso para likes (0-1)',
  `weight_recent` DECIMAL(3, 2) NOT NULL DEFAULT 0.3 COMMENT 'Peso para recência (0-1)',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_preferences` (`wallet_address`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Recompensas de Interações (Automático)
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_interaction_rewards` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `interaction_type` VARCHAR(50) NOT NULL UNIQUE COMMENT 'comment, reaction, follow, collaboration, etc.',
  `reward_gems` INT UNSIGNED NOT NULL DEFAULT 0,
  `reward_xp` INT UNSIGNED NOT NULL DEFAULT 0,
  `cooldown_seconds` INT UNSIGNED NULL COMMENT 'Cooldown entre recompensas (NULL = sem cooldown)',
  `max_per_day` INT UNSIGNED NULL COMMENT 'Máximo de recompensas por dia (NULL = ilimitado)',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_active` (`is_active`),
  INDEX `idx_type` (`interaction_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DADOS INICIAIS: Recompensas de Interações
-- ============================================
INSERT INTO `miao_interaction_rewards` 
  (`interaction_type`, `reward_gems`, `reward_xp`, `cooldown_seconds`, `max_per_day`, `is_active`) 
VALUES
  ('comment', 5, 10, 60, 50, TRUE),
  ('reaction', 2, 5, 30, 100, TRUE),
  ('follow', 10, 20, NULL, 20, TRUE),
  ('collaboration', 50, 100, NULL, 10, TRUE),
  ('governance_vote', 25, 50, NULL, 5, TRUE),
  ('event_participation', 15, 30, NULL, 10, TRUE),
  ('report_resolved', 10, 20, NULL, 5, TRUE),
  ('moderation_action', 20, 40, NULL, 20, TRUE)
ON DUPLICATE KEY UPDATE `reward_gems` = VALUES(`reward_gems`);

