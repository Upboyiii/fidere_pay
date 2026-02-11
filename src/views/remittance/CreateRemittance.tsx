'use client'

// React Imports
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

// Next Imports
import { useRouter, useParams, usePathname } from 'next/navigation'

// Util Imports
import { getLocalizedPath, getCurrentLangFromPath } from '@/utils/routeUtils'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Avatar from '@mui/material/Avatar'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import {
  createTransfer,
  getUserFeeConfig,
  getPayeeList,
  uploadSingleFile,
  getUserAssetList,
  getGoogleAuthStatus,
  // getPayPasswordStatus, // 已注释：去掉支付密码验证，只需要Google验证
  type PayeeItem,
  type UserAssetListItem
} from '@server/otc-api'
import { toast } from 'react-toastify'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

const CreateRemittance = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  
  // 使用 useMemo 确保 currentLang 随着 pathname 的变化而更新
  const currentLang = useMemo(() => {
    // 从路径中提取语言，确保获取当前页面的语言
    if (pathname) {
      const langMatch = pathname.match(/^\/([a-z]{2}(-[A-Z][a-zA-Z]*)?)/)
      if (langMatch && langMatch[1]) {
        return langMatch[1]
      }
    }
    // 如果路径中没有语言，则使用 params
    return (params?.lang as string) || undefined
  }, [pathname, params?.lang])
  
  const t = useTranslate()
  const [activeStep, setActiveStep] = useState(0)
  
  const [payCurrency, setPayCurrency] = useState('USDT-TRC20') // 默认 USDT-TRC20
  const [receiveCurrency, setReceiveCurrency] = useState('USD')
  const [payAmount, setPayAmount] = useState('')
  const [receiveAmount, setReceiveAmount] = useState('0.00')
  const [exchangeRate, setExchangeRate] = useState(1.0)
  const [fee, setFee] = useState(0)
  const [fixedFee, setFixedFee] = useState(0) // 固定费用
  const [feeRate, setFeeRate] = useState(0) // 收费比例（百分比）
  const [purposeType, setPurposeType] = useState('FAMILY_SUPPORT')
  const [purposeDesc, setPurposeDesc] = useState('')
  const [memo, setMemo] = useState('')
  // const [payPassword, setPayPassword] = useState('') // 已注释：去掉支付密码验证，只需要Google验证
  const [googleCode, setGoogleCode] = useState('')
  // const [showPassword, setShowPassword] = useState(false) // 已注释：去掉支付密码验证，只需要Google验证
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(null)
  const [recipientList, setRecipientList] = useState<PayeeItem[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [feeConfigLoading, setFeeConfigLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; path: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 用户资产
  const [assets, setAssets] = useState<UserAssetListItem[]>([])
  const [assetsLoading, setAssetsLoading] = useState(false)

  // 安全设置状态
  const [googleAuthBound, setGoogleAuthBound] = useState(false)
  // const [payPasswordSet, setPayPasswordSet] = useState(false) // 已注释：去掉支付密码验证，只需要Google验证
  const [securityCheckDialogOpen, setSecurityCheckDialogOpen] = useState(false)

  // 提交成功状态
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [transferResult, setTransferResult] = useState<any>(null)

  // 获取 USDT 资产余额
  const usdtAsset = assets.find(a => a.currencyCode.includes('USDT'))
  const usdtBalance = usdtAsset?.availableBalance || 0

  const selectedRecipient = recipientList.find(r => r.id === selectedRecipientId)

  const steps = [t('remittance.stepAmount'), t('remittance.stepConfirm'), t('remittance.stepSecurity')]

  // 加载收款人列表、资产列表和手续费配置
  useEffect(() => {
    loadRecipients()
    loadAssets()
    loadSecurityStatus()
    loadFeeConfig()
  }, [])

  // 加载手续费配置
  const loadFeeConfig = async () => {
    setFeeConfigLoading(true)
    try {
      const res = await getUserFeeConfig()
      const apiData = res.data?.data || res.data

      // 设置手续费配置
      // fixedFee: 固定费用
      // ratioFee: 收费比例（如 0.001 表示 0.1%）
      setFixedFee(apiData?.fixedFee || 0)
      // 将 ratioFee 转换为百分比存储（0.001 => 0.1）
      const ratioPercent = (apiData?.ratioFee || 0) * 100
      setFeeRate(ratioPercent)
    } catch (error) {
      console.error('加载手续费配置失败:', error)
      // 使用默认值
      setFixedFee(0)
      setFeeRate(0)
    } finally {
      setFeeConfigLoading(false)
    }
  }

  // 当资产加载完成后，更新支付币种为实际的 USDT 币种代码
  useEffect(() => {
    if (usdtAsset) {
      setPayCurrency(usdtAsset.currencyCode)
    }
  }, [usdtAsset])

  const loadRecipients = async () => {
    setLoading(true)
    try {
      const res = await getPayeeList()
      const apiData = res.data?.data || res.data
      setRecipientList(apiData?.list || [])
    } catch (error) {
      console.error('加载收款人列表失败:', error)
      toast.error(t('remittance.loadRecipientsFailed'))
    } finally {
      setLoading(false)
    }
  }

  const loadAssets = async () => {
    setAssetsLoading(true)
    try {
      const res = await getUserAssetList()
      const assetList = res.data?.list || []
      setAssets(assetList)
    } catch (error) {
      console.error('加载资产失败:', error)
      toast.error(t('remittance.loadAssetsFailed'))
    } finally {
      setAssetsLoading(false)
    }
  }

  // 加载安全验证状态
  const loadSecurityStatus = async () => {
    try {
      // 已注释：去掉支付密码验证，只需要Google验证
      // const [googleStatus, payPasswordStatus] = await Promise.all([
      //   getGoogleAuthStatus(),
      //   getPayPasswordStatus()
      // ])
      const googleStatus = await getGoogleAuthStatus()


      const googleData = googleStatus.data?.data || googleStatus.data
      // const payPasswordData = payPasswordStatus.data?.data || payPasswordStatus.data // 已注释


      setGoogleAuthBound(googleData?.bound || false)
      // 已注释：去掉支付密码验证，只需要Google验证
      // // 尝试多种可能的字段名
      // const isPasswordSet = payPasswordData?.isSet ||
      //   payPasswordData?.hasPassword ||
      //   payPasswordData?.set ||
      //   payPasswordData?.enabled ||
      //   false

      // setPayPasswordSet(isPasswordSet)
    } catch (error) {
      console.error('加载安全验证状态失败:', error)
    }
  }

  // 根据已加载的手续费配置，在前端计算手续费（金额变化时自动计算）
  useEffect(() => {
    if (payAmount && parseFloat(payAmount) > 0) {
      const amount = parseFloat(payAmount)
      // 手续费 = 固定费用 + (汇款金额 * 收费比例%)
      const ratioFeeAmount = amount * (feeRate / 100)
      const totalFeeAmount = fixedFee + ratioFeeAmount
      setFee(totalFeeAmount)

      // 根据汇率计算收款金额
      const receiveAmt = (amount * exchangeRate).toFixed(2)
      setReceiveAmount(receiveAmt)
    } else {
      setFee(0)
      setReceiveAmount('0.00')
    }
  }, [payAmount, fixedFee, feeRate, exchangeRate])


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('remittance.fileTooLarge'))
      return
    }

    // 验证文件类型
    const allowedTypes = [
      'application/zip',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ]
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('remittance.unsupportedFormat'))
      return
    }

    setUploading(true)
    try {
      const res = await uploadSingleFile(file)
      const apiData = res.data?.data || res.data
      setUploadedFile({
        name: apiData.name || file.name,
        path: apiData.path || apiData.fullPath
      })
      toast.success(t('remittance.uploadSuccess'))
    } catch (error: any) {
      console.error('文件上传失败:', error)
      const errorMessage = error?.response?.data?.message || error?.message || t('remittance.uploadFailed')
      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
  }

  const handleSubmit = async () => {
    if (!selectedRecipientId) {
      toast.error(t('remittance.selectRecipientError'))
      return
    }
    if (!payAmount || parseFloat(payAmount) <= 0) {
      toast.error(t('remittance.enterValidAmount'))
      return
    }
    // 已注释：去掉支付密码验证，只需要Google验证
    // // 检查是否已设置支付密码和谷歌验证（两个都必须设置）
    // if (!payPasswordSet || !googleAuthBound) {
    //   setSecurityCheckDialogOpen(true)
    //   return
    // }
    // 检查是否已设置谷歌验证
    if (!googleAuthBound) {
      setSecurityCheckDialogOpen(true)
      return
    }
    // 已注释：去掉支付密码验证
    // if (!payPassword) {
    //   toast.error(t('remittance.enterPayPassword'))
    //   return
    // }
    // 如果已绑定谷歌验证，必须输入谷歌验证码
    if (googleAuthBound && !googleCode) {
      toast.error(t('remittance.enterGoogleCode') || '请输入谷歌验证码')
      return
    }

    setSubmitting(true)
    try {
      const res = await createTransfer({
        payeeId: selectedRecipientId,
        currencyCode: payCurrency,
        receiveCurrencyCode: receiveCurrency,
        transferAmount: parseFloat(payAmount),
        exchangeRate,
        purposeType,
        purposeDesc: purposeDesc || undefined,
        memo: memo || undefined,
        transactionMaterial: uploadedFile?.path || undefined,
        // payPassword, // 已注释：去掉支付密码验证，只需要Google验证
        googleCode: googleCode || undefined
      })

      const apiData = res.data?.data || res.data

      // 设置成功状态，显示成功界面
      setTransferResult(apiData)
      setSubmitSuccess(true)
    } catch (error: any) {
      console.error('提交失败:', error)
      const msg = error?.response?.data?.message || error?.message || ''
      const isInputWrong =
        typeof msg === 'string' && (msg.includes('输入错误') || msg.includes('輸入錯誤'))
      const isCodeError =
        typeof msg === 'string' && (msg.includes('验证码') || msg.includes('时间同步') || msg.includes('驗證碼') || msg.includes('時間同步'))
      const i18nMsg = isInputWrong ? t('settings.googleAuthCodeWrong') : isCodeError ? t('settings.googleAuthCodeError') : null
      toast.error(i18nMsg || msg || t('remittance.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  // 步骤切换加载状态
  const [stepLoading, setStepLoading] = useState(false)

  const handleStepChange = async (direction: 'next' | 'back') => {
    // 从第一步（汇款金额）进入第二步（确认信息）时，校验金额和收款人
    if (direction === 'next' && activeStep === 0) {
      // 校验金额
      if (!payAmount || parseFloat(payAmount) <= 0) {
        toast.error(t('remittance.enterValidAmount'))
        return
      }
      // 校验收款人
      if (!selectedRecipientId) {
        toast.error(t('remittance.selectRecipientError'))
        return
      }
      // 校验金额是否为有效数字
      const amount = parseFloat(payAmount)
      if (isNaN(amount) || amount <= 0) {
        toast.error(t('remittance.enterValidAmount'))
        return
      }
      // 校验余额是否充足
      if (usdtAsset && amount + fee > usdtAsset.availableBalance) {
        toast.error(t('remittance.insufficientBalance'))
        return
      }
    }

    // 如果是从确认信息步骤进入安全验证步骤，检查安全设置
    if (direction === 'next' && activeStep === 1) {
      // 已注释：去掉支付密码验证，只需要Google验证
      // // 检查是否已设置支付密码和谷歌验证（两个都必须设置）
      // if (!payPasswordSet || !googleAuthBound) {
      //   setSecurityCheckDialogOpen(true)
      //   return
      // }
      // 检查是否已设置谷歌验证
      if (!googleAuthBound) {
        setSecurityCheckDialogOpen(true)
        return
      }
    }

    setStepLoading(true)

    // 模拟加载效果
    await new Promise(resolve => setTimeout(resolve, 300))

    if (direction === 'next') {
      // 每次进入安全验证步骤前，清空谷歌验证码
      if (activeStep === 1) {
        // setPayPassword('') // 已注释：去掉支付密码验证
        setGoogleCode('')
        // setShowPassword(false) // 已注释：去掉支付密码验证
      }

      setActiveStep(prev => prev + 1)
    } else {
      // 从安全验证步骤返回时，清空谷歌验证码
      if (activeStep === 2) {
        // setPayPassword('') // 已注释：去掉支付密码验证
        setGoogleCode('')
        // setShowPassword(false) // 已注释：去掉支付密码验证
      }

      setActiveStep(prev => prev - 1)
    }

    setStepLoading(false)
  }

  return (
    <Box
      sx={{
        p: 6,
        position: 'relative',
        minHeight: '100%',
        bgcolor: 'background.default'
      }}
    >
      {/* 现代感网格背景 */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: (theme) => theme.palette.mode === 'dark'
            ? `
              linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `
            : `
              linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
            `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 90%)'
        }}
      />

      <Grid container spacing={6} sx={{ position: 'relative', zIndex: 1 }}>
        {/* 开发环境调试信息 - 已隐藏 */}
        {/* {process.env.NODE_ENV === 'development' && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ 
              p: 3, 
              bgcolor: 'error.main', 
              color: 'white', 
              borderRadius: 2,
              mb: 2,
              fontSize: '0.875rem',
              fontFamily: 'monospace'
            }}>
              <div style={{ marginBottom: '8px' }}><strong>🔍 调试面板 - CreateRemittance</strong></div>
              <div>pathname (usePathname): {pathname}</div>
              <div>currentLang (useMemo): {currentLang}</div>
              <div>params.lang (useParams): {params?.lang as string}</div>
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                <strong>实时测试：</strong>
                <button 
                  onClick={() => {
                    const realTimeLang = getCurrentLangFromPath()
                    alert(`实时语言: ${realTimeLang}\n当前URL: ${window.location.pathname}`)
                  }}
                  style={{
                    marginLeft: '10px',
                    padding: '4px 12px',
                    backgroundColor: 'white',
                    color: 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  测试 getCurrentLangFromPath()
                </button>
              </div>
            </Box>
          </Grid>
        )} */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant='h4' sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              {t('remittance.createRemittance')}
            </Typography>
            <Typography color='text.secondary'>
              {t('remittance.createRemittanceDesc')}
            </Typography>
          </Box>
        </Grid>
        {/* 步骤指示器 */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ py: 8 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          '&.Mui-active': { color: 'primary.main' },
                          '&.Mui-completed': { color: 'success.main' }
                        }
                      }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>{label}</Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* 步骤1: 汇款金额 */}
        {activeStep === 0 && (
          <>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <CardHeader
                  title={t('remittance.stepAmount')}
                  subheader={t('remittance.stepAmountDesc')}
                  titleTypographyProps={{ sx: { fontWeight: 700 } }}
                  avatar={<i className='ri-money-dollar-circle-line text-primary text-xl' />}
                />
                <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
                <CardContent className='flex flex-col gap-8 py-8'>
                  <Box>
                    <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 600 }}>{t('remittance.youPay')}</Typography>
                    <Grid container spacing={4}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size='small'>
                          <Select
                            value={payCurrency}
                            onChange={(e) => setPayCurrency(e.target.value)}
                            sx={{ borderRadius: '12px' }}
                            disabled={assetsLoading}
                          >
                            {assetsLoading ? (
                              <MenuItem value='USDT'>{t('remittance.loading')}</MenuItem>
                            ) : usdtAsset ? (
                              <MenuItem value={usdtAsset.currencyCode}>
                                {usdtAsset.currencyCode} - {t('remittance.available')}: ${usdtBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                              </MenuItem>
                            ) : (
                              <MenuItem value='USDT'>USDT - 0.00</MenuItem>
                            )}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 8 }}>
                        <TextField
                          fullWidth
                          size='small'
                          placeholder='0'
                          value={payAmount}
                          onChange={(e) => {
                            const value = e.target.value
                            // 只允许输入整数
                            if (value === '' || /^\d+$/.test(value)) {
                              setPayAmount(value)
                            }
                          }}
                          type='number'
                          inputProps={{
                            max: usdtBalance,
                            step: '1',
                            min: '0',
                            pattern: '[0-9]*'
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.lightOpacity', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className='ri-arrow-down-line text-xl' />
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 600 }}>{t('remittance.theyReceive')}</Typography>
                    <Grid container spacing={4}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size='small'>
                          <Select value={receiveCurrency} onChange={(e) => setReceiveCurrency(e.target.value)} sx={{ borderRadius: '12px' }}>
                            <MenuItem value='USD'>{t('remittance.usd')}</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 8 }}>
                        <TextField
                          fullWidth
                          size='small'
                          placeholder='0.00'
                          value={receiveAmount}
                          onChange={(e) => setReceiveAmount(e.target.value)}
                          type='number'
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ p: 4, bgcolor: 'action.hover', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant='body2' color='text.secondary'>{t('remittance.exchangeRate')}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {feeConfigLoading ? (
                          <CircularProgress size={16} />
                        ) : (
                          <Typography variant='body2' sx={{ fontWeight: 700 }}>
                            1 {payCurrency} = {exchangeRate.toFixed(4)} {receiveCurrency}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {payAmount && parseFloat(payAmount) > 0 && (
                      <Box sx={{ p: 4, bgcolor: 'warning.lightOpacity', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant='body2' color='text.secondary'>{t('remittance.fee')}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {feeConfigLoading ? (
                            <CircularProgress size={16} />
                          ) : (
                            <Typography variant='body2' sx={{ fontWeight: 700, color: 'warning.main' }}>
                              {feeRate > 0 ? `${feeRate.toFixed(2)}%` : '0%'}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* 收款人账户 */}
              <Card sx={{ mt: 6, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <CardHeader
                  title={t('remittance.recipientAccount')}
                  titleTypographyProps={{ sx: { fontWeight: 700, fontSize: '1.125rem' } }}
                  avatar={<i className='ri-user-received-line text-primary text-xl' />}
                />
                <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
                <CardContent sx={{ p: 6 }}>
                  {/* 如果没有收款人，显示提示和跳转 */}
                  {recipientList.length === 0 && !loading ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: 'primary.lightOpacity',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3
                      }}>
                        <i className='ri-user-add-line text-4xl' />
                      </Box>
                      <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
                        {t('remittance.noRecipients')}
                      </Typography>
                      <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
                        {t('remittance.noRecipientsDesc')}
                      </Typography>
                      <Button
                        variant='contained'
                        startIcon={<i className='ri-add-line' />}
                        onClick={() => {
                          // 实时获取当前语言，避免闭包问题
                          const realTimeLang = getCurrentLangFromPath()
                          const targetPath = getLocalizedPath('/remittance/recipients/new', realTimeLang)
                          router.push(targetPath)
                        }}
                        sx={{ borderRadius: '8px', px: 6 }}
                      >
                        {t('remittance.addRecipient')}
                      </Button>
                    </Box>
                  ) : (
                    <>
                      {/* 收款人选择下拉 */}
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <Select
                          value={selectedRecipientId || ''}
                          onChange={(e) => setSelectedRecipientId(typeof e.target.value === 'number' ? e.target.value : (e.target.value ? parseInt(e.target.value) : null))}
                          displayEmpty
                          sx={{
                            borderRadius: '12px',
                            '& .MuiSelect-select': {
                              py: 2
                            }
                          }}
                        >
                          <MenuItem value=''>
                            <Typography color='text.secondary'>{t('remittance.selectRecipient')}</Typography>
                          </MenuItem>
                          {recipientList.map((recipient) => (
                            <MenuItem key={recipient.id} value={recipient.id}>
                              <Typography sx={{ fontWeight: 500 }}>
                                {recipient.accountName} - {recipient.accountNo} - {recipient.country}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      {/* 添加新收款人链接 */}
                      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant='text'
                          size='small'
                          startIcon={<i className='ri-add-line' />}
                          onClick={() => {
                            // 实时获取当前语言，避免闭包问题
                            const realTimeLang = getCurrentLangFromPath()
                            const targetPath = getLocalizedPath('/remittance/recipients/new', realTimeLang)
                            router.push(targetPath)
                          }}
                          sx={{
                            color: 'primary.main',
                            textTransform: 'none',
                            '&:hover': {
                              bgcolor: 'primary.lightOpacity'
                            }
                          }}
                        >
                          {t('remittance.addNewRecipient')}
                        </Button>
                      </Box>

                      {/* 只有选择了收款人才显示详细信息 */}
                      {selectedRecipient && (
                        <Box sx={{
                          p: 4,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: '12px',
                          bgcolor: 'background.paper',
                          transition: 'all 0.3s ease'
                        }}>
                          {/* 头部：头像、名称、标签 */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, fontSize: '1rem', fontWeight: 600 }}>
                              {selectedRecipient.accountName?.[0] || 'R'}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>{selectedRecipient.accountName}</Typography>
                                <Chip
                                  label={selectedRecipient.accountType === 1 ? t('remittance.companyAccount') : t('remittance.personalAccount')}
                                  size='small'
                                  variant='outlined'
                                  sx={{
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                    fontWeight: 500,
                                    height: 22,
                                    fontSize: '0.7rem'
                                  }}
                                />
                              </Box>
                              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                                {selectedRecipient.swiftCode ? t('remittance.swiftRemittance') : t('remittance.localRemittance')}
                              </Typography>
                            </Box>
                          </Box>

                          {/* 银行信息和地址信息并排 */}
                          <Grid container spacing={4}>
                            {/* 银行信息 */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <i className='ri-bank-line text-textSecondary text-base' />
                                <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('remittance.bankInfo')}</Typography>
                              </Box>
                              <Box sx={{ pl: 0 }}>
                                <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>{selectedRecipient.bankName}</Typography>
                                <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
                                  {selectedRecipient.accountNo}
                                </Typography>
                                {selectedRecipient.swiftCode && (
                                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                                    SWIFT: {selectedRecipient.swiftCode}
                                  </Typography>
                                )}
                              </Box>
                            </Grid>

                            {/* 地址信息 */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <i className='ri-global-line text-textSecondary text-base' />
                                <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('remittance.addressInfo')}</Typography>
                              </Box>
                              <Box sx={{ pl: 0 }}>
                                <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>{selectedRecipient.country}</Typography>
                                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                                  {selectedRecipient.city}{selectedRecipient.state ? ` , ${selectedRecipient.state}` : ''}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          {/* 汇款目的 */}
                          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>{t('remittance.remittancePurpose')}</Typography>
                            <Typography variant='body2' sx={{ fontWeight: 600 }}>
                              {selectedRecipient.purpose}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* 交易材料 */}
              <Card sx={{ mt: 6, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant='h6' sx={{ fontWeight: 700 }}>{t('remittance.transactionMaterials')}</Typography>
                      <Typography variant='body2' color='text.secondary'>{t('remittance.optional')}</Typography>
                      <Tooltip title={t('remittance.uploadMaterialTooltip')}>
                        <IconButton size='small' sx={{ p: 0.5, color: 'text.secondary' }}>
                          <i className='ri-information-line text-sm' />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                  avatar={<i className='ri-file-upload-line text-primary text-xl' />}
                />
                <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
                <CardContent sx={{ py: 6 }}>
                  {!uploadedFile ? (
                    <>
                      <input
                        ref={fileInputRef}
                        type='file'
                        accept='application/zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,image/jpg'
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                      <Box
                        onClick={() => {
                          if (!uploading && fileInputRef.current) {
                            fileInputRef.current.click()
                          }
                        }}
                        sx={{
                          border: '2px dashed',
                          borderColor: uploading ? 'action.disabled' : 'divider',
                          borderRadius: '12px',
                          p: 10,
                          textAlign: 'center',
                          cursor: uploading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          bgcolor: 'background.paper',
                          '&:hover': {
                            borderColor: uploading ? 'action.disabled' : 'primary.main',
                            bgcolor: uploading ? 'transparent' : 'primary.lightOpacity'
                          }
                        }}
                      >
                        {uploading ? (
                          <>
                            <CircularProgress size={48} sx={{ mb: 2 }} />
                            <Typography variant='body1' sx={{ fontWeight: 500, color: 'text.primary' }}>
                              {t('remittance.uploading')}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <i className='ri-cloud-upload-line text-5xl text-primary mb-4' />
                            <Typography variant='body1' sx={{ fontWeight: 500, mb: 3, color: 'text.primary' }}>
                              {t('remittance.clickOrDragToUpload')}
                            </Typography>
                            <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.875rem' }}>
                              {t('remittance.supportedFormats')}{' '}
                              <Typography component='span' sx={{ color: 'primary.main', fontWeight: 600 }}>
                                zip, pdf, doc, docx, png, jpg
                              </Typography>
                              {' '}({t('remittance.maxSize')}{' '}
                              <Typography component='span' sx={{ color: 'primary.main', fontWeight: 600 }}>
                                5MB
                              </Typography>
                              )
                            </Typography>
                          </>
                        )}
                      </Box>
                    </>
                  ) : (
                    <Box
                      sx={{
                        border: '1px solid',
                        borderColor: 'success.main',
                        borderRadius: '12px',
                        p: 4,
                        bgcolor: 'success.lightOpacity',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: 'success.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <i className='ri-file-text-line text-xl text-white' />
                        </Box>
                        <Box>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {uploadedFile.name}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {t('remittance.uploadSuccess')}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        onClick={handleRemoveFile}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: 'error.lightOpacity'
                          }
                        }}
                      >
                        <i className='ri-delete-bin-line' />
                      </IconButton>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* 备注信息 */}
              <Card sx={{ mt: 6, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <CardHeader
                  title={
                    <Box>
                      <Typography variant='h6' sx={{ fontWeight: 700 }}>{t('remittance.memoInfo')}</Typography>
                      <Typography variant='body2' color='text.secondary'>{t('remittance.optional')}</Typography>
                    </Box>
                  }
                  avatar={<i className='ri-file-edit-line text-primary text-xl' />}
                />
                <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
                <CardContent sx={{ py: 6 }}>
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder={t('remittance.enterMemoPlaceholder')}
                      value={memo}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value.length <= 200) {
                          setMemo(value)
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                      }}
                    />
                    <Box sx={{ position: 'absolute', bottom: 12, right: 16 }}>
                      <Typography variant='caption' color='text.secondary'>
                        {memo.length}/200
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* 右侧信息卡片 */}
            <Grid size={{ xs: 12, md: 4 }}>
              {/* 手续费明细 */}
              <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', mb: 4 }}>
                <CardHeader
                  title={t('remittance.feeDetails')}
                  titleTypographyProps={{ sx: { fontWeight: 700 } }}
                  avatar={<i className='ri-file-list-3-line text-primary text-xl' />}
                />
                <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
                <CardContent className='flex flex-col gap-4 py-6'>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>{t('remittance.fixedFee')}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {feeConfigLoading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Typography variant='body2' sx={{ fontWeight: 700 }}>
                          {fixedFee > 0 ? `${fixedFee.toFixed(4)} USDT` : '0.00 USDT'}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>{t('remittance.feeRate')}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {feeConfigLoading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Typography variant='body2' sx={{ fontWeight: 700 }}>
                          {feeRate > 0 ? `${feeRate.toFixed(2)}%` : '0.00%'}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {payAmount && parseFloat(payAmount) > 0 && fee > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>{t('remittance.totalFee')}</Typography>
                        <Typography variant='body2' sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {fee.toFixed(4)} USDT
                        </Typography>
                      </Box>
                    </>
                  )}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant='caption' color='text.secondary'>
                      • {t('remittance.feeDescription')}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      • {t('remittance.telegramFee')}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      • {t('remittance.feeTransparent')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* 预计到账时间 */}
              <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', mb: 4 }}>
                <CardHeader
                  title={t('remittance.expectedArrivalTitle')}
                  titleTypographyProps={{ sx: { fontWeight: 700 } }}
                  avatar={<i className='ri-time-line text-primary text-xl' />}
                />
                <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
                <CardContent className='py-6'>
                  <Typography variant='h6' sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                    {t('remittance.expectedArrivalTime')}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {t('remittance.arrivalTimeNote')}
                  </Typography>
                </CardContent>
              </Card>

              {/* 费用总览 */}
              <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <CardHeader
                  title={t('remittance.feeOverview')}
                  titleTypographyProps={{ sx: { fontWeight: 700 } }}
                  avatar={<i className='ri-calculator-line text-primary text-xl' />}
                />
                <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
                <CardContent className='flex flex-col gap-4 py-6'>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>{t('remittance.remittanceAmount')}</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>
                      {payAmount || '0'} USDT
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>{t('remittance.fee')}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {feeConfigLoading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Typography variant='body2' sx={{ fontWeight: 700 }}>
                          {feeRate > 0 ? `${feeRate.toFixed(2)}%` : '0%'}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>{t('remittance.totalAmountToPay')}</Typography>
                    <Typography variant='h6' sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {payAmount ? (parseFloat(payAmount) + fee).toFixed(4) : '0.00'} USDT
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>{t('remittance.theyReceive')}</Typography>
                    <Typography variant='h6' sx={{ fontWeight: 800, color: 'success.main' }}>
                      {receiveAmount || '0.00'} USD
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* 步骤2: 确认提交 */}
        {activeStep === 1 && (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <CardContent className='py-16 text-center'>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'success.lightOpacity', color: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 6 }}>
                  <i className='ri-check-line text-4xl' />
                </Box>
                <Typography variant='h5' sx={{ fontWeight: 700, mb: 2 }}>{t('remittance.confirmRemittanceInfo')}</Typography>
                <Typography color='text.secondary' sx={{ mb: 8 }}>
                  {selectedRecipient
                    ? t('remittance.confirmInfoDesc')
                    : t('remittance.confirmInfoDescNoRecipient')}
                </Typography>

                <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: 'left', p: 6, bgcolor: 'action.hover', borderRadius: '12px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Typography variant='body2' color='text.secondary'>{t('remittance.remittanceAmount')}</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>{payAmount || '0'} {payCurrency}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Typography variant='body2' color='text.secondary'>{t('remittance.exchangeRate')}</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>1 {payCurrency} = {exchangeRate.toFixed(4)} {receiveCurrency}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Typography variant='body2' color='text.secondary'>{t('remittance.recipientAmount')}</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: 'success.main' }}>{receiveAmount || '0.00'} {receiveCurrency}</Typography>
                  </Box>
                  {selectedRecipient && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                      <Typography variant='body2' color='text.secondary'>{t('remittance.recipient')}</Typography>
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>{selectedRecipient.accountName}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='body2' color='text.secondary'>{t('remittance.fee')}</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>
                      {feeConfigLoading ? <CircularProgress size={16} /> : `${feeRate > 0 ? feeRate.toFixed(2) : '0'}%`}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 步骤3: 安全验证 */}
        {activeStep === 2 && (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ py: 8, px: 6 }}>
                <Box sx={{ maxWidth: 500, mx: 'auto' }}>
                  <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'warning.lightOpacity', color: 'warning.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                      <i className='ri-shield-keyhole-line text-4xl' />
                    </Box>
                    <Typography variant='h5' sx={{ fontWeight: 700, mb: 2 }}>{t('remittance.stepSecurity')}</Typography>
                    <Typography color='text.secondary'>{t('remittance.securityVerificationDesc')}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {/* 已注释：去掉支付密码验证，只需要Google验证 */}
                    {/* 支付密码 */}
                    {/* <TextField
                      fullWidth
                      label={t('remittance.paymentPassword')}
                      type={showPassword ? 'text' : 'password'}
                      value={payPassword}
                      onChange={(e) => setPayPassword(e.target.value)}
                      placeholder={t('remittance.enterPaymentPassword')}
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge='end'
                            >
                              <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    /> */}

                    {/* Google验证码 */}
                    {googleAuthBound && (
                      <TextField
                        fullWidth
                        label={t('remittance.googleCode')}
                        value={googleCode}
                        onChange={(e) => setGoogleCode(e.target.value)}
                        placeholder={t('remittance.enterGoogleCode')}
                        required
                        inputProps={{ maxLength: 6 }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      />
                    )}

                    {!googleAuthBound && (
                      <Alert severity='warning' sx={{ borderRadius: '8px' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {t('remittance.bindGoogleAuth')}
                          </Typography>
                          <Typography variant='body2'>
                            {t('remittance.bindGoogleAuthDesc')}
                          </Typography>
                          <Button 
                            size='small'
                            variant='outlined'
                            color='warning'
                            onClick={() => {
                              // 实时获取当前语言，避免闭包问题
                              const realTimeLang = getCurrentLangFromPath()
                              const targetPath = getLocalizedPath('/settings', realTimeLang)
                              router.push(targetPath)
                            }}
                            sx={{ mt: 1, borderRadius: '6px', alignSelf: 'flex-start' }}
                          >
                            {t('remittance.bindFirst')}
                          </Button>
                        </Box>
                      </Alert>
                    )}

                    {googleAuthBound && (
                      <Alert severity='info' sx={{ borderRadius: '8px' }}>
                        {t('remittance.ensureGoogleCodeCorrect')}
                      </Alert>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 操作按钮 */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 4, mt: 4 }}>
            <Button
              variant='outlined'
              onClick={() => handleStepChange('back')}
              disabled={activeStep === 0 || submitting || stepLoading}
              sx={{ borderRadius: '8px', px: 8 }}
            >
              {t('remittance.back')}
            </Button>
            <Button
              variant='contained'
              onClick={activeStep === steps.length - 1 ? handleSubmit : () => handleStepChange('next')}
              disabled={submitting || stepLoading || (activeStep === steps.length - 1 && !googleAuthBound)}
              sx={{ borderRadius: '8px', px: 10, fontWeight: 700 }}
              startIcon={(submitting || stepLoading) ? <CircularProgress size={20} color='inherit' /> : null}
            >
              {activeStep === steps.length - 1 ? (submitting ? t('remittance.submitting') : t('remittance.confirmSubmit')) : (stepLoading ? t('remittance.loading') : t('remittance.nextStep'))}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* 步骤切换加载遮罩 */}
      {stepLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(2px)'
          }}
        >
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: '16px',
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          >
            <CircularProgress size={40} />
            <Typography variant='body2' sx={{ fontWeight: 500 }}>{t('remittance.loading')}</Typography>
          </Box>
        </Box>
      )}

      {/* 安全验证提示对话框 */}
      <Dialog
        open={securityCheckDialogOpen}
        onClose={() => setSecurityCheckDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className='ri-shield-keyhole-line' style={{ fontSize: '20px', color: 'text.secondary' }} />
            </Box>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              {t('remittance.securityCheckTitle')}
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 4, pb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.7 }}>
              {t('remittance.googleAuthRequiredBeforeRemittance')}
            </Typography>

            {/* 安全设置项列表 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* 已注释：去掉支付密码验证，只需要Google验证 */}
              {/* 支付密码 */}
              {/* <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2.5,
                  p: 2.5,
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                  transition: 'all 0.2s'
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    bgcolor: payPasswordSet ? 'rgba(76, 175, 80, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <i
                    className='ri-lock-line'
                    style={{
                      fontSize: '18px',
                      color: payPasswordSet ? '#4CAF50' : 'rgba(0, 0, 0, 0.38)'
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>
                    {t('remittance.paymentPassword')}
                  </Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem' }}>
                    {payPasswordSet ? t('remittance.alreadySet') : t('remittance.notSetRequired')}
                  </Typography>
                </Box>
                {payPasswordSet ? (
                  <i className='ri-checkbox-circle-fill' style={{ fontSize: '20px', color: '#4CAF50' }} />
                ) : (
                  <Chip
                    label={t('remittance.required')}
                    size='small'
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: 'rgba(0, 0, 0, 0.06)',
                      color: 'text.secondary'
                    }}
                  />
                )}
              </Box> */}

              {/* Google验证器 */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2.5,
                  p: 2.5,
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                  transition: 'all 0.2s'
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    bgcolor: googleAuthBound ? 'rgba(76, 175, 80, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <i
                    className='ri-smartphone-line'
                    style={{
                      fontSize: '18px',
                      color: googleAuthBound ? '#4CAF50' : 'rgba(0, 0, 0, 0.38)'
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>
                    {t('remittance.googleAuthenticator')}
                  </Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem' }}>
                    {googleAuthBound ? t('remittance.alreadyBound') : t('remittance.notBoundRecommended')}
                  </Typography>
                </Box>
                {googleAuthBound ? (
                  <i className='ri-checkbox-circle-fill' style={{ fontSize: '20px', color: '#4CAF50' }} />
                ) : (
                  <Chip
                    label={t('remittance.recommended')}
                    size='small'
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: 'rgba(0, 0, 0, 0.06)',
                      color: 'text.secondary'
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            onClick={() => setSecurityCheckDialogOpen(false)}
            sx={{
              borderRadius: '8px',
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            {t('remittance.later')}
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              setSecurityCheckDialogOpen(false)
              // 实时获取当前语言，避免闭包问题
              const realTimeLang = getCurrentLangFromPath()
              const targetPath = getLocalizedPath('/settings', realTimeLang)
              router.push(targetPath)
            }}
            sx={{
              borderRadius: '8px',
              px: 3
            }}
            startIcon={<i className='ri-arrow-right-line' />}
          >
            {t('remittance.goToSettings')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提交成功对话框 */}
      <Dialog
        open={submitSuccess}
        onClose={() => setSubmitSuccess(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogContent sx={{ py: 8, px: 6, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            {/* 成功图标 */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'success.lightOpacity',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <i className='ri-check-line' style={{ fontSize: '48px', color: '#4CAF50' }} />
            </Box>

            {/* 成功标题 */}
            <Typography variant='h5' sx={{ fontWeight: 700, color: 'success.main' }}>
              {t('remittance.submitSuccess')}
            </Typography>

            {/* 提示信息 */}
            <Typography variant='body1' color='text.secondary' sx={{ lineHeight: 1.7 }}>
              {t('remittance.submitSuccessDesc')}
            </Typography>

            {/* 订单信息 */}
            {transferResult && (
              <Box
                sx={{
                  width: '100%',
                  mt: 2,
                  p: 3,
                  borderRadius: '12px',
                  bgcolor: 'action.hover',
                  textAlign: 'left'
                }}
              >
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2, fontWeight: 600 }}>
                  {t('remittance.remittanceInfo')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='body2' color='text.secondary'>{t('remittance.remittanceAmount')}</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {payAmount} {payCurrency}
                    </Typography>
                  </Box>
                  {selectedRecipient && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant='body2' color='text.secondary'>{t('remittance.recipient')}</Typography>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {selectedRecipient.accountName}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='body2' color='text.secondary'>{t('remittance.expectedArrival')}</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {t('remittance.expectedArrivalTime')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* 操作按钮 */}
            <Box sx={{ display: 'flex', gap: 2, width: '100%', mt: 3 }}>
              <Button
                variant='outlined'
                fullWidth
                onClick={() => {
                  setSubmitSuccess(false)
                  // 重置表单
                  setActiveStep(0)
                  setPayAmount('')
                  setSelectedRecipientId(null)
                  // setPayPassword('') // 已注释：去掉支付密码验证
                  setGoogleCode('')
                  setUploadedFile(null)
                  setMemo('')
                }}
                sx={{ borderRadius: '8px', py: 1.5 }}
              >
                {t('remittance.createAnother')}
              </Button>
              <Button
                variant='contained'
                color='primary'
                fullWidth
                onClick={() => {
                  setSubmitSuccess(false)
                  // 实时获取当前语言，避免闭包问题
                  const realTimeLang = getCurrentLangFromPath()
                  const targetPath = getLocalizedPath('/remittance/records', realTimeLang)
                  router.push(targetPath)
                }}
                sx={{ borderRadius: '8px', py: 1.5 }}
                startIcon={<i className='ri-list-check' />}
              >
                {t('remittance.viewRecords')}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default CreateRemittance
