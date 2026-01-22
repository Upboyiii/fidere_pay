// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import BlankLayoutWrapper from '@components/BlankLayoutWrapper'
import BlankLayout from '@layouts/BlankLayout'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

type Props = ChildrenType & {
  params: Promise<{ lang: Locale }>
}

const Layout = async (props: Props) => {
  const params = await props.params
  const { children } = props

  // Vars
  const systemMode = await getSystemMode()

  return (
    <BlankLayoutWrapper lang={params.lang}>
      <BlankLayout systemMode={systemMode}>{children}</BlankLayout>
    </BlankLayoutWrapper>
  )
}

export default Layout
