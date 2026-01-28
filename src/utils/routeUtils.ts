/**
 * 路由工具函数
 */

import { i18n } from '@configs/i18n'

/**
 * 为路径添加语言前缀
 * @param path - 路径字符串（如 '/assets/my-assets'）
 * @param lang - 语言代码（可选，如果不提供则使用默认语言）
 * @returns 添加语言前缀后的路径（如 '/zh-CN/assets/my-assets'）
 */
export const getLocalizedPath = (path: string, lang?: string): string => {
  if (!path || typeof path !== 'string') {
    return path || '/'
  }

  const targetLang = lang || i18n.defaultLocale

  // 如果是外部链接（http/https）或锚点链接，直接返回
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('#')) {
    return path
  }

  // 检查是否已经包含语言前缀
  const langPattern = /^\/([a-z]{2}(-[A-Z][a-zA-Z]*)?)/
  if (langPattern.test(path)) {
    return path
  }

  // 添加语言前缀
  return `/${targetLang}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * 从路径中移除语言前缀
 * @param pathname - 包含语言前缀的路径（如 '/zh-CN/assets/my-assets'）
 * @returns 移除语言前缀后的路径（如 '/assets/my-assets'）
 */
export const removeLocalePrefix = (pathname: string): string => {
  if (!pathname) return '/'
  
  // 匹配语言前缀格式：/[lang]/...，如 /zh-CN, /en, /zh-Hant
  const localeMatch = pathname.match(/^\/([a-z]{2}(-[A-Z][a-zA-Z]*)?)(\/.*)?$/)
  if (localeMatch && localeMatch[3]) {
    // 如果匹配到语言前缀且有后续路径，返回后续路径
    return localeMatch[3] || '/'
  }
  
  // 如果没有匹配到语言前缀，返回原路径
  return pathname
}
