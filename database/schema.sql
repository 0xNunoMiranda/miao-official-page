-- ============================================
-- MIAO TOOLS - Database Schema
-- ============================================
-- Estrutura modular com wallet address como identificador principal
-- ============================================

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
-- NOTA: Gems NÃO são transacionáveis entre usuários
-- São apenas pontos internos para gamificação
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
-- TABELA: Feed da Comunidade (Memes Publicados)
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_feed` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `meme_id` BIGINT UNSIGNED NOT NULL,
  `wallet_address` VARCHAR(44) NOT NULL,
  `featured_until` DATETIME NULL COMMENT 'Destaque até esta data',
  `is_featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_meme` (`meme_id`),
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_featured` (`is_featured`, `featured_until`),
  INDEX `idx_created` (`created_at`),
  FOREIGN KEY (`meme_id`) REFERENCES `miao_memes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Transações $MIAO (Pagamentos Reais)
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_token_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_address` VARCHAR(44) NOT NULL,
  `transaction_signature` VARCHAR(88) UNIQUE NULL COMMENT 'Assinatura da transação Solana',
  `amount` DECIMAL(18, 9) NOT NULL COMMENT 'Quantidade de $MIAO tokens',
  `type` ENUM('payment', 'purchase', 'feature_unlock', 'premium_access') NOT NULL,
  `feature_id` VARCHAR(100) NULL COMMENT 'ID da feature/ferramenta comprada',
  `feature_name` VARCHAR(200) NULL COMMENT 'Nome da feature',
  `status` ENUM('pending', 'confirmed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `blockchain_verified` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Verificado na blockchain',
  `verified_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_signature` (`transaction_signature`),
  INDEX `idx_status` (`status`),
  INDEX `idx_feature` (`feature_id`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Features/Premium (Configuração de Preços)
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_features` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `feature_key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Identificador único (ex: "premium_meme_generator", "unlimited_quests")',
  `feature_name` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `category` ENUM('meme_studio', 'quests', 'profile', 'tools', 'premium') NOT NULL,
  `price_gems` INT UNSIGNED NULL COMMENT 'Preço em gems (NULL se não aceitar gems)',
  `price_miao` DECIMAL(18, 9) NULL COMMENT 'Preço em $MIAO tokens (NULL se não aceitar $MIAO)',
  `payment_options` ENUM('gems_only', 'miao_only', 'both') NOT NULL DEFAULT 'both' COMMENT 'Opções de pagamento disponíveis',
  `duration_days` INT NULL COMMENT 'Duração em dias (NULL = permanente)',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_active` (`is_active`),
  INDEX `idx_category` (`category`),
  INDEX `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Features Ativas dos Usuários
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_user_features` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_address` VARCHAR(44) NOT NULL,
  `feature_id` INT UNSIGNED NOT NULL,
  `payment_method` ENUM('gems', 'miao') NOT NULL COMMENT 'Método usado para comprar',
  `category` ENUM('tools') NOT NULL DEFAULT 'tools' COMMENT 'Categoria: sempre tools',
  `reason` VARCHAR(200) NULL COMMENT 'Motivo: nome da feature/tool comprada',
  `transaction_id` BIGINT UNSIGNED NULL COMMENT 'ID da transação $MIAO (se aplicável)',
  `gem_transaction_id` BIGINT UNSIGNED NULL COMMENT 'ID da transação de gems (se aplicável)',
  `treasury_transaction_id` BIGINT UNSIGNED NULL COMMENT 'ID da transação treasury (se pagamento $MIAO)',
  `activated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NULL COMMENT 'Data de expiração (NULL = permanente)',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_feature` (`feature_id`),
  INDEX `idx_active` (`is_active`, `expires_at`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE,
  FOREIGN KEY (`feature_id`) REFERENCES `miao_features`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`transaction_id`) REFERENCES `miao_token_transactions`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`gem_transaction_id`) REFERENCES `miao_gem_transactions`(`id`) ON DELETE SET NULL,
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
-- TABELA: Níveis e Hierarquias (Configuração)
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_levels` (
  `level` INT UNSIGNED NOT NULL PRIMARY KEY,
  `required_gems` INT UNSIGNED NOT NULL COMMENT 'Gems necessárias para alcançar este nível',
  `title` VARCHAR(50) NULL COMMENT 'Título do nível',
  `benefits` JSON NULL COMMENT 'Benefícios deste nível'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `miao_hierarchies` (
  `hierarchy` ENUM('recruit', 'soldier', 'sergeant', 'captain', 'general', 'legend') NOT NULL PRIMARY KEY,
  `required_level` INT UNSIGNED NOT NULL,
  `required_gems` INT UNSIGNED NOT NULL,
  `title` VARCHAR(50) NOT NULL,
  `description` TEXT NULL,
  `benefits` JSON NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Polls (Votações da Comunidade)
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_polls` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `poll_key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Identificador único da poll',
  `title` VARCHAR(300) NOT NULL,
  `description` TEXT NULL,
  `question` TEXT NOT NULL COMMENT 'Pergunta da poll',
  `options` JSON NOT NULL COMMENT 'Array de opções: [{"id": 1, "text": "Opção 1"}, ...]',
  `reward_gems` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Gems por responder',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_public` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Visível para todos',
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NULL COMMENT 'NULL = sem data de término',
  `created_by` VARCHAR(44) NULL COMMENT 'Wallet do criador (NULL = sistema)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_active` (`is_active`, `start_date`, `end_date`),
  INDEX `idx_public` (`is_public`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Respostas de Polls
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_poll_responses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `poll_id` INT UNSIGNED NOT NULL,
  `wallet_address` VARCHAR(44) NOT NULL,
  `selected_option_id` INT NOT NULL COMMENT 'ID da opção selecionada',
  `gems_rewarded` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Gems recebidas',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_poll_user` (`poll_id`, `wallet_address`),
  INDEX `idx_poll` (`poll_id`),
  INDEX `idx_wallet` (`wallet_address`),
  FOREIGN KEY (`poll_id`) REFERENCES `miao_polls`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Recursos da Plataforma (Para Gastar Gems)
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_resources` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `resource_key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Identificador único (ex: "extra_meme_slot", "quest_boost", "profile_theme")',
  `resource_name` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `category` ENUM('meme_studio', 'quests', 'profile', 'tools', 'boost', 'cosmetic', 'game') NOT NULL,
  `cost_gems` INT UNSIGNED NULL COMMENT 'Custo em gems (NULL = não disponível com gems)',
  `cost_sol` DECIMAL(18, 9) NULL COMMENT 'Custo em SOL (NULL = não disponível com SOL)',
  `payment_options` ENUM('gems_only', 'sol_only', 'both') NOT NULL DEFAULT 'gems_only' COMMENT 'Opções de pagamento',
  `duration_days` INT NULL COMMENT 'Duração em dias (NULL = permanente ou consumível)',
  `is_consumable` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Se true, pode ser usado múltiplas vezes',
  `max_uses` INT NULL COMMENT 'Máximo de usos (NULL = ilimitado)',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_active` (`is_active`),
  INDEX `idx_category` (`category`),
  INDEX `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Recursos Comprados/Ativos dos Usuários
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_user_resources` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_address` VARCHAR(44) NOT NULL,
  `resource_id` INT UNSIGNED NOT NULL,
  `payment_method` ENUM('gems', 'sol') NOT NULL COMMENT 'Método de pagamento usado',
  `gem_transaction_id` BIGINT UNSIGNED NULL COMMENT 'ID da transação de gems (se pagamento com gems)',
  `treasury_transaction_id` BIGINT UNSIGNED NULL COMMENT 'ID da transação treasury (se pagamento com SOL)',
  `purchased_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NULL COMMENT 'Data de expiração (NULL = permanente)',
  `uses_remaining` INT NULL COMMENT 'Usos restantes (NULL = ilimitado)',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_resource` (`resource_id`),
  INDEX `idx_active` (`is_active`, `expires_at`),
  INDEX `idx_treasury_transaction` (`treasury_transaction_id`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE,
  FOREIGN KEY (`resource_id`) REFERENCES `miao_resources`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`gem_transaction_id`) REFERENCES `miao_gem_transactions`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`treasury_transaction_id`) REFERENCES `miao_treasury_transactions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Jogos (Para Futuro)
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_games` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `game_key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Identificador único do jogo',
  `game_name` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `game_url` VARCHAR(500) NULL COMMENT 'URL do jogo (iframe ou link)',
  `entry_cost_gems` INT UNSIGNED NULL COMMENT 'Custo em gems para jogar (NULL = grátis)',
  `reward_gems` INT UNSIGNED NULL COMMENT 'Gems ganhas ao completar (NULL = sem recompensa)',
  `max_plays_per_day` INT NULL COMMENT 'Máximo de jogadas por dia (NULL = ilimitado)',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_active` (`is_active`),
  INDEX `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Progresso de Jogos dos Usuários (Persistente)
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_user_game_progress` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_address` VARCHAR(44) NOT NULL,
  `game_id` INT UNSIGNED NOT NULL,
  `best_score` INT NULL DEFAULT 0 COMMENT 'Melhor pontuação alcançada',
  `current_level` INT UNSIGNED NULL DEFAULT 1 COMMENT 'Nível atual no jogo',
  `total_plays` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total de vezes jogado',
  `total_time_played` INT UNSIGNED NULL DEFAULT 0 COMMENT 'Tempo total jogado em segundos',
  `game_coins` INT UNSIGNED NULL DEFAULT 0 COMMENT 'Moedas do jogo acumuladas',
  `lives` INT UNSIGNED NULL DEFAULT 0 COMMENT 'Vidas disponíveis',
  `progress_data` JSON NULL COMMENT 'Dados específicos do jogo (níveis desbloqueados, conquistas, etc.)',
  `last_played_at` DATETIME NULL COMMENT 'Última vez que jogou',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_game` (`wallet_address`, `game_id`),
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_game` (`game_id`),
  INDEX `idx_best_score` (`game_id`, `best_score`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE,
  FOREIGN KEY (`game_id`) REFERENCES `miao_games`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Histórico de Jogadas (Sessões de Jogo)
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_user_games` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_address` VARCHAR(44) NOT NULL,
  `game_id` INT UNSIGNED NOT NULL,
  `category` ENUM('games') NOT NULL DEFAULT 'games' COMMENT 'Categoria: sempre games',
  `reason` VARCHAR(200) NULL COMMENT 'Motivo: nome do jogo',
  `session_id` VARCHAR(100) NULL COMMENT 'ID da sessão de jogo',
  `score` INT NULL COMMENT 'Pontuação desta jogada',
  `level_reached` INT UNSIGNED NULL COMMENT 'Nível alcançado nesta jogada',
  `time_played` INT UNSIGNED NULL COMMENT 'Tempo jogado nesta sessão (segundos)',
  `gems_spent` INT UNSIGNED NULL COMMENT 'Gems gastas para jogar',
  `gems_earned` INT UNSIGNED NULL COMMENT 'Gems ganhas',
  `sol_spent` DECIMAL(18, 9) NULL COMMENT 'SOL gasto (se aplicável)',
  `sol_earned` DECIMAL(18, 9) NULL COMMENT 'SOL ganho (se aplicável)',
  `treasury_transaction_id` BIGINT UNSIGNED NULL COMMENT 'ID da transação treasury (se pagamento SOL/MIAO)',
  `session_data` JSON NULL COMMENT 'Dados específicos da sessão (conquistas, itens coletados, etc.)',
  `played_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_game` (`game_id`),
  INDEX `idx_played` (`played_at`),
  INDEX `idx_session` (`session_id`),
  INDEX `idx_treasury_transaction` (`treasury_transaction_id`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE CASCADE,
  FOREIGN KEY (`game_id`) REFERENCES `miao_games`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`treasury_transaction_id`) REFERENCES `miao_treasury_transactions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DADOS INICIAIS: Features Premium (Exemplos)
-- ============================================
INSERT INTO `miao_features` (`feature_key`, `feature_name`, `description`, `category`, `price_gems`, `price_miao`, `payment_options`, `duration_days`, `sort_order`) VALUES
('premium_meme_generator', 'Premium Meme Generator', 'Acesso ilimitado ao gerador de memes com IA avançada', 'meme_studio', 1000, 100.0, 'both', 30, 1),
('unlimited_quests', 'Unlimited Quests', 'Pode completar todas as quests sem limite diário', 'quests', 500, 50.0, 'both', NULL, 2),
('premium_profile', 'Premium Profile Badge', 'Badge exclusivo no perfil', 'profile', 2000, 200.0, 'both', NULL, 3),
('advanced_tools', 'Advanced Tools Access', 'Acesso a ferramentas avançadas do MIAO Tools', 'tools', NULL, 500.0, 'miao_only', NULL, 4),
('exclusive_nft', 'Exclusive NFT Access', 'Acesso a NFTs exclusivos', 'premium', 5000, 1000.0, 'both', NULL, 5)
ON DUPLICATE KEY UPDATE `feature_name` = VALUES(`feature_name`);

-- ============================================
-- DADOS INICIAIS: Quests Padrão
-- ============================================
-- Quests iniciais movidas para database/quests-initial-data.sql
-- Execute esse arquivo para inserir todas as quests prontas
-- INSERT INTO `miao_quests` ... (ver database/quests-initial-data.sql)

-- ============================================
-- TABELA: Shop - Produtos/Itens
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_shop_products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `product_key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Identificador único do produto',
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `short_description` VARCHAR(500) NULL,
  `category` ENUM('merchandise', 'digital', 'nft', 'access', 'collectible', 'other') NOT NULL DEFAULT 'merchandise',
  `sku` VARCHAR(100) UNIQUE NULL COMMENT 'SKU do produto',
  `price_sol` DECIMAL(18, 9) NOT NULL COMMENT 'Preço em SOL (principal)',
  `price_gems` INT UNSIGNED NULL COMMENT 'Preço em gems (opcional, muito alto para desencorajar)',
  `allows_gems` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Se permite pagamento com gems',
  `stock_quantity` INT NULL COMMENT 'Quantidade em stock (NULL = ilimitado)',
  `image_url` VARCHAR(500) NULL COMMENT 'URL da imagem principal',
  `image_urls` JSON NULL COMMENT 'Array de URLs de imagens adicionais',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `weight` DECIMAL(10, 2) NULL COMMENT 'Peso para envio (kg)',
  `dimensions` JSON NULL COMMENT 'Dimensões: {"length": 10, "width": 5, "height": 3}',
  `metadata` JSON NULL COMMENT 'Dados adicionais do produto',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_active` (`is_active`),
  INDEX `idx_category` (`category`),
  INDEX `idx_featured` (`is_featured`),
  INDEX `idx_sort` (`sort_order`),
  FULLTEXT `idx_search` (`name`, `description`, `short_description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Shop - Encomendas/Pedidos
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_shop_orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Número da encomenda (ex: ORD-2024-001234)',
  `wallet_address` VARCHAR(44) NOT NULL,
  `email` VARCHAR(255) NULL COMMENT 'Email para notificações',
  `shipping_name` VARCHAR(200) NOT NULL,
  `shipping_address` TEXT NOT NULL,
  `shipping_city` VARCHAR(100) NOT NULL,
  `shipping_postal_code` VARCHAR(20) NOT NULL,
  `shipping_country` VARCHAR(100) NOT NULL,
  `shipping_phone` VARCHAR(50) NULL,
  `billing_same_as_shipping` BOOLEAN NOT NULL DEFAULT TRUE,
  `billing_name` VARCHAR(200) NULL,
  `billing_address` TEXT NULL,
  `billing_city` VARCHAR(100) NULL,
  `billing_postal_code` VARCHAR(20) NULL,
  `billing_country` VARCHAR(100) NULL,
  `payment_method` ENUM('sol', 'gems') NOT NULL,
  `total_sol` DECIMAL(18, 9) NOT NULL DEFAULT 0 COMMENT 'Total em SOL',
  `total_gems` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total em gems (se aplicável)',
  `shipping_cost_sol` DECIMAL(18, 9) NOT NULL DEFAULT 0 COMMENT 'Custo de envio em SOL',
  `subtotal_sol` DECIMAL(18, 9) NOT NULL DEFAULT 0 COMMENT 'Subtotal sem envio',
  `status` ENUM('pending', 'payment_pending', 'payment_received', 'processing', 'preparing', 'shipped', 'in_transit', 'delivered', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
  `payment_status` ENUM('pending', 'partial', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `transaction_signature` VARCHAR(88) UNIQUE NULL COMMENT 'Assinatura da transação Solana',
  `treasury_transaction_id` BIGINT UNSIGNED NULL COMMENT 'ID da transação treasury',
  `blockchain_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `verified_at` DATETIME NULL,
  `tracking_number` VARCHAR(100) NULL COMMENT 'Número de rastreamento',
  `tracking_url` VARCHAR(500) NULL COMMENT 'URL de rastreamento',
  `notes` TEXT NULL COMMENT 'Notas internas',
  `customer_notes` TEXT NULL COMMENT 'Notas do cliente',
  `admin_notes` TEXT NULL COMMENT 'Notas administrativas',
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
  INDEX `idx_transaction` (`transaction_signature`),
  INDEX `idx_treasury_transaction` (`treasury_transaction_id`),
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE RESTRICT,
  FOREIGN KEY (`treasury_transaction_id`) REFERENCES `miao_treasury_transactions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Shop - Itens da Encomenda
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_shop_order_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `product_name` VARCHAR(200) NOT NULL COMMENT 'Nome do produto no momento da compra',
  `product_sku` VARCHAR(100) NULL COMMENT 'SKU no momento da compra',
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `unit_price_sol` DECIMAL(18, 9) NOT NULL COMMENT 'Preço unitário em SOL no momento da compra',
  `unit_price_gems` INT UNSIGNED NULL COMMENT 'Preço unitário em gems (se aplicável)',
  `total_price_sol` DECIMAL(18, 9) NOT NULL COMMENT 'Preço total (unitário * quantidade)',
  `total_price_gems` INT UNSIGNED NULL COMMENT 'Preço total em gems (se aplicável)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order` (`order_id`),
  INDEX `idx_product` (`product_id`),
  FOREIGN KEY (`order_id`) REFERENCES `miao_shop_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `miao_shop_products`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Shop - Transações $SOL
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_shop_sol_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `order_id` BIGINT UNSIGNED NULL COMMENT 'ID da encomenda (se aplicável)',
  `wallet_address` VARCHAR(44) NOT NULL,
  `transaction_signature` VARCHAR(88) UNIQUE NOT NULL COMMENT 'Assinatura da transação Solana',
  `amount_sol` DECIMAL(18, 9) NOT NULL COMMENT 'Quantidade de SOL',
  `type` ENUM('payment', 'refund', 'partial_payment') NOT NULL DEFAULT 'payment',
  `category` ENUM('shop') NOT NULL DEFAULT 'shop' COMMENT 'Categoria: sempre shop',
  `reason` VARCHAR(200) NULL COMMENT 'Motivo: nome do produto comprado',
  `product_id` INT UNSIGNED NULL COMMENT 'ID do produto (referência)',
  `status` ENUM('pending', 'confirmed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `blockchain_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `verified_at` DATETIME NULL,
  `block_number` BIGINT NULL COMMENT 'Número do bloco',
  `fee_sol` DECIMAL(18, 9) NULL COMMENT 'Taxa de transação',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_order` (`order_id`),
  INDEX `idx_wallet` (`wallet_address`),
  INDEX `idx_signature` (`transaction_signature`),
  INDEX `idx_status` (`status`),
  INDEX `idx_category` (`category`),
  INDEX `idx_product` (`product_id`),
  INDEX `idx_created` (`created_at`),
  FOREIGN KEY (`order_id`) REFERENCES `miao_shop_orders`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`wallet_address`) REFERENCES `miao_users`(`wallet_address`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Shop - Histórico de Status
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_shop_order_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `status` VARCHAR(50) NOT NULL COMMENT 'Status anterior ou novo',
  `action` VARCHAR(100) NOT NULL COMMENT 'Ação realizada',
  `changed_by` VARCHAR(44) NULL COMMENT 'Wallet do admin que fez a mudança (NULL = sistema)',
  `notes` TEXT NULL COMMENT 'Notas sobre a mudança',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order` (`order_id`),
  INDEX `idx_created` (`created_at`),
  FOREIGN KEY (`order_id`) REFERENCES `miao_shop_orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Shop - Configurações
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_shop_settings` (
  `setting_key` VARCHAR(100) NOT NULL PRIMARY KEY,
  `setting_value` TEXT NULL,
  `setting_type` ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string',
  `description` VARCHAR(500) NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DADOS INICIAIS: Recursos (Para Gastar Gems)
-- ============================================
-- Exemplos de recursos (incluindo itens de jogo com pagamento híbrido)
-- Ver database/game-items-system.md para mais detalhes
INSERT INTO `miao_resources` (`resource_key`, `resource_name`, `description`, `category`, `cost_gems`, `cost_sol`, `payment_options`, `duration_days`, `is_consumable`, `max_uses`, `sort_order`) VALUES
-- Recursos gerais (principalmente gems)
('extra_meme_slot', 'Extra Meme Slot', 'Slot adicional para criar memes', 'meme_studio', 100, NULL, 'gems_only', NULL, FALSE, NULL, 1),
('quest_boost', 'Quest Boost', 'Aumenta recompensas de quests em 50% por 7 dias', 'quests', 500, NULL, 'gems_only', 7, FALSE, NULL, 2),
('profile_theme_premium', 'Premium Profile Theme', 'Tema exclusivo para o perfil', 'profile', 300, NULL, 'gems_only', NULL, FALSE, NULL, 3),
('meme_generator_boost', 'Meme Generator Boost', 'Acesso a prompts avançados por 1 dia', 'meme_studio', 200, NULL, 'gems_only', 1, FALSE, NULL, 4),
('daily_quest_reroll', 'Quest Reroll', 'Reroll uma quest diária (consumível)', 'quests', 50, NULL, 'gems_only', NULL, TRUE, 1, 5),
('profile_badge_special', 'Special Badge', 'Badge especial no perfil', 'cosmetic', 1000, NULL, 'gems_only', NULL, FALSE, NULL, 6),
-- Itens de jogo (pagamento híbrido: SOL principal, gems muito caro)
('game_skin_premium', 'Skin Premium', 'Skin exclusiva para o jogo', 'game', 50000, 0.5, 'both', NULL, FALSE, NULL, 7),
('game_xp_boost_7d', 'Boost de XP 7 Dias', 'Ganhe 2x XP por 7 dias', 'game', 10000, 0.1, 'both', 7, FALSE, NULL, 8),
('game_extra_lives_5', 'Vidas Extras (Pack de 5)', '5 vidas extras para usar no jogo', 'game', 5000, 0.05, 'both', NULL, TRUE, 5, 9),
('game_coins_1000', '1000 Moedas do Jogo', '1000 moedas para usar no jogo', 'game', 20000, 0.2, 'both', NULL, TRUE, 1, 10),
('game_power_up', 'Power Up', 'Power-up para jogos (consumível)', 'game', 15000, 0.15, 'both', NULL, TRUE, 1, 11)
ON DUPLICATE KEY UPDATE `resource_name` = VALUES(`resource_name`);

-- ============================================
-- TABELA: Treasure Chests (Baús do Tesouro)
-- ============================================
-- A carteira intermediária principal é o "Treasure Chest" do MIAO
-- Todas as transações do ecossistema passam pelo Treasure Chest
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_treasury_wallets` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wallet_key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Identificador único (ex: "treasure_chest", "burn_chest", "liquidity_chest")',
  `wallet_address` VARCHAR(44) NOT NULL UNIQUE COMMENT 'Endereço da carteira Solana',
  `wallet_name` VARCHAR(200) NOT NULL COMMENT 'Nome do baú (ex: "MIAO Treasure Chest", "Burn Chest")',
  `wallet_type` ENUM('treasury', 'burn', 'liquidity', 'operations', 'reserve', 'staking', 'rewards') NOT NULL,
  `description` TEXT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `current_balance_sol` DECIMAL(18, 9) NOT NULL DEFAULT 0 COMMENT 'Saldo atual em SOL (atualizado periodicamente)',
  `current_balance_miao` DECIMAL(18, 9) NOT NULL DEFAULT 0 COMMENT 'Saldo atual em MIAO (atualizado periodicamente)',
  `last_balance_check` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_type` (`wallet_type`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Regras de Distribuição de Fundos
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_fund_distribution_rules` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `rule_key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Identificador único (ex: "shop_payment", "token_swap", "burn_mechanism")',
  `rule_name` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `source_type` ENUM('shop_payment', 'token_swap', 'manual', 'automatic', 'burn_event') NOT NULL,
  `trigger_condition` JSON NULL COMMENT 'Condições que disparam esta regra',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `priority` INT NOT NULL DEFAULT 0 COMMENT 'Prioridade de execução (maior = primeiro)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_active` (`is_active`),
  INDEX `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Distribuições (Splits) de Fundos
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_fund_distributions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `rule_id` INT UNSIGNED NOT NULL,
  `wallet_id` INT UNSIGNED NOT NULL COMMENT 'Carteira de destino',
  `percentage` DECIMAL(5, 2) NOT NULL COMMENT 'Percentual do montante (0-100)',
  `fixed_amount_sol` DECIMAL(18, 9) NULL COMMENT 'Valor fixo em SOL (sobrescreve percentage se definido)',
  `fixed_amount_miao` DECIMAL(18, 9) NULL COMMENT 'Valor fixo em MIAO (sobrescreve percentage se definido)',
  `action_type` ENUM('transfer', 'burn', 'swap_miao_to_sol', 'swap_sol_to_miao', 'add_liquidity', 'stake', 'hold') NOT NULL DEFAULT 'transfer',
  `description` VARCHAR(500) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_rule` (`rule_id`),
  INDEX `idx_wallet` (`wallet_id`),
  FOREIGN KEY (`rule_id`) REFERENCES `miao_fund_distribution_rules`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`wallet_id`) REFERENCES `miao_treasury_wallets`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Transações Automáticas (Treasury)
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_treasury_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `transaction_type` ENUM('incoming', 'outgoing', 'swap', 'burn', 'distribution', 'conversion') NOT NULL,
  `category` ENUM('shop', 'tools', 'games', 'general', 'treasury') NOT NULL DEFAULT 'general' COMMENT 'Categoria: shop, tools, games',
  `source_type` VARCHAR(100) NULL COMMENT 'Origem (ex: "shop_order", "tool_purchase", "game_entry", "token_swap", "manual")',
  `source_id` BIGINT UNSIGNED NULL COMMENT 'ID da origem (ex: order_id, game_id, tool_id)',
  `reason` VARCHAR(200) NULL COMMENT 'Motivo específico (ex: "T-Shirt Black", "Premium Meme Generator", "MIAO Game #1")',
  `reason_details` JSON NULL COMMENT 'Detalhes do motivo: {"product_name": "...", "game_name": "...", "tool_name": "..."}',
  `from_wallet_id` INT UNSIGNED NULL COMMENT 'Carteira de origem',
  `to_wallet_id` INT UNSIGNED NULL COMMENT 'Carteira de destino',
  `amount_sol` DECIMAL(18, 9) NOT NULL DEFAULT 0,
  `amount_miao` DECIMAL(18, 9) NOT NULL DEFAULT 0,
  `transaction_signature` VARCHAR(88) UNIQUE NULL COMMENT 'Assinatura da transação Solana',
  `swap_rate` DECIMAL(18, 9) NULL COMMENT 'Taxa de câmbio usada (se swap)',
  `status` ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  `blockchain_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `executed_at` DATETIME NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_type` (`transaction_type`),
  INDEX `idx_category` (`category`),
  INDEX `idx_source` (`source_type`, `source_id`),
  INDEX `idx_from_wallet` (`from_wallet_id`),
  INDEX `idx_to_wallet` (`to_wallet_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_signature` (`transaction_signature`),
  INDEX `idx_category_source` (`category`, `source_type`),
  FOREIGN KEY (`from_wallet_id`) REFERENCES `miao_treasury_wallets`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`to_wallet_id`) REFERENCES `miao_treasury_wallets`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Execuções de Distribuição
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_distribution_executions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `rule_id` INT UNSIGNED NOT NULL,
  `source_type` VARCHAR(100) NOT NULL COMMENT 'Tipo da origem',
  `source_id` BIGINT UNSIGNED NOT NULL COMMENT 'ID da origem',
  `total_amount_sol` DECIMAL(18, 9) NOT NULL COMMENT 'Montante total recebido',
  `total_amount_miao` DECIMAL(18, 9) NOT NULL DEFAULT 0 COMMENT 'Montante total em MIAO (se aplicável)',
  `distribution_summary` JSON NOT NULL COMMENT 'Resumo da distribuição: [{"wallet": "...", "amount": 0.5, "percentage": 50, "action": "burn"}, ...]',
  `status` ENUM('pending', 'processing', 'completed', 'partial', 'failed') NOT NULL DEFAULT 'pending',
  `executed_at` DATETIME NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_rule` (`rule_id`),
  INDEX `idx_source` (`source_type`, `source_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`rule_id`) REFERENCES `miao_fund_distribution_rules`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: Detalhes de Execução de Distribuição
-- ============================================
CREATE TABLE IF NOT EXISTS `miao_distribution_execution_details` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `execution_id` BIGINT UNSIGNED NOT NULL,
  `distribution_id` INT UNSIGNED NOT NULL,
  `wallet_id` INT UNSIGNED NOT NULL,
  `calculated_amount_sol` DECIMAL(18, 9) NOT NULL COMMENT 'Valor calculado em SOL',
  `calculated_amount_miao` DECIMAL(18, 9) NOT NULL DEFAULT 0 COMMENT 'Valor calculado em MIAO',
  `actual_amount_sol` DECIMAL(18, 9) NULL COMMENT 'Valor real transferido (após execução)',
  `actual_amount_miao` DECIMAL(18, 9) NULL COMMENT 'Valor real em MIAO (após execução)',
  `action_type` ENUM('transfer', 'burn', 'swap_miao_to_sol', 'swap_sol_to_miao', 'add_liquidity', 'stake', 'hold') NOT NULL,
  `transaction_signature` VARCHAR(88) NULL COMMENT 'Assinatura da transação (se executada)',
  `status` ENUM('pending', 'completed', 'failed', 'skipped') NOT NULL DEFAULT 'pending',
  `executed_at` DATETIME NULL,
  `error_message` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_execution` (`execution_id`),
  INDEX `idx_distribution` (`distribution_id`),
  INDEX `idx_wallet` (`wallet_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`execution_id`) REFERENCES `miao_distribution_executions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`distribution_id`) REFERENCES `miao_fund_distributions`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`wallet_id`) REFERENCES `miao_treasury_wallets`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DADOS INICIAIS: Carteiras Intermediárias
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
-- DADOS INICIAIS: Regras de Distribuição
-- ============================================
INSERT INTO `miao_fund_distribution_rules` (`rule_key`, `rule_name`, `description`, `source_type`, `priority`) VALUES
('shop_payment_sol', 'Shop Payment (SOL)', 'Distribuição quando alguém paga em SOL na shop', 'shop_payment', 10),
('shop_payment_gems', 'Shop Payment (Gems)', 'Distribuição quando alguém paga com gems na shop', 'shop_payment', 9),
('token_swap', 'Token Swap', 'Distribuição em swaps de tokens', 'token_swap', 8),
('burn_mechanism', 'Burn Mechanism', 'Mecanismo automático de queima', 'burn_event', 7)
ON DUPLICATE KEY UPDATE `rule_name` = VALUES(`rule_name`);

-- ============================================
-- DADOS INICIAIS: Distribuições (Splits)
-- ============================================
-- Exemplo: Shop Payment (SOL) - 30% burn, 40% treasury, 20% liquidity, 10% operations
-- ============================================
INSERT INTO `miao_fund_distributions` 
  (`rule_id`, `wallet_id`, `percentage`, `action_type`, `description`, `sort_order`)
SELECT 
  r.id,
  w.id,
  CASE w.wallet_key
    WHEN 'burn_wallet' THEN 30.0
    WHEN 'treasure_chest' THEN 40.0
    WHEN 'liquidity_pool' THEN 20.0
    WHEN 'operations' THEN 10.0
    ELSE 0
  END,
  CASE w.wallet_key
    WHEN 'burn_wallet' THEN 'burn'
    WHEN 'liquidity_pool' THEN 'add_liquidity'
    ELSE 'transfer'
  END,
  CASE w.wallet_key
    WHEN 'burn_wallet' THEN '30% do pagamento será usado para queimar MIAO'
    WHEN 'treasure_chest' THEN '40% vai para o MIAO Treasure Chest'
    WHEN 'liquidity_pool' THEN '20% adicionado à pool de liquidez'
    WHEN 'operations' THEN '10% para operações do dia a dia'
    ELSE NULL
  END,
  CASE w.wallet_key
    WHEN 'burn_wallet' THEN 1
    WHEN 'main_treasury' THEN 2
    WHEN 'liquidity_pool' THEN 3
    WHEN 'operations' THEN 4
    ELSE 0
  END
FROM miao_fund_distribution_rules r
CROSS JOIN miao_treasury_wallets w
WHERE r.rule_key = 'shop_payment_sol'
  AND w.wallet_key IN ('burn_wallet', 'treasure_chest', 'liquidity_pool', 'operations')
ON DUPLICATE KEY UPDATE 
  `percentage` = VALUES(`percentage`),
  `action_type` = VALUES(`action_type`),
  `description` = VALUES(`description`);

-- ============================================
-- DADOS INICIAIS: Shop Settings
-- ============================================
INSERT INTO `miao_shop_settings` (`setting_key`, `setting_value`, `setting_type`, `description`) VALUES
('shop_name', 'MIAO Shop', 'string', 'Nome da loja'),
('shop_email', 'shop@miaotoken.vip', 'string', 'Email da loja'),
('sol_wallet_address', '', 'string', 'Endereço da carteira SOL para receber pagamentos'),
('gems_multiplier', '100', 'number', 'Multiplicador para preços em gems (preço SOL * multiplicador)'),
('free_shipping_threshold_sol', '50', 'number', 'Valor mínimo em SOL para frete grátis'),
('default_shipping_cost_sol', '5', 'number', 'Custo padrão de envio em SOL'),
('order_prefix', 'ORD', 'string', 'Prefixo do número da encomenda'),
('auto_verify_payments', 'true', 'boolean', 'Verificar automaticamente pagamentos na blockchain'),
('admin_wallets', '[]', 'json', 'Array de wallets de administradores')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- ============================================
-- DADOS INICIAIS: Níveis
-- ============================================
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
-- Hierarquias do Exército Miao com níveis e gems necessárias
-- ============================================
INSERT INTO `miao_hierarchies` (`hierarchy`, `required_level`, `required_gems`, `title`, `description`, `benefits`) VALUES
('recruit', 1, 0, 'Recruit', 'Novo membro do exército Miao', JSON_OBJECT(
  'daily_quest_limit', 3,
  'meme_slots', 5,
  'access_level', 'basic'
)),
('soldier', 2, 500, 'Soldier', 'Soldado dedicado do exército', JSON_OBJECT(
  'daily_quest_limit', 5,
  'meme_slots', 10,
  'access_level', 'standard',
  'quest_reward_bonus', 1.1
)),
('sergeant', 3, 2000, 'Sergeant', 'Sargento experiente e confiável', JSON_OBJECT(
  'daily_quest_limit', 7,
  'meme_slots', 15,
  'access_level', 'standard',
  'quest_reward_bonus', 1.15,
  'referral_bonus', 1.2
)),
('captain', 4, 5000, 'Captain', 'Capitão respeitado e líder', JSON_OBJECT(
  'daily_quest_limit', 10,
  'meme_slots', 25,
  'access_level', 'premium',
  'quest_reward_bonus', 1.25,
  'referral_bonus', 1.3,
  'exclusive_features', JSON_ARRAY('advanced_tools', 'priority_support')
)),
('general', 5, 15000, 'General', 'General do exército, comandante de elite', JSON_OBJECT(
  'daily_quest_limit', 15,
  'meme_slots', 50,
  'access_level', 'premium',
  'quest_reward_bonus', 1.5,
  'referral_bonus', 1.5,
  'exclusive_features', JSON_ARRAY('advanced_tools', 'priority_support', 'beta_access', 'governance_voting')
)),
('legend', 6, 50000, 'Legend', 'Lenda do MIAO, membro fundador', JSON_OBJECT(
  'daily_quest_limit', -1,
  'meme_slots', -1,
  'access_level', 'legendary',
  'quest_reward_bonus', 2.0,
  'referral_bonus', 2.0,
  'exclusive_features', JSON_ARRAY('all_features', 'priority_support', 'beta_access', 'governance_voting', 'exclusive_nft', 'custom_badge'),
  'special_title', 'MIAO Legend'
))
ON DUPLICATE KEY UPDATE 
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `benefits` = VALUES(`benefits`);

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

