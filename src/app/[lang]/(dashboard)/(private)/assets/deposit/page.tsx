// Next Imports
import type { Metadata } from 'next'

// Component Imports
import Deposit from '@views/remittance/Deposit'

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
    title: dictionary.assets.depositPageTitle,
    description: dictionary.assets.depositPageDescription
  }
}

const DepositPage = async (props: Props) => {
  // Vars
  const mode = await getServerMode()

  return <Deposit mode={mode} />
}

export default DepositPage
