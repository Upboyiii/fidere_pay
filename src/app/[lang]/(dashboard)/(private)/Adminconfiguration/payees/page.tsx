// Next Imports
import type { Metadata } from 'next'

// Component Imports
import AdminPayeeList from '@views/admin/otc/AdminPayeeList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { getDictionary } from '@/utils/getDictionary'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const dict = await getDictionary(params.lang)
  const t = dict.navigation as any

  return {
    title: t.adminPayees || '收款人列表',
    description: t.adminPayees || '管理平台收款人列表'
  }
}

const AdminPayeesPage = async ({ params }: { params: { lang: string } }) => {
  const mode = await getServerMode()

  return <AdminPayeeList mode={mode} />
}

export default AdminPayeesPage
