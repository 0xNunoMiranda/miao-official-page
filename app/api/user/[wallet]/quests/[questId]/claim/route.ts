import { execute } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireWalletAuth, verifyWalletOwnership } from '@/lib/auth'

// Reclamar recompensa da quest
export async function POST(
  req: NextRequest,
  { params }: { params: { wallet: string; questId: string } }
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
    const questId = parseInt(params.questId)

    // Verificar ownership (usuário só pode reclamar quests da sua própria wallet)
    if (!verifyWalletOwnership(auth.wallet!, wallet)) {
      return NextResponse.json(
        { error: 'Unauthorized to claim quests for this wallet' },
        { status: 403 }
      )
    }

    // Executar SP que retorna gems_earned e success
    const result = await execute('sp_user_quest_claim', [wallet, questId])

    // Parsear resultado (Stored Procedure retorna OUT parameters)
    // Dependendo de como mysql2 retorna, pode ser array ou objeto
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Quest not found or already claimed' }, { status: 400 })
    }

    const row = result[0]

    return NextResponse.json({
      success: true,
      wallet,
      quest_id: questId,
      gems_earned: row.p_gems_earned,
    })
  } catch (error) {
    console.error('Error claiming quest reward:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
