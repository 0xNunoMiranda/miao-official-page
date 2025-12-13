import { NextRequest, NextResponse } from 'next/server'
import { verifyWalletAuth, isAdminWallet, getOrCreateUser } from '@/lib/auth'

/**
 * GET /api/auth/verify
 * Verifica se o token JWT é válido e retorna dados do usuário
 * 
 * Headers: Authorization: Bearer <token>
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar token
    const auth = verifyWalletAuth(req)
    
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Obter dados do usuário (garantir que existe)
    const user = await getOrCreateUser(auth.wallet)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Verificar se é admin
    const isAdmin = await isAdminWallet(auth.wallet)

    return NextResponse.json({
      success: true,
      wallet: auth.wallet,
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
      },
      isAdmin,
      message: 'Token is valid',
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Token verification failed' },
      { status: 500 }
    )
  }
}

