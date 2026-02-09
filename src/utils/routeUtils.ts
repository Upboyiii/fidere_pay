/**
 * 路由工具函数
 */

import { i18n } from '@configs/i18n'
import type { Locale } from '@configs/i18n'

/**
 * 从当前浏览器路径中提取语言代码
 * @returns 当前语言代码
 */
export const getCurrentLangFromPath = (): string => {
  if (typeof window === 'undefined') {
    console.log('[getCurrentLangFromPath] SSR环境，返回默认语言:', i18n.defaultLocale)
    return i18n.defaultLocale
  }
  
  const pathname = window.location.pathname
  const langMatch = pathname.match(/^\/([a-z]{2}(-[A-Z][a-zA-Z]*)?)/)
  
  console.log('[getCurrentLangFromPath] 调试信息:', {
    'window.location.pathname': pathname,
    'window.location.href': window.location.href,
    'langMatch': langMatch,
    'extractedLang': langMatch ? langMatch[1] : null,
    'i18n.locales': i18n.locales
  })
  
  if (langMatch && langMatch[1]) {
    const extractedLang = langMatch[1] as Locale
    if (i18n.locales.includes(extractedLang)) {
      console.log('[getCurrentLangFromPath] ✅ 成功提取语言:', extractedLang)
      return extractedLang
    } else {
      console.log('[getCurrentLangFromPath] ⚠️ 提取的语言不在配置中:', extractedLang)
    }
  }
  
  console.log('[getCurrentLangFromPath] ⚠️ 未找到语言前缀，返回默认语言:', i18n.defaultLocale)
  return i18n.defaultLocale
}

/**
 * 为路径添加语言前缀
 * @param path - 路径字符串（如 '/assets/my-assets'）
 * @param lang - 语言代码（可选，如果不提供则使用默认语言）
 * @returns 添加语言前缀后的路径（如 '/zh-CN/assets/my-assets'）
 */
export const getLocalizedPath = (path: string, lang?: string): string => {
  if (!path || typeof path !== 'string') {
    console.log('[getLocalizedPath] ⚠️ Invalid path:', path)
    return path || '/'
  }

  const targetLang = lang || i18n.defaultLocale
  
  console.log('[getLocalizedPath] 输入:', { path, lang, targetLang })

  // 如果是外部链接（http/https）或锚点链接，直接返回
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('#')) {
    console.log('[getLocalizedPath] 外部链接，直接返回:', path)
    return path
  }

  // 检查是否已经包含语言前缀
  // 方法：使用正则表达式检查路径是否以 /[lang]/ 或 /[lang] 开头
  // 确保路径以 / 开头，且第一个段是有效的语言代码
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const langPrefixPattern = /^\/([a-z]{2}(-[A-Z][a-zA-Z]*)?)(\/|$)/
  const langMatch = normalizedPath.match(langPrefixPattern)
  
  if (langMatch && langMatch[1]) {
    const extractedLang = langMatch[1]
    // 检查提取的语言代码是否在配置的语言列表中（不区分大小写）
    const normalizedExtractedLang = extractedLang.toLowerCase()
    const isLangPrefix = i18n.locales.some(locale => locale.toLowerCase() === normalizedExtractedLang)
    
    if (isLangPrefix) {
      // 如果第一个段是语言代码，说明已包含语言前缀，直接返回原路径
      console.log('[getLocalizedPath] 已包含语言前缀，直接返回:', path)
      return path
    }
  }

  // 添加语言前缀
  const result = `/${targetLang}${path.startsWith('/') ? path : `/${path}`}`
  console.log('[getLocalizedPath] ✅ 结果:', result)
  return result
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
