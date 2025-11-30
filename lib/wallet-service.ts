import type { WalletType } from "../types"

export interface WalletConnectionResult {
  success: boolean
  address?: string
  error?: string
  userRejected?: boolean
  timeout?: boolean
}

// Check if wallet is installed
export const isWalletInstalled = (type: WalletType): boolean => {
  if (typeof window === "undefined") return false

  switch (type) {
    case "phantom":
      return !!window.solana?.isPhantom
    case "solflare":
      return !!window.solflare?.isSolflare
    case "metamask":
      return !!window.ethereum?.isMetaMask
    case "backpack":
      return !!window.backpack?.isBackpack
    default:
      return false
  }
}

// Get wallet download URL
export const getWalletDownloadUrl = (type: WalletType): string => {
  switch (type) {
    case "phantom":
      return "https://phantom.app/download"
    case "solflare":
      return "https://solflare.com/download"
    case "metamask":
      return "https://metamask.io/download/"
    case "backpack":
      return "https://backpack.app/download"
    default:
      return "#"
  }
}

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {\
  return new Promise((resolve, reject) => {\
    const timer = setTimeout(() => {
      reject(new Error("TIMEOUT"))
    }, ms)

    promise
      .then((value) => {
        clearTimeout(timer)\
        resolve(value)
      })
      .catch((err) => {
        clearTimeout(timer)\
        reject(err)
      })
  })
}

export const connectWallet = async (type: WalletType): Promise<WalletConnectionResult> => {\
  const TIMEOUT_MS = 30000

  try {\
    switch (type) {\
      case "phantom": {\
        if (!window.solana?.isPhantom) {\
          return { success: false, error: "Phantom not installed" }
        }
        const response = await withTimeout(window.solana.connect(), TIMEOUT_MS)
        return {\
          success: true,
          address: response.publicKey.toString(),
        }
      }

      case "solflare": {\
        if (!window.solflare?.isSolflare) {\
          return { success: false, error: "Solflare not installed" }
        }
        await withTimeout(window.solflare.connect(), TIMEOUT_MS)
        const address = window.solflare.publicKey?.toString()
        if (!address) {\
          return { success: false, error: "Failed to get address" }
        }\
        return { success: true, address }
      }

      case "metamask": {\
        if (!window.ethereum?.isMetaMask) {\
          return { success: false, error: "MetaMask not installed" }
        }
        
        try {\
          const accounts = await withTimeout(
            window.ethereum.request({\
              method: "eth_requestAccounts",\
            }) as Promise<string[]>,
            TIMEOUT_MS
          )
          
          if (accounts && accounts.length > 0) {\
            return { \
              success: true, 
              address: accounts[0],
            }
          }\
          return { success: false, error: "No accounts found" }
        } catch (mmError: any) {\
          if (mmError?.code === -32002) {\
            return { \
              success: false, 
              error: "MetaMask ja tem um pedido pendente. Abra a extensao MetaMask." 
            }
          }
          throw mmError
        }
      }

      case "backpack": {\
        if (!window.backpack?.isBackpack) {\
          return { success: false, error: "Backpack not installed" }
        }
        const response = await withTimeout(window.backpack.connect(), TIMEOUT_MS)
        return {\
          success: true,
          address: response.publicKey.toString(),
        }
      }

      default:\
        return { success: false, error: "Unknown wallet type" }
    }
  } catch (error: any) {\
    if (error?.message === "TIMEOUT") {
      return {
        success: false,
        timeout: true,
        error: "Tempo limite excedido. A carteira nao respondeu.",
      }
    }

    const errorMessage = error?.message?.toLowerCase() || ""
    const isUserRejected =
      errorMessage.includes("user rejected") ||
      errorMessage.includes("user denied") ||
      errorMessage.includes("user cancelled") ||
      errorMessage.includes("user canceled") ||
      error?.code === 4001 ||
      error?.code === -32603

    if (isUserRejected) {
      return {
        success: false,
        userRejected: true,
        error: "Conexao cancelada",
      }
    }

    console.error("Wallet connection error:", error)
    return {
      success: false,
      error: error.message || "Connection failed",
    }
  }
}

// Disconnect wallet
export const disconnectWallet = async (type: WalletType): Promise<void> => {
  try {
    switch (type) {
      case "phantom":
        await window.solana?.disconnect()
        break
      case "solflare":
        await window.solflare?.disconnect()
        break
      case "backpack":
        await window.backpack?.disconnect()
        break
      case "metamask":
        break
    }
  } catch (error) {
    console.error("Disconnect error:", error)
  }
}

// Get SOL balance (for Solana wallets)
export const getSolBalance = async (address: string): Promise<number> => {
  try {
    const response = await fetch("https://api.mainnet-beta.solana.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address],
      }),
    })
    const data = await response.json()
    if (data.result?.value) {
      return data.result.value / 1e9
    }
    return 0
  } catch (error) {
    console.error("Failed to get balance:", error)
    return 0
  }
}

// Get connected Solana wallet provider
export const getSolanaProvider = () => {
  if (window.solana?.isPhantom) return window.solana
  if (window.solflare?.isSolflare) return window.solflare
  if (window.backpack?.isBackpack) return window.backpack
  return null
}
