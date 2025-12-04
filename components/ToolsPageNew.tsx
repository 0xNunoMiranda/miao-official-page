"use client"

import React, { useState } from "react"
import type { WalletState } from "../types"
import {
  ArrowLeft,
  Lock,
  Zap,
  Palette,
  CheckSquare,
  Star,
  BarChart3,
} from "lucide-react"
import { ClientDashboard } from "@/components/ClientDashboard"
import { MemeStudio } from "@/components/MemeStudio"
import { QuestsPage } from "@/components/QuestsPage"
import { MemesFeed } from "@/components/MemesFeed"
import { AdminPanel } from "@/components/AdminPanel"

interface ToolsPageProps {
  onBack: () => void
  walletState: WalletState
}

type TabType = "dashboard" | "meme_studio" | "quests" | "feed" | "admin"

const ToolsPage: React.FC<ToolsPageProps> = ({ onBack, walletState }) => {
  const [activeTab, setActiveTab] = useState<string>("dashboard")

  // --- Auth Gate (Comic Style) ---
  if (!walletState.isConnected) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center px-6 bg-[var(--bg-primary)]">
        <div className="max-w-xl w-full bg-white dark:bg-slate-800 border-b-8 border-r-4 border-l-4 border-t-4 border-slate-900 rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden">
          {/* Diagonal Stripes Background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 20px)",
            }}
          ></div>

          <div className="relative z-10">
            <div className="w-28 h-28 bg-slate-200 rounded-full border-4 border-slate-900 flex items-center justify-center mx-auto mb-6 shadow-[0_6px_0_0_rgba(15,23,42,1)]">
              <Lock size={48} className="text-slate-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">
              Locked!
            </h1>
            <p className="text-lg text-slate-500 font-bold mb-8 leading-snug">
              This zone is for the <span className="text-[var(--brand)]">Miao Army</span> only.
              <br />
              Connect your wallet to enter the barracks.
            </p>
            <button
              onClick={onBack}
              className="bg-[var(--brand)] text-white w-full font-black text-xl px-8 py-4 rounded-2xl border-b-4 border-green-700 hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all"
            >
              GO BACK
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- Admin Panel Direct Access (for development) ---
  if (activeTab === "admin") {
    return (
      <div>
        <button
          onClick={() => setActiveTab("dashboard")}
          className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
        >
          <ArrowLeft size={20} />
          Back to Tools
        </button>
        <AdminPanel />
      </div>
    )
  }

  // --- Render Content ---
  const renderContent = () => {
    switch (activeTab) {
      case "meme_studio":
        return <MemeStudio onBack={() => setActiveTab("dashboard")} />
      case "quests":
        return <QuestsPage onBack={() => setActiveTab("dashboard")} />
      case "feed":
        return <MemesFeed onBack={() => setActiveTab("dashboard")} />
      case "dashboard":
      default:
        return <ClientDashboard walletState={walletState} />
    }
  }

  if (activeTab !== "dashboard" && activeTab !== "admin") {
    return renderContent()
  }

  // --- Main Dashboard Layout ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b-4 border-green-600 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-green-600 transition"
          >
            <ArrowLeft size={20} />
            Exit Tools
          </button>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">🎮 MIAO TOOLS</h1>
          <div className="text-right">
            <p className="text-xs text-gray-600 dark:text-gray-400">Wallet</p>
            <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">
              {walletState.address?.substring(0, 6)}...{walletState.address?.substring(-4)}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6 pb-4 flex gap-2 overflow-x-auto pb-safe">
          <TabButton
            icon={<BarChart3 size={20} />}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard" as any)}
          />
          <TabButton
            icon={<Palette size={20} />}
            label="Meme Studio"
            active={activeTab === "meme_studio"}
            onClick={() => setActiveTab("meme_studio" as any)}
          />
          <TabButton
            icon={<CheckSquare size={20} />}
            label="Quests"
            active={activeTab === "quests"}
            onClick={() => setActiveTab("quests" as any)}
          />
          <TabButton
            icon={<Star size={20} />}
            label="Feed"
            active={activeTab === "feed"}
            onClick={() => setActiveTab("feed" as any)}
          />
          <div className="ml-auto">
            <TabButton
              icon={<Zap size={20} />}
              label="Admin"
              active={activeTab === "admin"}
              onClick={() => setActiveTab("admin" as any)}
              variant="secondary"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {renderContent()}
      </div>
    </div>
  )
}

interface TabButtonProps {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  variant?: "primary" | "secondary"
}

const TabButton: React.FC<TabButtonProps> = ({
  icon,
  label,
  active,
  onClick,
  variant = "primary",
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap border-b-4 ${
      active
        ? variant === "secondary"
          ? "bg-amber-600 text-white border-amber-800"
          : "bg-green-600 text-white border-green-800"
        : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:shadow-lg"
    }`}
  >
    {icon}
    {label}
  </button>
)

export default ToolsPage
