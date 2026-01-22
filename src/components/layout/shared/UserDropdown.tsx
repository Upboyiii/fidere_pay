'use client'

// React Imports
import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import { logoutApi } from '@/@server/login'
import { clearCache } from '@/@server/admin'
import { useTranslate } from '@/contexts/DictionaryContext'
import { toast } from 'react-toastify'
// import { useParams, useRouter, useSearchParams } from 'next/navigation'

// Third-party Imports
import { signOut, useSession } from 'next-auth/react'

// Type Imports
import type { Locale } from '@configs/i18n'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [clearingCache, setClearingCache] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const { data: session } = useSession()
  const { settings } = useSettings()
  const { lang: locale } = useParams()
  const t = useTranslate()
  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      router.push(getLocalizedUrl(url, locale as Locale))
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    // 调用退出接口，即使失败也继续执行后续操作
    try {
      await logoutApi()
    } catch (error) {}

    // 先关闭下拉菜单，避免UI状态冲突
    setOpen(false)

    // 清理本地存储的token和用户数据（先清理，避免signOut过程中的状态冲突）
    localStorage.removeItem('auth_tokens')
    localStorage.removeItem('userRole')

    // 清理sessionStorage中的重定向标记和验证码状态
    if (typeof window !== 'undefined') {
      // 清除所有重定向相关的标记
      sessionStorage.removeItem('auth_redirect_triggered')
      sessionStorage.removeItem('auth_redirect_executed')
      sessionStorage.setItem('resetCaptcha', 'true')

      // 清除所有相关的cookie（包括NextAuth的cookie）
      const cookiesToClear = [
        'next-auth.session-token',
        '__Secure-next-auth.session-token',
        '__Host-next-auth.session-token',
        'next-auth.csrf-token',
        '__Secure-next-auth.csrf-token'
      ]

      // 清除每个cookie（通过设置过期时间为过去的时间）
      cookiesToClear.forEach(cookieName => {
        // 清除当前路径下的cookie
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure`
        // 清除根路径下的cookie
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
        // 清除带.前缀的域名cookie（用于子域名）
        if (window.location.hostname.includes('.')) {
          const domain = '.' + window.location.hostname.split('.').slice(-2).join('.')
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`
        }
      })
    }

    // 立即调用signOut，不使用延迟
    try {
      // 调用NextAuth的signOut清除session
      await signOut({
        redirect: false, // 不自动重定向，我们手动处理
        callbackUrl: '/login'
      })
    } catch (signOutError) {
      console.warn('signOut调用失败，但继续清理流程:', signOutError)
    }

    // 强制跳转到登录页，确保浏览器加载最新代码
    // 问题场景：如果用户之前打开过页面，关闭后发布了新版本，浏览器可能缓存了旧的JavaScript代码
    // 解决方案：使用window.location.replace + 时间戳参数，强制浏览器重新加载页面，不使用任何缓存
    const loginUrl = getLocalizedUrl('/login', locale as string)
    // 添加时间戳和随机参数，强制浏览器重新加载页面，不使用缓存
    const separator = loginUrl.includes('?') ? '&' : '?'
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const finalLoginUrl = `${loginUrl}${separator}_t=${timestamp}&_r=${random}`

    // 使用window.location.replace确保：
    // 1. 不会在历史记录中留下记录（用户无法通过后退按钮回到退出前的页面）
    // 2. 强制浏览器重新加载页面，不使用任何缓存（包括Service Worker缓存）
    // 3. 确保加载的是最新版本的代码，而不是缓存的旧代码
    window.location.replace(finalLoginUrl)
  }

  /**
   * 清除缓存
   */
  const handleClearCache = async () => {
    try {
      setClearingCache(true)
      await clearCache()
      toast.success(t('auth.clearCacheSuccess'))
      // 接口成功后刷新页面
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error: any) {
      toast.error(error?.message || t('auth.clearCacheFailed'))
    } finally {
      setClearingCache(false)
    }
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar
          ref={anchorRef}
          alt={session?.user?.name || ''}
          src={session?.user?.image || ''}
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                    <Avatar alt={session?.user?.name || ''} src={session?.user?.image || ''} />
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {session?.user?.name || ''}
                      </Typography>
                      <Typography variant='caption'>{session?.user?.email || ''}</Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  {/* <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/pages/user-profile')}>
                    <i className='ri-user-3-line' />
                    <Typography color='text.primary'>My Profile</Typography>
                  </MenuItem> */}
                  {/* <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/pages/account-settings')}>
                    <i className='ri-settings-4-line' />
                    <Typography color='text.primary'>Settings</Typography>
                  </MenuItem> */}
                  {/* <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/pages/pricing')}>
                    <i className='ri-money-dollar-circle-line' />
                    <Typography color='text.primary'>Pricing</Typography>
                  </MenuItem> */}
                  {/* <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/pages/faq')}>
                    <i className='ri-question-line' />
                    <Typography color='text.primary'>FAQ</Typography>
                  </MenuItem> */}
                  <MenuItem className='gap-3' onClick={handleClearCache} disabled={clearingCache}>
                    <i className='ri-delete-bin-line' />
                    <Typography color='text.primary'>
                      {clearingCache ? t('auth.clearingCache') : t('auth.clearCache')}
                    </Typography>
                  </MenuItem>
                  <Divider className='mlb-1' />
                  <div className='flex items-center plb-2 pli-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='ri-logout-box-r-line' />}
                      onClick={handleUserLogout}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      {t('auth.logout')}
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
