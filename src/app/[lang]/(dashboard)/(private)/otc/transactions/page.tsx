// Next Imports
import type { Metadata } from 'next'

// Component Imports
import UserTransactionList from '@views/otc/UserTransactionList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { getDictionary } from '@/utils/getDictionary'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const assets = dict.assets as Record<string, string>

  return {
    title: assets.fundFlow || '资金流水',
    description: assets.fundFlowDesc || '查看我的资金流水'
  }
}

const UserTransactionListPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <UserTransactionList mode={mode} />
}

export default UserTransactionListPage
