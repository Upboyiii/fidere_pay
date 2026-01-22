// Next Imports
import type { Metadata } from 'next'

// Component Imports
import TransactionHistory from '@views/assets/TransactionHistory'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '交易流水',
  description: '查看交易流水记录'
}

const TransactionHistoryPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <TransactionHistory mode={mode} />
}

export default TransactionHistoryPage
