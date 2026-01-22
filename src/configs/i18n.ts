export const i18n = {
  defaultLocale: 'zh-CN',
  locales: ['en', 'zh-CN', 'zh-Hant'],
  langDirection: {
    en: 'ltr',
    // fr: 'ltr',
    // ar: 'rtl',
    'zh-CN': 'ltr',
    'zh-Hant': 'ltr'
  }
} as const

export type Locale = (typeof i18n)['locales'][number]
