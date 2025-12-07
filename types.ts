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
  videoUrl?: string // Optional video URL for video generations
  type?: "image" | "video" // Type of generated content
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
        // Image generation
        txt2img: (prompt: string, testMode?: boolean) => Promise<HTMLImageElement>
        // Video generation
        txt2vid: (
          prompt: string,
          testModeOrOptions?: boolean | {
            model?: "sora-2" | "sora-2-pro"
            seconds?: 4 | 8 | 12
            duration?: 4 | 8 | 12
            size?: "720x1280" | "1280x720" | "1024x1792" | "1792x1024"
            resolution?: "720x1280" | "1280x720" | "1024x1792" | "1792x1024"
            input_reference?: File | Blob
          }
        ) => Promise<HTMLVideoElement>
        // Text to speech
        txt2speech?: (text: string, options?: { voice?: string; speed?: number }) => Promise<HTMLAudioElement>
        // Chat
        chat?: (prompt: string, options?: { model?: string; stream?: boolean }) => Promise<string | AsyncIterable<{ text?: string }>>
      }
      auth: {
        // User authentication
        signIn: () => Promise<void>
        signOut: () => Promise<void>
        isSignedIn: () => boolean
        getUser: () => Promise<{ username?: string; email?: string; [key: string]: any }>
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
