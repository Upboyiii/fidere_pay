'use client'

// MUI Imports
import Button from '@mui/material/Button'

// Type Imports
import type { ChildrenType, Direction } from '@core/types'
import type { Locale } from '@configs/i18n'

// Hook Imports
import { useDictionaryLoader } from '@/hooks/useDictionaryLoader'

// Layout Imports
import LayoutWrapper from '@layouts/LayoutWrapper'
import VerticalLayout from '@layouts/VerticalLayout'
import HorizontalLayout from '@layouts/HorizontalLayout'

// Component Imports
import ClientProviders from '@components/ClientProviders'
import ClientAuthGuard from '@components/ClientAuthGuard'
import AuthErrorHandler from '@components/AuthErrorHandler'
import RouteGuard from '@components/RouteGuard'
import Navigation from '@components/layout/vertical/Navigation'
import Header from '@components/layout/horizontal/Header'
import Navbar from '@components/layout/vertical/Navbar'
import VerticalFooter from '@components/layout/vertical/Footer'
import HorizontalFooter from '@components/layout/horizontal/Footer'
import Customizer from '@core/components/customizer'
import ScrollToTop from '@core/components/scroll-to-top'

// Context Imports
import { DictionaryProvider } from '@/contexts/DictionaryContext'

// Config Imports
import { i18n } from '@configs/i18n'

type Props = ChildrenType & {
  params: { lang: Locale }
}

/**
 * 内部布局内容组件
 * 在 SessionProvider 内部使用 useMenu hook
 */
type InnerLayoutContentProps = {
  children: React.ReactNode
  dictionary: any
  lang: Locale
  direction: Direction
}

const InnerLayoutContent = ({ children, dictionary, lang, direction }: InnerLayoutContentProps) => {
  return (
    <DictionaryProvider value={{ dictionary }}>
      <AuthErrorHandler>
        <ClientAuthGuard locale={lang}>
          <RouteGuard>
            <LayoutWrapper
              systemMode='light'
              verticalLayout={
                <VerticalLayout
                  navigation={<Navigation dictionary={dictionary} mode='light' />}
                  navbar={<Navbar />}
                  footer={<VerticalFooter />}
                >
                  {children}
                </VerticalLayout>
              }
              horizontalLayout={
                <HorizontalLayout header={<Header dictionary={dictionary} />} footer={<HorizontalFooter />}>
                  {children}
                </HorizontalLayout>
              }
            />
            <ScrollToTop className='mui-fixed'>
              <Button
                variant='contained'
                className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'
              >
                <i className='ri-arrow-up-line' />
              </Button>
            </ScrollToTop>
            <Customizer dir={direction} />
          </RouteGuard>
        </ClientAuthGuard>
      </AuthErrorHandler>
    </DictionaryProvider>
  )
}

/**
 * 客户端布局组件
 * 使用 useDictionaryLoader hook 加载字典数据
 */
const ClientLayout = ({ children, params }: Props) => {
  const { lang } = params
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
      <InnerLayoutContent dictionary={dictionary} lang={lang} direction={direction}>
        {children}
      </InnerLayoutContent>
    </ClientProviders>
  )
}

export default ClientLayout
