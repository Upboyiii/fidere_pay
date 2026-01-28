// Next Imports
import type { Metadata } from 'next'

// Component Imports
import FeeConfigList from '@views/admin/otc/FeeConfigList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '手续费配置',
  description: '管理手续费配置'
}

const FeeConfigListPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <FeeConfigList mode={mode} />
}

export default FeeConfigListPage
