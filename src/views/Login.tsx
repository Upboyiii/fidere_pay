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
import { GET_THEME_CONFIG, SITE_CONFIG, GET_ENTRANCE } from '@/utils/siteConfig'
import { ENV_CONFIG } from '@server/config'

// Third-party Imports
import { signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, email, pipe, nonEmpty, number } from 'valibot'
import classnames from 'classnames'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import { toast } from 'react-toastify'

// Type Imports
import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'

// Config Imports
import themeConfig, { getFirstMenuRoute } from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import useThemeByRole from '@core/hooks/useThemeByRole'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { getCaptchaImg, loginApi } from '@server/login'
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
  const CONFIG = GET_THEME_CONFIG()

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
  // Vars
  const darkImg = '/images/pages/auth-v2-mask-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-light.png'
  const darkIllustration = CONFIG?.loginIllustrationDark
  const lightIllustration = CONFIG?.loginIllustration
  const borderedDarkIllustration = CONFIG?.loginIllustrationBorderedDark
  const borderedLightIllustration = CONFIG?.loginIllustrationBordered
  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const { updateThemeByRole } = useThemeByRole()

  // 创建 schema，使用翻译函数（确保字典已加载）
  const schema = createSchema(t)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      // email: 'admin',
      // password: '123456',
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
  }, []) // 空依赖数组，确保只执行一次
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    try {
      setLoginLoading(true)
      setErrorState(null) // 清除之前的错误状态

      const res = await loginApi({
        username: data.email,
        password: data.password,
        verifyCode: data.totp,
        verifyKey: captchaImg?.key,
        entrance: GET_ENTRANCE?.() ?? 'MANAGEMENT'
      })
      // 判断登录是否成功
      // 此时如果请求失败已经被抛出了，所以这里 res 一定存在
      if (res?.data) {
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
          email: data.email,
          password: data.password,
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
          menuList: menuListJson // 存储到 localStorage，不传递到 signIn 避免 cookie 过大
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
        // 显示成功提示
        toast.success(t('auth.loginSuccess'))
        // 根据用户角色更新主题设置
        updateThemeByRole(signInData)
        // 等待 NextAuth 会话状态更新
        // await new Promise(resolve => setTimeout(resolve, 100))
        // 获取 menuList 第一条的第一个路由，直接传入 menuList 避免读取 localStorage 的时序问题
        const homePageUrl = getFirstMenuRoute(normalizedMenuList)
        const redirectURL = searchParams.get('redirectTo') ?? homePageUrl
        const finalUrl = getLocalizedUrl(redirectURL, locale as Locale)
        router.replace(finalUrl)
      }
    } catch (error) {
      // 从错误对象中提取错误消息
      const errorMessage = error instanceof Error ? error.message : t('auth.loginFailed')
      toast.error(errorMessage)
      requestCaptchaImg()
      // setErrorState({
      //   message: [errorMessage]
      // })
    } finally {
      setLoginLoading(false)
    }
  }

  return (
    <div className='flex bs-full justify-center items-center min-bs-[100dvh] bg-gradient-to-br from-primary/5 via-backgroundPaper to-primary/10'>
      {/* 左侧装饰区域 - 移动端隐藏 */}
      <div
        className={classnames(
          'hidden md:flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <div className='plb-12 pis-12 relative z-10'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[500px] max-is-full bs-auto'
          />
        </div>
        <Illustrations
          image1={{ src: '/images/illustrations/objects/tree-2.png' }}
          image2={null}
          maskImg={{ src: authBackground }}
        />
      </div>
      
      {/* 右侧登录表单区域 */}
      <div className='flex justify-center items-center bs-full !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[520px]'>
        <div className='w-full max-w-md'>
          {/* Logo 区域 */}
          <div className='flex justify-center mb-8'>
            <Logo />
          </div>
          
          {/* 登录卡片 */}
          <Box
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              padding: { xs: 3, sm: 4 },
              border: settings.skin === 'bordered' ? '1px solid' : 'none',
              borderColor: 'divider'
            }}
          >
            <div className='flex flex-col gap-6'>
              {/* 标题区域 */}
              <div className='text-center mb-2'>
                <Typography 
                  variant='h4' 
                  sx={{ 
                    fontWeight: 700,
                    mb: 1,
                    background: 'linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {t('auth.welcomeMessage', {
                    templateName: themeConfig.templateName,
                    loginName: GET_THEME_CONFIG()?.loginName
                  })}
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  {t('auth.signInToAccount')}
                </Typography>
              </div>
              
              <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Controller
              name='email'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  autoFocus
                  type='email'
                  label={t('auth.email')}
                  variant='outlined'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main'
                        }
                      },
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderWidth: 2
                        }
                      }
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
                  label={t('auth.password')}
                  id='login-password'
                  type={isPasswordShown ? 'text' : 'password'}
                  variant='outlined'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main'
                        }
                      },
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderWidth: 2
                        }
                      }
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
                            aria-label='toggle password visibility'
                            sx={{ color: 'text.secondary' }}
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
            {/* 验证码输入区域 */}
            <Controller
              control={control}
              name='totp'
              rules={{ required: true }}
              render={({ field }) => (
                <Stack direction='row' alignItems='flex-start' spacing={1.5}>
                  <TextField
                    {...field}
                    fullWidth
                    label={t('auth.captcha')}
                    variant='outlined'
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t('auth.captchaPlaceholder')}
                    inputProps={{ maxLength: 6 }}
                    error={!!errors.totp}
                    helperText={errors.totp?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main'
                          }
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: 2
                          }
                        }
                      }
                    }}
                  />
                  {/* 验证码图片容器 */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: 127,
                      height: 56,
                      border: '2px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      overflow: 'hidden',
                      backgroundColor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      minWidth: 127,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    {captchaLoading ? (
                      <Typography variant='body2' color='text.secondary'>
                        {t('auth.loading')}
                      </Typography>
                    ) : captchaImg?.img ? (
                      <img
                        src={`${captchaImg?.img}`}
                        alt={t('auth.captchaAlt')}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'fill', // 强制填满容器，可能会拉伸
                          cursor: 'pointer'
                        }}
                        onClick={requestCaptchaImg}
                        title={t('auth.refreshCaptcha')}
                      />
                    ) : (
                      <Typography variant='body2' color='text.secondary'>
                        {t('auth.captcha')}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              )}
            />
            {ENV_CONFIG?.IS_DEVELOPMENT && (
              <Select
                value={selectValue}
                onChange={(e: SelectChangeEvent) => {
                  setSelectValue(e.target.value)
                }}
              >
                <MenuItem value='kyc'>{t('auth.role.kyc')}</MenuItem>
                <MenuItem value='operation'>{t('auth.role.operation')}</MenuItem>
              </Select>
            )}

            <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
              <FormControlLabel 
                control={<Checkbox defaultChecked />} 
                label={t('auth.rememberMe')}
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem'
                  }
                }}
              />
            </div>
            <Button
              fullWidth
              variant='contained'
              type='submit'
              disabled={loginLoading}
              size='large'
              sx={{
                borderRadius: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                '&:hover': {
                  background: 'linear-gradient(135deg, var(--mui-palette-primary-dark) 0%, var(--mui-palette-primary-main) 100%)',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                  transform: 'translateY(-1px)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
              startIcon={loginLoading ? <CircularProgress size={20} color='inherit' /> : null}
            >
              {loginLoading ? t('auth.loggingIn') : t('auth.logIn')}
            </Button>
          </form>
            </div>
          </Box>
        </div>
      </div>
    </div>
  )
}

export default Login
