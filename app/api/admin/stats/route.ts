import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { requireAdminAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  // Verificar autenticação admin
  const auth = await requireAdminAuth(req)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const result = await execute('sp_admin_get_stats', [])

    return NextResponse.json({
      success: true,
      data: stats?.[0] || {},
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
