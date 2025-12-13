import { execute } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireWalletAuth, verifyWalletOwnership } from '@/lib/auth'

// Obter atividades recentes
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
        { error: 'Unauthorized to access this wallet activities' },
        { status: 403 }
      )
    }

    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20')

    const result = await execute('sp_user_activities_get', [wallet, limit])

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
