'use client'

// React Imports
import { useState, useEffect, useCallback, useRef } from 'react'

import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { GET_THEME_CONFIG, SITE_CONFIG, GET_ENTRANCE } from '@/utils/siteConfig'
import { ENV_CONFIG } from '@server/config'

// Component Imports
import LogoSvg from '@core/svg/Logo'

// Third-party Imports
import { signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, pipe, nonEmpty } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import { toast } from 'react-toastify'

// Type Imports
import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports

// Config Imports
import { getFirstMenuRoute } from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import useThemeByRole from '@core/hooks/useThemeByRole'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { getCaptchaImg, loginApi, verify2faApi } from '@server/login'
import type { LoginResponse } from '@server/login'
import { TokenManager } from '@/utils/tokenManager'
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select'

// Hook Imports
import { useTranslate, useDictionary } from '@/contexts/DictionaryContext'

// 全局标记，防止重复调用验证码接口
let captchaRequested = false

type ErrorType = {
  message: string[]
}

// 动态创建 schema，因为需要翻译函数
const createSchema = (t: (key: string, params?: Record<string, string | number>) => string) =>
  object({
    email: pipe(string(), minLength(1, t('auth.emailRequired') || 'This field is required')),
    password: pipe(
      string(),
      nonEmpty(t('auth.passwordRequired') || 'This field is required'),
      minLength(5, t('auth.passwordMinLength') || 'Password must be at least 5 characters long')
    ),
    totp: pipe(string(), minLength(1, t('auth.captchaRequired') || 'This field is required'))
  })

type FormData = InferInput<ReturnType<typeof createSchema>>

const Login = ({ mode }: { mode: Mode }) => {

  // Hooks
  const dictionary = useDictionary()
  const t = useTranslate()

  // 如果字典未加载，显示加载状态（但在 BlankLayoutWrapper 中已经有加载状态，这里只是额外保护）
  if (!dictionary || !dictionary.auth) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
        </div>
      </div>
    )
  }

  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const [captchaImg, setCaptchaImg] = useState<any>(null)
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const captchaPromiseRef = useRef<Promise<any> | null>(null)

  const [selectValue, setSelectValue] = useState('kyc')
  
  // 谷歌验证码弹窗相关状态
  const [googleAuthDialogOpen, setGoogleAuthDialogOpen] = useState(false)
  const [googleAuthTab, setGoogleAuthTab] = useState(0) // 0: 谷歌验证, 1: 邮箱验证
  const [googleAuthCode, setGoogleAuthCode] = useState(['', '', '', '', '', ''])
  const [pendingLoginData, setPendingLoginData] = useState<FormData | null>(null)
  const [tempToken, setTempToken] = useState<string>('') // 2FA 临时 token
  const googleAuthInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [verifyLoading, setVerifyLoading] = useState(false)
  
  // 主题切换动画相关状态
  const [themeTransition, setThemeTransition] = useState(false)
  const [pendingMode, setPendingMode] = useState<'light' | 'dark' | null>(null)
  
  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const { settings, updateSettings } = useSettings()
  const { updateThemeByRole } = useThemeByRole()

  // 获取当前主题模式（优先使用 settings.mode，否则使用 prop）
  const currentMode = settings.mode || mode

  // 主题切换处理函数
  const handleThemeToggle = () => {
    const newMode = currentMode === 'dark' ? 'light' : 'dark'
    setPendingMode(newMode)
    setThemeTransition(true)
    
    // 动画进行到一半时切换主题
    setTimeout(() => {
      updateSettings({ mode: newMode })
    }, 400)
    
    // 动画结束后清除状态
    setTimeout(() => {
      setThemeTransition(false)
      setPendingMode(null)
    }, 800)
  }

  // 创建 schema，使用翻译函数（确保字典已加载）
  const schema = createSchema(t)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      totp: ''
    }
  })

  const requestCaptchaImg = useCallback(async () => {
    try {
      setCaptchaLoading(true)
      const res = await getCaptchaImg()

      if (res?.data) {
        // 处理验证码图片数据
        setCaptchaImg(res.data)
      }
      return res
    } catch (error) {
      throw error
    } finally {
      setCaptchaLoading(false)
      captchaPromiseRef.current = null // 清除Promise引用
    }
  }, [])

  useEffect(() => {
    // 检查是否需要重置验证码状态（退出登录后）
    const shouldResetCaptcha = sessionStorage.getItem('resetCaptcha')
    if (shouldResetCaptcha === 'true') {
      // 重置全局标记和验证码状态
      captchaRequested = false
      setCaptchaImg(null)
      sessionStorage.removeItem('resetCaptcha')
    }

    // 使用全局标记确保只执行一次
    if (!captchaRequested) {
      captchaRequested = true
      requestCaptchaImg()
    }
  }, [requestCaptchaImg]) // 添加 requestCaptchaImg 到依赖数组

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  // 处理谷歌验证码输入
  const handleGoogleAuthCodeChange = (index: number, value: string) => {
    // 只允许数字
    const numericValue = value.replace(/[^0-9]/g, '')
    
    if (numericValue.length <= 1) {
      const newCode = [...googleAuthCode]
      newCode[index] = numericValue
      setGoogleAuthCode(newCode)
      
      // 自动跳转到下一个输入框
      if (numericValue && index < 5) {
        googleAuthInputRefs.current[index + 1]?.focus()
      }
    } else if (numericValue.length === 6) {
      // 处理粘贴整个验证码的情况
      setGoogleAuthCode(numericValue.split(''))
      googleAuthInputRefs.current[5]?.focus()
    }
  }

  // 处理谷歌验证码输入框的键盘事件
  const handleGoogleAuthKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !googleAuthCode[index] && index > 0) {
      googleAuthInputRefs.current[index - 1]?.focus()
    }
  }

  // 关闭谷歌验证码弹窗
  const handleCloseGoogleAuthDialog = () => {
    setGoogleAuthDialogOpen(false)
    setGoogleAuthCode(['', '', '', '', '', ''])
    setPendingLoginData(null)
    setTempToken('')
    setGoogleAuthTab(0)
  }

  // 处理登录成功后的逻辑
  const handleLoginSuccess = async (res: { data: LoginResponse }, formData: FormData) => {
    // 检查 menuList 可能的位置
    const menuList = res.data.menuList || res.data.menu || res.data?.userInfo?.menuList || []
    const { token, refreshToken, expires, permissions, roles } = res.data
    const { avatar, userName, userNickname, isAdmin } = res?.data?.userInfo || {}
    // 确保 menuList 是数组格式，然后转为 JSON 字符串存储
    const normalizedMenuList = Array.isArray(menuList) ? menuList : []
    const menuListJson = normalizedMenuList.length > 0 ? JSON.stringify(normalizedMenuList) : '[]'
    const _selectValue = ENV_CONFIG?.IS_DEVELOPMENT ? selectValue : SITE_CONFIG?.SITE_TYPE
    // 存储到session中
    const signInData = {
      email: formData.email,
      password: formData.password,
      accessToken: token,
      refreshToken,
      username: userName,
      nickname: userNickname,
      avatar,
      permissions,
      roles,
      timestamp: Date.now(),
      role: _selectValue,
      isAdmin,
      menuList: menuListJson
    }
    // signIn 时不传递 menuList，避免存储在 JWT token/cookie 中导致 431 错误
    const { menuList: _, ...signInCredentials } = signInData
    const signInResult = await signIn('credentials', {
      ...signInCredentials,
      redirect: false
    })
    // 检查signIn是否成功
    if (signInResult?.error) {
      toast.error(t('auth.signInFailed', { error: signInResult.error }))
      return
    }
    // 存储用户角色到 localStorage
    localStorage.setItem('userRole', _selectValue)
    // 使用 TokenManager 存储到 localStorage
    TokenManager.setTokens(signInData)
    // 清除重定向标记（防止重复重定向）
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_redirect_triggered')
      sessionStorage.removeItem('auth_redirect_executed')
    }
    // 关闭弹窗（如果有的话）
    handleCloseGoogleAuthDialog()
    // 显示成功提示
    toast.success(t('auth.loginSuccess'))
    // 根据用户角色更新主题设置
    updateThemeByRole(signInData)
    // 默认跳转到"我的资产"页面，如果有 redirectTo 参数则优先使用
    const defaultHomePage = '/assets/my-assets'
    const redirectURL = searchParams.get('redirectTo') ?? defaultHomePage
    const finalUrl = getLocalizedUrl(redirectURL, locale as Locale)
    router.replace(finalUrl)
  }

  // 第一步：提交登录，检查是否需要 2FA
  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    try {
      setLoginLoading(true)
      setErrorState(null)

      const res = await loginApi({
        username: data.email,
        password: data.password,
        verifyCode: data.totp,
        verifyKey: captchaImg?.key,
        entrance: GET_ENTRANCE?.() ?? 'MANAGEMENT'
      })

      if (res?.data) {
        // 检查是否需要 2FA 验证
        if (res.data.needGoogleAuth && res.data.tempToken) {
          // 需要 2FA，保存数据并打开验证码弹窗
          setPendingLoginData(data)
          setTempToken(res.data.tempToken)
          setGoogleAuthDialogOpen(true)
          setGoogleAuthCode(['', '', '', '', '', ''])
          // 聚焦第一个输入框
          setTimeout(() => {
            googleAuthInputRefs.current[0]?.focus()
          }, 100)
        } else {
          // 不需要 2FA，直接登录成功
          await handleLoginSuccess(res, data)
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('auth.loginFailed')
      toast.error(errorMessage)
      requestCaptchaImg()
    } finally {
      setLoginLoading(false)
    }
  }

  // 第二步：验证谷歌验证码
  const handleGoogleAuthSubmit = async () => {
    if (!pendingLoginData || !tempToken) return
    
    const googleCode = googleAuthCode.join('')
    if (googleCode.length !== 6) {
      toast.error('请输入6位验证码')
      return
    }

    try {
      setVerifyLoading(true)

      const res = await verify2faApi({
        tempToken: tempToken,
        googleCode: googleCode
      })
      
      if (res?.data) {
        await handleLoginSuccess(res, pendingLoginData)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('auth.loginFailed')
      toast.error(errorMessage)
      // 清空验证码输入
      setGoogleAuthCode(['', '', '', '', '', ''])
      googleAuthInputRefs.current[0]?.focus()
    } finally {
      setVerifyLoading(false)
    }
  }

  return (
    <div 
      className='flex bs-full min-bs-[100dvh] relative overflow-hidden transition-colors duration-500'
      style={{ backgroundColor: currentMode === 'dark' ? '#0f0f1a' : '#f8fafc' }}
    >
      {/* 现代感网格背景 */}
      <div 
        className='absolute inset-0 z-0'
        style={{
          backgroundImage: currentMode === 'dark'
            ? `
              linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `
            : `
              linear-gradient(to right, rgba(0, 0, 0, 0.07) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.07) 1px, transparent 1px)
            `,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 90%)'
        }}
      />
      
      {/* 极简背景光晕修饰 */}
      <div 
        className='absolute -top-24 -left-24 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-60'
      />
      <div 
        className='absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-60'
      />
      
      {/* 顶部 Header */}
      <div className='absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-8'>
        <div className='flex items-center gap-2.5'>
          <LogoSvg className='h-[34px] w-[34px] flex-shrink-0' />
          <Typography 
            variant='h6' 
            sx={{ 
              fontWeight: 700,
              color: 'text.primary',
              fontSize: '1.4rem',
              letterSpacing: '-0.02em'
            }}
          >
            Fidere Pay
          </Typography>
        </div>
        <div className='flex items-center gap-4'>
          <IconButton size='medium' sx={{ color: 'text.secondary' }}>
            <i className='ri-translate-2-line' />
          </IconButton>
          <IconButton 
            size='medium' 
            onClick={handleThemeToggle}
            sx={{ 
              color: 'text.secondary',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'rotate(20deg)'
              }
            }}
          >
            <i className={currentMode === 'dark' ? 'ri-sun-line' : 'ri-moon-line'} />
          </IconButton>
        </div>
      </div>

      {/* 主题切换月牙动画遮罩 */}
      {themeTransition && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 9999,
            pointerEvents: 'none',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: '-100vmax',
              width: '200vmax',
              height: '200vmax',
              borderRadius: '50%',
              transform: 'translateY(-50%)',
              bgcolor: pendingMode === 'dark' ? '#1a1a2e' : '#f8fafc',
              animation: 'crescentSwipe 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
              boxShadow: pendingMode === 'dark' 
                ? 'inset 30px 0 80px rgba(255, 255, 255, 0.1), -20px 0 60px rgba(0, 0, 0, 0.5)'
                : 'inset -30px 0 80px rgba(0, 0, 0, 0.05), 20px 0 60px rgba(0, 0, 0, 0.1)',
              '@keyframes crescentSwipe': {
                '0%': {
                  right: '-200vmax',
                  opacity: 0.8
                },
                '50%': {
                  right: '-50vmax',
                  opacity: 1
                },
                '100%': {
                  right: '100vmax',
                  opacity: 0
                }
              }
            }}
          >
            {/* 月牙内部光晕效果 */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60%',
                height: '60%',
                borderRadius: '50%',
                background: pendingMode === 'dark'
                  ? 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
                animation: 'pulseGlow 0.8s ease-out'
              }}
            />
          </Box>
          
          {/* 星星/阳光粒子效果 */}
          {[...Array(8)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: pendingMode === 'dark' ? '4px' : '8px',
                height: pendingMode === 'dark' ? '4px' : '8px',
                borderRadius: '50%',
                bgcolor: pendingMode === 'dark' ? '#fff' : '#fbbf24',
                top: `${20 + Math.random() * 60}%`,
                right: `${10 + i * 10}%`,
                opacity: 0,
                animation: `sparkle 0.8s ${0.1 + i * 0.05}s ease-out forwards`,
                boxShadow: pendingMode === 'dark'
                  ? '0 0 10px #fff, 0 0 20px #fff'
                  : '0 0 10px #fbbf24, 0 0 20px #fbbf24',
                '@keyframes sparkle': {
                  '0%': {
                    opacity: 0,
                    transform: 'scale(0) translateX(0)'
                  },
                  '50%': {
                    opacity: 1,
                    transform: 'scale(1.5) translateX(-50px)'
                  },
                  '100%': {
                    opacity: 0,
                    transform: 'scale(0) translateX(-100px)'
                  }
                }
              }}
            />
          ))}
        </Box>
      )}

      {/* 主要内容区域 */}
      <div className='flex flex-col md:flex-row w-full relative z-10 max-w-[1600px] mx-auto'>
        {/* 左侧信息展示区域 */}
        <div className='hidden md:flex flex-col justify-center flex-1 p-12 md:p-20 lg:p-32'>
          <div className='max-w-xl'>
            <Typography 
              variant='h2' 
              sx={{ 
                fontWeight: 800,
                fontSize: { md: '3rem', lg: '3.5rem' },
                color: 'text.primary',
                mb: 3,
                lineHeight: 1.1,
                letterSpacing: '-0.03em'
              }}
            >
              全球收付款平台
            </Typography>
            
            <Typography 
              variant='h5' 
              sx={{ 
                color: 'primary.main',
                mb: 4,
                fontWeight: 600,
                letterSpacing: '0.1em'
              }}
            >
              安全 · 便捷 · 高效
            </Typography>
            
            <Typography 
              variant='body1' 
              sx={{ 
                color: 'text.secondary',
                mb: 8,
                lineHeight: 1.8,
                fontSize: '1.1rem',
                maxWidth: '90%'
              }}
            >
              连接全球200+国家和地区，支持多币种实时收款与汇款。银行级安全保障，让您的跨境资金流转更加便捷高效。
            </Typography>
            
            {/* 功能特性 - 更简洁的列表样式 */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10'>
              {[
                { icon: 'ri-time-line', title: '实时到账', desc: '7×24小时实时处理，资金秒速到账' },
                { icon: 'ri-global-line', title: '多币种支持', desc: '支持50+主流货币，汇率实时更新' },
                { icon: 'ri-shield-check-line', title: '安全保障', desc: '银行级加密技术，资金安全有保障' },
                { icon: 'ri-line-chart-line', title: '低费率', desc: '行业领先的优惠费率，节省成本' }
              ].map((item, index) => (
                <div key={index} className='flex gap-4 items-start'>
                  <div className='flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
                    <i className={`${item.icon} text-xl`} style={{ color: 'var(--mui-palette-primary-main)' }} />
                  </div>
                  <div>
                    <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                      {item.title}
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                      {item.desc}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 右侧登录表单区域 */}
        <div className='flex justify-center items-center w-full md:w-[500px] lg:w-[550px] p-6 md:p-12'>
          <Box
            sx={{
              width: '100%',
              maxWidth: 440,
              backgroundColor: currentMode === 'dark' ? '#1e1e2d' : 'background.paper',
              borderRadius: '24px',
              boxShadow: currentMode === 'dark' 
                ? '0 20px 50px rgba(0, 0, 0, 0.3)' 
                : '0 20px 50px rgba(0, 0, 0, 0.05)',
              padding: { xs: 6, sm: 8, md: 10 },
              border: '1px solid',
              borderColor: currentMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
            }}
          >
            <div className='flex flex-col gap-8'>
              <div className='text-center md:text-left'>
                <Typography 
                  variant='h4' 
                  sx={{ 
                    fontWeight: 800,
                    mb: 1.5,
                    color: 'text.primary',
                    letterSpacing: '-0.02em'
                  }}
                >
                  欢迎回来
                </Typography>
                <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
                  请输入账号信息以管理您的项目
                </Typography>
              </div>
              
              <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
                <Controller
                  name='email'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      autoFocus
                      placeholder='账号 / 邮箱'
                      variant='outlined'
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: currentMode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fcfdfe',
                          '& fieldset': { borderColor: currentMode === 'dark' ? 'rgba(255,255,255,0.1)' : '#eef0f2' },
                          '&:hover fieldset': { borderColor: 'primary.main' },
                        }
                      }}
                      onChange={e => {
                        field.onChange(e.target.value)
                        errorState !== null && setErrorState(null)
                      }}
                      {...((errors.email || errorState !== null) && {
                        error: true,
                        helperText: errors?.email?.message || errorState?.message[0]
                      })}
                    />
                  )}
                />
                
                <Controller
                  name='password'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder='密码'
                      type={isPasswordShown ? 'text' : 'password'}
                      variant='outlined'
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: currentMode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fcfdfe',
                          '& fieldset': { borderColor: currentMode === 'dark' ? 'rgba(255,255,255,0.1)' : '#eef0f2' },
                          '&:hover fieldset': { borderColor: 'primary.main' },
                        }
                      }}
                      onChange={e => {
                        field.onChange(e.target.value)
                        errorState !== null && setErrorState(null)
                      }}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                size='small'
                                edge='end'
                                onClick={handleClickShowPassword}
                                onMouseDown={e => e.preventDefault()}
                                sx={{ color: currentMode === 'dark' ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}
                              >
                                <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }}
                      {...(errors.password && { error: true, helperText: errors.password.message })}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name='totp'
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Stack direction='row' alignItems='center' spacing={2}>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder='验证码'
                        variant='outlined'
                        inputProps={{ maxLength: 6 }}
                        error={!!errors.totp}
                        helperText={errors.totp?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: currentMode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fcfdfe',
                            '& fieldset': { borderColor: currentMode === 'dark' ? 'rgba(255,255,255,0.1)' : '#eef0f2' },
                            '&:hover fieldset': { borderColor: 'primary.main' },
                          }
                        }}
                      />
                      <Box
                        onClick={requestCaptchaImg}
                        sx={{
                          width: 130,
                          height: 52,
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: currentMode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #eef0f2',
                          cursor: 'pointer',
                          backgroundColor: currentMode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
                          flexShrink: 0,
                          '&:hover': { borderColor: 'primary.main' }
                        }}
                      >
                        {captchaLoading ? (
                          <div className='w-full h-full flex items-center justify-center'>
                            <CircularProgress size={20} />
                          </div>
                        ) : captchaImg?.img ? (
                          <img src={`${captchaImg?.img}`} alt='captcha' className='w-full h-full object-contain' />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center text-xs text-gray-400'>
                            点击刷新
                          </div>
                        )}
                      </Box>
                    </Stack>
                  )}
                />

                {/* KYC模式选择器 - 默认为KYC模式，暂时隐藏
                <Select
                  value={selectValue}
                  onChange={(e: SelectChangeEvent) => setSelectValue(e.target.value)}
                  sx={{ 
                    borderRadius: '12px', 
                    backgroundColor: '#fcfdfe', 
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#eef0f2' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
                  }}
                >
                  <MenuItem value='kyc'>KYC 模式</MenuItem>
                  <MenuItem value='operation'>运营模式</MenuItem>
                </Select>
                */}

                {/* <div className='flex justify-between items-center'>
                  <FormControlLabel 
                    control={<Checkbox sx={{ color: '#e2e8f0', '&.Mui-checked': { color: 'primary.main' } }} />} 
                    label={<span className='text-sm text-gray-500'>记住账号</span>}
                  />
                  <Typography variant='body2' sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 600 }}>
                    忘记密码?
                  </Typography>
                </div> */}

                <Button
                  fullWidth
                  variant='contained'
                  type='submit'
                  disabled={loginLoading}
                  size='large'
                  sx={{
                    borderRadius: '12px',
                    py: 1.8,
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    backgroundColor: 'primary.main',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      boxShadow: '0 8px 20px rgba(var(--mui-palette-primary-mainChannel), 0.3)'
                    }
                  }}
                  startIcon={loginLoading ? <CircularProgress size={20} color='inherit' /> : null}
                >
                  {loginLoading ? t('auth.loggingIn') : '立即登录'}
                </Button>
              </form>
              
              <Typography 
                variant='caption' 
                sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}
              >
                © {new Date().getFullYear()} Fidere Pay. All rights reserved.
              </Typography>
            </div>
          </Box>
        </div>
      </div>

      {/* 谷歌验证码弹窗 */}
      <Dialog
        open={googleAuthDialogOpen}
        onClose={handleCloseGoogleAuthDialog}
        maxWidth='xs'
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)'
            }
          }
        }}
        PaperProps={{
          sx: { 
            borderRadius: '24px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            bgcolor: 'background.paper'
          }
        }}
      >
        {/* 顶部 Tab 栏 - 增加层次感 */}
        <Box sx={{ px: 4, pt: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            borderBottom: '1px solid',
            borderColor: 'divider',
            position: 'relative', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              pb: 2, 
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '1rem',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -1,
                left: 0,
                width: '100%',
                height: 3,
                backgroundColor: 'primary.main',
                borderRadius: '3px 3px 0 0'
              }
            }}>
              <Box 
                component='img' 
                src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
                sx={{ width: 20, height: 20 }}
              />
              谷歌验证
            </Box>
            
            <IconButton
              onClick={handleCloseGoogleAuthDialog}
              size='small'
              sx={{
                mb: 2,
                color: 'text.secondary',
                transition: 'all 0.2s',
                '&:hover': { 
                  color: 'text.primary', 
                  backgroundColor: 'action.hover',
                  transform: 'rotate(90deg)'
                }
              }}
            >
              <i className='ri-close-line' style={{ fontSize: 22 }} />
            </IconButton>
          </Box>
        </Box>

        {/* 内容区域 */}
        <Box sx={{ p: 5, pt: 4, textAlign: 'center' }}>
          {/* 谷歌 Logo 容器 - 增加立体感 */}
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
              bgcolor: 'background.paper',
              boxShadow: `
                0 10px 20px -5px rgba(0,0,0,0.05),
                inset 0 -2px 6px rgba(0,0,0,0.02)
              `,
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative'
            }}
          >
            <Box 
              component='img' 
              src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
              sx={{ width: 48, height: 48, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' }}
            />
          </Box>

          {/* 标题 */}
          <Typography variant='h5' sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary', letterSpacing: '-0.02em' }}>
            安全验证
          </Typography>

          {/* 描述 */}
          <Typography variant='body2' sx={{ mb: 5, color: 'text.secondary', fontSize: '0.95rem', lineHeight: 1.6 }}>
            请输入谷歌验证器中的 <Box component='span' sx={{ color: 'primary.main', fontWeight: 600 }}>6位数字</Box> 验证码
          </Typography>

          {/* 6位验证码输入框 - 增加交互层次感 */}
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mb: 6 }}>
            {googleAuthCode.map((digit, index) => (
              <Box
                key={index}
                component='input'
                ref={(el: HTMLInputElement | null) => { googleAuthInputRefs.current[index] = el }}
                type='text'
                inputMode='numeric'
                maxLength={1}
                value={digit}
                autoFocus={index === 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleGoogleAuthCodeChange(index, e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleGoogleAuthKeyDown(index, e)}
                onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                  e.preventDefault()
                  const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
                  if (pastedData.length === 6) {
                    setGoogleAuthCode(pastedData.split(''))
                    googleAuthInputRefs.current[5]?.focus()
                  }
                }}
                sx={{
                  width: 54,
                  height: 68,
                  border: '2px solid',
                  borderColor: digit ? 'primary.main' : 'divider',
                  borderRadius: '16px',
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  bgcolor: digit ? 'background.paper' : 'action.hover',
                  color: 'text.primary',
                  '&:focus': {
                    borderColor: 'primary.main',
                    bgcolor: 'background.paper',
                    boxShadow: '0 0 0 4px rgba(var(--mui-palette-primary-mainChannel), 0.15)',
                    transform: 'translateY(-2px)'
                  },
                  '&:hover': {
                    borderColor: digit ? 'primary.main' : 'text.disabled'
                  }
                }}
              />
            ))}
          </Box>

          {/* 按钮区域 - 增加质感 */}
          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
            <Button
              variant='text'
              fullWidth
              onClick={handleCloseGoogleAuthDialog}
              sx={{
                borderRadius: '14px',
                py: 1.8,
                fontSize: '1rem',
                fontWeight: 600,
                color: '#64748b',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#f1f5f9',
                  color: '#1e293b'
                }
              }}
            >
              取 消
            </Button>
            <Button
              variant='contained'
              fullWidth
              disabled={googleAuthCode.join('').length !== 6 || verifyLoading}
              onClick={handleGoogleAuthSubmit}
              sx={{
                borderRadius: '14px',
                py: 1.8,
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 10px 15px -3px rgba(var(--mui-palette-primary-mainChannel), 0.3)',
                textTransform: 'none',
                bgcolor: 'primary.main',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  boxShadow: '0 20px 25px -5px rgba(var(--mui-palette-primary-mainChannel), 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                },
                '&.Mui-disabled': {
                  bgcolor: '#f1f5f9',
                  color: '#cbd5e1',
                  boxShadow: 'none'
                }
              }}
              startIcon={verifyLoading ? <CircularProgress size={20} color='inherit' /> : null}
            >
              {verifyLoading ? '验证中...' : '开始验证'}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </div>
  )
}

export default Login
