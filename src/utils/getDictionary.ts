// Third-party Imports
import 'server-only'

// Type Imports
import type { Locale } from '@configs/i18n'

/**
 * 字典加载器
 * 使用新的模块化结构加载翻译
 */
const dictionaries = {
  en: () => import('@/data/dictionaries/en').then(module => module.default),
  // fr: () => import('@/data/dictionaries/fr').then(module => module.default),
  // ar: () => import('@/data/dictionaries/ar').then(module => module.default),
  'zh-CN': () => import('@/data/dictionaries/zh-CN').then(module => module.default),
  'zh-Hant': () => import('@/data/dictionaries/zh-Hant').then(module => module.default)
}

/**
 * 获取指定语言的字典
 * @param locale - 语言代码
 * @returns Promise<字典对象>
 */
export const getDictionary = async (locale: Locale) => dictionaries[locale]()
