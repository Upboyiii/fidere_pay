// Next Imports
import type { Metadata } from 'next'

// Component Imports
import UserTransferList from '@views/otc/UserTransferList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '转账记录',
  description: '查看我的转账记录'
}

const UserTransferListPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <UserTransferList mode={mode} />
}

export default UserTransferListPage
