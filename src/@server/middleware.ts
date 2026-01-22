/**
 * 简化的中间件模块
 * 只处理必要的认证验证，移除不必要的日志和复杂逻辑
 */

// Third-party Imports
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

/**
 * 简化的授权检查函数
 * @param token - 当前 token
 * @param req - 请求对象
 * @returns 是否允许访问
 */
export function checkAuthorization({ token, req: _req }: { token: any; req: NextRequest }): boolean {
  const { pathname } = _req.nextUrl

  // 公开路径，无需认证
  const publicPaths = [
    '/login',
    '/register',
    '/api/auth',
    '/api/public',
    '/front-pages',
    '/_next',
    '/favicon.ico',
    '/images',
    '/public'
  ]

  // 需要认证的路径 - 包含新增的kyc和operation路由
  const protectedPaths = ['/dashboard', '/apps', '/admin', '/profile', '/settings', '/kyc', '/operation']

  // 检查公开路径
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return true
  }

  // 检查需要认证的路径
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    return !!token
  }

  // 其他路径默认允许访问
  return true
}

/**
 * 优化的中间件主函数
 */
export const middleware = withAuth(
  function middleware(req) {
    // 直接通过，不进行额外的处理
    return NextResponse.next()
  },
  {
    callbacks: {
      /**
       * 优化的授权回调函数
       */
      authorized: ({ token, req }) => {
        // 快速路径检查，减少延迟
        const { pathname } = req.nextUrl

        // 静态资源直接通过
        if (pathname.startsWith('/_next') || pathname.startsWith('/images') || pathname.startsWith('/favicon.ico')) {
          return true
        }

        return checkAuthorization({ token, req })
      }
    }
  }
)

/**
 * 中间件配置 - 只对需要认证的路径启用中间件
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js API routes)
     * - api/public (public API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - front-pages (public front pages)
     * - login, register (auth pages)
     * - images (public images)
     */
    '/((?!api/auth|api/public|_next/static|_next/image|favicon.ico|front-pages|login|register|images).*)'
  ]
}
