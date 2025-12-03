-- ============================================
-- MIAO TOOLS - Example Queries
-- ============================================

-- ============================================
-- 1. OBTER DADOS COMPLETOS DO USUÁRIO
-- ============================================
SELECT 
  u.*,
  h.title as hierarchy_title,
  h.description as hierarchy_description,
  COUNT(DISTINCT m.id) as total_memes,
  COUNT(DISTINCT CASE WHEN m.is_published = 1 THEN m.id END) as published_memes,
  COUNT(DISTINCT uq.id) as active_quests,
  COUNT(DISTINCT CASE WHEN uq.status = 'completed' THEN uq.id END) as completed_quests
FROM miao_users u
LEFT JOIN miao_hierarchies h ON u.hierarchy = h.hierarchy
LEFT JOIN miao_memes m ON u.wallet_address = m.wallet_address
LEFT JOIN miao_user_quests uq ON u.wallet_address = uq.wallet_address
WHERE u.wallet_address = ?
GROUP BY u.wallet_address;

-- ============================================
-- 2. HISTÓRICO DE GEMS (ÚLTIMAS 50)
-- ============================================
SELECT 
  amount,
  type,
  source,
  description,
  created_at
FROM miao_gem_transactions
WHERE wallet_address = ?
ORDER BY created_at DESC
LIMIT 50;

-- ============================================
-- 3. MEMES DO USUÁRIO (ORDENADOS POR DATA)
-- ============================================
SELECT 
  id,
  prompt,
  image_url,
  top_text,
  bottom_text,
  is_published,
  likes_count,
  shares_count,
  created_at
FROM miao_memes
WHERE wallet_address = ?
ORDER BY created_at DESC;

-- ============================================
-- 4. FEED DA COMUNIDADE (MEMES PUBLICADOS)
-- ============================================
SELECT 
  m.id,
  m.wallet_address,
  u.username,
  u.avatar_url,
  m.image_url,
  m.top_text,
  m.bottom_text,
  m.likes_count,
  m.shares_count,
  m.created_at,
  f.is_featured
FROM miao_feed f
JOIN miao_memes m ON f.meme_id = m.id
JOIN miao_users u ON m.wallet_address = u.wallet_address
WHERE m.is_published = 1
ORDER BY f.is_featured DESC, m.created_at DESC
LIMIT 20;

-- ============================================
-- 5. QUESTS DISPONÍVEIS E PROGRESSO
-- ============================================
SELECT 
  q.id,
  q.quest_key,
  q.title,
  q.description,
  q.reward_gems,
  q.quest_type,
  COALESCE(uq.status, 'pending') as status,
  COALESCE(uq.progress, 0) as progress,
  COALESCE(uq.target, 1) as target,
  uq.completed_at,
  uq.claimed_at
FROM miao_quests q
LEFT JOIN miao_user_quests uq ON q.id = uq.quest_id 
  AND uq.wallet_address = ?
  AND (uq.reset_date = CURDATE() OR q.quest_type != 'daily')
WHERE q.is_active = 1
ORDER BY q.sort_order;

-- ============================================
-- 6. ATIVIDADES RECENTES
-- ============================================
SELECT 
  activity_type,
  activity_data,
  gems_earned,
  created_at
FROM miao_activities
WHERE wallet_address = ?
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- 7. ADICIONAR GEMS E REGISTRAR TRANSAÇÃO
-- NOTA: Gems são apenas pontos internos, NÃO transacionáveis
-- ============================================
START TRANSACTION;

-- Atualizar gems do usuário
UPDATE miao_users 
SET 
  current_gems = current_gems + ?,
  total_gems = total_gems + ?,
  updated_at = NOW()
WHERE wallet_address = ?;

-- Registrar transação
INSERT INTO miao_gem_transactions 
  (wallet_address, amount, type, source, description)
VALUES 
  (?, ?, ?, ?, ?);

-- Registrar atividade
INSERT INTO miao_activities 
  (wallet_address, activity_type, gems_earned, activity_data)
VALUES 
  (?, 'gem_earned', ?, JSON_OBJECT('source', ?, 'type', ?));

COMMIT;

-- ============================================
-- 8. VERIFICAR E ATUALIZAR NÍVEL/HIERARQUIA
-- ============================================
-- Verificar nível
SELECT level, required_gems 
FROM miao_levels 
WHERE required_gems <= (
  SELECT current_gems FROM miao_users WHERE wallet_address = ?
)
ORDER BY level DESC 
LIMIT 1;

-- Verificar hierarquia
SELECT hierarchy, required_level, required_gems
FROM miao_hierarchies
WHERE required_level <= (
  SELECT level FROM miao_users WHERE wallet_address = ?
)
AND required_gems <= (
  SELECT current_gems FROM miao_users WHERE wallet_address = ?
)
ORDER BY required_level DESC, required_gems DESC
LIMIT 1;

-- ============================================
-- 9. CRIAR MEME E ADICIONAR GEMS
-- ============================================
START TRANSACTION;

-- Criar meme
INSERT INTO miao_memes 
  (wallet_address, prompt, image_url, image_hash, top_text, bottom_text)
VALUES 
  (?, ?, ?, ?, ?, ?);

SET @meme_id = LAST_INSERT_ID();

-- Adicionar gems por criação
UPDATE miao_users 
SET 
  current_gems = current_gems + 50,
  total_gems = total_gems + 50
WHERE wallet_address = ?;

-- Registrar transação
INSERT INTO miao_gem_transactions 
  (wallet_address, amount, type, source, description)
VALUES 
  (?, 50, 'meme_creation', CONCAT('meme_', @meme_id), 'Meme created');

-- Registrar atividade
INSERT INTO miao_activities 
  (wallet_address, activity_type, gems_earned, activity_data)
VALUES 
  (?, 'meme_created', 50, JSON_OBJECT('meme_id', @meme_id));

COMMIT;

-- ============================================
-- 10. COMPLETAR QUEST E RECLAMAR RECOMPENSA
-- ============================================
START TRANSACTION;

-- Obter dados da quest
SELECT reward_gems INTO @reward FROM miao_quests WHERE id = ?;

-- Atualizar status da quest
UPDATE miao_user_quests
SET 
  status = 'claimed',
  claimed_at = NOW()
WHERE wallet_address = ? AND quest_id = ? AND status = 'completed';

-- Adicionar gems
UPDATE miao_users 
SET 
  current_gems = current_gems + @reward,
  total_gems = total_gems + @reward
WHERE wallet_address = ?;

-- Registrar transação
INSERT INTO miao_gem_transactions 
  (wallet_address, amount, type, source, description)
VALUES 
  (?, @reward, 'quest', CONCAT('quest_', ?), 'Quest reward claimed');

-- Registrar atividade
INSERT INTO miao_activities 
  (wallet_address, activity_type, gems_earned, activity_data)
VALUES 
  (?, 'quest_completed', @reward, JSON_OBJECT('quest_id', ?));

COMMIT;

