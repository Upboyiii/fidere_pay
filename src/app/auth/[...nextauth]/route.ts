// Third-party Imports
import NextAuth from 'next-auth'

// Server Imports
import { authOptions } from '@server/auth'

/*
 * NextAuth API 路由处理器
 * 使用服务器端认证配置
 * 路径已从 /api/auth 改为 /auth，避免与后端 API 冲突
 */

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
