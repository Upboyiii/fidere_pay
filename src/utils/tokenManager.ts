/**
 * Token 管理工具
 * 统一处理 token 的存储、获取、刷新等操作
 */

// 类型定义
export interface TokenData {
  accessToken: string
  refreshToken: string
  expires?: number // 改为可选字段
  username?: string
  nickname?: string
  avatar?: string
  permissions?: string[]
  roles?: string[]
  timestamp: number
  menuList?: string // menuList 作为 JSON 字符串存储，避免 cookie 过大
}

export interface RefreshTokenResponse {
  success: boolean
  data?: {
    accessToken: string
    refreshToken: string
    expires: number
  }
  message?: string
}

/**
 * Token 管理类
 */
export class TokenManager {
  private static readonly STORAGE_KEY = 'auth_tokens'
  private static readonly REFRESH_THRESHOLD = 5 * 60 * 1000 // 5分钟

  /**
   * 存储 token 到 localStorage
   * @param tokenData - token 数据
   */
  static setTokens(tokenData: TokenData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokenData))
    } catch (error) {
      console.error('存储 token 失败:', error)
    }
  }

  /**
   * 从 localStorage 获取 token
   * @returns token 数据或 null
   */
  static getTokens(): TokenData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null

      const tokenData = JSON.parse(stored) as TokenData

      // 检查 token 是否过期
      // if (this.isTokenExpired(tokenData.expires)) {
      //   this.clearTokens()
      //   return null
      // }

      return tokenData
    } catch (error) {
      console.error('获取 token 失败:', error)
      this.clearTokens()
      return null
    }
  }

  /**
   * 清除 localStorage 中的 token
   */
  static clearTokens(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('清除 token 失败:', error)
    }
  }

  // /**
  //  * 检查 token 是否过期
  //  * @param expires - 过期时间戳
  //  * @returns 是否过期
  //  */
  // static isTokenExpired(expires: number): boolean {
  //   return Date.now() >= expires
  // }

  // /**
  //  * 检查 token 是否即将过期（在刷新阈值内）
  //  * @param expires - 过期时间戳
  //  * @returns 是否即将过期
  //  */
  // static isTokenExpiringSoon(expires: number): boolean {
  //   return Date.now() >= expires - this.REFRESH_THRESHOLD
  // }

  // /**
  //  * 刷新 token
  //  * @param refreshToken - 刷新 token
  //  * @returns 刷新后的 token 数据
  //  */
  // static async refreshToken(refreshToken: string): Promise<TokenData | null> {
  //   try {
  //     const response = await fetch('/api/auth/refresh', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({ refreshToken })
  //     })

  //     if (!response.ok) {
  //       throw new Error('Token 刷新失败')
  //     }

  //     const result: RefreshTokenResponse = await response.json()

  //     if (result.success && result.data) {
  //       const currentTokens = this.getTokens()
  //       const newTokenData: TokenData = {
  //         accessToken: result.data.accessToken,
  //         refreshToken: result.data.refreshToken,
  //         expires: result.data.expires,
  //         username: currentTokens?.username,
  //         nickname: currentTokens?.nickname,
  //         avatar: currentTokens?.avatar,
  //         permissions: currentTokens?.permissions,
  //         roles: currentTokens?.roles,
  //         timestamp: Date.now()
  //       }

  //       this.setTokens(newTokenData)
  //       return newTokenData
  //     }

  //     return null
  //   } catch (error) {
  //     console.error('Token 刷新错误:', error)
  //     this.clearTokens()
  //     return null
  //   }
  // }

  // /**
  //  * 获取有效的 access token，如果即将过期则自动刷新
  //  * @returns access token 或 null
  //  */
  // static async getValidAccessToken(): Promise<string | null> {
  //   const tokens = this.getTokens()
  //   if (!tokens) return null

  //   // 如果 token 即将过期，尝试刷新
  //   if (this.isTokenExpiringSoon(tokens.expires)) {
  //     const refreshedTokens = await this.refreshToken(tokens.refreshToken)
  //     return refreshedTokens?.accessToken || null
  //   }

  //   return tokens.accessToken
  // }

  // /**
  //  * 设置自动刷新定时器
  //  * @param callback - 刷新回调函数
  //  * @returns 定时器 ID
  //  */
  // static setupAutoRefresh(callback: () => void): NodeJS.Timeout | null {
  //   const tokens = this.getTokens()
  //   if (!tokens) return null

  //   // 计算刷新时间（提前 5 分钟）
  //   const refreshTime = tokens.expires - Date.now() - this.REFRESH_THRESHOLD

  //   if (refreshTime > 0) {
  //     return setTimeout(() => {
  //       callback()
  //     }, refreshTime)
  //   }

  //   return null
  // }
}

/**
 * Hook 用于在组件中使用 token 管理
 */
export const useTokenManager = () => {
  /**
   * 获取当前 token 数据
   */
  const getTokens = () => TokenManager.getTokens()

  /**
   * 设置 token 数据
   */
  const setTokens = (tokenData: TokenData) => TokenManager.setTokens(tokenData)

  /**
   * 清除 token 数据
   */
  const clearTokens = () => TokenManager.clearTokens()

  // /**
  //  * 获取有效的 access token
  //  */
  // const getValidAccessToken = () => TokenManager.getValidAccessToken()

  // /**
  //  * 刷新 token
  //  */
  // const refreshToken = (refreshToken: string) => TokenManager.refreshToken(refreshToken)

  /**
   * 检查是否已登录
   */
  const isAuthenticated = () => {
    const tokens = TokenManager.getTokens()
    return tokens && tokens.accessToken
    // return tokens && !TokenManager.isTokenExpired(tokens.expires)
  }

  return {
    getTokens,
    setTokens,
    clearTokens,
    // getValidAccessToken,
    // refreshToken,
    isAuthenticated
  }
}
