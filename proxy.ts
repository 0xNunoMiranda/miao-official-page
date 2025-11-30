import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Forçar renderização dinâmica para todas as rotas
  const response = NextResponse.next()
  
  // Adicionar headers para evitar cache
  response.headers.set('Cache-Control', 'no-store, must-revalidate')
  response.headers.set('X-Robots-Tag', 'noindex')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

