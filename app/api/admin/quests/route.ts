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
    const result = await execute('sp_quests_get_available', [])

    return NextResponse.json({
      success: true,
      data: result || [],
      count: Array.isArray(result) ? result.length : 0,
    })
  } catch (error) {
    console.error('Error fetching quests:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quests' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, title, description, type, rewards, difficulty } = body

    if (action === 'create') {
      await execute('sp_quest_create', [title, description, type, rewards, difficulty || 'medium'])
      return NextResponse.json({ success: true, message: 'Quest created' })
    }

    if (action === 'update') {
      const { questId } = body
      await execute('sp_quest_update', [questId, title, description, rewards])
      return NextResponse.json({ success: true, message: 'Quest updated' })
    }

    if (action === 'delete') {
      const { questId } = body
      await execute('sp_quest_delete', [questId])
      return NextResponse.json({ success: true, message: 'Quest deleted' })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error managing quests:', error)
    return NextResponse.json(
      { success: false, error: 'Operation failed' },
      { status: 500 }
    )
  }
}
