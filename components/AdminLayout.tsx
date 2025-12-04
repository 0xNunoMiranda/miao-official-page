"use client"

import React, { useState, ReactNode } from "react"
import {
  Menu,
  LogOut,
  BarChart3,
  Settings,
  Gem,
  CheckSquare,
  Users,
  Image,
  ArrowLeft,
  X,
} from "lucide-react"
import { logoutAdmin, getAdminUser } from "@/lib/admin-auth"

interface AdminLayoutProps {
  children: ReactNode
  currentTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}

const ADMIN_MENU = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "gems", label: "Gems", icon: Gem },
  { id: "quests", label: "Quests", icon: CheckSquare },
  { id: "memes", label: "Memes", icon: Image },
  { id: "settings", label: "Settings", icon: Settings },
]

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentTab, onTabChange, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const admin = getAdminUser()

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-950">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-900 dark:bg-gray-950 text-white transition-all duration-300 hidden md:flex flex-col border-r border-gray-800`}
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-800">
          {sidebarOpen && <span className="text-xl font-bold">MIAO ADMIN</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2">
          {ADMIN_MENU.map((item) => {
            const Icon = item.icon
            const isActive = currentTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-green-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-gray-800 p-4">
          <button
            onClick={() => {
              logoutAdmin()
              onLogout()
            }}
            className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-gray-800 rounded-lg transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-gray-900 text-white rounded-lg"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-gray-900 text-white p-4 pt-20">
          {ADMIN_MENU.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id)
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-800 transition text-left"
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {ADMIN_MENU.find((m) => m.id === currentTab)?.label || "Admin"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{admin?.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
              {admin?.username?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  )
}
