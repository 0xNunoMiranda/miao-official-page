/**
 * Serviço para gerenciar autenticação e verificação de wallet
 */

export interface WalletAuthState {
  isAuthenticated: boolean
  wallet: string | null
  token: string | null
  isAdmin: boolean
}

const AUTH_STORAGE_KEY = 'miao_wallet_auth'
const TOKEN_STORAGE_KEY = 'miao_wallet_token'

/**
 * Salva o estado de autenticação no localStorage
 */
export function saveAuthState(state: WalletAuthState): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
    isAuthenticated: state.isAuthenticated,
    wallet: state.wallet,
    isAdmin: state.isAdmin,
  }))
  
  if (state.token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, state.token)
  }
}

/**
 * Carrega o estado de autenticação do localStorage
 */
export function loadAuthState(): WalletAuthState {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, wallet: null, token: null, isAdmin: false }
  }
  
  const authData = localStorage.getItem(AUTH_STORAGE_KEY)
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  
  if (!authData || !token) {
    return { isAuthenticated: false, wallet: null, token: null, isAdmin: false }
  }
  
  try {
    const parsed = JSON.parse(authData)
    return {
      isAuthenticated: parsed.isAuthenticated || false,
      wallet: parsed.wallet || null,
      token,
      isAdmin: parsed.isAdmin || false,
    }
  } catch {
    return { isAuthenticated: false, wallet: null, token: null, isAdmin: false }
  }
}

/**
 * Limpa o estado de autenticação
 */
export function clearAuthState(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(AUTH_STORAGE_KEY)
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

/**
 * Obtém o token de autenticação
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

/**
 * Verifica o status da wallet com a API
 * @param currentWallet - Wallet atualmente conectada no frontend
 * @returns Status da verificação
 */
export async function checkWalletStatus(currentWallet: string | null): Promise<{
  success: boolean
  action?: 'logout' | 'reconnect'
  message?: string
  error?: string
}> {
  const token = getAuthToken()
  
  if (!token) {
    return {
      success: false,
      action: 'logout',
      message: 'No authentication token found',
    }
  }

  try {
    const response = await fetch('/api/auth/wallet-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentWallet }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      // Se a API pedir logout, limpar estado
      if (data.action === 'logout') {
        clearAuthState()
      }
      
      return {
        success: false,
        action: data.action || 'logout',
        message: data.message || data.error || 'Wallet status check failed',
        error: data.error,
      }
    }

    return {
      success: true,
      message: data.message,
    }
  } catch (error) {
    console.error('Error checking wallet status:', error)
    return {
      success: false,
      action: 'logout',
      message: 'Failed to check wallet status',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Obtém a wallet atualmente conectada do window (Phantom, Solflare, etc)
 */
export function getCurrentConnectedWallet(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null)
      return
    }

    // Verificar Phantom (pode estar em window.solana ou window.phantom.solana)
    const phantomProvider = (window as any).solana?.isPhantom 
      ? (window as any).solana 
      : (window as any).phantom?.solana
    
    if (phantomProvider?.isPhantom && phantomProvider.publicKey) {
      resolve(phantomProvider.publicKey.toString())
      return
    }

    // Verificar Solflare
    if (window.solflare?.isSolflare && window.solflare.publicKey) {
      resolve(window.solflare.publicKey.toString())
      return
    }

    // Verificar Backpack
    if (window.backpack?.isBackpack && window.backpack.publicKey) {
      resolve(window.backpack.publicKey.toString())
      return
    }

    // Verificar MetaMask (Ethereum)
    if (window.ethereum?.isMetaMask) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          resolve(accounts[0] || null)
        })
        .catch(() => resolve(null))
      return
    }

    resolve(null)
  })
}

/**
 * Hook para verificar periodicamente o status da wallet
 * Retorna uma função para parar a verificação
 */
export function startWalletStatusChecker(
  onStatusChange: (status: { success: boolean; action?: string; message?: string }) => void,
  intervalMs: number = 10000 // Verificar a cada 10 segundos
): () => void {
  let intervalId: NodeJS.Timeout | null = null
  let isRunning = true

  const checkStatus = async () => {
    if (!isRunning) return

    const authState = loadAuthState()
    
    // Se não está autenticado, não precisa verificar
    if (!authState.isAuthenticated || !authState.wallet) {
      return
    }

    // Obter wallet atualmente conectada
    const currentWallet = await getCurrentConnectedWallet()
    
    // Verificar status com a API
    const status = await checkWalletStatus(currentWallet)
    
    // Se houve mudança, notificar
    if (!status.success || status.action) {
      onStatusChange(status)
    }
  }

  // Verificar imediatamente
  checkStatus()

  // Verificar periodicamente
  intervalId = setInterval(checkStatus, intervalMs)

  // Retornar função para parar
  return () => {
    isRunning = false
    if (intervalId) {
      clearInterval(intervalId)
    }
  }
}

// Declarações de tipos para window
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom: boolean
        publicKey?: { toString(): string }
        connect?: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>
      }
    }
    solana?: {
      isPhantom: boolean
      publicKey?: { toString(): string }
      connect?: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>
      isConnected?: boolean
    }
    solflare?: {
      isSolflare: boolean
      publicKey?: { toString(): string }
      connect?: () => Promise<void>
    }
    backpack?: {
      isBackpack: boolean
      publicKey?: { toString(): string }
      connect?: () => Promise<{ publicKey: { toString(): string } }>
    }
    ethereum?: {
      isMetaMask: boolean
      request: (args: { method: string }) => Promise<string[]>
    }
  }
}

