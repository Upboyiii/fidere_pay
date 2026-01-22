'use client'

// React Imports
import { useState, useEffect } from 'react'

// Type Imports
import type { Locale } from '@configs/i18n'
import type { getDictionary } from '@/utils/getDictionary'

/**
 * 字典加载器 Hook
 * 负责加载字典数据，不使用缓存
 *
 * @param lang - 语言代码
 * @returns 字典数据和加载状态
 */
export function useDictionaryLoader(lang: Locale) {
  const [dictionary, setDictionary] = useState<Awaited<ReturnType<typeof getDictionary>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadDictionary = async () => {
      try {
        setError(null)
        setLoading(true)
        // 动态导入字典数据
        const dictModule = await import(`@/data/dictionaries/${lang}`)
        const dictData = dictModule.default
        setDictionary(dictData)
      } catch (error) {
        // 如果加载失败，使用英文作为后备
        try {
          const fallbackModule = await import('@/data/dictionaries/zh-CN')
          const fallbackData = fallbackModule.default
          setDictionary(fallbackData)
        } catch (fallbackError) {
          // 最后的后备方案：空字典
          const emptyDict = {
            navigation: {},
            common: {},
            auth: {},
            dashboard: {},
            user: {},
            table: {},
            form: {},
            messages: {}
          } as any
          setDictionary(emptyDict)

          // 记录错误
          setError(error instanceof Error ? error : new Error(String(error)))
        }
      } finally {
        setLoading(false)
      }
    }

    loadDictionary()
  }, [lang])

  return { dictionary, loading, error }
}
