// Next Imports
import type { Metadata } from 'next'

// Component Imports
import CallbackList from '@views/admin/otc/CallbackList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '回调记录列表',
  description: '查看和管理回调记录'
}

const CallbackListPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <CallbackList mode={mode} />
}

export default CallbackListPage
