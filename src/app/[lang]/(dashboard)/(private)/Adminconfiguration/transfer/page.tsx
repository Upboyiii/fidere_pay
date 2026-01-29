// Next Imports
import type { Metadata } from 'next'

// Component Imports
import AdminTransferList from '@views/admin/otc/AdminTransferList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '转账管理',
  description: '管理转账申请和审核'
}

const TransferPage = async () => {
  const mode = await getServerMode()

  return <AdminTransferList mode={mode} />
}

export default TransferPage
