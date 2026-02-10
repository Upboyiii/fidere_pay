// Next Imports
import type { Metadata } from 'next'

// Component Imports
import CallbackList from '@views/admin/otc/CallbackList'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { getDictionary } from '@/utils/getDictionary'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const otc = dict.adminOtc as Record<string, string>

  return {
    title: otc.callbackRecordList || '回调记录列表',
    description: otc.callbackRecordListDesc || '查看和管理回调记录'
  }
}

const CallbackListPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <CallbackList mode={mode} />
}

export default CallbackListPage
