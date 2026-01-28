// Next Imports
import type { Metadata } from 'next'

// Component Imports
import SecuritySettings from '@views/settings/SecuritySettings'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '安全设置',
  description: '管理您的账户安全设置'
}

const SettingsPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <SecuritySettings mode={mode} />
}

export default SettingsPage
