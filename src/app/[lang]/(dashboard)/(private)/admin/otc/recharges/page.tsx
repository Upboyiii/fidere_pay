// Next Imports
import type { Metadata } from 'next'

// Component Imports
import AdminRechargeList from '@views/admin/otc/AdminRechargeList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '充值记录列表',
  description: '查看和管理充值记录'
}

const AdminRechargeListPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <AdminRechargeList mode={mode} />
}

export default AdminRechargeListPage
