// lib/miao-api.ts - Helper para chamadas à API MIAO Tools

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

interface ApiResponse<T = any> {
  success?: boolean
  error?: string
  data?: T
}

async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE}/api${endpoint}`
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (body && method === 'POST') {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Unknown error',
      }
    }

    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error('API call failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Request failed',
    }
  }
}

// --- USER ---
export async function createOrGetUser(walletAddress: string) {
  return apiCall('/user', 'POST', { wallet_address: walletAddress })
}

export async function getUser(walletAddress: string) {
  return apiCall(`/user/${walletAddress}`)
}

export async function getUserStats(walletAddress: string) {
  return apiCall(`/user/${walletAddress}/stats`)
}

// --- GEMS ---
export async function getGems(walletAddress: string) {
  return apiCall(`/user/${walletAddress}/gems`)
}

export async function addGems(walletAddress: string, amount: number, reason?: string) {
  return apiCall(`/user/${walletAddress}/gems`, 'POST', {
    gems_amount: amount,
    reason: reason || 'Manual addition',
  })
}

export async function getGemsHistory(walletAddress: string, limit = 50) {
  return apiCall(`/user/${walletAddress}/gems/history?limit=${limit}`)
}

// --- QUESTS ---
export async function getAvailableQuests(questType?: string) {
  const query = questType ? `?type=${questType}` : ''
  return apiCall(`/quests${query}`)
}

export async function getUserQuests(walletAddress: string, status?: string) {
  const query = status ? `?status=${status}` : ''
  return apiCall(`/user/${walletAddress}/quests${query}`)
}

export async function initializeQuests(walletAddress: string, questType: 'daily' | 'weekly') {
  return apiCall(`/user/${walletAddress}/quests`, 'POST', { quest_type: questType })
}

export async function claimQuestReward(walletAddress: string, questId: number) {
  return apiCall(`/user/${walletAddress}/quests/${questId}/claim`, 'POST', {})
}

// --- MEMES ---
export async function createMeme(
  walletAddress: string,
  prompt: string,
  imageUrl: string,
  topText?: string,
  bottomText?: string
) {
  return apiCall('/memes', 'POST', {
    wallet_address: walletAddress,
    prompt,
    top_text: topText,
    bottom_text: bottomText,
    image_url: imageUrl,
  })
}

export async function getUserMemes(walletAddress: string, publishedOnly = false, limit = 50) {
  return apiCall(`/memes?wallet=${walletAddress}&published=${publishedOnly}&limit=${limit}`)
}

export async function publishMeme(memeId: number, walletAddress: string) {
  return apiCall(`/memes/${memeId}/publish`, 'POST', {
    wallet_address: walletAddress,
  })
}

export async function getMemesFeed(limit = 20, offset = 0) {
  return apiCall(`/feed?limit=${limit}&offset=${offset}`)
}

export async function likeMeme(memeId: number, walletAddress: string) {
  return apiCall(`/memes/${memeId}/like`, 'POST', {
    wallet_address: walletAddress,
  })
}

// --- ACTIVITIES ---
export async function getUserActivities(walletAddress: string, limit = 20) {
  return apiCall(`/user/${walletAddress}/activities?limit=${limit}`)
}
