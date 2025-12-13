import { execute } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Obter feed de memes
export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20')
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0')

    const result = await execute('sp_memes_get_feed', [limit, offset])

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching memes feed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
