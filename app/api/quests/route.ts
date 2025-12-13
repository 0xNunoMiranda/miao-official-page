import { execute } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Listar quests disponíveis
export async function GET(req: NextRequest) {
  try {
    const questType = req.nextUrl.searchParams.get('type') || null

    const result = await execute('sp_quests_get_available', [questType])

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching quests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
