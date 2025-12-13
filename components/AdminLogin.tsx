"use client"

import React, { useState } from "react"
import { AlertCircle, Lock, Mail } from "lucide-react"
import { loginAdmin } from "@/lib/admin-auth"

interface AdminLoginProps {
  onLoginSuccess: () => void
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    setTimeout(() => {
      const result = loginAdmin(username, password)
      if (result.success) {
        onLoginSuccess()
      } else {
        setError("Invalid credentials. Try admin / miao_admin_2025")
      }
      setLoading(false)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo Area */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-green-600 rounded-2xl mb-4">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">MIAO ADMIN</h1>
          <p className="text-gray-400">Administrative Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-red-400">Login Failed</p>
                <p className="text-sm text-red-300 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Username</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Enter Dashboard"}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <p className="text-xs text-gray-400 mb-2">Demo Credentials:</p>
            <div className="text-xs text-gray-300 space-y-1">
              <p>
                <span className="text-green-400">Username:</span> admin
              </p>
              <p>
                <span className="text-green-400">Password:</span> miao_admin_2025
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2025 MIAO. Secured Administrative Access.
          </p>
        </div>
      </div>
    </div>
  )
}
