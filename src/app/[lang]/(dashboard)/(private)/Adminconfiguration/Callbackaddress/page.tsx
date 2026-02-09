// Next Imports
import type { Metadata } from 'next'

// Component Imports
import CallbackList from '@views/admin/otc/CallbackList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { getDictionary } from '@/utils/getDictionary'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const dict = await getDictionary(params.lang)
  const t = dict.navigation as any
  
  return {
    title: t.adminCallbackAddress || '回调地址',
    description: t.adminCallbackAddress || '管理回调地址配置'
  }
}

const CallbackAddressPage = async ({ params }: { params: { lang: string } }) => {
  const mode = await getServerMode()

  return <CallbackList mode={mode} />
}

export default CallbackAddressPage
