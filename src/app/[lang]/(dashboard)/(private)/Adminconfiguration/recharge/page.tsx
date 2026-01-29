// Next Imports
import type { Metadata } from 'next'

// Component Imports
import AdminRechargeList from '@views/admin/otc/AdminRechargeList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '充值管理',
  description: '管理充值订单'
}

const RechargePage = async () => {
  const mode = await getServerMode()

  return <AdminRechargeList mode={mode} />
}

export default RechargePage
