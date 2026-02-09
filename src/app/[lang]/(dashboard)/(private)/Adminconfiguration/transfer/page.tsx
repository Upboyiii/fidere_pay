// Next Imports
import type { Metadata } from 'next'

// Component Imports
import AdminTransferList from '@views/admin/otc/AdminTransferList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { getDictionary } from '@/utils/getDictionary'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const dict = await getDictionary(params.lang)
  const t = dict.navigation as any
  
  return {
    title: t.adminTransfer || '转账管理',
    description: t.adminTransfer || '管理转账申请和审核'
  }
}

const TransferPage = async ({ params }: { params: { lang: string } }) => {
  const mode = await getServerMode()

  return <AdminTransferList mode={mode} />
}

export default TransferPage
