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
    const result = await execute('sp_admin_get_all_memes', [])

    return NextResponse.json({
      success: true,
      data: result || [],
      count: Array.isArray(result) ? result.length : 0,
    })
  } catch (error) {
    console.error('Error fetching memes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch memes' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, memeId, status, reason } = body

    if (action === 'approve') {
      await execute('sp_meme_approve', [memeId])
      return NextResponse.json({ success: true, message: 'Meme approved' })
    }

    if (action === 'reject') {
      await execute('sp_meme_reject', [memeId, reason || 'Violates community guidelines'])
      return NextResponse.json({ success: true, message: 'Meme rejected' })
    }

    if (action === 'delete') {
      await execute('sp_meme_delete', [memeId])
      return NextResponse.json({ success: true, message: 'Meme deleted' })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error managing memes:', error)
    return NextResponse.json(
      { success: false, error: 'Operation failed' },
      { status: 500 }
    )
  }
}
