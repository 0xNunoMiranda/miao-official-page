import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'
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
    // Pegar todos os usuários
    const users = await execute('sp_admin_get_all_users')

    return NextResponse.json({
      success: true,
      data: users[0],
      count: users[0].length,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  // Verificar autenticação admin
  const auth = await requireAdminAuth(req)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const { action, wallet, username, status } = body

    if (action === 'ban') {
      // Ban user
      await execute('sp_admin_ban_user', [wallet])
      return NextResponse.json({ success: true, message: 'User banned' })
    }

    if (action === 'unban') {
      // Unban user
      await execute('sp_admin_unban_user', [wallet])
      return NextResponse.json({ success: true, message: 'User unbanned' })
    }

    if (action === 'delete') {
      // Delete user
      await execute('sp_admin_delete_user', [wallet])
      return NextResponse.json({ success: true, message: 'User deleted' })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in user action:', error)
    return NextResponse.json(
      { success: false, error: 'Operation failed' },
      { status: 500 }
    )
  }
}
