'use client'
// Next Imports
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

// Utils Imports
import { TokenManager } from '@/utils/tokenManager'

/**
 * 获取用户菜单列表
 * 优先从 localStorage 读取，避免 cookie 过大导致 431 错误
 * @returns 菜单列表数组
 */
const useMenu = () => {
  const { data: session } = useSession()
  const [menuList, setMenuList] = useState<any[]>([])

  useEffect(() => {
    // 优先从 localStorage 读取 menuList（避免 cookie 过大）
    const tokens = TokenManager.getTokens()
    if (tokens && (tokens as any).menuList) {
      try {
        const parsedMenuList = JSON.parse((tokens as any).menuList)
        if (Array.isArray(parsedMenuList)) {
          setMenuList(parsedMenuList)
          return
        }
      } catch (error) {
        console.error('解析 menuList 失败:', error)
      }
    }

    // 向后兼容：如果 localStorage 中没有，尝试从 session 中读取
    if ((session as any)?.menuList && Array.isArray((session as any).menuList)) {
      setMenuList((session as any).menuList)
    } else {
      setMenuList([])
    }
  }, [session])
  return menuList
}

export default useMenu
