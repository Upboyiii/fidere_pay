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
  try {
    const mode = await getServerMode()
    return <SecuritySettings mode={mode} />
  } catch (error) {
    console.error('Settings page error:', error)
    // 如果获取 mode 失败，使用默认值
    return <SecuritySettings mode='light' />
  }
}

export default SettingsPage
