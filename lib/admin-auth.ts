// Simple admin authentication - can be enhanced with proper auth later
// For now, using hardcoded credentials (in production, this should be server-side JWT)

const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "miao_admin_2025" // Change in production

export interface AdminUser {
  username: string
  role: "super_admin" | "moderator" | "analyst"
  permissions: string[]
}

export const ADMIN_PERMISSIONS = {
  SUPER_ADMIN: [
    "manage_gems",
    "manage_quests",
    "manage_memes",
    "manage_users",
    "manage_admins",
    "view_analytics",
  ],
  MODERATOR: ["manage_memes", "manage_users", "view_analytics"],
  ANALYST: ["view_analytics"],
}

export function loginAdmin(username: string, password: string): { success: boolean; user?: AdminUser } {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const user: AdminUser = {
      username: "Administrator",
      role: "super_admin",
      permissions: ADMIN_PERMISSIONS.SUPER_ADMIN,
    }
    localStorage.setItem("admin_user", JSON.stringify(user))
    localStorage.setItem("admin_token", "token_" + Date.now())
    return { success: true, user }
  }
  return { success: false }
}

export function logoutAdmin(): void {
  localStorage.removeItem("admin_user")
  localStorage.removeItem("admin_token")
}

export function getAdminUser(): AdminUser | null {
  const stored = localStorage.getItem("admin_user")
  return stored ? JSON.parse(stored) : null
}

export function isAdminAuthenticated(): boolean {
  return !!localStorage.getItem("admin_token") && !!getAdminUser()
}

export function hasPermission(permission: string): boolean {
  const user = getAdminUser()
  return user?.permissions.includes(permission) || false
}
