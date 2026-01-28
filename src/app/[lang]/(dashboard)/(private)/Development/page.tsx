// Next Imports
import type { Metadata } from 'next'

// Component Imports
import ApiKeyManagement from '@views/development/ApiKeyManagement'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '开发配置',
  description: 'API Key配置与管理'
}

const DevelopmentPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <ApiKeyManagement mode={mode} />
}

export default DevelopmentPage
