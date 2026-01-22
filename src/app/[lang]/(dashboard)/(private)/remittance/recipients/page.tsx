// Next Imports
import type { Metadata } from 'next'

// Component Imports
import RecipientList from '@views/remittance/RecipientList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '收款人列表',
  description: '管理收款人信息'
}

const RecipientListPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <RecipientList mode={mode} />
}

export default RecipientListPage
