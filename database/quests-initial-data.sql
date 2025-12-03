-- ============================================
-- MIAO Tools - Quests Iniciais (Prontas para Uso)
-- ============================================
-- Este arquivo contém todas as quests prontas para uso
-- ============================================

-- ============================================
-- QUESTS DIÁRIAS
-- ============================================

-- 1. Criar Meme (Daily)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('daily_meme_creation', 'Criar 1 Meme', 'Use o Meme Studio para criar um meme incrível!', 10, 'daily', 'meme_creation', JSON_OBJECT('target', 1), 1);

-- 2. Partilhar Meme (Daily)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('daily_meme_share', 'Partilhar 1 Meme', 'Partilhe um meme no Twitter ou Telegram!', 15, 'daily', 'activity_based', JSON_OBJECT('activity_type', 'share', 'platform', 'twitter|telegram', 'target', 1), 2);

-- 3. Curtir Memes (Daily)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('daily_meme_likes', 'Curtir 3 Memes', 'Mostre amor à comunidade curtindo memes!', 5, 'daily', 'activity_based', JSON_OBJECT('activity_type', 'like', 'target', 3), 3);

-- 4. Retweet Post Fixado (Daily)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('daily_retweet_pinned', 'Retweet Post Fixado', 'Retweete o post fixado do @MIAO no Twitter!', 20, 'daily', 'twitter_api', JSON_OBJECT('action', 'retweet', 'tweet_id', 'pinned_tweet_id'), 4);

-- 5. Visitar Dashboard (Daily)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('daily_dashboard_visit', 'Visitar Dashboard', 'Acesse o MIAO Tools Dashboard!', 5, 'daily', 'activity_based', JSON_OBJECT('activity_type', 'dashboard_visit'), 5);

-- 6. Responder Poll (Daily)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('daily_poll_response', 'Responder Poll', 'Participe na comunidade respondendo a uma poll!', 10, 'daily', 'activity_based', JSON_OBJECT('activity_type', 'poll_response', 'target', 1), 6);

-- ============================================
-- QUESTS SEMANAIS
-- ============================================

-- 1. Criar 10 Memes (Weekly)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('weekly_meme_creation_10', 'Criar 10 Memes', 'Crie 10 memes incríveis esta semana!', 150, 'weekly', 'meme_creation', JSON_OBJECT('target', 10), 10);

-- 2. Partilhar 5 Memes (Weekly)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('weekly_meme_shares_5', 'Partilhar 5 Memes', 'Partilhe 5 memes nas redes sociais!', 100, 'weekly', 'activity_based', JSON_OBJECT('activity_type', 'share', 'target', 5), 11);

-- 3. Completar 7 Quests Diárias (Weekly)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('weekly_complete_7_dailies', 'Completar 7 Quests Diárias', 'Complete todas as quests diárias por 7 dias!', 200, 'weekly', 'activity_based', JSON_OBJECT('activity_type', 'daily_quest_completion', 'required_days', 7), 12);

-- 4. Alcançar 50 Likes (Weekly)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('weekly_50_likes', 'Alcançar 50 Likes', 'Seus memes devem receber 50 likes no total!', 120, 'weekly', 'activity_based', JSON_OBJECT('activity_type', 'total_likes_received', 'target', 50), 13);

-- 5. Criar Meme Viral (Weekly)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('weekly_viral_meme', 'Criar Meme Viral', 'Crie um meme que alcance 100+ likes!', 200, 'weekly', 'activity_based', JSON_OBJECT('activity_type', 'meme_likes', 'target_likes', 100), 14);

-- ============================================
-- QUESTS ONE-TIME
-- ============================================

-- 1. Primeira Conexão (One-Time)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('one_time_wallet_connect', 'Conectar Carteira', 'Conecte sua carteira pela primeira vez!', 50, 'one_time', 'activity_based', JSON_OBJECT('activity_type', 'wallet_connect', 'first_time', true), 20);

-- 2. Primeiro Meme (One-Time)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('one_time_first_meme', 'Criar Primeiro Meme', 'Crie seu primeiro meme no Meme Studio!', 100, 'one_time', 'meme_creation', JSON_OBJECT('first_meme', true), 21);

-- 3. Primeira Partilha (One-Time)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('one_time_first_share', 'Partilhar Primeiro Meme', 'Partilhe seu primeiro meme nas redes sociais!', 75, 'one_time', 'activity_based', JSON_OBJECT('activity_type', 'share', 'first_share', true), 22);

-- 4. Seguir no Twitter (One-Time)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('one_time_twitter_follow', 'Seguir @MIAO no Twitter', 'Siga @MIAO no Twitter para ficar atualizado!', 50, 'one_time', 'twitter_api', JSON_OBJECT('action', 'follow', 'username', '@MIAO'), 23);

-- 5. Entrar no Discord (One-Time)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('one_time_discord_join', 'Entrar no Discord', 'Junte-se à comunidade no Discord!', 50, 'one_time', 'discord_api', JSON_OBJECT('action', 'join_server', 'server_id', 'discord_server_id'), 24);

-- 6. Alcançar Nível 5 (One-Time)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('one_time_level_5', 'Alcançar Nível 5', 'Suba de nível e alcance o nível 5!', 200, 'one_time', 'activity_based', JSON_OBJECT('activity_type', 'level_up', 'target_level', 5), 25);

-- 7. Alcançar Nível 10 (One-Time)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('one_time_level_10', 'Alcançar Nível 10', 'Suba de nível e alcance o nível 10!', 500, 'one_time', 'activity_based', JSON_OBJECT('activity_type', 'level_up', 'target_level', 10), 26);

-- 8. Ter 1000 Gems (One-Time)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('one_time_1000_gems', 'Acumular 1000 Gems', 'Acumule 1000 gems através das suas atividades!', 500, 'one_time', 'activity_based', JSON_OBJECT('activity_type', 'gem_balance', 'target_gems', 1000), 27);

-- 9. Primeira Referência (One-Time)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('one_time_first_referral', 'Primeira Referência', 'Convide um amigo e ganhe gems!', 100, 'one_time', 'activity_based', JSON_OBJECT('activity_type', 'referral', 'first_referral', true), 28);

-- 10. Alcançar Hierarquia Recruta (One-Time)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('one_time_hierarchy_recruit', 'Alcançar Recruta', 'Alcance a hierarquia de Recruta!', 300, 'one_time', 'activity_based', JSON_OBJECT('activity_type', 'hierarchy_upgrade', 'target_hierarchy', 'recruit'), 29);

-- ============================================
-- QUESTS RECURRING
-- ============================================

-- 1. Criar Meme (Recurring)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('recurring_meme_creation', 'Criar Meme', 'Crie um meme e ganhe gems!', 5, 'recurring', 'meme_creation', JSON_OBJECT('target', 1), 30);

-- 2. Partilhar Meme (Recurring)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('recurring_meme_share', 'Partilhar Meme', 'Partilhe um meme e ganhe gems!', 10, 'recurring', 'activity_based', JSON_OBJECT('activity_type', 'share'), 31);

-- 3. Meme com 50 Likes (Recurring)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('recurring_meme_50_likes', 'Meme com 50 Likes', 'Crie um meme que alcance 50 likes!', 25, 'recurring', 'activity_based', JSON_OBJECT('activity_type', 'meme_likes', 'target_likes', 50), 32);

-- 4. Meme com 100 Likes (Recurring)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('recurring_meme_100_likes', 'Meme com 100 Likes', 'Crie um meme que alcance 100 likes!', 50, 'recurring', 'activity_based', JSON_OBJECT('activity_type', 'meme_likes', 'target_likes', 100), 33);

-- 5. Meme com 500 Likes (Recurring)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('recurring_meme_500_likes', 'Meme com 500 Likes', 'Crie um meme que alcance 500 likes!', 200, 'recurring', 'activity_based', JSON_OBJECT('activity_type', 'meme_likes', 'target_likes', 500), 34);

-- 6. Referenciar Usuário (Recurring)
INSERT INTO `miao_quests` (`quest_key`, `title`, `description`, `reward_gems`, `quest_type`, `verification_type`, `verification_data`, `sort_order`) VALUES
('recurring_referral', 'Referenciar Usuário', 'Convide um amigo e ganhe gems!', 50, 'recurring', 'activity_based', JSON_OBJECT('activity_type', 'referral'), 35);

-- ============================================
-- NOTAS
-- ============================================
-- 1. Atualizar 'pinned_tweet_id' e 'discord_server_id' com valores reais
-- 2. Ajustar reward_gems conforme necessário
-- 3. Adicionar mais quests conforme a necessidade
-- 4. Quests diárias resetam à meia-noite UTC
-- 5. Quests semanais resetam toda segunda-feira à meia-noite UTC
-- 6. Quests one-time são completadas apenas uma vez por usuário
-- 7. Quests recurring podem ser completadas múltiplas vezes

