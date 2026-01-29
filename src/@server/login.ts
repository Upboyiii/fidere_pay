import { clientRequest } from '@server/http'

export const getCaptchaImg = () => clientRequest.get('/pub/captcha/get')

// 登录响应类型
export interface LoginResponse {
  // 正常登录成功时的字段
  token?: string
  refreshToken?: string
  expires?: number
  permissions?: string[]
  roles?: string[]
  userInfo?: {
    avatar?: string
    userName?: string
    userNickname?: string
    isAdmin?: boolean
  }
  menuList?: any[]
  menu?: any[]
  // 需要 2FA 验证时的字段
  needGoogleAuth?: boolean
  tempToken?: string
}

export const loginApi = (loginData: {
  username: string
  password: string
  verifyCode: string
  verifyKey: string
  entrance: string
}) => clientRequest.post<LoginResponse>('/system/login', loginData)

// 2FA 验证接口
export const verify2faApi = (data: {
  tempToken: string
  googleCode: string
}) => clientRequest.post<LoginResponse>('/system/login/verify-2fa', data)

export const logoutApi = () => clientRequest.get('/system/logout')
