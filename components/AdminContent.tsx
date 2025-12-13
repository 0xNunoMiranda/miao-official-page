"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  LogOut,
  Users,
  Gem,
  Target,
  Image as ImageIcon,
  BarChart3,
  Lock,
  Wallet,
  Eye,
  EyeOff,
} from "lucide-react"
import { AdminDashboard } from "@/components/AdminDashboard"
import { AdminUsersPage } from "@/components/AdminUsersPage"
import { AdminGemsPage } from "@/components/AdminGemsPage"
import { AdminQuestsPage } from "@/components/AdminQuestsPage"
import { AdminMemesPage } from "@/components/AdminMemesPage"

interface AdminState {
  isLoggedIn: boolean
  wallet?: string
  username?: string
}

export default function AdminContent() {
  const router = useRouter()
  const [adminState, setAdminState] = useState<AdminState>({ isLoggedIn: false })
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "gems" | "quests" | "memes">("overview")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Check if already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    const wallet = localStorage.getItem("adminWallet")
    const savedUsername = localStorage.getItem("adminUsername")

    if (token && wallet) {
      setAdminState({
        isLoggedIn: true,
        wallet,
        username: savedUsername || "Admin",
      })
      setWalletConnected(true)
      setWalletAddress(wallet)
    }
  }, [])

  // Connect to Phantom Wallet
  const connectWallet = async () => {
    try {
      const { solana } = window as any;
      
      if (solana && solana.isPhantom) {
        const response = await solana.connect();
        const wallet = response.publicKey.toString();
        setWalletAddress(wallet);
        setWalletConnected(true);
        setError(null);
      } else {
        setError("Phantom wallet not found! Please install it.");
        window.open("https://phantom.app/", "_blank");
      }
    } catch (err) {
      console.error(err);
      setError("User rejected the connection request");
    }
  }

  const disconnectWallet = async () => {
    try {
      const { solana } = window as any;
      if (solana && solana.isPhantom) {
        await solana.disconnect();
      }
    } catch (err) {
      console.error(err);
    }
    setWalletAddress(null)
    setWalletConnected(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!walletConnected || !walletAddress) {
      setError("Please connect your wallet first")
      return
    }

    if (!username || !password) {
      setError("Please enter username and password")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // For now, we'll use hardcoded credentials for testing
      // In production, this would call the API endpoint
      if (username === "admin" && password === "miao2024") {
        // Generate a fake token (in production, get from API)
        const token = btoa(JSON.stringify({ 
          user: username,
          wallet: walletAddress,
          timestamp: Date.now()
        }))

        localStorage.setItem("adminToken", token)
        localStorage.setItem("adminWallet", walletAddress)
        localStorage.setItem("adminUsername", username)

        setAdminState({
          isLoggedIn: true,
          wallet: walletAddress,
          username,
        })

        setUsername("")
        setPassword("")
      } else {
        setError("Invalid credentials. Use admin / miao2024")
      }
    } catch (err) {
      setError("Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminWallet")
    localStorage.removeItem("adminUsername")

    setAdminState({ isLoggedIn: false })
    setUsername("")
    setPassword("")
    setWalletAddress(null)
    setWalletConnected(false)
    setError(null)
  }

  // Login Form Component
  if (!adminState.isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white mb-2">ADMIN PANEL</h1>
            <p className="text-purple-300 font-bold">Secure Access Required</p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-800 border-4 border-purple-600 rounded-xl p-8 shadow-2xl">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900 border-l-4 border-red-500 rounded text-red-100">
                <p className="font-bold">! {error}</p>
              </div>
            )}

            {/* Wallet Connection Section */}
            <div className="mb-6 p-4 bg-slate-700 border-2 border-purple-500 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="text-purple-400" size={20} />
                <span className="font-bold text-white">Wallet Connection</span>
              </div>

              {walletConnected && walletAddress ? (
                <div className="space-y-3">
                  <div className="bg-slate-800 p-3 rounded border-2 border-green-500">
                    <p className="text-xs text-slate-400 mb-1">Connected Wallet:</p>
                    <p className="text-sm font-mono text-green-400 break-all">{walletAddress}</p>
                  </div>
                  <button
                    type="button"
                    onClick={disconnectWallet}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition border-b-2 border-red-800 active:border-b-0 active:translate-y-1"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={connectWallet}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition border-b-2 border-purple-800 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2"
                >
                  <Wallet size={18} />
                  Connect Wallet
                </button>
              )}
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-white font-bold mb-2 text-sm">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!walletConnected}
                  placeholder="Enter username"
                  className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-white font-bold mb-2 text-sm">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!walletConnected}
                    placeholder="Enter password"
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={!walletConnected}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={!walletConnected || !username || !password || loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock size={20} />
                {loading ? "Authenticating..." : "Authenticate"}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 p-3 bg-slate-700 rounded text-xs text-slate-300">
              <p className="font-bold mb-1">Demo Credentials:</p>
              <p>Username: <span className="font-mono text-cyan-400">admin</span></p>
              <p>Password: <span className="font-mono text-cyan-400">miao2024</span></p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard Component
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800 border-b-4 border-purple-600 p-6 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white">ADMIN PANEL</h1>
            <p className="text-purple-300 text-sm font-bold mt-1">Logged in as: {adminState.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg transition border-b-2 border-red-800 active:border-b-0 active:translate-y-1"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "users", label: "Users", icon: Users },
            { id: "gems", label: "Gems", icon: Gem },
            { id: "quests", label: "Quests", icon: Target },
            { id: "memes", label: "Memes", icon: ImageIcon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition border-b-4 ${
                activeTab === id
                  ? "bg-purple-600 text-white border-purple-800"
                  : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
              }`}
            >
              <Icon size={20} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6">
          {activeTab === "overview" && <AdminDashboard />}
          {activeTab === "users" && <AdminUsersPage />}
          {activeTab === "gems" && <AdminGemsPage />}
          {activeTab === "quests" && <AdminQuestsPage />}
          {activeTab === "memes" && <AdminMemesPage />}
        </div>
      </div>
    </div>
  )
}
