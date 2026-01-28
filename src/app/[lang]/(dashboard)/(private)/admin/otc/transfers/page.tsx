// Next Imports
import type { Metadata } from 'next'

// Component Imports
import AdminTransferList from '@views/admin/otc/AdminTransferList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '转账申请列表',
  description: '审核和管理转账申请'
}

const AdminTransferListPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <AdminTransferList mode={mode} />
}

export default AdminTransferListPage
