// Next Imports
import type { Metadata } from 'next'

// Component Imports
import EditRecipient from '@views/remittance/EditRecipient'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '编辑收款人',
  description: '编辑收款人信息'
}

const EditRecipientPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <EditRecipient mode={mode} />
}

export default EditRecipientPage
