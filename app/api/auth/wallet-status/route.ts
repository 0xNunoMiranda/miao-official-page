import { NextRequest, NextResponse } from 'next/server'
import { verifyWalletAuth } from '@/lib/auth'
import { Connection, PublicKey } from '@solana/web3.js'

const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet.solana.com'
const connection = new Connection(SOLANA_RPC, 'confirmed')

/**
 * POST /api/auth/wallet-status
 * Verifica se a wallet do token ainda está conectada e é a mesma
 * 
 * Body: { currentWallet: string } - Wallet atualmente conectada no frontend
 * Headers: Authorization: Bearer <token>
 */
export async function POST(req: NextRequest) {
  try {
    // Verificar token
    const auth = verifyWalletAuth(req)
    
    if (!auth) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid or expired token',
          action: 'logout' // Frontend deve fazer logout
        },
        { status: 401 }
      )
    }

    const { currentWallet } = await req.json()
    const tokenWallet = auth.wallet.toLowerCase().trim()
    const currentWalletNormalized = currentWallet?.toLowerCase().trim() || null

    // Se não há wallet conectada no frontend, mas há token válido
    if (!currentWalletNormalized) {
      return NextResponse.json({
        success: false,
        error: 'Wallet disconnected',
        action: 'logout',
        message: 'Wallet was disconnected. Please reconnect.',
      })
    }

    // Se a wallet mudou
    if (tokenWallet !== currentWalletNormalized) {
      return NextResponse.json({
        success: false,
        error: 'Wallet changed',
        action: 'logout',
        message: 'You connected a different wallet. Please re-authenticate.',
        tokenWallet,
        currentWallet: currentWalletNormalized,
      })
    }

    // Verificar se a wallet ainda está conectada onchain (opcional, pode ser pesado)
    try {
      const publicKey = new PublicKey(tokenWallet)
      // Tentar obter balance para verificar se a wallet ainda existe e está acessível
      await connection.getBalance(publicKey)
    } catch (onchainError) {
      // Se não conseguir verificar onchain, ainda pode ser válido (pode ser problema de rede)
      // Mas vamos avisar
      console.warn('Could not verify wallet onchain:', onchainError)
    }

    return NextResponse.json({
      success: true,
      wallet: tokenWallet,
      message: 'Wallet status is valid',
    })
  } catch (error) {
    console.error('Wallet status check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Wallet status check failed',
        action: 'logout'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/wallet-status
 * Verifica apenas o token (sem comparar com wallet do frontend)
 * Útil para verificar se o token ainda é válido
 */
export async function GET(req: NextRequest) {
  try {
    const auth = verifyWalletAuth(req)
    
    if (!auth) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid or expired token',
          action: 'logout'
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      wallet: auth.wallet,
      isAdmin: auth.isAdmin,
      message: 'Token is valid',
    })
  } catch (error) {
    console.error('Token check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Token check failed',
        action: 'logout'
      },
      { status: 500 }
    )
  }
}

