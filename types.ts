export interface TokenomicStat {
  label: string
  value: string
  description?: string
}

export interface Step {
  title: string
  description: string
  icon: string
}

export interface GeneratedCat {
  id: string
  imageUrl: string
}

export type ImageSize = "1K" | "2K" | "4K"

export interface Game {
  id: string
  title: string
  category: string
  rating: number
  plays: string
  image: string
  isNew?: boolean
  isHot?: boolean
}

export type WalletType = "phantom" | "solflare" | "metamask" | "backpack"

export interface WalletState {
  isConnected: boolean
  address: string | null
  balance: number // in SOL
  type: WalletType | null
}

// Add Puter to window type
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>
    openSelectKey: () => Promise<void>
  }

  interface PhantomProvider {
    isPhantom?: boolean
    connect: () => Promise<{ publicKey: { toString: () => string } }>
    disconnect: () => Promise<void>
    on: (event: string, callback: (args: any) => void) => void
    isConnected: boolean
  }

  interface SolflareProvider {
    isSolflare?: boolean
    connect: () => Promise<void>
    disconnect: () => Promise<void>
    publicKey?: { toString: () => string }
    on: (event: string, callback: (args: any) => void) => void
    isConnected: boolean
  }

  interface BackpackProvider {
    isBackpack?: boolean
    connect: () => Promise<{ publicKey: { toString: () => string } }>
    disconnect: () => Promise<void>
    on: (event: string, callback: (args: any) => void) => void
    isConnected: boolean
  }

  interface Window {
    puter?: {
      ai: {
        txt2img: (prompt: string, options?: { model?: string; quality?: string }) => Promise<HTMLImageElement>
      }
    }
    solana?: PhantomProvider
    solflare?: SolflareProvider
    backpack?: BackpackProvider
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (args: any) => void) => void
    }
  }
}
