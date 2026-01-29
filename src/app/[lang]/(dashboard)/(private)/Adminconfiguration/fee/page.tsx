// Next Imports
import type { Metadata } from 'next'

// Component Imports
import FeeConfigList from '@views/admin/otc/FeeConfigList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '手续费管理',
  description: '配置手续费规则'
}

const FeePage = async () => {
  const mode = await getServerMode()

  return <FeeConfigList mode={mode} />
}

export default FeePage
