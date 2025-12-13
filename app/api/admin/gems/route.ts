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
    const result = await execute('sp_admin_get_gems_history', [])

    return NextResponse.json({
      success: true,
      data: gems,
      count: Array.isArray(gems) ? gems.length : 0,
    })
  } catch (error) {
    console.error('Error fetching gems:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gems' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, wallet, amount, reason } = body

    if (action === 'add') {
      await execute('sp_gems_add', [wallet, amount, reason])
      return NextResponse.json({ success: true, message: 'Gems added' })
    }

    if (action === 'remove') {
      await execute('sp_gems_spend', [wallet, amount, reason])
      return NextResponse.json({ success: true, message: 'Gems removed' })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error managing gems:', error)
    return NextResponse.json(
      { success: false, error: 'Operation failed' },
      { status: 500 }
    )
  }
}
