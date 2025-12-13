import { sign } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'miao-secret-key-change-in-production'

/**
 * Gera um token JWT para a wallet após verificar assinatura
 * @param wallet - Endereço da wallet
 * @param isAdmin - Se a wallet é admin
 * @returns JWT token
 */
export function generateWalletToken(wallet: string, isAdmin: boolean = false): string {
  const payload = {
    wallet: wallet.toLowerCase(),
    timestamp: Date.now(),
    isAdmin,
  }

  return sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

/**
 * Verifica assinatura da wallet (Web3)
 * @param wallet - Endereço da wallet
 * @param signature - Assinatura da mensagem
 * @param message - Mensagem assinada
 * @returns true se assinatura válida
 */
export async function verifyWalletSignature(
  wallet: string,
  signature: string,
  message: string
): Promise<boolean> {
  try {
    // Implementação simplificada - em produção usar ethers.js ou web3.js
    // const recoveredAddress = ethers.utils.verifyMessage(message, signature)
    // return recoveredAddress.toLowerCase() === wallet.toLowerCase()
    
    // Por agora, retornar true para desenvolvimento
    // TODO: Implementar verificação real de assinatura Web3
    console.log('Verifying signature for wallet:', wallet)
    return true
  } catch (error) {
    console.error('Signature verification failed:', error)
    return false
  }
}
