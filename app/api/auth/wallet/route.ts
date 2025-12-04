import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser, generateWalletToken, isAdminWallet, verifyWalletOnchain } from '@/lib/auth'
import { Connection, PublicKey } from '@solana/web3.js'

const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
const connection = new Connection(SOLANA_RPC, 'confirmed')

/**
 * POST /api/auth/wallet
 * Autentica uma wallet e cria o usuário se não existir
 * 
 * Body: { wallet: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { wallet } = await req.json()

    if (!wallet || typeof wallet !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Normalizar wallet address
    const normalizedWallet = wallet.toLowerCase().trim()

    // Validar formato básico (Solana addresses têm 32-44 caracteres)
    if (normalizedWallet.length < 32 || normalizedWallet.length > 44) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address format' },
        { status: 400 }
      )
    }

    // Verificar se a wallet é válida onchain (opcional, pode ser pesado)
    try {
      const isValid = await verifyWalletOnchain(normalizedWallet)
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid wallet address' },
          { status: 400 }
        )
      }
    } catch (onchainError) {
      // Se não conseguir verificar onchain, continua (pode ser problema de rede)
      console.warn('Could not verify wallet onchain:', onchainError)
    }

    // Criar ou obter usuário (automaticamente cria se não existir)
    const user = await getOrCreateUser(normalizedWallet)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Failed to create or retrieve user' },
        { status: 500 }
      )
    }

    // Verificar se é admin
    const isAdmin = await isAdminWallet(normalizedWallet)

    // Gerar token JWT
    const token = generateWalletToken(normalizedWallet, isAdmin)

    return NextResponse.json({
      success: true,
      wallet: normalizedWallet,
      token,
      user: {
        wallet_address: user.wallet_address,
        username: user.username,
        avatar_url: user.avatar_url,
        level: user.level,
        current_gems: user.current_gems,
        total_gems: user.total_gems,
        hierarchy: user.hierarchy,
        streak_days: user.streak_days,
        referral_code: user.referral_code,
        total_referrals: user.total_referrals,
        last_activity: user.last_activity,
        created_at: user.created_at,
      },
      isAdmin,
      message: 'Wallet authenticated successfully',
    })
  } catch (error) {
    console.error('Wallet authentication error:', error)
    return NextResponse.json(
      { success: false, error: 'Wallet authentication failed' },
      { status: 500 }
    )
  }
}

