// Next Imports
import type { Metadata } from 'next'

// Component Imports
import Deposit from '@views/remittance/Deposit'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '充值',
  description: '数字货币充值'
}

const DepositPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <Deposit mode={mode} />
}

export default DepositPage
