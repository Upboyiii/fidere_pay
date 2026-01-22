// Next Imports
import type { Metadata } from 'next'

// Component Imports
import CreateRemittance from '@views/remittance/CreateRemittance'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '创建汇款',
  description: '创建新的汇款订单'
}

const CreateRemittancePage = async () => {
  // Vars
  const mode = await getServerMode()

  return <CreateRemittance mode={mode} />
}

export default CreateRemittancePage
