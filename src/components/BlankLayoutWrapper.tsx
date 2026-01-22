'use client'

// Type Imports
import type { Locale } from '@configs/i18n'

// Hook Imports
import { useDictionaryLoader } from '@/hooks/useDictionaryLoader'

// Context Imports
import { DictionaryProvider } from '@/contexts/DictionaryContext'

// Config Imports
import { i18n } from '@configs/i18n'

// Component Imports
import ClientProviders from '@components/ClientProviders'

type Props = {
  children: React.ReactNode
  lang: Locale
}

/**
 * 空白布局包装器
 * 为空白布局页面（guest-only等）提供字典支持
 */
const BlankLayoutWrapper = ({ children, lang }: Props) => {
  const { dictionary, loading } = useDictionaryLoader(lang)

  const direction = i18n.langDirection[lang] || 'ltr'

  // 如果还在加载中，显示加载状态
  if (loading || !dictionary) {
    return (
      <ClientProviders direction={direction}>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          </div>
        </div>
      </ClientProviders>
    )
  }

  return (
    <ClientProviders direction={direction}>
      <DictionaryProvider value={{ dictionary }}>{children}</DictionaryProvider>
    </ClientProviders>
  )
}

export default BlankLayoutWrapper
