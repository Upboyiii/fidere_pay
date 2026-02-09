// Next Imports
import type { Metadata } from 'next'

// Component Imports
import SecuritySettings from '@views/settings/SecuritySettings'

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
  const dictionary = await getDictionary(lang)
  
  return {
    title: dictionary.settings.title,
    description: dictionary.settings.description
  }
}

const SettingsPage = async (props: Props) => {
  // Vars
  try {
    const mode = await getServerMode()
    return <SecuritySettings mode={mode} />
  } catch (error) {
    console.error('Settings page error:', error)
    // 如果获取 mode 失败，使用默认值
    return <SecuritySettings mode='light' />
  }
}

export default SettingsPage
