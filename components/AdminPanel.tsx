"use client"

import React, { useState, useEffect } from "react"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { AdminLogin } from "@/components/AdminLogin"
import { AdminLayout } from "@/components/AdminLayout"
import { AdminDashboard } from "@/components/AdminDashboard"
import { AdminUsersPage } from "@/components/AdminUsersPage"
import { AdminGemsPage } from "@/components/AdminGemsPage"
import { AdminQuestsPage } from "@/components/AdminQuestsPage"
import { AdminMemesPage } from "@/components/AdminMemesPage"

export const AdminPanel: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false)
  const [currentTab, setCurrentTab] = useState<string>("dashboard")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if already authenticated
    setAuthenticated(isAdminAuthenticated())
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin text-green-600 text-4xl mb-4">⏳</div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return <AdminLogin onLoginSuccess={() => setAuthenticated(true)} />
  }

  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return <AdminDashboard />
      case "users":
        return <AdminUsersPage />
      case "gems":
        return <AdminGemsPage />
      case "quests":
        return <AdminQuestsPage />
      case "memes":
        return <AdminMemesPage />
      case "settings":
        return (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
            <p className="text-gray-600 dark:text-gray-400">Settings page coming soon...</p>
          </div>
        )
      default:
        return <AdminDashboard />
    }
  }

  return (
    <AdminLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      onLogout={() => setAuthenticated(false)}
    >
      {renderContent()}
    </AdminLayout>
  )
}
