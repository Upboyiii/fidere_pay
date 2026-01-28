// Next Imports
import type { Metadata } from 'next'

// Component Imports
import ApiKeyList from '@views/otc/ApiKeyList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'API Key管理',
  description: '管理我的API Key'
}

const ApiKeyListPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <ApiKeyList mode={mode} />
}

export default ApiKeyListPage
