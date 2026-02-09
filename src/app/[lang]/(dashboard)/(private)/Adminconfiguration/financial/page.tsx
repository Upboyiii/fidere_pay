// Next Imports
import type { Metadata } from 'next'

// Component Imports
import AdminTransactionList from '@views/admin/otc/AdminTransactionList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { getDictionary } from '@/utils/getDictionary'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const dict = await getDictionary(params.lang)
  const t = dict.navigation as any
  
  return {
    title: t.adminFinancial || '资金流水',
    description: t.adminFinancial || '查看资金流水记录'
  }
}

const FinancialPage = async ({ params }: { params: { lang: string } }) => {
  const mode = await getServerMode()

  return <AdminTransactionList mode={mode} />
}

export default FinancialPage
