'use client'

// React Imports
import { createContext, useContext } from 'react'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'

type Dictionary = Awaited<ReturnType<typeof getDictionary>>

type DictionaryContextType = {
  dictionary: Dictionary | null
}

const DictionaryContext = createContext<DictionaryContextType>({
  dictionary: null
})

export const DictionaryProvider = DictionaryContext.Provider

/**
 * 获取字典的 Hook
 * @returns 字典对象
 */
export function useDictionary(): Dictionary | null {
  const context = useContext(DictionaryContext)
  return context.dictionary
}

/**
 * 创建翻译函数 t()
 * @param dictionary - 字典对象
 * @returns 翻译函数
 */
export function createTranslate(dictionary: Dictionary | null) {
  return (key: string, params?: Record<string, string | number>): string => {
    if (!dictionary) {
      // 字典未加载时返回键，但不在生产环境输出警告
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn('[i18n] Dictionary not loaded, key:', key)
      }
      return key
    }

    // 根据路径获取嵌套值，如 'auth.captcha' -> dictionary.auth.captcha
    const keys = key.split('.')
    let value: any = dictionary

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // 如果路径不存在，在开发环境输出警告
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.warn(`[i18n] Translation key not found: ${key}, missing part: ${k}`, {
            availableKeys: value ? Object.keys(value) : [],
            dictionary: dictionary
          })
        }
        return key
      }
    }

    // 如果是字符串则返回，否则返回键
    let text = typeof value === 'string' ? value : key

    // 如果有参数，进行替换（支持 {param} 格式）
    if (params && typeof text === 'string') {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue))
      })
    }

    return text
  }
}

/**
 * 使用翻译函数的 Hook
 * @returns 翻译函数 t()
 */
export function useTranslate() {
  const dictionary = useDictionary()
  return createTranslate(dictionary)
}
