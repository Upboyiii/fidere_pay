import { clientRequest } from '@server/http'

export const getCaptchaImg = () => clientRequest.get('/pub/captcha/get')

export const loginApi = (loginData: {
  username: string
  password: string
  verifyCode: string
  verifyKey: string
  entrance: string
}) => clientRequest.post('/system/login', loginData)
export const logoutApi = () => clientRequest.get('/system/logout')
