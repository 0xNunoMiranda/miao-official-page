// Jupiter API for Solana swaps
const JUPITER_API = "https://quote-api.jup.ag/v6"

// Common token mints
export const TOKENS = {
  SOL: {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logo: "https://cryptologos.cc/logos/solana-sol-logo.png",
  },
  MIAO: {
    mint: "8xpdiZ5GrnAdxpf7DSyZ1YXZxx6itvvoXPHZ4K2Epump",
    symbol: "MIAO",
    name: "Miao",
    decimals: 6,
    logo: "https://miaotoken.vip/wp-content/uploads/2025/11/miao-1.png",
  },
  USDC: {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  },
  USDT: {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "Tether",
    decimals: 6,
    logo: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  },
  BONK: {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    logo: "https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I",
  },
}

export type TokenKey = keyof typeof TOKENS
export type TokenInfo = (typeof TOKENS)[TokenKey]

export interface SwapQuote {
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  priceImpactPct: string
  slippageBps: number
  otherAmountThreshold: string
  swapMode: string
  routePlan: any[]
}

export interface SwapResult {
  success: boolean
  signature?: string
  error?: string
  userRejected?: boolean
}

export const getSwapQuote = async (
  inputMint: string,
  outputMint: string,
  amountIn: number,
  slippageBps = 100,
): Promise<SwapQuote | null> => {
  try {
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amountIn.toString(),
      slippageBps: slippageBps.toString(),
    })

    const response = await fetch(`${JUPITER_API}/quote?${params}`)

    if (!response.ok) {
      console.error("Quote error:", await response.text())
      return null
    }

    const quote = await response.json()
    return quote
  } catch (error) {
    console.error("Failed to get quote:", error)
    return null
  }
}

// Get swap transaction from Jupiter
export const getSwapTransaction = async (quote: SwapQuote, userPublicKey: string): Promise<string | null> => {
  try {
    const response = await fetch(`${JUPITER_API}/swap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: "auto",
      }),
    })

    if (!response.ok) {
      console.error("Swap transaction error:", await response.text())
      return null
    }

    const { swapTransaction } = await response.json()
    return swapTransaction
  } catch (error) {
    console.error("Failed to get swap transaction:", error)
    return null
  }
}

export const executeSwap = async (
  inputToken: TokenInfo,
  outputToken: TokenInfo,
  amountIn: number,
  walletAddress: string,
  slippageBps = 100,
): Promise<SwapResult> => {
  try {
    // Convert to smallest unit
    const amountInSmallest = Math.floor(amountIn * Math.pow(10, inputToken.decimals))

    // Get quote
    const quote = await getSwapQuote(inputToken.mint, outputToken.mint, amountInSmallest, slippageBps)
    if (!quote) {
      return { success: false, error: "Nao foi possivel obter cotacao. Tente novamente." }
    }

    // Get swap transaction
    const swapTransaction = await getSwapTransaction(quote, walletAddress)
    if (!swapTransaction) {
      return { success: false, error: "Nao foi possivel criar transacao. Tente novamente." }
    }

    // Get the connected Solana wallet
    const provider = getSolanaProvider()
    if (!provider) {
      return { success: false, error: "Carteira Solana nao encontrada." }
    }

    // Decode the transaction
    const transactionBuffer = Buffer.from(swapTransaction, "base64")

    // For Phantom/Solflare/Backpack, we need to use their signAndSendTransaction method
    const transaction = deserializeTransaction(transactionBuffer)

    // Sign and send the transaction
    const { signature } = await provider.signAndSendTransaction(transaction)

    // Wait for confirmation
    const confirmed = await confirmTransaction(signature)

    if (confirmed) {
      return { success: true, signature }
    } else {
      return { success: false, error: "Transacao nao confirmada. Verifique o explorador." }
    }
  } catch (error: any) {
    const errorMessage = error?.message?.toLowerCase() || ""
    const isUserRejected =
      errorMessage.includes("user rejected") ||
      errorMessage.includes("user denied") ||
      errorMessage.includes("user cancelled") ||
      errorMessage.includes("user canceled") ||
      error?.code === 4001

    if (isUserRejected) {
      return { success: false, userRejected: true, error: "Transacao cancelada." }
    }

    console.error("Swap error:", error)
    return { success: false, error: error.message || "Erro ao executar swap." }
  }
}

// Get Solana provider from window
const getSolanaProvider = () => {
  if (typeof window === "undefined") return null
  // Prioritize window.phantom.solana
  if (window.phantom?.solana?.isPhantom) return window.phantom.solana
  if (window.solana?.isPhantom) return window.solana
  if (window.solflare?.isSolflare) return window.solflare
  if (window.backpack?.isBackpack) return window.backpack
  return null
}

// Deserialize versioned transaction
const deserializeTransaction = (buffer: Buffer) => {
  return {
    serialize: () => buffer,
    _raw: buffer,
  }
}

// Confirm transaction on Solana
const confirmTransaction = async (signature: string): Promise<boolean> => {
  const maxRetries = 30
  const delay = 2000

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch("https://api.mainnet.solana.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getSignatureStatuses",
          params: [[signature], { searchTransactionHistory: true }],
        }),
      })

      const data = await response.json()
      const status = data.result?.value?.[0]

      if (status) {
        if (status.err) {
          console.error("Transaction failed:", status.err)
          return false
        }
        if (status.confirmationStatus === "confirmed" || status.confirmationStatus === "finalized") {
          return true
        }
      }

      await new Promise((resolve) => setTimeout(resolve, delay))
    } catch (error) {
      console.error("Confirmation check error:", error)
    }
  }

  return false
}

// Format large numbers with commas
export const formatTokenAmount = (amount: string, decimals = 6): string => {
  const num = Number.parseInt(amount) / Math.pow(10, decimals)
  return num.toLocaleString("en-US", { maximumFractionDigits: 2 })
}
