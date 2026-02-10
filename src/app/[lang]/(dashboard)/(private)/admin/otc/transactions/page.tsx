// Next Imports
import type { Metadata } from 'next'

// Component Imports
import AdminTransactionList from '@views/admin/otc/AdminTransactionList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { getDictionary } from '@/utils/getDictionary'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const otc = dict.adminOtc as Record<string, string>

  return {
    title: otc.financialList || '资金流水列表',
    description: otc.financialListDesc || '查看资金流水记录'
  }
}

const AdminTransactionListPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <AdminTransactionList mode={mode} />
}

export default AdminTransactionListPage
