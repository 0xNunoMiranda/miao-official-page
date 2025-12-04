import { execute, query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireWalletAuth, verifyWalletOwnership } from '@/lib/auth'

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

  // Verificar ownership (usuário só pode acessar seus próprios dados)
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

    const result = await execute('sp_user_get', [wallet])

    return NextResponse.json({
      success: true,
      data: result?.[0] || null,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  // Verificar autenticação wallet
  const auth = await requireWalletAuth(req)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const { wallet, username, avatar } = body

    // Verificar ownership
    if (!verifyWalletOwnership(auth.wallet!, wallet)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to modify this wallet data' },
        { status: 403 }
      )
    }

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet is required' },
        { status: 400 }
      )
    }

    await execute('sp_user_create_or_update', [
      wallet,
      username || '',
      avatar || '',
    ])

    const result = await execute('sp_user_get', [wallet])

    return NextResponse.json({
      success: true,
      data: result?.[0],
      message: 'User created or updated',
    })
  } catch (error) {
    console.error('Error creating/updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Operation failed' },
      { status: 500 }
    )
  }
}
