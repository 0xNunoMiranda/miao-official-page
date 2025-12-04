import { execute } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireWalletAuth, verifyWalletOwnership } from '@/lib/auth'

// Obter estatísticas do usuário
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

  const wallet = params.wallet

  // Verificar ownership
  if (!verifyWalletOwnership(auth.wallet!, wallet)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized to access this wallet data' },
      { status: 403 }
    )
  }

  try {
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet is required' },
        { status: 400 }
      )
    }

    const result = await execute('sp_user_get_stats', [wallet])

    return NextResponse.json({
      success: true,
      data: result?.[0] || {},
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
