// Next Imports
import type { Metadata } from 'next'

// Component Imports
import AdminAssetList from '@views/admin/otc/AdminAssetList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { getDictionary } from '@/utils/getDictionary'

// Type Imports
import type { Locale } from '@configs/i18n'

type Props = {
  params: Promise<{ lang: Locale }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return {
    title: dict.adminOtc.assetManagement,
    description: dict.adminOtc.assetManagementDesc
  }
}

const AssetManagementPage = async () => {
  const mode = await getServerMode()

  return <AdminAssetList mode={mode} />
}

export default AssetManagementPage
