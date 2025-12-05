"use client"

import { useEffect, useState, useCallback } from 'react'
import {
  checkWalletStatus,
  getCurrentConnectedWallet,
  loadAuthState,
  clearAuthState,
  startWalletStatusChecker,
  type WalletAuthState,
} from './wallet-auth-service'

export interface UseWalletAuthReturn {
  authState: WalletAuthState
  isChecking: boolean
  error: string | null
  warning: string | null
  checkStatus: () => Promise<void>
  logout: () => void
}

/**
 * Hook para gerenciar autenticação de wallet com verificação automática
 * Verifica periodicamente se a wallet mudou ou foi desconectada
 */
export function useWalletAuth(
  options?: {
    checkInterval?: number // Intervalo em ms para verificar (padrão: 10s)
    autoCheck?: boolean // Se deve verificar automaticamente (padrão: true)
  }
): UseWalletAuthReturn {
  const [authState, setAuthState] = useState<WalletAuthState>(() => loadAuthState())
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  const checkStatus = useCallback(async () => {
    if (!authState.isAuthenticated || !authState.wallet) {
      return
    }

    setIsChecking(true)
    setError(null)
    setWarning(null)

    try {
      const currentWallet = await getCurrentConnectedWallet()
      const status = await checkWalletStatus(currentWallet)

      if (!status.success) {
        if (status.action === 'logout') {
          setError(status.message || 'Wallet authentication failed')
          setAuthState({ isAuthenticated: false, wallet: null, token: null, isAdmin: false })
          clearAuthState()
        } else {
          setWarning(status.message || 'Wallet status check failed')
        }
      } else {
        // Status OK, limpar avisos
        setError(null)
        setWarning(null)
      }
    } catch (err) {
      console.error('Error checking wallet status:', err)
      setWarning('Failed to check wallet status')
    } finally {
      setIsChecking(false)
    }
  }, [authState.isAuthenticated, authState.wallet])

  const logout = useCallback(() => {
    clearAuthState()
    setAuthState({ isAuthenticated: false, wallet: null, token: null, isAdmin: false })
    setError(null)
    setWarning(null)
  }, [])

  // Carregar estado inicial
  useEffect(() => {
    const state = loadAuthState()
    setAuthState(state)
  }, [])

  // Verificação automática periódica
  useEffect(() => {
    if (!options?.autoCheck && options?.autoCheck !== undefined) {
      return
    }

    if (!authState.isAuthenticated || !authState.wallet) {
      return
    }

    const stopChecker = startWalletStatusChecker(
      (status) => {
        if (!status.success) {
          if (status.action === 'logout') {
            setError(status.message || 'Wallet authentication failed')
            setAuthState({ isAuthenticated: false, wallet: null, token: null, isAdmin: false })
            clearAuthState()
          } else {
            setWarning(status.message || 'Wallet status check failed')
          }
        } else {
          setError(null)
          setWarning(null)
        }
      },
      options?.checkInterval || 10000
    )

    return () => {
      stopChecker()
    }
  }, [authState.isAuthenticated, authState.wallet, options?.checkInterval, options?.autoCheck])

  // Verificar quando a wallet muda (listener de eventos da wallet)
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.wallet) {
      return
    }

    const handleWalletChange = async () => {
      const currentWallet = await getCurrentConnectedWallet()
      if (currentWallet && currentWallet.toLowerCase() !== authState.wallet?.toLowerCase()) {
        // Wallet mudou!
        setError('You connected a different wallet. Please re-authenticate.')
        setAuthState({ isAuthenticated: false, wallet: null, token: null, isAdmin: false })
        clearAuthState()
      } else if (!currentWallet) {
        // Wallet desconectada
        setError('Wallet was disconnected. Please reconnect.')
        setAuthState({ isAuthenticated: false, wallet: null, token: null, isAdmin: false })
        clearAuthState()
      }
    }

    // Verificar mudanças na wallet do Phantom (pode estar em window.solana ou window.phantom.solana)
    const phantomProvider = (window as any).phantom?.solana || ((window as any).solana?.isPhantom ? (window as any).solana : null)
    
    if (phantomProvider) {
      phantomProvider.on('disconnect', handleWalletChange)
      phantomProvider.on('accountChanged', handleWalletChange)
    }

    // Verificar mudanças na wallet do Solflare
    if (window.solflare) {
      window.solflare.on('disconnect', handleWalletChange)
      window.solflare.on('accountChange', handleWalletChange)
    }

    // Verificar mudanças na wallet do MetaMask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleWalletChange)
      window.ethereum.on('disconnect', handleWalletChange)
    }

    return () => {
      // Cleanup listeners
      const phantomProvider = (window as any).solana?.isPhantom 
        ? (window as any).solana 
        : (window as any).phantom?.solana
      
      if (phantomProvider) {
        phantomProvider.removeListener('disconnect', handleWalletChange)
        phantomProvider.removeListener('accountChanged', handleWalletChange)
      }
      if (window.solflare) {
        window.solflare.removeListener('disconnect', handleWalletChange)
        window.solflare.removeListener('accountChange', handleWalletChange)
      }
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleWalletChange)
        window.ethereum.removeListener('disconnect', handleWalletChange)
      }
    }
  }, [authState.isAuthenticated, authState.wallet])

  return {
    authState,
    isChecking,
    error,
    warning,
    checkStatus,
    logout,
  }
}

