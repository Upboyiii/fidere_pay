// Next Imports
import type { Metadata } from 'next'

// Component Imports
import SystemParameter from '@/views/admin/systemParameter'

// Util Imports
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
    title: dict.admin.systemParameterConfigTitle,
    description: dict.admin.systemParameterConfigDesc
  }
}

export default async function SystemParameterPage() {
  return <SystemParameter />
}
