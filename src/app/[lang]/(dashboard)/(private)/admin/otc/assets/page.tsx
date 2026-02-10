// Next Imports
import type { Metadata } from 'next'

// Component Imports
import AdminAssetList from '@views/admin/otc/AdminAssetList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { getDictionary } from '@/utils/getDictionary'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const otc = dict.adminOtc as Record<string, string>

  return {
    title: otc.userAssetList || '用户资产列表',
    description: otc.userAssetListDesc || '查看用户资产列表'
  }
}

const AdminAssetListPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <AdminAssetList mode={mode} />
}

export default AdminAssetListPage
