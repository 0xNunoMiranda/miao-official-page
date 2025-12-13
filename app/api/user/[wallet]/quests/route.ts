import { execute } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireWalletAuth, verifyWalletOwnership } from '@/lib/auth'

// Obter progresso de quests do usuário
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
        { error: 'Unauthorized to access this wallet quests' },
        { status: 403 }
      )
    }

    const status = req.nextUrl.searchParams.get('status') || null

    const result = await execute('sp_user_quests_get', [wallet, status])

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching user quests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Inicializar quests diárias/semanais
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

    // Verificar ownership
    if (!verifyWalletOwnership(auth.wallet!, wallet)) {
      return NextResponse.json(
        { error: 'Unauthorized to initialize quests for this wallet' },
        { status: 403 }
      )
    }

    const { quest_type } = await req.json()

    if (!quest_type || !['daily', 'weekly'].includes(quest_type)) {
      return NextResponse.json({ error: 'Invalid quest type' }, { status: 400 })
    }

    await execute('sp_user_quests_initialize', [wallet, quest_type])

    return NextResponse.json({ success: true, wallet, quest_type })
  } catch (error) {
    console.error('Error initializing quests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
