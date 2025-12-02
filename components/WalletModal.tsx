"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { WalletType } from "../types"
import { X, Shield, Wallet, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"
import { isWalletInstalled, getWalletDownloadUrl, connectWallet } from "../lib/wallet-service"
import { useLanguage } from "../lib/language-context"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (type: WalletType, address: string) => void
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onConnect }) => {
  const { t } = useLanguage()
  const [connecting, setConnecting] = useState<WalletType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [installedWallets, setInstalledWallets] = useState<Record<WalletType, boolean>>({
    phantom: false,
    solflare: false,
    metamask: false,
    backpack: false,
  })

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const detected = {
          phantom: isWalletInstalled("phantom"),
          solflare: isWalletInstalled("solflare"),
          metamask: isWalletInstalled("metamask"),
          backpack: isWalletInstalled("backpack"),
        }
        setInstalledWallets(detected)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (connecting && countdown === null) {
      setCountdown(30)
    }

    if (countdown !== null && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null))
      }, 1000)
    }

    if (!connecting) {
      setCountdown(null)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [connecting, countdown])

  if (!isOpen) return null

  const handleConnect = async (type: WalletType) => {
    setError(null)

    if (!installedWallets[type]) {
      window.open(getWalletDownloadUrl(type), "_blank")
      return
    }

    setConnecting(type)
    setCountdown(30)

    try {
      const result = await connectWallet(type)

      if (result.success && result.data?.address) {
        onConnect(type, result.data.address)
        setConnecting(null)
      } else if (result.cancelled) {
        setConnecting(null)
      } else if (result.timeout) {
        setError(t("wallet.timeout"))
        setConnecting(null)
      } else {
        setError(result.error || t("wallet.error"))
        setConnecting(null)
      }
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || t("wallet.error"))
      setConnecting(null)
    }
  }

  const wallets = [
    {
      id: "phantom" as WalletType,
      name: "Phantom",
      icon: "/assets/wallets/phantom.png",
      color: "#AB9FF2",
      recommended: true,
      description: t("wallet.phantomDesc"),
      disabled: false,
    },
    {
      id: "solflare" as WalletType,
      name: "Solflare",
      icon: "/assets/wallets/solflare.png",
      color: "#FFE500",
      description: t("wallet.solflareDesc"),
      disabled: false,
    },
    {
      id: "backpack" as WalletType,
      name: "Backpack",
      icon: "/assets/wallets/backpack.png",
      color: "#E33E3F",
      description: t("wallet.backpackDesc"),
      disabled: false,
    },
    {
      id: "metamask" as WalletType,
      name: "MetaMask",
      icon: "/assets/wallets/metamask.png",
      color: "#F6851B",
      description: t("wallet.notSupported"),
      disabled: true,
    },
  ]

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-md bg-(--bg-primary) border-2 border-(--border-color) rounded-3xl overflow-hidden shadow-2xl animate-fade-up">
        <div className="flex justify-between items-center p-5 border-b-2 border-(--border-color) bg-(--bg-secondary)">
          <h2 className="text-xl font-black text-(--text-primary) flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-(--brand) flex items-center justify-center">
              <Wallet className="text-white" size={20} />
            </div>
            {t("wallet.title")}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-(--bg-tertiary) border-2 border-(--border-color) text-(--text-secondary) hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-5 p-3 rounded-xl bg-red-500/10 border-2 border-red-500/30 flex items-center gap-2 text-red-500">
            <AlertCircle size={18} />
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        <div className="p-5 space-y-3">
          {wallets.map((wallet) => {
            const isInstalled = installedWallets[wallet.id]
            const isConnecting = connecting === wallet.id
            const isDisabled = wallet.disabled

            return (
              <button
                key={wallet.id}
                onClick={() => !isDisabled && handleConnect(wallet.id)}
                disabled={connecting !== null || isDisabled}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${
                  isDisabled
                    ? "opacity-50 cursor-not-allowed border-(--border-color) bg-(--bg-tertiary)"
                    : isConnecting
                      ? "border-(--brand) bg-(--brand)/5"
                      : "border-(--border-color) hover:border-(--brand) hover:bg-(--bg-secondary)"
                } ${connecting !== null && !isConnecting && !isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 border-(--border-color) overflow-hidden ${isDisabled ? "grayscale" : ""}`}
                    style={{ backgroundColor: `${wallet.color}20` }}
                  >
                    <img
                      src={wallet.icon || "/placeholder.svg"}
                      alt={wallet.name}
                      className={`w-7 h-7 object-contain ${isDisabled ? "grayscale" : ""}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                        target.parentElement!.innerHTML =
                          wallet.id === "phantom"
                            ? "👻"
                            : wallet.id === "solflare"
                              ? "🌞"
                              : wallet.id === "metamask"
                                ? "🦊"
                                : "🎒"
                      }}
                    />
                  </div>

                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-lg ${isDisabled ? "text-(--text-tertiary)" : "text-(--text-primary)"}`}
                      >
                        {wallet.name}
                      </span>
                      {wallet.recommended && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-(--brand) text-white rounded-full">
                          {t("wallet.recommended")}
                        </span>
                      )}
                      {isDisabled && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-gray-500 text-white rounded-full">
                          {t("wallet.comingSoon")}
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-xs ${isDisabled ? "text-(--text-tertiary)" : "text-(--text-tertiary)"}`}
                    >
                      {wallet.description}
                    </div>
                    {!isDisabled && (
                      <div
                        className={`text-xs font-bold flex items-center gap-1 ${isInstalled ? "text-(--brand)" : "text-(--text-tertiary)"}`}
                      >
                        {isInstalled ? (
                          <>
                            <CheckCircle size={12} />
                            {t("wallet.detected")}
                          </>
                        ) : (
                          <>
                            <ExternalLink size={12} />
                            {t("wallet.install")}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isConnecting ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-(--text-secondary)">{countdown}s</span>
                      <div className="w-6 h-6 border-2 border-(--brand) border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div
                      className={`w-6 h-6 rounded-full border-2 transition-colors flex items-center justify-center ${
                        isDisabled
                          ? "border-gray-400 bg-gray-200"
                          : isInstalled
                            ? "border-(--brand) group-hover:bg-(--brand)"
                            : "border-(--border-color)"
                      }`}
                    >
                      {isDisabled && (
                        <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="p-5 border-t-2 border-(--border-color) bg-(--bg-secondary)">
          <div className="text-center p-3 rounded-xl bg-(--bg-tertiary) border-2 border-dashed border-(--border-color)">
            <p className="text-xs text-(--text-secondary) font-bold flex items-center justify-center gap-2">
              <Shield size={14} className="text-(--brand)" />
              {t("wallet.newToCrypto")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletModal
