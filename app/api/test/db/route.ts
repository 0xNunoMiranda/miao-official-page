import { NextRequest, NextResponse } from 'next/server'
import { execute, query } from '@/lib/db'

/**
 * GET /api/test/db
 * Testa a conexão com a BD e verifica se a stored procedure existe
 */
export async function GET(req: NextRequest) {
  try {
    // Testar conexão básica
    const connectionTest = await query('SELECT 1 as test')
    console.log('[TEST/DB] Connection test:', connectionTest)

    // Verificar se a stored procedure existe
    const procedureCheck = await query(`
      SELECT ROUTINE_NAME 
      FROM information_schema.ROUTINES 
      WHERE ROUTINE_SCHEMA = DATABASE() 
      AND ROUTINE_NAME = 'sp_user_get_or_create'
    `)
    console.log('[TEST/DB] Procedure check:', procedureCheck)

    // Tentar chamar a stored procedure com uma wallet de teste
    try {
      const testWallet = 'test' + Date.now().toString().slice(-10) + 'x'.repeat(22)
      console.log('[TEST/DB] Testing with wallet:', testWallet)
      
      const result = await execute('sp_user_get_or_create', [testWallet])
      console.log('[TEST/DB] Procedure result:', JSON.stringify(result, null, 2))

      // Limpar o teste
      await query('DELETE FROM miao_users WHERE wallet_address = ?', [testWallet])

      return NextResponse.json({
        success: true,
        connection: 'OK',
        procedureExists: Array.isArray(procedureCheck) && procedureCheck.length > 0,
        procedureTest: 'OK',
        resultStructure: {
          type: typeof result,
          isArray: Array.isArray(result),
          length: Array.isArray(result) ? result.length : 'N/A',
        },
        message: 'Database and stored procedure are working correctly',
      })
    } catch (procError) {
      console.error('[TEST/DB] Procedure test error:', procError)
      return NextResponse.json({
        success: false,
        connection: 'OK',
        procedureExists: Array.isArray(procedureCheck) && procedureCheck.length > 0,
        procedureTest: 'FAILED',
        error: procError instanceof Error ? procError.message : 'Unknown error',
        message: 'Database connection works but stored procedure failed',
      }, { status: 500 })
    }
  } catch (error) {
    console.error('[TEST/DB] Test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database test failed',
    }, { status: 500 })
  }
}

