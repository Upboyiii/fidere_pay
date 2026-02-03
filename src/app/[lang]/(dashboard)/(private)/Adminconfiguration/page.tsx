// Next Imports
import type { Metadata } from 'next'

// Component Imports
import AdminDashboard from '@views/admin/otc/AdminDashboard'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: '管理员配置',
  description: '管理员配置中心'
}

const AdminConfigurationPage = async () => {
  const mode = await getServerMode()

  return <AdminDashboard mode={mode} />
}

export default AdminConfigurationPage
