// Third-party Imports
import 'server-only'

// Type Imports
import type { Locale } from '@configs/i18n'

/**
 * 深層合併：將 fallback 中存在的鍵補全到 target，target 優先
 * 用於 zh-Hant 與 en 合併，確保切換繁體時缺少的模組（如 assets、remittance）不會報錯
 */
const deepMergeFallback = (target: Record<string, any>, fallback: Record<string, any>): Record<string, any> => {
  const result = { ...target }
  for (const key of Object.keys(fallback)) {
    if (result[key] === undefined || result[key] === null) {
      result[key] = fallback[key]
    } else if (
      typeof result[key] === 'object' &&
      result[key] !== null &&
      typeof fallback[key] === 'object' &&
      fallback[key] !== null &&
      !Array.isArray(result[key]) &&
      !Array.isArray(fallback[key])
    ) {
      result[key] = deepMergeFallback(result[key], fallback[key])
    }
  }
  return result
}

/**
 * 字典加载器
 * 使用新的模块化结构加载翻译
 */
const dictionaries = {
  en: () => import('@/data/dictionaries/en').then(module => module.default),
  // fr: () => import('@/data/dictionaries/fr').then(module => module.default),
  // ar: () => import('@/data/dictionaries/ar').then(module => module.default),
  'zh-CN': () => import('@/data/dictionaries/zh-CN').then(module => module.default),
  'zh-Hant': async () => {
    // 切換繁體時，部分模組使用 zh-Hant 而非 zhTW，合併 en 作為 fallback 避免 undefined 報錯
    const [zhHant, en] = await Promise.all([
      import('@/data/dictionaries/zh-Hant').then(m => m.default),
      import('@/data/dictionaries/en').then(m => m.default)
    ])
    return deepMergeFallback(zhHant, en) as typeof zhHant
  }
}

/**
 * 获取指定语言的字典
 * @param locale - 语言代码
 * @returns Promise<字典对象>
 */
export const getDictionary = async (locale: Locale) => dictionaries[locale]()
