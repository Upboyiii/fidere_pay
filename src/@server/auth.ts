/**
 * 认证模块
 * 包含 NextAuth 配置、token 刷新、会话管理等
 */

// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'

// Server Imports
import { SERVER_CONFIG } from '@server/config'
import type { AuthUser } from '@server/types'

// /**
//  * 刷新访问 token
//  * @param token - 当前 token 对象
//  * @returns 更新后的 token 对象
//  */
// async function refreshAccessToken(_token: any) {
//   try {
//     // 如果没有refreshToken，直接返回错误
//     if (!_token.refreshToken) {
//       return {
//         ..._token,
//         error: 'NoRefreshToken'
//       }
//     }

//     const response = await fetch('/admin-api/auth/refresh', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${_token.refreshToken}`
//       }
//     })

//     const refreshedTokens = await response.json()

//     if (!response.ok) {
//       // 如果刷新失败，返回错误但不删除现有token
//       return {
//         ..._token,
//         error: 'RefreshAccessTokenError'
//       }
//     }

//     return {
//       ..._token,
//       accessToken: refreshedTokens.accessToken,
//       accessTokenExpires: Date.now() + refreshedTokens.expiresIn * 1000,
//       refreshToken: refreshedTokens.refreshToken ?? _token.refreshToken,
//       error: undefined // 清除之前的错误
//     }
//   } catch (error) {
//     console.error('Token 刷新错误:', error)
//     // 发生错误时，保留现有token，只标记错误
//     return {
//       ..._token,
//       error: 'RefreshAccessTokenError'
//     }
//   }
// }

/**
 * NextAuth 配置选项
 *
 * NextAuth 工作流程：
 * 1. 用户调用 signIn('credentials', { ... })
 * 2. NextAuth 调用 providers[].authorize() 函数验证用户
 * 3. authorize() 返回 user 对象
 * 4. NextAuth 调用 callbacks.jwt() 将 user 数据保存到 JWT token
 * 5. NextAuth 调用 callbacks.session() 将 token 数据映射到 session
 * 6. 客户端通过 useSession() 获取 session 数据
 */
export const authOptions: NextAuthOptions = {
  // 移除 Prisma 适配器，使用 JWT 策略
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-development',
  
  // 使用默认的 /api/auth 路径（NextAuth 标准路径）
  // basePath: '/api/auth',  // 注释掉，使用 NextAuth 默认值

  /**
   * Providers（认证提供者）
   * 定义如何验证用户身份，比如：
   * - Credentials: 用户名密码登录
   * - Google: Google OAuth 登录
   * - GitHub: GitHub OAuth 登录
   *
   * 当用户调用 signIn('credentials', credentials) 时：
   * 1. NextAuth 找到 name 为 'credentials' 的 provider
   * 2. 调用该 provider 的 authorize(credentials) 函数
   * 3. authorize() 返回 user 对象（包含用户信息）
   * 4. 如果返回 null，登录失败
   */
  providers: [
    CredentialProvider({
      name: 'Credentials', // provider 的名称，signIn('credentials', ...) 中的 'credentials' 对应这里
      type: 'credentials', // 认证类型
      credentials: {}, // 定义需要的凭证字段（这里为空，因为我们手动传递所有数据）
      /**
       * authorize 函数
       * @param credentials - 从 signIn() 传递过来的数据
       * @returns user 对象或 null（null 表示登录失败）
       *
       * 这个函数的作用：
       * - 验证用户凭证（用户名、密码等）
       * - 返回包含用户信息的 user 对象
       * - 返回的 user 对象会被传递给 callbacks.jwt()
       */
      async authorize(credentials) {
        const {
          email,
          password,
          accessToken,
          refreshToken,
          expires,
          username,
          nickname,
          avatar,
          permissions,
          roles,
          role,
          isAdmin
        } = credentials as {
          email?: string
          password?: string
          accessToken?: string
          refreshToken?: string
          expires?: number
          username?: string
          nickname?: string
          avatar?: string
          permissions?: string[]
          roles?: string[]
          role?: string
          isAdmin?: boolean
        }

        // 如果已经通过Login组件验证并传递了token信息，直接返回
        if (accessToken) {
          // 注意：menuList 不再通过 authorize 传递，已存储在 localStorage 中
          return {
            id: username || email || 'user',
            name: nickname || username || email || 'User',
            email: email || 'user@example.com',
            accessToken,
            refreshToken,
            username,
            nickname,
            avatar,
            permissions: permissions || [],
            roles: roles || [],
            role: role,
            isAdmin: isAdmin || false
          }
        }

        // 如果没有accessToken，但是有email和password，尝试直接验证
        if (email && password) {
          // 这里可以添加额外的验证逻辑，或者直接返回一个默认用户
          return {
            id: email,
            name: email,
            email: email,
            accessToken: 'dummy-token',
            refreshToken: 'dummy-refresh-token',
            username: email,
            nickname: email,
            avatar: '',
            permissions: [],
            roles: [],
            role: 'kyc'
          }
        }

        // try {
        //   // ** Login API Call to match the user credentials and receive user data in response along with his role
        //   const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        //   const res = await fetch(`${baseUrl}/admin-api/login`, {
        //     method: 'POST',
        //     headers: {
        //       'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ email, password })
        //   })

        //   const data = await res.json()

        //   if (res.status === 401) {
        //     throw new Error(JSON.stringify(data))
        //   }

        //   if (res.status === 200) {
        //     return data
        //   }

        //   return null
        // } catch (e: any) {
        //   throw new Error(e.message)
        // }

        // 注释掉登录API调用后，直接返回null
        return null
      }
    })

    // GoogleProvider({
    //   clientId: SERVER_CONFIG.THIRD_PARTY.GOOGLE_CLIENT_ID as string,
    //   clientSecret: SERVER_CONFIG.THIRD_PARTY.GOOGLE_CLIENT_SECRET as string
    // })
  ],

  // ** Session configuration
  session: {
    strategy: 'jwt',
    maxAge: SERVER_CONFIG.AUTH.SESSION_MAX_AGE
  },

  // ** Pages configuration
  pages: {
    signIn: '/login'
  },

  /**
   * Callbacks（回调函数）
   * 在认证流程的不同阶段被调用，用于自定义数据处理
   */
  callbacks: {
    /**
     * JWT Callback
     * 在以下情况被调用：
     * 1. 用户首次登录时（user 参数存在）
     * 2. 每次请求时验证 session（user 参数为 undefined）
     *
     * @param token - JWT token 对象，会被序列化后存储在 cookie 中
     * @param user - 从 authorize() 返回的 user 对象（仅在首次登录时存在）
     * @returns 更新后的 token 对象
     *
     * 作用：
     * - 将 user 对象中的数据保存到 token 中
     * - token 中的数据会被序列化，所以复杂对象可能有问题
     * - token 有大小限制（通常 4KB），太大的数据会被截断
     */
    async jwt({ token, user, account: _account }) {
      // 初始登录时保存用户信息（user 存在表示是首次登录）
      if (user) {
        token.name = user.name
        token.email = user.email
        token.accessToken = (user as any).accessToken
        token.refreshToken = (user as any).refreshToken
        token.username = (user as any).username
        token.nickname = (user as any).nickname
        token.avatar = (user as any).avatar
        token.permissions = (user as any).permissions || []
        token.roles = (user as any).roles || []
        token.role = (user as any).role
        token.isAdmin = (user as any).isAdmin
        // 注意：menuList 不再存储在 token 中，避免 cookie 过大导致 431 错误
        // menuList 已通过 TokenManager 存储在 localStorage 中
      }

      return token
    },
    /**
     * Session Callback
     * 每次客户端调用 useSession() 时被调用
     *
     * @param session - 返回给客户端的 session 对象
     * @param token - 从 JWT callback 返回的 token 对象
     * @returns 更新后的 session 对象
     *
     * 作用：
     * - 将 token 中的数据映射到 session 对象
     * - session 对象是客户端通过 useSession() 获取到的数据
     * - 可以在这里添加额外的数据或格式化数据
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name
        session.user.email = token.email
        ;(session as any).accessToken = token.accessToken
        ;(session as any).refreshToken = token.refreshToken
        ;(session as any).username = token.username
        ;(session as any).nickname = token.nickname
        ;(session as any).avatar = token.avatar
        ;(session as any).permissions = token.permissions
        ;(session as any).roles = token.roles
        ;(session as any).role = token.role
        // menuList 不再从 token 中读取，避免 cookie 过大
        // menuList 应该从 localStorage 中读取（通过 useMenu hook）
        ;(session as any).menuList = []
        ;(session as any).error = token.error
      }

      return session
    }
  }
}

/**
 * 认证工具函数
 */
export const authUtils = {
  /**
   * 验证用户权限
   * @param user - 用户信息
   * @param requiredPermission - 需要的权限
   * @returns 是否有权限
   */
  hasPermission(user: AuthUser, requiredPermission: string): boolean {
    return user.permissions.includes(requiredPermission) || user.role === 'admin'
  },

  /**
   * 验证用户角色
   * @param user - 用户信息
   * @param requiredRole - 需要的角色
   * @returns 是否有角色
   */
  hasRole(user: AuthUser, requiredRole: string): boolean {
    return user.role === requiredRole || user.role === 'admin'
  },

  /**
   * 检查密码强度
   * @param password - 密码
   * @returns 密码强度评分
   */
  validatePassword(password: string): { isValid: boolean; score: number; message: string } {
    const minLength = SERVER_CONFIG.AUTH.PASSWORD_MIN_LENGTH
    const requireUppercase = SERVER_CONFIG.AUTH.PASSWORD_REQUIRE_UPPERCASE
    const requireLowercase = SERVER_CONFIG.AUTH.PASSWORD_REQUIRE_LOWERCASE
    const requireNumbers = SERVER_CONFIG.AUTH.PASSWORD_REQUIRE_NUMBERS
    const requireSymbols = SERVER_CONFIG.AUTH.PASSWORD_REQUIRE_SYMBOLS

    if (password.length < minLength) {
      return {
        isValid: false,
        score: 0,
        message: `密码长度至少需要 ${minLength} 位`
      }
    }

    let score = 0
    if (requireUppercase && /[A-Z]/.test(password)) score += 20
    if (requireLowercase && /[a-z]/.test(password)) score += 20
    if (requireNumbers && /[0-9]/.test(password)) score += 20
    if (requireSymbols && /[^a-zA-Z0-9]/.test(password)) score += 20
    if (password.length >= 12) score += 20

    const isValid = score >= 60

    return {
      isValid,
      score,
      message: isValid ? '密码强度符合要求' : '密码强度不足'
    }
  }
}
