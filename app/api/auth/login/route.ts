import { NextRequest, NextResponse } from 'next/server'
import { generateWalletToken, isAdminWallet, getOrCreateUser } from '@/lib/auth'
import { PublicKey } from '@solana/web3.js'
import nacl from 'tweetnacl'

/**
 * POST /api/auth/login
 * Autentica uma wallet, cria usuário se não existir, e retorna JWT token
 * 
 * Body: { wallet: string, signature: string, message: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { wallet, signature, message } = await req.json()

    if (!wallet || !signature || !message) {
      return NextResponse.json(
        { success: false, error: 'Wallet, signature and message required' },
        { status: 400 }
      )
    }

    // Normalizar wallet
    const normalizedWallet = wallet.toLowerCase().trim()

    // Verificar assinatura Solana onchain
    try {
      const publicKey = new PublicKey(normalizedWallet)
      const messageBytes = new TextEncoder().encode(message)
      
      // Tentar decodificar assinatura (pode ser base64 ou base58)
      let signatureBytes: Uint8Array
      try {
        // Tentar base64 primeiro
        signatureBytes = Uint8Array.from(Buffer.from(signature, 'base64'))
      } catch {
        // Se falhar, tentar como array de números
        if (Array.isArray(signature)) {
          signatureBytes = Uint8Array.from(signature)
        } else {
          throw new Error('Invalid signature format')
        }
      }
      
      // Verificar assinatura usando tweetnacl
      const isValid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKey.toBytes()
      )

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        )
      }
    } catch (sigError) {
      console.error('Signature verification error:', sigError)
      return NextResponse.json(
        { success: false, error: 'Signature verification failed' },
        { status: 401 }
      )
    }

    // Criar ou obter usuário automaticamente
    const user = await getOrCreateUser(normalizedWallet)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Failed to create/get user' },
        { status: 500 }
      )
    }

    // Verificar se a wallet é admin
    const isAdmin = await isAdminWallet(normalizedWallet)

    // Gerar token JWT
    const token = generateWalletToken(normalizedWallet, isAdmin)

    return NextResponse.json({
      success: true,
      token,
      wallet: normalizedWallet,
      user: {
        wallet_address: user.wallet_address,
        username: user.username,
        level: user.level,
        current_gems: user.current_gems,
        hierarchy: user.hierarchy,
      },
      isAdmin,
      message: 'Authentication successful',
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
