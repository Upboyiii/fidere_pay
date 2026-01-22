// Next Imports
import type { Metadata } from 'next'

// Component Imports
import MyAssets from '@views/assets/MyAssets'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '我的资产',
  description: '查看和管理我的资产'
}

const MyAssetsPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <MyAssets mode={mode} />
}

export default MyAssetsPage
