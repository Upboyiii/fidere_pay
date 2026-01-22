// Next Imports
import type { Metadata } from 'next'

// Component Imports
import RemittanceRecords from '@views/remittance/RemittanceRecords'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '汇款记录',
  description: '查看汇款记录'
}

const RemittanceRecordsPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <RemittanceRecords mode={mode} />
}

export default RemittanceRecordsPage
