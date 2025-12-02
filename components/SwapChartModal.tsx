"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  X,
  ArrowDownUp,
  Settings,
  Info,
  RefreshCw,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Search,
  BarChart3,
} from "lucide-react"
import {
  getSwapQuote,
  executeSwap,
  formatTokenAmount,
  TOKENS,
  type SwapQuote,
  type TokenInfo,
} from "../lib/swap-service"
import { useLanguage } from "../lib/language-context"

interface SwapChartModalProps {
  isOpen: boolean
  onClose: () => void
  walletBalance: number
  walletAddress?: string
}

const SwapChartModal: React.FC<SwapChartModalProps> = ({ isOpen, onClose, walletBalance, walletAddress }) => {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<"swap" | "chart">("swap")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [inputToken, setInputToken] = useState<TokenInfo>(TOKENS.SOL)
  const [outputToken, setOutputToken] = useState<TokenInfo>(TOKENS.MIAO)
  const [inputAmount, setInputAmount] = useState<string>("")
  const [outputAmount, setOutputAmount] = useState<string>("")
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [signature, setSignature] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [slippage, setSlippage] = useState<number>(1)
  const [showSettings, setShowSettings] = useState(false)
  const [showInputTokenSelect, setShowInputTokenSelect] = useState(false)
  const [showOutputTokenSelect, setShowOutputTokenSelect] = useState(false)
  const [inputSearch, setInputSearch] = useState("")
  const [outputSearch, setOutputSearch] = useState("")
  const [customToken, setCustomToken] = useState<TokenInfo | null>(null)
  const [isLoadingCustomToken, setIsLoadingCustomToken] = useState(false)

  // DexScreener base URL
  const DEXSCREENER_BASE_URL = "https://dexscreener.com/solana/87nramn14jjty4nqw847rczwggkeitnwaljn28jmif1t"
  
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme")
      setIsDarkMode(theme === "dark")
    }
    
    checkTheme()
    
    // Listen for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })
    
    return () => observer.disconnect()
  }, [])

  // DexScreener URL - Try to pass theme (may not be supported by DexScreener)
  // The iframe will be reloaded when theme changes due to the key prop
  const DEXSCREENER_URL = `${DEXSCREENER_BASE_URL}?embed=1&theme=${isDarkMode ? "dark" : "light"}`

  const searchTokenByAddress = async (address: string): Promise<TokenInfo | null> => {
    if (address.length < 32) return null

    try {
      setIsLoadingCustomToken(true)
      const response = await fetch(`https://tokens.jup.ag/token/${address}`)
      if (!response.ok) return null

      const data = await response.json()
      if (data && data.address) {
        return {
          symbol: data.symbol || "???",
          name: data.name || "Unknown Token",
          mint: data.address,
          decimals: data.decimals || 9,
          logo: data.logoURI || "/digital-token.png",
        }
      }
      return null
    } catch (err) {
      console.error("Error fetching token:", err)
      return null
    } finally {
      setIsLoadingCustomToken(false)
    }
  }

  const filterTokens = (search: string, excludeMint: string) => {
    const searchLower = search.toLowerCase().trim()
    const baseTokens = Object.values(TOKENS).filter((t) => t.mint !== excludeMint)

    if (!searchLower) return baseTokens

    const filtered = baseTokens.filter(
      (t) =>
        t.symbol.toLowerCase().includes(searchLower) ||
        t.name.toLowerCase().includes(searchLower) ||
        t.mint.toLowerCase().includes(searchLower),
    )

    if (customToken && customToken.mint !== excludeMint) {
      const matchesCustom =
        customToken.symbol.toLowerCase().includes(searchLower) ||
        customToken.name.toLowerCase().includes(searchLower) ||
        customToken.mint.toLowerCase().includes(searchLower)
      if (matchesCustom && !filtered.find((t) => t.mint === customToken.mint)) {
        filtered.push(customToken)
      }
    }

    return filtered
  }

  const handleSearchChange = async (value: string, isInput: boolean) => {
    if (isInput) {
      setInputSearch(value)
    } else {
      setOutputSearch(value)
    }

    if (value.length >= 32 && value.length <= 50) {
      const token = await searchTokenByAddress(value)
      if (token) {
        setCustomToken(token)
      }
    }
  }

  const fetchQuote = async (amount: string) => {
    const val = Number.parseFloat(amount)
    if (isNaN(val) || val <= 0) {
      setOutputAmount("")
      setQuote(null)
      return
    }

    setIsLoadingQuote(true)
    setError("")

    try {
      const amountInSmallest = Math.floor(val * Math.pow(10, inputToken.decimals))
      const quoteResult = await getSwapQuote(inputToken.mint, outputToken.mint, amountInSmallest, slippage * 100)
      if (quoteResult) {
        setQuote(quoteResult)
        setOutputAmount(formatTokenAmount(quoteResult.outAmount, outputToken.decimals))
      } else {
        setOutputAmount("")
        setError(t("swap.quoteError"))
      }
    } catch (err) {
      setError(t("swap.error"))
    } finally {
      setIsLoadingQuote(false)
    }
  }

  useEffect(() => {
    if (!inputAmount) {
      setOutputAmount("")
      setQuote(null)
      return
    }

    const timer = setTimeout(() => {
      fetchQuote(inputAmount)
    }, 500)

    return () => clearTimeout(timer)
  }, [inputAmount, inputToken, outputToken, slippage])

  const swapTokens = () => {
    const temp = inputToken
    setInputToken(outputToken)
    setOutputToken(temp)
    setInputAmount("")
    setOutputAmount("")
    setQuote(null)
  }

  const handleSwap = async () => {
    if (!inputAmount || !walletAddress) return

    const val = Number.parseFloat(inputAmount)
    if (isNaN(val) || val <= 0) return

    if (inputToken.symbol === "SOL" && val > walletBalance) {
      setError(t("swap.insufficientBalance"))
      return
    }

    setIsSwapping(true)
    setError("")

    const result = await executeSwap(inputToken, outputToken, val, walletAddress, slippage * 100)

    if (result.success && result.signature) {
      setSignature(result.signature)
      setIsSuccess(true)
    } else if (result.userRejected) {
      setIsSwapping(false)
    } else {
      setError(result.error || t("swap.executeError"))
    }

    setIsSwapping(false)
  }

  const reset = () => {
    setIsSuccess(false)
    setInputAmount("")
    setOutputAmount("")
    setQuote(null)
    setSignature("")
    setError("")
    onClose()
  }

  const refreshQuote = () => {
    if (inputAmount) {
      fetchQuote(inputAmount)
    }
  }

  const TokenSelector = ({
    token,
    onSelect,
    isOpen,
    setIsOpen,
    excludeToken,
    searchValue,
    onSearchChange,
  }: {
    token: TokenInfo
    onSelect: (token: TokenInfo) => void
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    excludeToken: string
    searchValue: string
    onSearchChange: (value: string) => void
  }) => {
    const filteredTokens = filterTokens(searchValue, excludeToken)

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 bg-(--bg-secondary) px-4 py-3 rounded-xl border-2 border-(--border-color) hover:bg-(--bg-tertiary) transition-colors min-w-[200px]"
        >
          <img
            src={token.logo || "/placeholder.svg"}
            alt={token.symbol}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
          <span className="font-black text-(--text-primary) text-base truncate flex-1 text-left">{token.symbol}</span>
          <ChevronDown size={18} className="text-(--text-secondary) shrink-0" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => {
                setIsOpen(false)
                onSearchChange("")
              }}
            />
            <div className="absolute top-full left-0 mt-2 bg-(--bg-secondary) border-2 border-(--border-color) rounded-xl shadow-lg z-20 w-[280px] overflow-hidden">
              <div className="p-3 border-b-8 border-(--border-color)">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Pesquisar nome ou endereco..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-(--bg-tertiary) border-2 border-(--border-color) rounded-lg pl-9 pr-3 py-2 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-(--brand)"
                    autoFocus
                  />
                </div>
                {isLoadingCustomToken && (
                  <p className="text-xs text-(--text-muted) mt-2 flex items-center gap-1">
                    <RefreshCw size={12} className="animate-spin" />A procurar token...
                  </p>
                )}
              </div>

              <div className="max-h-[250px] overflow-y-auto">
                {filteredTokens.length > 0 ? (
                  filteredTokens.map((t) => (
                    <button
                      key={t.mint}
                      onClick={() => {
                        onSelect(t)
                        setIsOpen(false)
                        onSearchChange("")
                        setInputAmount("")
                        setOutputAmount("")
                        setQuote(null)
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-(--bg-tertiary) transition-colors"
                    >
                      <img
                        src={t.logo || "/placeholder.svg"}
                        alt={t.symbol}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-bold text-(--text-primary) text-sm">{t.symbol}</div>
                        <div className="text-xs text-(--text-muted) truncate">{t.name}</div>
                      </div>
                      {t.mint !== TOKENS.SOL.mint && (
                        <span className="text-[10px] text-(--text-muted) font-mono truncate max-w-[60px]">
                          {t.mint.slice(0, 4)}...{t.mint.slice(-4)}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-(--text-muted)">
                    {searchValue.length >= 32
                      ? isLoadingCustomToken
                        ? "A carregar..."
                        : "Token nao encontrado"
                      : "Nenhum token encontrado"}
                  </div>
                )}
              </div>

              <div className="p-2 border-t-8 border-(--border-color) bg-(--bg-tertiary)">
                <p className="text-[10px] text-(--text-muted) text-center">
                  Cole um endereco de contrato para adicionar qualquer token
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div
        className={`relative w-full bg-(--bg-secondary) border-4 border-(--border-color) rounded-3xl p-6 shadow-[6px_6px_0_0_var(--border-color)] h-[90vh] flex flex-col transition-all duration-500 ease-in-out ${
          activeTab === "chart" ? "max-w-6xl" : "max-w-2xl"
        }`}
        style={{
          transition: "max-width 500ms ease-in-out, width 500ms ease-in-out",
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2 border-2 border-(--border-color) rounded-xl p-1 bg-(--bg-tertiary)">
            <button
              onClick={() => setActiveTab("swap")}
              className={`px-4 py-2 rounded-lg font-black text-sm uppercase transition-all flex items-center gap-2 ${
                activeTab === "swap"
                  ? "bg-(--brand) text-white"
                  : "text-(--text-secondary) hover:text-(--text-primary)"
              }`}
            >
              <ArrowDownUp size={16} />
              Swap
            </button>
            <button
              onClick={() => setActiveTab("chart")}
              className={`px-4 py-2 rounded-lg font-black text-sm uppercase transition-all flex items-center gap-2 ${
                activeTab === "chart"
                  ? "bg-(--brand) text-white"
                  : "text-(--text-secondary) hover:text-(--text-primary)"
              }`}
            >
              <BarChart3 size={16} />
              Chart
            </button>
          </div>
          <div className="flex gap-2">
            {activeTab === "swap" && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full hover:bg-(--bg-tertiary) text-(--text-secondary) hover:scale-110 transition-all ${showSettings ? "bg-(--bg-tertiary)" : ""}`}
              >
                <Settings size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-(--bg-tertiary) text-(--text-primary) hover:scale-110 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          {/* Swap Tab */}
          <div
            className={`absolute inset-0 transition-all duration-300 ease-in-out ${
              activeTab === "swap"
                ? "opacity-100 translate-x-0 z-10 pointer-events-auto"
                : "opacity-0 -translate-x-4 z-0 pointer-events-none"
            }`}
          >
            <div className="h-full flex flex-col">
              {showSettings && (
                <div className="mb-3 p-3 bg-(--bg-tertiary) rounded-xl border-4 border-(--border-color)">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-(--text-primary)">Slippage</span>
                    <div className="flex gap-2">
                      {[0.5, 1, 2, 3].map((val) => (
                        <button
                          key={val}
                          onClick={() => setSlippage(val)}
                          className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                            slippage === val
                              ? "bg-(--brand) text-white"
                              : "bg-(--bg-secondary) text-(--text-secondary) hover:bg-(--bg-primary)"
                          }`}
                        >
                          {val}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isSuccess ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-500 animate-bounce">
                    <Check size={40} className="text-green-600" />
                  </div>
                  <h3 className="text-2xl font-black text-(--text-primary) mb-2">Swap Concluido!</h3>
                  <p className="text-(--text-secondary) font-bold mb-4">
                    Recebeu {outputAmount} ${outputToken.symbol}
                  </p>
                  {signature && (
                    <a
                      href={`https://solscan.io/tx/${signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-(--brand) font-bold hover:underline mb-6"
                    >
                      Ver no Solscan <ExternalLink size={16} />
                    </a>
                  )}
                  <button
                    onClick={reset}
                    className="w-full bg-(--brand) text-white font-black py-3 rounded-xl border-[3px] border-(--comic-outline) shadow-[4px_4px_0_0_var(--comic-outline)] hover:shadow-[6px_6px_0_0_var(--comic-outline)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <>
                  {!walletAddress && (
                    <div className="mb-4 p-3 bg-yellow-100 border-2 border-yellow-400 rounded-xl flex items-center gap-2">
                      <AlertCircle size={20} className="text-yellow-600" />
                      <span className="text-sm font-bold text-yellow-800">Conecte sua carteira para fazer swap</span>
                    </div>
                  )}

                  {error && (
                    <div className="mb-3 p-2.5 bg-red-100 border-2 border-red-400 rounded-xl flex items-center gap-2">
                      <AlertCircle size={20} className="text-red-600" />
                      <span className="text-sm font-bold text-red-800">{error}</span>
                    </div>
                  )}

                  <div className="bg-(--bg-tertiary) rounded-2xl p-3 border-4 border-(--border-color) mb-2">
                    <div className="flex justify-between mb-3">
                      <span className="text-xs font-bold text-(--text-secondary)">Voce paga</span>
                      {inputToken.symbol === "SOL" && (
                        <span className="text-xs font-bold text-(--text-secondary) flex items-center gap-1">
                          Saldo: {walletBalance.toFixed(4)}
                          <button
                            onClick={() => setInputAmount((walletBalance - 0.01).toFixed(4))}
                            className="text-(--brand) uppercase hover:underline ml-1"
                          >
                            Max
                          </button>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <TokenSelector
                        token={inputToken}
                        onSelect={setInputToken}
                        isOpen={showInputTokenSelect}
                        setIsOpen={setShowInputTokenSelect}
                        excludeToken={outputToken.mint}
                        searchValue={inputSearch}
                        onSearchChange={(v) => handleSearchChange(v, true)}
                      />
                      <input
                        type="number"
                        placeholder="0.0"
                        value={inputAmount}
                        onChange={(e) => setInputAmount(e.target.value)}
                        className="flex-1 bg-transparent text-right text-2xl font-black text-(--text-primary) focus:outline-none min-w-0"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center -my-3 relative z-10">
                    <button
                      onClick={swapTokens}
                      className="bg-(--bg-secondary) border-2 border-(--border-color) p-2 rounded-xl hover:bg-(--bg-tertiary) transition-all hover:rotate-180 duration-300"
                    >
                      <ArrowDownUp size={20} className="text-(--text-primary)" />
                    </button>
                  </div>

                  <div className="bg-(--bg-tertiary) rounded-2xl p-3 border-4 border-(--border-color) mt-2 mb-3">
                    <div className="flex justify-between mb-3">
                      <span className="text-xs font-bold text-(--text-secondary)">Voce recebe</span>
                      <button
                        onClick={refreshQuote}
                        disabled={isLoadingQuote}
                        className="text-xs font-bold text-(--brand) hover:underline flex items-center gap-1"
                      >
                        <RefreshCw size={12} className={isLoadingQuote ? "animate-spin" : ""} />
                        Atualizar
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <TokenSelector
                        token={outputToken}
                        onSelect={setOutputToken}
                        isOpen={showOutputTokenSelect}
                        setIsOpen={setShowOutputTokenSelect}
                        excludeToken={inputToken.mint}
                        searchValue={outputSearch}
                        onSearchChange={(v) => handleSearchChange(v, false)}
                      />
                      <input
                        type="text"
                        readOnly
                        placeholder="0.0"
                        value={isLoadingQuote ? "..." : outputAmount}
                        className="flex-1 bg-transparent text-right text-2xl font-black text-(--text-primary) focus:outline-none min-w-0"
                      />
                    </div>
                  </div>

                  {quote && (
                    <div className="space-y-1.5 mb-3 px-2">
                      <div className="flex justify-between text-xs font-bold text-(--text-secondary)">
                        <span>Price Impact</span>
                        <span className={Number.parseFloat(quote.priceImpactPct) > 1 ? "text-red-500" : ""}>
                          {Number.parseFloat(quote.priceImpactPct).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-(--text-secondary)">
                        <span>Slippage</span>
                        <span>{slippage}%</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-(--text-secondary)">
                        <span className="flex items-center gap-1">
                          Network Fee <Info size={12} />
                        </span>
                        <span>~0.00005 SOL</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSwap}
                    disabled={isSwapping || !inputAmount || !walletAddress || isLoadingQuote}
                    className={`w-full py-4 rounded-xl font-black text-xl flex items-center justify-center gap-2 border-[3px] border-(--comic-outline) shadow-[4px_4px_0_0_var(--comic-outline)] transition-all ${
                      isSwapping || !inputAmount || !walletAddress || isLoadingQuote
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-(--brand) text-white hover:shadow-[6px_6px_0_0_var(--comic-outline)] active:shadow-none active:translate-x-1 active:translate-y-1"
                    }`}
                  >
                    {isSwapping ? (
                      <>
                        <RefreshCw className="animate-spin" size={24} />A processar...
                      </>
                    ) : !walletAddress ? (
                      "Conectar Carteira"
                    ) : (
                      `Swap ${inputToken.symbol} → ${outputToken.symbol}`
                    )}
                  </button>

                  <p className="text-center text-xs text-(--text-muted) mt-2">Powered by Jupiter Aggregator</p>
                </>
              )}
            </div>
          </div>

          {/* Chart Tab */}
          <div
            className={`absolute inset-0 transition-all duration-300 ease-in-out ${
              activeTab === "chart"
                ? "opacity-100 translate-x-0 z-10 pointer-events-auto"
                : "opacity-0 translate-x-4 z-0 pointer-events-none"
            }`}
          >
            <div className="flex flex-col h-full min-h-[600px]">
              <div className="flex-1 border-2 border-(--border-color) rounded-xl overflow-hidden bg-(--bg-tertiary)">
                <iframe
                  key={DEXSCREENER_URL}
                  src={DEXSCREENER_URL}
                  className="w-full h-full min-h-[600px]"
                  title="DexScreener Chart"
                  allow="clipboard-read; clipboard-write"
                />
              </div>
              <div className="mt-4 flex justify-center">
                <a
                  href={DEXSCREENER_BASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-(--brand) font-bold hover:underline text-sm flex items-center gap-1"
                >
                  Abrir no DexScreener
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SwapChartModal

