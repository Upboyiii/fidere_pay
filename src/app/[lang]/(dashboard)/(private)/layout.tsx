// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import ClientLayout from '@components/ClientLayout'

const Layout = async (props: ChildrenType & { params: Promise<{ lang: Locale }> }) => {
  const params = await props.params
  const { children } = props

  return <ClientLayout params={params}>{children}</ClientLayout>
}

export default Layout
