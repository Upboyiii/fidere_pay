// Next Imports
import type { Metadata } from 'next'

// Component Imports
import SecuritySettings from '@views/otc/SecuritySettings'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '安全设置',
  description: '管理安全设置'
}

const SecuritySettingsPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <SecuritySettings mode={mode} />
}

export default SecuritySettingsPage
