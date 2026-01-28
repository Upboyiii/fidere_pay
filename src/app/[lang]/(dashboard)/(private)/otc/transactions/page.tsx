// Next Imports
import type { Metadata } from 'next'

// Component Imports
import UserTransactionList from '@views/otc/UserTransactionList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '资金流水',
  description: '查看我的资金流水'
}

const UserTransactionListPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <UserTransactionList mode={mode} />
}

export default UserTransactionListPage
