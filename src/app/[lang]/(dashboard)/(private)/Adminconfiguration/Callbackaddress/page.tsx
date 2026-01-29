// Next Imports
import type { Metadata } from 'next'

// Component Imports
import CallbackList from '@views/admin/otc/CallbackList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '回调地址',
  description: '管理回调地址配置'
}

const CallbackAddressPage = async () => {
  const mode = await getServerMode()

  return <CallbackList mode={mode} />
}

export default CallbackAddressPage
