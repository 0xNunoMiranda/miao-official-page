import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser, generateWalletToken, isAdminWallet, verifyWalletOnchain } from '@/lib/auth'

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
    // Comentado temporariamente para não bloquear em caso de problemas de rede
    /*
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
    */

    console.log('[AUTH/WALLET] Attempting to get or create user for wallet:', normalizedWallet)

    // Criar ou obter usuário (automaticamente cria se não existir)
    const user = await getOrCreateUser(normalizedWallet)

    console.log('[AUTH/WALLET] User result:', user ? 'User found/created' : 'User is null', user)

    if (!user) {
      console.error('[AUTH/WALLET] Failed to create or retrieve user for wallet:', normalizedWallet)
      return NextResponse.json(
        { success: false, error: 'Failed to create or retrieve user. Please check server logs.' },
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
    console.error('[AUTH/WALLET] Wallet authentication error:', error)
    if (error instanceof Error) {
      console.error('[AUTH/WALLET] Error message:', error.message)
      console.error('[AUTH/WALLET] Error stack:', error.stack)
      
      // Verificar se é erro de stored procedure não encontrada
      if (error.message.includes('does not exist') || error.message.includes('PROCEDURE')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Database stored procedure not found. Please run the database setup script.',
            details: error.message
          },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Wallet authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

