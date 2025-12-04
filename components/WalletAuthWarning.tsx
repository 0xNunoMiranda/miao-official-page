"use client"

import React from 'react'
import { AlertTriangle, X, RefreshCw } from 'lucide-react'
import { useWalletAuth } from '@/lib/use-wallet-auth'

interface WalletAuthWarningProps {
  onReconnect?: () => void
}

export const WalletAuthWarning: React.FC<WalletAuthWarningProps> = ({ onReconnect }) => {
  const { error, warning, checkStatus, logout } = useWalletAuth()

  if (!error && !warning) {
    return null
  }

  const handleReconnect = () => {
    logout()
    if (onReconnect) {
      onReconnect()
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg mb-2">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                Wallet Authentication Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                {error}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleReconnect}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                  Reconnect Wallet
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-md transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              onClick={logout}
              className="ml-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {warning && !error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 shadow-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                Wallet Status Warning
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                {warning}
              </p>
              <button
                onClick={checkStatus}
                className="px-3 py-1.5 text-xs font-medium text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-md transition-colors flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Check Again
              </button>
            </div>
            <button
              onClick={() => {}}
              className="ml-2 text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

