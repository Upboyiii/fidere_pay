// Next Imports
import type { Metadata } from 'next'

// Component Imports
import AdminAssetList from '@views/admin/otc/AdminAssetList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '资产管理',
  description: '管理数字资产配置'
}

const AssetManagementPage = async () => {
  const mode = await getServerMode()

  return <AdminAssetList mode={mode} />
}

export default AssetManagementPage
