/**
 * 登录入口来源管理
 * managelogin 退出后回到 managelogin，userlogin/login 退出后回到 userlogin
 */

const LOGIN_SOURCE_KEY = 'loginSource'

export type LoginSource = 'manage' | 'user'

export const setLoginSource = (source: LoginSource) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOGIN_SOURCE_KEY, source)
  }
}

export const getLoginSource = (): LoginSource | null => {
  if (typeof window === 'undefined') return null
  const v = localStorage.getItem(LOGIN_SOURCE_KEY)
  return (v === 'manage' || v === 'user') ? v : null
}

/** 根据 loginSource 获取登录页路径（不含语言前缀） */
export const getLoginPathBySource = (): string => {
  const source = getLoginSource()
  return source === 'manage' ? '/managelogin' : '/userlogin'
}
