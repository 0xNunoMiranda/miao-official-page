// Componentes reutilizáveis para o admin
import React from "react"

// Card de Stat
export interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: number; up: boolean }
  bgColor?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  bgColor = "bg-blue-50 dark:bg-blue-900/20",
}) => (
  <div
    className={`${bgColor} border border-blue-200 dark:border-blue-800 rounded-xl p-6 hover:shadow-lg transition-shadow`}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">{label}</h3>
      <div className="text-blue-600 dark:text-blue-400">{icon}</div>
    </div>
    <div className="flex items-baseline justify-between">
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      {trend && (
        <span className={`text-sm font-semibold ${trend.up ? "text-green-600" : "text-red-600"}`}>
          {trend.up ? "↑" : "↓"} {trend.value}%
        </span>
      )}
    </div>
  </div>
)

// Table Component
export interface TableColumn<T> {
  key: keyof T
  label: string
  render?: (value: any, row: T) => React.ReactNode
  width?: string
}

interface AdminTableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  actions?: (row: T) => React.ReactNode
  loading?: boolean
}

export const AdminTable = React.forwardRef<HTMLDivElement, AdminTableProps<any>>(
  ({ data, columns, actions, loading }, ref) => (
    <div ref={ref} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className={`px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 ${col.width || ""}`}>
                {col.label}
              </th>
            ))}
            {actions && <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center">
                <div className="inline-block animate-spin">⏳</div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-6 py-4 text-gray-900 dark:text-gray-100">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {actions && <td className="px-6 py-4">{actions(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
)
AdminTable.displayName = "AdminTable"

// Modal Component
interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
  size?: "small" | "medium" | "large"
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = "medium",
}) => {
  if (!isOpen) return null

  const sizeClass = {
    small: "max-w-md",
    medium: "max-w-2xl",
    large: "max-w-4xl",
  }[size]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-2xl ${sizeClass} w-full`}>
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {actions && <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3 justify-end">{actions}</div>}
      </div>
    </div>
  )
}

// Badge Component
interface BadgeProps {
  label: string
  variant?: "success" | "warning" | "danger" | "info" | "default"
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = "default" }) => {
  const styles = {
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    default: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  }

  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[variant]}`}>{label}</span>
}
