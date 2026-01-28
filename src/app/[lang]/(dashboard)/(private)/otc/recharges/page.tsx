// Next Imports
import type { Metadata } from 'next'

// Component Imports
import UserRechargeList from '@views/otc/UserRechargeList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '充值记录',
  description: '查看我的充值记录'
}

const UserRechargeListPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <UserRechargeList mode={mode} />
}

export default UserRechargeListPage
