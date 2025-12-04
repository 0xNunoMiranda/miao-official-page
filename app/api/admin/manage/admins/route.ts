import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { requireAdminAuth } from '@/lib/auth'
import crypto from 'crypto'

/**
 * GET /api/admin/manage/admins
 * Lista todos os administradores (requer ser admin)
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const result = await execute('sp_admin_list_all', [])

    return NextResponse.json({
      success: true,
      data: result || [],
      count: Array.isArray(result) ? result.length : 0,
    })
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admins' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/manage/admins
 * Criar novo admin, atualizar status, etc.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const { action, wallet, username, password, email, admin_id, status } = await req.json()

    if (action === 'create') {
      if (!wallet || !username || !password || !email) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        )
      }

      // Hash da password
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex')

      await execute('sp_admin_create', [
        wallet.toLowerCase(),
        username,
        passwordHash,
        email,
        auth.admin?.admin_id || null
      ])

      return NextResponse.json({
        success: true,
        message: 'Admin created successfully',
      })
    }

    if (action === 'update_status') {
      if (!admin_id || !status) {
        return NextResponse.json(
          { success: false, error: 'Missing admin_id or status' },
          { status: 400 }
        )
      }

      await execute(
        'UPDATE miao_admins SET status = ? WHERE admin_id = ?',
        [status, admin_id]
      )

      return NextResponse.json({
        success: true,
        message: 'Admin status updated',
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error managing admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to manage admin' },
      { status: 500 }
    )
  }
}
