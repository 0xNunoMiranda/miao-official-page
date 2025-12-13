-- ============================================================
-- MIAO TOOLS - COMPLETE DATABASE SETUP
-- ============================================================
-- Este arquivo contém TODAS as tabelas e stored procedures
-- Execute este arquivo completo na sua base de dados MySQL
-- ============================================================
-- SQL Injection Safe - Todas as queries usam prepared statements
-- ============================================================
-- IMPORTANTE: Execute este arquivo COMPLETO de uma vez
-- Não execute apenas partes isoladas do arquivo
-- O DELIMITER $$ é necessário para criar as stored procedures
-- ============================================================

-- ============================================================
-- PARTE 1: TABELAS
-- ============================================================

-- ============================================
-- TABELA PRINCIPAL: Usuários (Base)
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_users` (
  `wallet_address` VARCHAR(44) NOT NULL PRIMARY KEY COMMENT 'Solana wallet address (base58)',
  `username` VARCHAR(50) NULL COMMENT 'Nome escolhido pelo usuário',
  `avatar_url` VARCHAR(255) NULL COMMENT 'URL do avatar (NFT ou upload)',
  `level` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Nível do usuário',
  `total_gems` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total de gems acumuladas (histórico)',
  `current_gems` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Gems disponíveis atualmente (não transacionáveis)',
  `hierarchy` ENUM('recruit', 'soldier', 'sergeant', 'captain', 'general', 'legend') NOT NULL DEFAULT 'recruit' COMMENT 'Hierarquia no exército Miao',
  `streak_days` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Dias consecutivos de atividade',
  `last_activity` DATETIME NULL COMMENT 'Última atividade registrada',
  `referral_code` VARCHAR(20) UNIQUE NULL COMMENT 'Código único de referência',
  `referred_by` VARCHAR(44) NULL COMMENT 'Wallet address de quem indicou',
  `total_referrals` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total de pessoas indicadas',
  `miao_balance` DECIMAL(18, 9) NOT NULL DEFAULT 0 COMMENT 'Saldo de $MIAO tokens (para verificação)',
  `last_balance_check` DATETIME NULL COMMENT 'Última verificação de saldo $MIAO',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_hierarchy` (`hierarchy`),
  INDEX `idx_level` (`level`),
  INDEX `idx_referral_code` (`referral_code`),
  INDEX `idx_referred_by` (`referred_by`),
  FOREIGN KEY (`referred_by`) REFERENCES `miao_users`(`wallet_address`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Histórico de Gems (Pontos Internos)
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_gem_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_address` VARCHAR(44) NOT NULL,
  `amount` INT NOT NULL COMMENT 'Valor positivo (ganho) ou negativo (gasto interno)',
  `type` ENUM('earn', 'spend', 'bonus', 'referral', 'quest', 'meme_creation', 'meme_share', 'daily_login', 'streak_bonus', 'feature_unlock', 'poll_response', 'content_share', 'game_reward', 'resource_purchase', 'game_purchase') NOT NULL COMMENT 'Tipo: earn=ganho, spend=gasto interno (não transferível)',
  `payment_method` ENUM('gems', 'miao', 'both') NULL COMMENT 'Método de pagamento usado (NULL para ganhos)',
  `source` VARCHAR(100) NULL COMMENT 'Origem da transação (ex: "quest_retweet", "meme_123", "feature_premium")',
  `description` VARCHAR(255) NULL COMMENT 'Descrição da transação',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_type` (`type`),
  INDEX `idx_created` (`created_at`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Meme Studio - Imagens Geradas
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_memes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_address` VARCHAR(44) NOT NULL,
  `prompt` TEXT NOT NULL COMMENT 'Prompt usado para gerar a imagem',
  `image_url` VARCHAR(500) NOT NULL COMMENT 'URL da imagem gerada (IPFS, Arweave, ou servidor)',
  `image_hash` VARCHAR(64) NULL COMMENT 'Hash da imagem para verificação',
  `top_text` VARCHAR(200) NULL COMMENT 'Texto superior do meme',
  `bottom_text` VARCHAR(200) NULL COMMENT 'Texto inferior do meme',
  `is_published` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Publicado no feed da comunidade',
  `publish_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Número de vezes publicado/compartilhado',
  `likes_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Curtidas recebidas',
  `shares_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Compartilhamentos',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_published` (`is_published`),
  INDEX `idx_created` (`created_at`),
  FULLTEXT `idx_prompt` (`prompt`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Quests (Missões)
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_quests` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `quest_key` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Identificador único da quest (ex: "retweet_pinned", "join_discord")',
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `reward_gems` INT UNSIGNED NOT NULL DEFAULT 0,
  `quest_type` ENUM('daily', 'weekly', 'one_time', 'recurring') NOT NULL DEFAULT 'daily',
  `verification_type` ENUM('manual', 'twitter_api', 'discord_api', 'wallet_balance', 'meme_creation', 'activity_based') NOT NULL DEFAULT 'manual',
  `verification_data` JSON NULL COMMENT 'Dados adicionais para verificação (ex: tweet_id, discord_user_id)',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_active` (`is_active`),
  INDEX `idx_type` (`quest_type`),
  INDEX `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Progresso de Quests dos Usuários
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_user_quests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_address` VARCHAR(44) NOT NULL,
  `quest_id` INT UNSIGNED NOT NULL,
  `status` ENUM('pending', 'in_progress', 'completed', 'claimed') NOT NULL DEFAULT 'pending',
  `progress` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Progresso atual (ex: 0-100)',
  `target` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Meta para completar',
  `completed_at` DATETIME NULL,
  `claimed_at` DATETIME NULL,
  `reset_date` DATE NULL COMMENT 'Data de reset para quests diárias/semanais',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_quest_reset` (`wallet_address`, `quest_id`, `reset_date`),
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_status` (`status`),
  INDEX `idx_reset` (`reset_date`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE,
  FOREIGN KEY (`quest_id`) REFERENCES `miao_quests`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Atividades Recentes (Log)
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_activities` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_address` VARCHAR(44) NOT NULL,
  `activity_type` ENUM('login', 'meme_created', 'meme_shared', 'quest_completed', 'level_up', 'hierarchy_up', 'referral', 'gem_earned', 'gem_spent') NOT NULL,
  `activity_data` JSON NULL COMMENT 'Dados adicionais da atividade',
  `gems_earned` INT NOT NULL DEFAULT 0 COMMENT 'Gems ganhas nesta atividade',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_type` (`activity_type`),
  INDEX `idx_created` (`created_at`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Admins
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_admins` (
  `admin_id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_address` VARCHAR(44) NOT NULL UNIQUE,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(64) NOT NULL COMMENT 'SHA256 hash',
  `email` VARCHAR(255) NULL,
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `permissions` JSON NULL COMMENT 'Permissões específicas',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` DATETIME NULL,
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_username` (`username`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Treasury Wallets
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_treasury_wallets` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Identificador único (ex: "treasure_chest", "burn_chest")',
  `wallet_address` VARCHAR(44) NOT NULL UNIQUE COMMENT 'Endereço da carteira Solana',
  `wallet_name` VARCHAR(200) NOT NULL COMMENT 'Nome do baú',
  `wallet_type` ENUM('treasury', 'burn', 'liquidity', 'operations', 'reserve', 'staking', 'rewards') NOT NULL,
  `description` TEXT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `current_balance_sol` DECIMAL(18, 9) NOT NULL DEFAULT 0,
  `current_balance_miao` DECIMAL(18, 9) NOT NULL DEFAULT 0,
  `last_balance_check` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_type` (`wallet_type`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Treasury Transactions
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_treasury_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `transaction_type` ENUM('incoming', 'outgoing', 'swap', 'burn', 'distribution', 'conversion') NOT NULL,
  `category` ENUM('shop', 'tools', 'games', 'general', 'treasury') NOT NULL DEFAULT 'general',
  `source_type` VARCHAR(100) NULL COMMENT 'Origem (ex: "shop_order", "tool_purchase", "game_entry")',
  `source_id` BIGINT UNSIGNED NULL COMMENT 'ID da origem',
  `reason` VARCHAR(200) NULL COMMENT 'Motivo específico',
  `reason_details` JSON NULL,
  `from_wallet_id` INT UNSIGNED NULL,
  `to_wallet_id` INT UNSIGNED NULL,
  `amount_sol` DECIMAL(18, 9) NOT NULL DEFAULT 0,
  `amount_miao` DECIMAL(18, 9) NOT NULL DEFAULT 0,
  `transaction_signature` VARCHAR(88) UNIQUE NULL,
  `swap_rate` DECIMAL(18, 9) NULL,
  `status` ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  `blockchain_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `executed_at` DATETIME NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_type` (`transaction_type`),
  INDEX `idx_category` (`category`),
  INDEX `idx_source` (`source_type`, `source_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_signature` (`transaction_signature`),
  FOREIGN KEY (`from_wallet_id`) REFERENCES `miao_treasury_wallets`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`to_wallet_id`) REFERENCES `miao_treasury_wallets`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Shop Products
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_shop_products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `product_key` VARCHAR(100) NOT NULL UNIQUE,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `short_description` VARCHAR(500) NULL,
  `category` ENUM('merchandise', 'digital', 'nft', 'access', 'collectible', 'other') NOT NULL DEFAULT 'merchandise',
  `sku` VARCHAR(100) UNIQUE NULL,
  `price_sol` DECIMAL(18, 9) NOT NULL,
  `price_gems` INT UNSIGNED NULL,
  `allows_gems` BOOLEAN NOT NULL DEFAULT FALSE,
  `stock_quantity` INT NULL,
  `image_url` VARCHAR(500) NULL,
  `image_urls` JSON NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `weight` DECIMAL(10, 2) NULL,
  `dimensions` JSON NULL,
  `metadata` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_active` (`is_active`),
  INDEX `idx_category` (`category`),
  INDEX `idx_featured` (`is_featured`),
  INDEX `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Shop Orders
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_shop_orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `wallet_address` VARCHAR(44) NOT NULL,
  `email` VARCHAR(255) NULL,
  `shipping_name` VARCHAR(200) NOT NULL,
  `shipping_address` TEXT NOT NULL,
  `shipping_city` VARCHAR(100) NOT NULL,
  `shipping_postal_code` VARCHAR(20) NOT NULL,
  `shipping_country` VARCHAR(100) NOT NULL,
  `shipping_phone` VARCHAR(50) NULL,
  `payment_method` ENUM('sol', 'gems') NOT NULL,
  `total_sol` DECIMAL(18, 9) NOT NULL DEFAULT 0,
  `total_gems` INT UNSIGNED NOT NULL DEFAULT 0,
  `shipping_cost_sol` DECIMAL(18, 9) NOT NULL DEFAULT 0,
  `subtotal_sol` DECIMAL(18, 9) NOT NULL DEFAULT 0,
  `status` ENUM('pending', 'payment_pending', 'payment_received', 'processing', 'preparing', 'shipped', 'in_transit', 'delivered', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
  `payment_status` ENUM('pending', 'partial', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `transaction_signature` VARCHAR(88) UNIQUE NULL,
  `treasury_transaction_id` BIGINT UNSIGNED NULL,
  `blockchain_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `verified_at` DATETIME NULL,
  `tracking_number` VARCHAR(100) NULL,
  `tracking_url` VARCHAR(500) NULL,
  `notes` TEXT NULL,
  `customer_notes` TEXT NULL,
  `admin_notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `paid_at` DATETIME NULL,
  `shipped_at` DATETIME NULL,
  `delivered_at` DATETIME NULL,
  `cancelled_at` DATETIME NULL,
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_status` (`status`),
  INDEX `idx_payment_status` (`payment_status`),
  INDEX `idx_order_number` (`order_number`),
  INDEX `idx_created` (`created_at`),
  INDEX `idx_treasury_transaction` (`treasury_transaction_id`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE RESTRICT,
  FOREIGN KEY (`treasury_transaction_id`) REFERENCES `miao_treasury_transactions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Shop Order Items
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_shop_order_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `product_name` VARCHAR(200) NOT NULL,
  `product_sku` VARCHAR(100) NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `unit_price_sol` DECIMAL(18, 9) NOT NULL,
  `unit_price_gems` INT UNSIGNED NULL,
  `total_price_sol` DECIMAL(18, 9) NOT NULL,
  `total_price_gems` INT UNSIGNED NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order` (`order_id`),
  INDEX `idx_product` (`product_id`),
  FOREIGN KEY (`order_id`) REFERENCES `miao_shop_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `miao_shop_products`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Shop Order History
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_shop_order_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `changed_by` VARCHAR(44) NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order` (`order_id`),
  INDEX `idx_created` (`created_at`),
  FOREIGN KEY (`order_id`) REFERENCES `miao_shop_orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Features/Premium
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_features` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `feature_key` VARCHAR(100) NOT NULL UNIQUE,
  `feature_name` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `category` ENUM('meme_studio', 'quests', 'profile', 'tools', 'premium') NOT NULL,
  `price_gems` INT UNSIGNED NULL,
  `price_miao` DECIMAL(18, 9) NULL,
  `payment_options` ENUM('gems_only', 'miao_only', 'both') NOT NULL DEFAULT 'both',
  `duration_days` INT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_active` (`is_active`),
  INDEX `idx_category` (`category`),
  INDEX `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: User Features
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_user_features` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_address` VARCHAR(44) NOT NULL,
  `feature_id` INT UNSIGNED NOT NULL,
  `payment_method` ENUM('gems', 'miao') NOT NULL,
  `category` ENUM('tools') NOT NULL DEFAULT 'tools',
  `reason` VARCHAR(200) NULL,
  `transaction_id` BIGINT UNSIGNED NULL,
  `gem_transaction_id` BIGINT UNSIGNED NULL,
  `treasury_transaction_id` BIGINT UNSIGNED NULL,
  `activated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_feature` (`feature_id`),
  INDEX `idx_active` (`is_active`, `expires_at`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE,
  FOREIGN KEY (`feature_id`) REFERENCES `miao_features`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Games
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_games` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `game_key` VARCHAR(100) NOT NULL UNIQUE,
  `game_name` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `game_url` VARCHAR(500) NULL,
  `entry_cost_gems` INT UNSIGNED NULL,
  `reward_gems` INT UNSIGNED NULL,
  `max_plays_per_day` INT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_active` (`is_active`),
  INDEX `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: User Game Progress
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_user_game_progress` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_address` VARCHAR(44) NOT NULL,
  `game_id` INT UNSIGNED NOT NULL,
  `best_score` INT NULL DEFAULT 0,
  `current_level` INT UNSIGNED NULL DEFAULT 1,
  `total_plays` INT UNSIGNED NOT NULL DEFAULT 0,
  `total_time_played` INT UNSIGNED NULL DEFAULT 0,
  `game_coins` INT UNSIGNED NULL DEFAULT 0,
  `lives` INT UNSIGNED NULL DEFAULT 0,
  `progress_data` JSON NULL,
  `last_played_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_game` (`wallet_address`, `game_id`),
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_game` (`game_id`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE,
  FOREIGN KEY (`game_id`) REFERENCES `miao_games`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: User Games (Histórico)
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_user_games` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_address` VARCHAR(44) NOT NULL,
  `game_id` INT UNSIGNED NOT NULL,
  `category` ENUM('games') NOT NULL DEFAULT 'games',
  `reason` VARCHAR(200) NULL,
  `session_id` VARCHAR(100) NULL,
  `score` INT NULL,
  `level_reached` INT UNSIGNED NULL,
  `time_played` INT UNSIGNED NULL,
  `gems_spent` INT UNSIGNED NULL,
  `gems_earned` INT UNSIGNED NULL,
  `sol_spent` DECIMAL(18, 9) NULL,
  `sol_earned` DECIMAL(18, 9) NULL,
  `treasury_transaction_id` BIGINT UNSIGNED NULL,
  `session_data` JSON NULL,
  `played_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_game` (`game_id`),
  INDEX `idx_treasury_transaction` (`treasury_transaction_id`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE,
  FOREIGN KEY (`game_id`) REFERENCES `miao_games`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`treasury_transaction_id`) REFERENCES `miao_treasury_transactions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Interações (Likes, Shares)
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_interactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `meme_id` BIGINT UNSIGNED NOT NULL,
  `wallet_address` VARCHAR(44) NOT NULL,
  `interaction_type` ENUM('like', 'share', 'report') NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_interaction` (`meme_id`, `wallet_address`, `interaction_type`),
  INDEX `idx_meme` (`meme_id`),
  INDEX `idx_wallet` (`wallet_address`),
  FOREIGN KEY (`meme_id`) REFERENCES `miao_memes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DADOS INICIAIS: Treasury Wallets
-- ============================================
INSERT INTO `miao_treasury_wallets` (`wallet_key`, `wallet_address`, `wallet_name`, `wallet_type`, `description`) VALUES
('treasure_chest', '', 'MIAO Treasure Chest', 'treasury', 'Baú do Tesouro Principal - Todas as transações do ecossistema passam por aqui'),
('burn_wallet', '', 'Burn Wallet', 'burn', 'Carteira para queimar tokens MIAO'),
('liquidity_pool', '', 'Liquidity Pool', 'liquidity', 'Pool de liquidez'),
('operations', '', 'Operations Wallet', 'operations', 'Carteira para operações do dia a dia'),
('reserve', '', 'Reserve Fund', 'reserve', 'Fundo de reserva'),
('staking', '', 'Staking Pool', 'staking', 'Pool de staking'),
('rewards', '', 'Rewards Wallet', 'rewards', 'Carteira para recompensas')
ON DUPLICATE KEY UPDATE `wallet_name` = VALUES(`wallet_name`);

-- ============================================
-- DADOS INICIAIS: Features Premium
-- ============================================
INSERT INTO `miao_features` (`feature_key`, `feature_name`, `description`, `category`, `price_gems`, `price_miao`, `payment_options`, `duration_days`, `sort_order`) VALUES
('premium_meme_generator', 'Premium Meme Generator', 'Acesso ilimitado ao gerador de memes com IA avançada', 'meme_studio', 1000, 100.0, 'both', 30, 1),
('unlimited_quests', 'Unlimited Quests', 'Pode completar todas as quests sem limite diário', 'quests', 500, 50.0, 'both', NULL, 2),
('premium_profile', 'Premium Profile Badge', 'Badge exclusivo no perfil', 'profile', 2000, 200.0, 'both', NULL, 3),
('advanced_tools', 'Advanced Tools Access', 'Acesso a ferramentas avançadas do MIAO Tools', 'tools', NULL, 500.0, 'miao_only', NULL, 4)
ON DUPLICATE KEY UPDATE `feature_name` = VALUES(`feature_name`);

-- ============================================
-- DADOS INICIAIS: Níveis
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_levels` (
  `level` INT UNSIGNED NOT NULL PRIMARY KEY,
  `required_gems` INT UNSIGNED NOT NULL,
  `title` VARCHAR(50) NULL,
  `benefits` JSON NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `miao_levels` (`level`, `required_gems`, `title`) VALUES
(1, 0, 'Novato'),
(2, 100, 'Iniciante'),
(3, 500, 'Aprendiz'),
(4, 1500, 'Veterano'),
(5, 3000, 'Expert'),
(6, 5000, 'Mestre'),
(7, 10000, 'Lenda')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- ============================================
-- DADOS INICIAIS: Hierarquias
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_hierarchies` (
  `hierarchy` ENUM('recruit', 'soldier', 'sergeant', 'captain', 'general', 'legend') NOT NULL PRIMARY KEY,
  `required_level` INT UNSIGNED NOT NULL,
  `required_gems` INT UNSIGNED NOT NULL,
  `title` VARCHAR(50) NOT NULL,
  `description` TEXT NULL,
  `benefits` JSON NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `miao_hierarchies` (`hierarchy`, `required_level`, `required_gems`, `title`, `description`, `benefits`) VALUES
('recruit', 1, 0, 'Recruit', 'Novo membro do exército Miao', JSON_OBJECT('daily_quest_limit', 3, 'meme_slots', 5, 'access_level', 'basic')),
('soldier', 2, 500, 'Soldier', 'Soldado dedicado do exército', JSON_OBJECT('daily_quest_limit', 5, 'meme_slots', 10, 'access_level', 'standard', 'quest_reward_bonus', 1.1)),
('sergeant', 3, 2000, 'Sergeant', 'Sargento experiente e confiável', JSON_OBJECT('daily_quest_limit', 7, 'meme_slots', 15, 'access_level', 'standard', 'quest_reward_bonus', 1.15, 'referral_bonus', 1.2)),
('captain', 4, 5000, 'Captain', 'Capitão respeitado e líder', JSON_OBJECT('daily_quest_limit', 10, 'meme_slots', 25, 'access_level', 'premium', 'quest_reward_bonus', 1.25, 'referral_bonus', 1.3, 'exclusive_features', JSON_ARRAY('advanced_tools', 'priority_support'))),
('general', 5, 15000, 'General', 'General do exército, comandante de elite', JSON_OBJECT('daily_quest_limit', 15, 'meme_slots', 50, 'access_level', 'premium', 'quest_reward_bonus', 1.5, 'referral_bonus', 1.5, 'exclusive_features', JSON_ARRAY('advanced_tools', 'priority_support', 'beta_access', 'governance_voting'))),
('legend', 6, 50000, 'Legend', 'Lenda do MIAO, membro fundador', JSON_OBJECT('daily_quest_limit', -1, 'meme_slots', -1, 'access_level', 'legendary', 'quest_reward_bonus', 2.0, 'referral_bonus', 2.0, 'exclusive_features', JSON_ARRAY('all_features', 'priority_support', 'beta_access', 'governance_voting', 'exclusive_nft', 'custom_badge'), 'special_title', 'MIAO Legend'))
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- ============================================================
-- PARTE 2: STORED PROCEDURES
-- ============================================================
-- ATENÇÃO: O DELIMITER $$ é OBRIGATÓRIO para criar stored procedures
-- Se o seu cliente SQL não suportar DELIMITER, execute cada stored procedure
-- separadamente através da interface do cliente (ex: phpMyAdmin, MySQL Workbench)
-- ============================================================

DELIMITER $$

-- ============================================================
-- PROCEDURE: sp_user_get_or_create
-- ============================================================
-- Cria usuário automaticamente se não existir na autenticação
-- SQL Injection Safe - Usa prepared statements
-- Compatível com MariaDB
-- ============================================================
DROP PROCEDURE IF EXISTS sp_user_get_or_create$$

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

-- ============================================================
-- PROCEDURE: sp_admin_check_wallet
-- ============================================================
DROP PROCEDURE IF EXISTS sp_admin_check_wallet$$

CREATE PROCEDURE sp_admin_check_wallet(
  IN p_wallet_address VARCHAR(44)
)
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
  WHERE wallet_address = LOWER(TRIM(p_wallet_address))
    AND status = 'active';
END$$

-- ============================================================
-- PROCEDURE: sp_admin_verify_credentials
-- ============================================================
DROP PROCEDURE IF EXISTS sp_admin_verify_credentials$$

CREATE PROCEDURE sp_admin_verify_credentials(
  IN p_username VARCHAR(50),
  IN p_password_hash VARCHAR(64)
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
    AND status = 'active';
END$$

-- ============================================================
-- PROCEDURE: sp_admin_update_last_login
-- ============================================================
DROP PROCEDURE IF EXISTS sp_admin_update_last_login$$

CREATE PROCEDURE sp_admin_update_last_login(
  IN p_admin_id INT UNSIGNED
)
BEGIN
  UPDATE miao_admins
  SET last_login = NOW()
  WHERE admin_id = p_admin_id;
END$$

-- ============================================================
-- PROCEDURE: sp_admin_create
-- ============================================================
DROP PROCEDURE IF EXISTS sp_admin_create$$

CREATE PROCEDURE sp_admin_create(
  IN p_wallet_address VARCHAR(44),
  IN p_username VARCHAR(50),
  IN p_password_hash VARCHAR(64),
  IN p_email VARCHAR(255),
  IN p_created_by INT UNSIGNED
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  INSERT INTO miao_admins (
    wallet_address,
    username,
    password_hash,
    email,
    status,
    created_at
  ) VALUES (
    LOWER(TRIM(p_wallet_address)),
    p_username,
    p_password_hash,
    p_email,
    'active',
    NOW()
  );

  COMMIT;
END$$

-- ============================================================
-- PROCEDURE: sp_admin_list_all
-- ============================================================
DROP PROCEDURE IF EXISTS sp_admin_list_all$$

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
END$$

-- ============================================================
-- PROCEDURE: sp_admin_get_all_users
-- ============================================================
DROP PROCEDURE IF EXISTS sp_admin_get_all_users$$

CREATE PROCEDURE sp_admin_get_all_users()
BEGIN
  SELECT 
    wallet_address,
    username,
    current_gems,
    level,
    hierarchy,
    created_at,
    last_activity
  FROM miao_users
  ORDER BY created_at DESC
  LIMIT 1000;
END$$

-- ============================================================
-- PROCEDURE: sp_admin_ban_user
-- ============================================================
DROP PROCEDURE IF EXISTS sp_admin_ban_user$$

CREATE PROCEDURE sp_admin_ban_user(
  IN p_wallet_address VARCHAR(44)
)
BEGIN
  -- Nota: Adicionar coluna 'status' na tabela miao_users se não existir
  -- Por enquanto, apenas atualizar last_activity como marcador
  UPDATE miao_users 
  SET last_activity = NULL
  WHERE wallet_address = LOWER(TRIM(p_wallet_address));
END$$

-- ============================================================
-- PROCEDURE: sp_admin_unban_user
-- ============================================================
DROP PROCEDURE IF EXISTS sp_admin_unban_user$$

CREATE PROCEDURE sp_admin_unban_user(
  IN p_wallet_address VARCHAR(44)
)
BEGIN
  UPDATE miao_users 
  SET last_activity = NOW()
  WHERE wallet_address = LOWER(TRIM(p_wallet_address));
END$$

-- ============================================================
-- PROCEDURE: sp_admin_delete_user
-- ============================================================
DROP PROCEDURE IF EXISTS sp_admin_delete_user$$

CREATE PROCEDURE sp_admin_delete_user(
  IN p_wallet_address VARCHAR(44)
)
BEGIN
  DELETE FROM miao_users
  WHERE wallet_address = LOWER(TRIM(p_wallet_address));
END$$

-- ============================================================
-- PROCEDURE: sp_admin_get_all_memes
-- ============================================================
DROP PROCEDURE IF EXISTS sp_admin_get_all_memes$$

CREATE PROCEDURE sp_admin_get_all_memes()
BEGIN
  SELECT 
    m.id,
    m.wallet_address,
    u.username,
    m.prompt,
    m.image_url,
    m.top_text,
    m.bottom_text,
    m.is_published,
    m.likes_count,
    m.shares_count,
    m.created_at
  FROM miao_memes m
  LEFT JOIN miao_users u ON m.wallet_address = u.wallet_address
  ORDER BY m.created_at DESC
  LIMIT 1000;
END$$

-- ============================================================
-- PROCEDURE: sp_admin_get_gems_history
-- ============================================================
DROP PROCEDURE IF EXISTS sp_admin_get_gems_history$$

CREATE PROCEDURE sp_admin_get_gems_history()
BEGIN
  SELECT 
    gt.id,
    gt.wallet_address,
    u.username,
    gt.amount,
    gt.type,
    gt.payment_method,
    gt.source,
    gt.description,
    gt.created_at
  FROM miao_gem_transactions gt
  LEFT JOIN miao_users u ON gt.wallet_address = u.wallet_address
  ORDER BY gt.created_at DESC
  LIMIT 1000;
END$$

DELIMITER ;

-- ============================================================
-- FIM DO SCRIPT COMPLETO
-- ============================================================
-- Execute este arquivo na sua base de dados MySQL
-- Todas as tabelas e stored procedures serão criadas
-- ============================================================
