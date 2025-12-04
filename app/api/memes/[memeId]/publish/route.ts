import { execute } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireWalletAuth, verifyWalletOwnership } from '@/lib/auth'

// Publicar meme
export async function POST(
  req: NextRequest,
  { params }: { params: { memeId: string } }
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
    const memeId = parseInt(params.memeId)
    const { wallet_address } = await req.json()

    if (!wallet_address) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    // Verificar ownership (usuário só pode publicar memes da sua própria wallet)
    if (!verifyWalletOwnership(auth.wallet!, wallet_address)) {
      return NextResponse.json(
        { error: 'Unauthorized to publish memes for this wallet' },
        { status: 403 }
      )
    }

    const result = await execute('sp_meme_publish', [memeId, wallet_address])

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Meme not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      meme_id: memeId,
    })
  } catch (error) {
    console.error('Error publishing meme:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
