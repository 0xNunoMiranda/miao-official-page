export type WalletType = "phantom" | "solflare" | "metamask" | "backpack"

export interface WalletConnection {
  address: string
  balance: number
  walletType: WalletType
}

export interface ConnectionResult {
  success: boolean
  data?: WalletConnection
  error?: string
  cancelled?: boolean
  timeout?: boolean
}

declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean
        connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>
        disconnect: () => Promise<void>
        connection: unknown
      }
    }
    solana?: {
      isPhantom?: boolean
      connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>
      disconnect: () => Promise<void>
      isConnected?: boolean
    }
    solflare?: {
      isSolflare?: boolean
      connect: () => Promise<void>
      disconnect: () => Promise<void>
      publicKey?: { toString: () => string }
    }
    backpack?: {
      isBackpack?: boolean
      connect: () => Promise<{ publicKey: { toString: () => string } }>
      disconnect: () => Promise<void>
    }
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    }
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("TIMEOUT"))
    }, ms)
    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

export function isWalletInstalled(walletType: WalletType): boolean {
  if (typeof window === "undefined") return false
  switch (walletType) {
    case "phantom":
      // Phantom pode estar em window.solana ou window.phantom.solana
      return !!(window.solana?.isPhantom || window.phantom?.solana?.isPhantom)
    case "solflare":
      return !!window.solflare?.isSolflare
    case "backpack":
      return !!window.backpack?.isBackpack
    case "metamask":
      return !!window.ethereum?.isMetaMask
    default:
      return false
  }
}

export function getWalletDownloadUrl(walletType: WalletType): string {
  switch (walletType) {
    case "phantom":
      return "https://phantom.app/download"
    case "solflare":
      return "https://solflare.com/download"
    case "backpack":
      return "https://backpack.app/download"
    case "metamask":
      return "https://metamask.io/download/"
    default:
      return ""
  }
}

export async function connectWallet(walletType: WalletType, timeoutMs = 30000): Promise<ConnectionResult> {
  try {
    if (!isWalletInstalled(walletType)) {
      return { success: false, error: `${walletType} not installed` }
    }

    let address = ""

    const connectionPromise = (async () => {
      switch (walletType) {
        case "phantom": {
          // Phantom pode estar em window.solana ou window.phantom.solana
          const phantomProvider = window.solana?.isPhantom 
            ? window.solana 
            : window.phantom?.solana
          
          if (!phantomProvider) {
            throw new Error("Phantom wallet not found")
          }

          // Forçar popup mesmo em localhost usando onlyIfTrusted: false
          const resp = await phantomProvider.connect({ onlyIfTrusted: false })
          address = resp.publicKey.toString()
          break
        }
        case "solflare": {
          await window.solflare!.connect()
          address = window.solflare!.publicKey?.toString() || ""
          break
        }
        case "backpack": {
          const resp = await window.backpack!.connect()
          address = resp.publicKey.toString()
          break
        }
        case "metamask": {
          const accounts = (await window.ethereum!.request({
            method: "eth_requestAccounts",
          })) as string[]
          address = accounts[0] || ""
          break
        }
      }
      return address
    })()

    address = await withTimeout(connectionPromise, timeoutMs)

    if (!address) {
      return { success: false, error: "Failed to get wallet address" }
    }

    let balance = 0
    if (walletType !== "metamask") {
      balance = await getSolBalance(address)
    }

    return {
      success: true,
      data: { address, balance, walletType },
    }
  } catch (err) {
    const error = err as Error
    if (error.message === "TIMEOUT") {
      return { success: false, error: "Connection timeout", timeout: true }
    }
    if (
      error.message?.includes("User rejected") ||
      error.message?.includes("User denied") ||
      (error as { code?: number }).code === 4001
    ) {
      return { success: false, cancelled: true }
    }
    return { success: false, error: error.message || "Connection failed" }
  }
}

export async function getSolBalance(address: string): Promise<number> {
  try {
    // Usar RPC alternativo se disponível, ou fallback silencioso
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"
    
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address],
      }),
    })
    
    if (!response.ok) {
      // Se der erro (403, etc), retorna 0 silenciosamente
      console.warn(`[WALLET] Failed to get balance from RPC (${response.status}):`, response.statusText)
      return 0
    }
    
    const data = await response.json()
    return (data.result?.value || 0) / 1e9
  } catch (error) {
    // Falha silenciosamente - balance não é crítico para a conexão
    console.warn('[WALLET] Error getting balance:', error instanceof Error ? error.message : 'Unknown error')
    return 0
  }
}

export async function disconnectWallet(walletType: WalletType): Promise<void> {
  try {
    switch (walletType) {
      case "phantom": {
        // Phantom pode estar em window.solana ou window.phantom.solana
        const phantomProvider = window.solana?.isPhantom 
          ? window.solana 
          : window.phantom?.solana
        if (phantomProvider) {
          await phantomProvider.disconnect()
        }
        break
      }
      case "solflare":
        await window.solflare?.disconnect()
        break
      case "backpack":
        await window.backpack?.disconnect()
        break
    }
  } catch {
    // Ignore disconnect errors
  }
}
