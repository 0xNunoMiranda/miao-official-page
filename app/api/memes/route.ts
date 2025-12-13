import { execute } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireWalletAuth, verifyWalletOwnership } from '@/lib/auth'

// Criar meme
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
    const { wallet_address, prompt, top_text, bottom_text, image_url } = await req.json()

    if (!wallet_address || !prompt || !image_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verificar ownership (usuário só pode criar memes para sua própria wallet)
    if (!verifyWalletOwnership(auth.wallet!, wallet_address)) {
      return NextResponse.json(
        { error: 'Unauthorized to create memes for this wallet' },
        { status: 403 }
      )
    }

    // Executar SP que retorna meme_id
    const result = await execute('sp_meme_create', [
      wallet_address,
      prompt,
      top_text || null,
      bottom_text || null,
      image_url,
    ])

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Error creating meme' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      meme_id: result[0].meme_id || result[0].LAST_INSERT_ID,
      wallet_address,
    })
  } catch (error) {
    console.error('Error creating meme:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Listar memes de um usuário
export async function GET(req: NextRequest) {
  // Verificar autenticação wallet
  const auth = await requireWalletAuth(req)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const wallet = req.nextUrl.searchParams.get('wallet')
    const published_only = req.nextUrl.searchParams.get('published') === 'true'
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50')

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet required' }, { status: 400 })
    }

    // Verificar ownership (usuário só pode ver seus próprios memes não publicados)
    // Se for publicado, qualquer um pode ver, mas para não publicados, só o dono
    if (!published_only && !verifyWalletOwnership(auth.wallet!, wallet)) {
      return NextResponse.json(
        { error: 'Unauthorized to access this wallet memes' },
        { status: 403 }
      )
    }

    const result = await execute('sp_memes_get_by_wallet', [wallet, published_only, limit])

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching memes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
