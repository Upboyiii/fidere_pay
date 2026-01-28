// Next Imports
import type { Metadata } from 'next'

// Component Imports
import AdminAssetList from '@views/admin/otc/AdminAssetList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '用户资产列表',
  description: '查看用户资产列表'
}

const AdminAssetListPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <AdminAssetList mode={mode} />
}

export default AdminAssetListPage
