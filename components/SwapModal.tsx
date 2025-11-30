"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
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
} from "lucide-react"
import {
  getSwapQuote,
  executeSwap,
  formatTokenAmount,
  TOKENS,
  type SwapQuote,
  type TokenInfo,
} from "../lib/swap-service"

interface SwapModalProps {
  isOpen: boolean
  onClose: () => void
  walletBalance: number
  walletAddress?: string
}

const SwapModal: React.FC<SwapModalProps> = ({ isOpen, onClose, walletBalance, walletAddress }) => {
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

  const fetchQuote = useCallback(
    async (amount: string) => {
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
          setError("Nao foi possivel obter cotacao.")
        }
      } catch (err) {
        setError("Erro ao obter cotacao.")
      } finally {
        setIsLoadingQuote(false)
      }
    },
    [slippage, inputToken, outputToken],
  )

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
  }, [inputAmount, fetchQuote])

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
      setError("Saldo insuficiente.")
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
      setError(result.error || "Erro ao executar swap.")
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
          className="flex items-center gap-2 bg-[var(--bg-secondary)] px-3 py-2 rounded-xl border-2 border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors min-w-[140px]"
        >
          <img
            src={token.logo || "/placeholder.svg"}
            alt={token.symbol}
            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          />
          <span className="font-black text-[var(--text-primary)] text-sm truncate max-w-[60px]">{token.symbol}</span>
          <ChevronDown size={16} className="text-[var(--text-secondary)] flex-shrink-0" />
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
            <div className="absolute top-full left-0 mt-2 bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] rounded-xl shadow-lg z-20 w-[280px] overflow-hidden">
              <div className="p-3 border-b border-[var(--border-color)]">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="Pesquisar nome ou endereco..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] rounded-lg pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand)]"
                    autoFocus
                  />
                </div>
                {isLoadingCustomToken && (
                  <p className="text-xs text-[var(--text-muted)] mt-2 flex items-center gap-1">
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
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                      <img
                        src={t.logo || "/placeholder.svg"}
                        alt={t.symbol}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-bold text-[var(--text-primary)] text-sm">{t.symbol}</div>
                        <div className="text-xs text-[var(--text-muted)] truncate">{t.name}</div>
                      </div>
                      {t.mint !== TOKENS.SOL.mint && (
                        <span className="text-[10px] text-[var(--text-muted)] font-mono truncate max-w-[60px]">
                          {t.mint.slice(0, 4)}...{t.mint.slice(-4)}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-[var(--text-muted)]">
                    {searchValue.length >= 32
                      ? isLoadingCustomToken
                        ? "A carregar..."
                        : "Token nao encontrado"
                      : "Nenhum token encontrado"}
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]">
                <p className="text-[10px] text-[var(--text-muted)] text-center">
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-[var(--bg-secondary)] border-4 border-[var(--border-color)] rounded-3xl p-6 comic-shadow animate-float">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">Swap</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] btn-icon-pop ${showSettings ? "bg-[var(--bg-tertiary)]" : ""}`}
            >
              <Settings size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] btn-icon-pop"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="mb-4 p-4 bg-[var(--bg-tertiary)] rounded-xl border-2 border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[var(--text-primary)]">Slippage</span>
              <div className="flex gap-2">
                {[0.5, 1, 2, 3].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSlippage(val)}
                    className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                      slippage === val
                        ? "bg-[var(--brand)] text-white"
                        : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]"
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
            <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">Swap Concluido!</h3>
            <p className="text-[var(--text-secondary)] font-bold mb-4">
              Recebeu {outputAmount} ${outputToken.symbol}
            </p>
            {signature && (
              <a
                href={`https://solscan.io/tx/${signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[var(--brand)] font-bold hover:underline mb-6"
              >
                Ver no Solscan <ExternalLink size={16} />
              </a>
            )}
            <button
              onClick={reset}
              className="w-full bg-[var(--brand)] text-white font-black py-3 rounded-xl comic-border comic-shadow btn-comic"
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
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-400 rounded-xl flex items-center gap-2">
                <AlertCircle size={20} className="text-red-600" />
                <span className="text-sm font-bold text-red-800">{error}</span>
              </div>
            )}

            <div className="bg-[var(--bg-tertiary)] rounded-2xl p-4 border-2 border-[var(--border-color)] mb-2">
              <div className="flex justify-between mb-3">
                <span className="text-xs font-bold text-[var(--text-secondary)]">Voce paga</span>
                {inputToken.symbol === "SOL" && (
                  <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1">
                    Saldo: {walletBalance.toFixed(4)}
                    <button
                      onClick={() => setInputAmount((walletBalance - 0.01).toFixed(4))}
                      className="text-[var(--brand)] uppercase hover:underline ml-1"
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
                  className="flex-1 bg-transparent text-right text-2xl font-black text-[var(--text-primary)] focus:outline-none min-w-0"
                />
              </div>
            </div>

            <div className="flex justify-center -my-3 relative z-10">
              <button
                onClick={swapTokens}
                className="bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-all hover:rotate-180 duration-300"
              >
                <ArrowDownUp size={20} className="text-[var(--text-primary)]" />
              </button>
            </div>

            <div className="bg-[var(--bg-tertiary)] rounded-2xl p-4 border-2 border-[var(--border-color)] mt-2 mb-4">
              <div className="flex justify-between mb-3">
                <span className="text-xs font-bold text-[var(--text-secondary)]">Voce recebe</span>
                <button
                  onClick={refreshQuote}
                  disabled={isLoadingQuote}
                  className="text-xs font-bold text-[var(--brand)] hover:underline flex items-center gap-1"
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
                  className="flex-1 bg-transparent text-right text-2xl font-black text-[var(--text-primary)] focus:outline-none min-w-0"
                />
              </div>
            </div>

            {quote && (
              <div className="space-y-2 mb-4 px-2">
                <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                  <span>Price Impact</span>
                  <span className={Number.parseFloat(quote.priceImpactPct) > 1 ? "text-red-500" : ""}>
                    {Number.parseFloat(quote.priceImpactPct).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                  <span>Slippage</span>
                  <span>{slippage}%</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
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
              className={`w-full py-4 rounded-xl font-black text-xl flex items-center justify-center gap-2 comic-border comic-shadow transition-all btn-comic ${
                !inputAmount || !walletAddress || isLoadingQuote
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[var(--brand)] text-white hover:brightness-110"
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

            <p className="text-center text-xs text-[var(--text-muted)] mt-4">Powered by Jupiter Aggregator</p>
          </>
        )}
      </div>
    </div>
  )
}

export default SwapModal
