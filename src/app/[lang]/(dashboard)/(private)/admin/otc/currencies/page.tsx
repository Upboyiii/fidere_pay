// Next Imports
import type { Metadata } from 'next'

// Component Imports
import CurrencyList from '@views/admin/otc/CurrencyList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '币种管理',
  description: '管理币种配置'
}

const CurrencyListPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <CurrencyList mode={mode} />
}

export default CurrencyListPage
