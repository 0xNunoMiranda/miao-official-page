import { execute } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireWalletAuth, verifyWalletOwnership } from '@/lib/auth'

// Obter histórico de gems
export async function GET(
  req: NextRequest,
  { params }: { params: { wallet: string } }
) {
  // Verificar autenticação wallet
  const auth = await requireWalletAuth(req)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const wallet = params.wallet

    // Verificar ownership
    if (!verifyWalletOwnership(auth.wallet!, wallet)) {
      return NextResponse.json(
        { error: 'Unauthorized to access this wallet gems history' },
        { status: 403 }
      )
    }

    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50')

    const result = await execute('sp_gems_history', [wallet, limit])

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching gems history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
