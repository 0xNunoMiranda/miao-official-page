export interface TokenomicStat {
    label: string;
    value: string;
    description?: string;
}

export interface Step {
    title: string;
    description: string;
    icon: string;
}

export interface GeneratedCat {
    id: string;
    imageUrl: string;
}

export type ImageSize = '1K' | '2K' | '4K';

export interface Game {
  id: string;
  title: string;
  category: string;
  rating: number;
  plays: string;
  image: string;
  isNew?: boolean;
  isHot?: boolean;
}

export type WalletType = 'phantom' | 'solflare' | 'metamask' | 'backpack';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number; // in SOL
  type: WalletType | null;
}

// Add Puter to window type
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    puter?: {
      ai: {
        txt2img: (prompt: string, options?: { model?: string; quality?: string }) => Promise<HTMLImageElement>;
      };
    };
  }
}
