'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter, usePathname } from 'next/navigation'

// MUI Imports
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

// Type Imports
import type { Locale } from '@configs/i18n'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const LanguageSwitcher = ({ currentLocale }: { currentLocale: Locale }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLanguageChange = (locale: Locale) => {
    // 获取当前路径（去掉语言前缀）
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/'

    // 生成新的本地化 URL
    const newUrl = getLocalizedUrl(pathWithoutLocale, locale)

    // 跳转到新语言版本
    router.push(newUrl)
    handleClose()
  }

  const languageNames = {
    en: 'English',
    fr: 'Français',
    ar: 'العربية',
    'zh-CN': '简体中文'
  }

  const languageFlags = {
    en: '🇺🇸',
    fr: '🇫🇷',
    ar: '🇸🇦',
    'zh-CN': '🇨🇳'
  }

  return (
    <>
      <Button onClick={handleClick} variant='outlined' startIcon={<span>{languageFlags[currentLocale]}</span>}>
        {languageNames[currentLocale]}
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {i18n.locales.map(locale => (
          <MenuItem key={locale} onClick={() => handleLanguageChange(locale)} selected={locale === currentLocale}>
            <ListItemIcon>
              <span>{languageFlags[locale]}</span>
            </ListItemIcon>
            <ListItemText>{languageNames[locale]}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default LanguageSwitcher
