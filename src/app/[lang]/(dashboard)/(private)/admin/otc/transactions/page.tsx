// Next Imports
import type { Metadata } from 'next'

// Component Imports
import AdminTransactionList from '@views/admin/otc/AdminTransactionList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '资金流水列表',
  description: '查看资金流水记录'
}

const AdminTransactionListPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <AdminTransactionList mode={mode} />
}

export default AdminTransactionListPage
