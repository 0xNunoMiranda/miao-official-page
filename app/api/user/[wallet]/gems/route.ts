import { execute } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireWalletAuth, verifyWalletOwnership } from '@/lib/auth'

// Obter gems atuais
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

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet is required' },
        { status: 400 }
      )
    }

    // Verificar ownership (usuário só pode acessar seus próprios dados)
    if (!verifyWalletOwnership(auth.wallet!, wallet)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to access this wallet data' },
        { status: 403 }
      )
    }

    const result = await execute('sp_user_get', [wallet])

    return NextResponse.json({
      success: true,
      data: { balance: result?.[0]?.current_gems || 0 },
    })
  } catch (error) {
    console.error('Error fetching gems:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gems' },
      { status: 500 }
    )
  }
}

// Adicionar gems
export async function POST(
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
    const body = await req.json()
    const { action, amount, reason } = body

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet is required' },
        { status: 400 }
      )
    }

    // Verificar ownership (usuário só pode modificar seus próprios dados)
    if (!verifyWalletOwnership(auth.wallet!, wallet)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to modify this wallet data' },
        { status: 403 }
      )
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (action === 'add') {
      await execute('sp_gems_add', [wallet, amount, reason || 'Manual addition'])
    } else if (action === 'spend') {
      await execute('sp_gems_spend', [wallet, amount, reason || 'User spent'])
    }

    const result = await execute('sp_user_get', [wallet])

    return NextResponse.json({
      success: true,
      data: { balance: result?.[0]?.current_gems || 0 },
      message: `Gems ${action}ed successfully`,
    })
  } catch (error) {
    console.error('Error managing gems:', error)
    return NextResponse.json(
      { success: false, error: 'Operation failed' },
      { status: 500 }
    )
  }
}
