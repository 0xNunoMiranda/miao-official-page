// EXEMPLO DE INTEGRAÇÃO - Como usar no ToolsPage.tsx

import React, { useState, useEffect } from "react"
import {
  getUserStats,
  initializeQuests,
  getUserQuests,
  claimQuestReward,
  createMeme,
  publishMeme,
  likeMeme,
  getMemesFeed,
  addGems,
} from "@/lib/miao-api"

export async function exampleInitializeUserOnConnect(walletAddress: string) {
  try {
    // 1. Inicializar quests diárias
    await initializeQuests(walletAddress, 'daily')

    // 2. Obter stats
    const stats = await getUserStats(walletAddress)
    console.log('User Stats:', stats)

    return stats
  } catch (error) {
    console.error('Error initializing user:', error)
  }
}

export async function exampleClaimQuestOnButton(walletAddress: string, questId: number) {
  try {
    // Reclamar recompensa
    const result = await claimQuestReward(walletAddress, questId)

    if (result.success) {
      const gemsEarned = result.data.gems_earned
      console.log(`✅ Quest claimed! +${gemsEarned} Gems`)

      // Atualizar UI
      return {
        success: true,
        gems: gemsEarned,
      }
    } else {
      console.error('Failed to claim quest:', result.error)
      return {
        success: false,
        error: result.error,
      }
    }
  } catch (error) {
    console.error('Error claiming quest:', error)
    return {
      success: false,
      error: 'Unknown error',
    }
  }
}

export async function exampleCreateAndPublishMeme(
  walletAddress: string,
  prompt: string,
  imageUrl: string,
  topText: string,
  bottomText: string
) {
  try {
    // 1. Criar meme
    const memeResult = await createMeme(walletAddress, prompt, imageUrl, topText, bottomText)

    if (!memeResult.success) {
      throw new Error(memeResult.error)
    }

    const memeId = memeResult.data.meme_id
    console.log(`✅ Meme created with ID: ${memeId}`)

    // 2. Publicar meme
    const publishResult = await publishMeme(memeId, walletAddress)

    if (!publishResult.success) {
      throw new Error(publishResult.error)
    }

    console.log(`✅ Meme published! +50 Gems`)

    // 3. Atualizar progresso da quest de meme_creation
    // (A SP já faz isso automaticamente ao criar)

    return {
      success: true,
      memeId,
      gemsEarned: 50,
    }
  } catch (error) {
    console.error('Error creating/publishing meme:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function exampleLikeMeme(walletAddress: string, memeId: number) {
  try {
    const result = await likeMeme(memeId, walletAddress)

    if (result.success) {
      console.log('✅ Meme liked!')
      return { success: true }
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Error liking meme:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function exampleGetMemesFeed(limit = 20, offset = 0) {
  try {
    const result = await getMemesFeed(limit, offset)

    if (result.success) {
      const memes = result.data
      console.log(`✅ Loaded ${memes.length} memes from feed`)
      return {
        success: true,
        memes,
      }
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Error loading memes feed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      memes: [],
    }
  }
}

// ============================================================
// INTEGRAÇÃO COMPLETA NO TOOLSPAGE
// ============================================================

export async function integrateWithToolsPage() {
  // No component, substituir os dados hardcoded:

  // ANTES:
  // const [points, setPoints] = useState(1250)

  // DEPOIS:
  const [points, setPoints] = useState(0)

  // useEffect para carregar stats ao conectar carteira:
  useEffect(() => {
    if (walletState.isConnected && walletState.address) {
      loadUserData()
    }
  }, [walletState.isConnected, walletState.address])

  const loadUserData = async () => {
    try {
      // 1. Inicializar quests se for primeira vez
      await initializeQuests(walletState.address, 'daily')
      await initializeQuests(walletState.address, 'weekly')

      // 2. Carregar stats
      const stats = await getUserStats(walletState.address)
      if (stats.success) {
        setPoints(stats.data.current_gems)
      }

      // 3. Carregar quests do usuário
      const questsResult = await getUserQuests(walletState.address)
      if (questsResult.success) {
        // Atualizar UI com quests
        setUserQuests(questsResult.data)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  // Substituir handleShareMeme:
  const handleShareMeme = async () => {
    try {
      // Publicar meme
      const result = await publishMeme(generatedImage, walletState.address)

      if (result.success) {
        // Adicionar 100 gems (já feito automaticamente, mas podemos refletir no UI)
        setPoints(p => p + 100)
        alert('Published to Community Feed! +100 MP')

        // Limpar form
        setTopText("")
        setBottomText("")
        setGeneratedImage(null)
        setPrompt("")
      } else {
        alert('Error publishing meme: ' + result.error)
      }
    } catch (error) {
      console.error('Error sharing meme:', error)
      alert('Error publishing meme')
    }
  }

  // Substituir clique em "CLAIM" na quest:
  const handleClaimQuestReward = async (questId: number, reward: number) => {
    try {
      const result = await claimQuestReward(walletState.address, questId)

      if (result.success) {
        setPoints(p => p + result.data.gems_earned)
        alert(`Quest Complete! +${result.data.gems_earned} Gems`)
      } else {
        alert('Failed to claim reward: ' + result.error)
      }
    } catch (error) {
      console.error('Error claiming reward:', error)
      alert('Error claiming reward')
    }
  }
}

// ============================================================
// EXEMPLO: INICIALIZAR QUESTS NO BANCO
// ============================================================

export function exampleInsertInitialQuests() {
  const sql = `
    -- Quests Diárias
    INSERT INTO miao_quests (quest_key, title, description, reward_gems, quest_type, verification_type, target_value) VALUES
    ('daily_meme_creation', 'Criar 1 Meme', 'Use o Meme Studio para criar um meme incrível!', 10, 'daily', 'meme_creation', 1),
    ('daily_meme_share', 'Partilhar 1 Meme', 'Partilhe um meme no Twitter ou Telegram!', 15, 'daily', 'activity_based', 1),
    ('daily_meme_likes', 'Curtir 3 Memes', 'Mostre amor à comunidade curtindo memes!', 5, 'daily', 'activity_based', 3),
    ('daily_retweet_pinned', 'Retweet Post Fixado', 'Retweete o post fixado do @MIAO no Twitter!', 20, 'daily', 'twitter_api', 1),
    ('daily_dashboard_visit', 'Visitar Dashboard', 'Acesse o MIAO Tools Dashboard!', 5, 'daily', 'activity_based', 1);

    -- Quests Semanais
    INSERT INTO miao_quests (quest_key, title, description, reward_gems, quest_type, verification_type, target_value) VALUES
    ('weekly_meme_creation_10', 'Criar 10 Memes', 'Crie 10 memes incríveis esta semana!', 150, 'weekly', 'meme_creation', 10),
    ('weekly_meme_shares_5', 'Partilhar 5 Memes', 'Partilhe 5 memes nas redes sociais!', 100, 'weekly', 'activity_based', 5);

    -- Quests One-Time
    INSERT INTO miao_quests (quest_key, title, description, reward_gems, quest_type, verification_type, target_value) VALUES
    ('onetime_first_meme', 'Criar Primeiro Meme', 'Crie seu primeiro meme e entre no Miao Army!', 50, 'one_time', 'meme_creation', 1),
    ('onetime_first_share', 'Primeira Partilha', 'Partilhe seu primeiro meme com o mundo!', 100, 'one_time', 'activity_based', 1),
    ('onetime_wallet_connect', 'Conectar Carteira', 'Conecte sua carteira ao MIAO Tools!', 25, 'one_time', 'activity_based', 1);
  `
  return sql
}

// ============================================================
// TIPO DE DADOS RETORNADOS
// ============================================================

export interface UserStats {
  id: number
  wallet_address: string
  current_gems: number
  current_level: number
  total_xp: number
  referral_code: string | null
  referred_by_wallet: string | null
  created_at: string
  memes_created: number
  quests_completed: number
  quests_claimed: number
  total_likes: number
  referrals_count: number
}

export interface Quest {
  id: number
  quest_key: string
  title: string
  description: string
  reward_gems: number
  quest_type: 'daily' | 'weekly' | 'one_time' | 'recurring'
  verification_type: string
  target_value: number
}

export interface UserQuest {
  id: number
  wallet_address: string
  quest_id: number
  quest_key: string
  title: string
  description: string
  reward_gems: number
  quest_type: string
  status: 'pending' | 'in_progress' | 'completed' | 'claimed'
  progress: number
  target: number
  completed_at: string | null
  claimed_at: string | null
  created_at: string
}

export interface Meme {
  id: number
  wallet_address: string
  prompt: string
  top_text: string | null
  bottom_text: string | null
  image_url: string
  is_published: boolean
  likes_count: number
  shares_count: number
  created_at: string
}

export interface Activity {
  id: number
  wallet_address: string
  activity_type: string
  activity_data: any
  gems_earned: number
  created_at: string
}

// ============================================================
// CICLO DE VIDA DO USUÁRIO
// ============================================================

/*
1. USUÁRIO CONECTA CARTEIRA
   ↓
   createOrGetUser(wallet) → cria entrada em miao_users
   ↓

2. INICIAR FERRAMENTAS
   ↓
   initializeQuests(wallet, 'daily') → cria quests diárias
   initializeQuests(wallet, 'weekly') → cria quests semanais
   ↓

3. USAR MEME STUDIO
   ↓
   createMeme(wallet, prompt, image) → cria meme + atualiza quest progress
   ↓
   publishMeme(memeId, wallet) → publica + adiciona 50 gems
   ↓
   likeMeme(memeId, wallet) → curte + registra atividade
   ↓

4. COMPLETAR QUESTS
   ↓
   claimQuestReward(wallet, questId) → adiciona gems + atualiza status
   ↓

5. REPETIR
   ↓
   Daily reset → initializeQuests(wallet, 'daily') novamente
*/
