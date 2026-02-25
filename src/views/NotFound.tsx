'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// Type Imports
import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Illustrations from '@components/Illustrations'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Util Imports
import { getFirstMenuRoute } from '@configs/themeConfig'
import { getLocalizedUrl } from '@/utils/i18n'
import { getLoginPathBySource } from '@/utils/loginSource'

const LOGOUT_FLAG = 'logout_in_progress'

function getIsLogoutRedirect() {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(LOGOUT_FLAG) === 'true'
}

const NotFound = ({ mode }: { mode: Mode }) => {
  const [isLogoutRedirect] = useState(getIsLogoutRedirect)

  // 退出流程中落到 404 时只显示 loading，不展示 404 内容，避免被察觉
  if (isLogoutRedirect) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4' />
        </div>
      </div>
    )
  }

  // Vars
  const darkImg = '/images/pages/misc-mask-dark.png'
  const lightImg = '/images/pages/misc-mask-light.png'
  // Hooks
  const { lang: locale } = useParams()
  const miscBackground = useImageVariant(mode, lightImg, darkImg)
  const [homeUrl, setHomeUrl] = useState('/')

  // 在客户端设置首页 URL，避免 hydration 错误
  useEffect(() => {
    const firstRoute = getFirstMenuRoute()
    const lang = (locale as Locale) || 'zh-CN'
    const localizedUrl = getLocalizedUrl(firstRoute, lang)
    setHomeUrl(localizedUrl)
  }, [locale])

  return (
    <div className='flex items-center justify-center min-bs-[100dvh] relative p-6 overflow-x-hidden'>
      <div className='flex items-center flex-col text-center gap-10'>
        <div className='flex flex-col gap-2 is-[90vw] sm:is-[unset]'>
          <Typography className='font-medium text-8xl' color='text.primary'>
            404
          </Typography>
          <Typography variant='h4'>Page Not Found ⚠️</Typography>
          <Typography>We couldn&#39;t find the page you are looking for.</Typography>
        </div>
        <img
          alt='error-illustration'
          src='/images/illustrations/characters/5.png'
          className='object-cover bs-[400px] md:bs-[450px] lg:bs-[500px]'
        />
        <div className='flex gap-4 justify-center flex-wrap'>
          <Button href={homeUrl} component={Link} variant='contained'>
            Back to Home
          </Button>
          <Button href={getLocalizedUrl(getLoginPathBySource(), locale as Locale)} component={Link} variant='outlined'>
            Back to Login
          </Button>
        </div>
      </div>
      <Illustrations maskImg={{ src: miscBackground }} />
    </div>
  )
}

export default NotFound
