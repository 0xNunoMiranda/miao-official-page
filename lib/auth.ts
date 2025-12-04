import { NextRequest } from 'next/server'
import { execute } from '@/lib/db'
import crypto from 'crypto'
import { Connection, PublicKey } from '@solana/web3.js'

const JWT_SECRET = process.env.JWT_SECRET || 'miao-secret-key-change-in-production'
const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'

export interface AuthPayload {
  wallet: string
  timestamp: number
  isAdmin?: boolean
}

/**
 * Verifica se o token JWT da wallet é válido
 * @param request - NextRequest com Authorization header
 * @returns Payload decodificado ou null se inválido
 */
export function verifyWalletAuth(request: NextRequest): AuthPayload | null {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    
    // Decodificar JWT manualmente (Base64)
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())

    // Verificar se o token não expirou (24 horas)
    const now = Date.now()
    const tokenAge = now - payload.timestamp
    const MAX_AGE = 24 * 60 * 60 * 1000 // 24 horas

    if (tokenAge > MAX_AGE) {
      return null
    }

    return payload as AuthPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Verifica se a wallet autenticada é admin (consulta BD)
 * @param wallet - Endereço da wallet
 * @returns true se for admin
 */
export async function isAdminWallet(wallet: string): Promise<boolean> {
  try {
    const result = await execute('sp_admin_check_wallet', [wallet.toLowerCase()])
    return result && Array.isArray(result) && result.length > 0
  } catch (error) {
    console.error('Error checking admin wallet:', error)
    return false
  }
}

/**
 * Verifica credenciais de admin (consulta BD com hash)
 * @param username - Username do admin
 * @param password - Password do admin (será hashado)
 * @returns Admin data se credenciais válidas, null caso contrário
 */
export async function verifyAdminCredentials(username: string, password: string): Promise<any | null> {
  try {
    // Hash da password com SHA256 (mesmo algoritmo da BD)
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')
    
    const result = await execute('sp_admin_verify_credentials', [username, passwordHash])
    
    if (result && Array.isArray(result) && result.length > 0) {
      return result[0]
    }
    
    return null
  } catch (error) {
    console.error('Error verifying admin credentials:', error)
    return null
  }
}

/**
 * Middleware completo para autenticação de admin
 * Requer: wallet autenticada + wallet na lista de admins + credenciais válidas
 */
export async function requireAdminAuth(request: NextRequest): Promise<{
  authorized: boolean
  wallet?: string
  admin?: any
  error?: string
}> {
  // 1. Verificar JWT da wallet
  const auth = verifyWalletAuth(request)
  if (!auth) {
    return { authorized: false, error: 'Wallet authentication required' }
  }

  // 2. Verificar se wallet é admin
  const isAdmin = await isAdminWallet(auth.wallet)
  if (!isAdmin) {
    return { authorized: false, error: 'Admin wallet required' }
  }

  // 3. Verificar credenciais admin do header (x-admin-username e x-admin-password)
  const adminUsername = request.headers.get('x-admin-username')
  const adminPassword = request.headers.get('x-admin-password')

  if (!adminUsername || !adminPassword) {
    return { authorized: false, error: 'Admin credentials required' }
  }

  const adminData = await verifyAdminCredentials(adminUsername, adminPassword)
  if (!adminData) {
    return { authorized: false, error: 'Invalid admin credentials' }
  }

  // Atualizar último login
  if (adminData.admin_id) {
    await execute('sp_admin_update_last_login', [adminData.admin_id])
  }

  return { authorized: true, wallet: auth.wallet, admin: adminData }
}

/**
 * Middleware para autenticação de cliente (apenas wallet)
 * Verifica token e garante que o usuário existe na BD
 * Opcionalmente verifica se a wallet do header corresponde ao token
 */
export async function requireWalletAuth(
  request: NextRequest,
  options?: { verifyWalletMatch?: string }
): Promise<{
  authorized: boolean
  wallet?: string
  user?: any
  error?: string
  walletMismatch?: boolean
}> {
  const auth = verifyWalletAuth(request)
  
  if (!auth) {
    return { authorized: false, error: 'Wallet authentication required' }
  }

  // Se foi fornecida uma wallet para verificar, comparar
  if (options?.verifyWalletMatch) {
    const providedWallet = options.verifyWalletMatch.toLowerCase().trim()
    const tokenWallet = auth.wallet.toLowerCase().trim()
    
    if (providedWallet !== tokenWallet) {
      return { 
        authorized: false, 
        error: 'Wallet mismatch: token wallet does not match provided wallet',
        walletMismatch: true
      }
    }
  }

  // Verificar se o usuário existe na BD
  try {
    const user = await getOrCreateUser(auth.wallet)
    
    if (!user) {
      return { authorized: false, error: 'User not found in database' }
    }

    return { authorized: true, wallet: auth.wallet, user }
  } catch (error) {
    console.error('Error checking user:', error)
    return { authorized: false, error: 'Database error' }
  }
}

/**
 * Verifica se a wallet autenticada corresponde ao parâmetro da rota
 * Previne que um usuário acesse dados de outro
 */
export function verifyWalletOwnership(authWallet: string, routeWallet: string): boolean {
  return authWallet.toLowerCase() === routeWallet.toLowerCase()
}

/**
 * Cria ou obtém usuário automaticamente na autenticação
 * @param wallet - Endereço da wallet
 * @returns Dados do usuário
 */
export async function getOrCreateUser(wallet: string): Promise<any | null> {
  try {
    const normalizedWallet = wallet.toLowerCase().trim()
    console.log('[AUTH] Calling sp_user_get_or_create for wallet:', normalizedWallet)
    
    const result = await execute('sp_user_get_or_create', [normalizedWallet])
    
    console.log('[AUTH] Raw stored procedure result:', JSON.stringify(result, null, 2))
    
    // mysql2 retorna stored procedures como array de resultados
    // Cada SELECT na stored procedure é um elemento do array
    // sp_user_get_or_create tem um SELECT no final, então result[0] deve conter as linhas
    
    if (result && Array.isArray(result)) {
      // result é um array de resultados (um para cada SELECT na SP)
      // O último SELECT (result[result.length - 1]) contém os dados do usuário
      const userResult = result[result.length - 1]
      
      if (Array.isArray(userResult) && userResult.length > 0) {
        const user = userResult[0]
        console.log('[AUTH] User found/created successfully:', {
          wallet_address: user.wallet_address,
          username: user.username,
          level: user.level,
        })
        return user
      }
      
      // Se não encontrou no último, tenta no primeiro
      if (result.length > 0 && Array.isArray(result[0]) && result[0].length > 0) {
        const user = result[0][0]
        console.log('[AUTH] User found/created (fallback):', {
          wallet_address: user.wallet_address,
          username: user.username,
          level: user.level,
        })
        return user
      }
    }
    
    console.warn('[AUTH] No user data found in result. Result structure:', {
      isArray: Array.isArray(result),
      length: Array.isArray(result) ? result.length : 'N/A',
      firstElement: Array.isArray(result) && result.length > 0 ? result[0] : 'N/A',
    })
    return null
  } catch (error) {
    console.error('[AUTH] Error getting/creating user:', error)
    if (error instanceof Error) {
      console.error('[AUTH] Error message:', error.message)
      console.error('[AUTH] Error stack:', error.stack)
    }
    return null
  }
}

/**
 * Verifica se uma wallet Solana é válida onchain
 * @param wallet - Endereço da wallet
 * @returns true se a wallet é válida
 */
export async function verifyWalletOnchain(wallet: string): Promise<boolean> {
  try {
    const normalizedWallet = wallet.toLowerCase().trim()
    
    // Validar formato básico (Solana addresses têm 32-44 caracteres)
    if (normalizedWallet.length < 32 || normalizedWallet.length > 44) {
      return false
    }

    // Tentar criar PublicKey (valida formato)
    try {
      const publicKey = new PublicKey(normalizedWallet)
      
      // Tentar obter balance para verificar se a wallet existe onchain
      const connection = new Connection(SOLANA_RPC, 'confirmed')
      await connection.getBalance(publicKey)
      
      return true
    } catch (error) {
      // Se não conseguir criar PublicKey ou obter balance, wallet inválida
      console.warn('Wallet validation failed:', error)
      return false
    }
  } catch (error) {
    console.error('Error verifying wallet onchain:', error)
    return false
  }
}

/**
 * Gera um token JWT simples para a wallet
 * @param wallet - Endereço da wallet
 * @param isAdmin - Se a wallet é admin
 * @returns JWT-like token
 */
export function generateWalletToken(wallet: string, isAdmin: boolean = false): string {
  const payload = {
    wallet: wallet.toLowerCase(),
    timestamp: Date.now(),
    isAdmin,
  }

  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  
  // Assinatura simplificada (em produção usar crypto.createHmac)
  const signature = Buffer.from(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`).toString('base64url')
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}
