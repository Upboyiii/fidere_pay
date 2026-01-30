'use client'

// React Imports
import { useState, useEffect, useRef, useCallback } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

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

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import {
  createTransfer,
  calculateTransferFee,
  getPayeeList,
  uploadSingleFile,
  type PayeeItem
} from '@server/otc-api'
import { toast } from 'react-toastify'

const CreateRemittance = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const [payCurrency, setPayCurrency] = useState('USDT')
  const [receiveCurrency, setReceiveCurrency] = useState('USD')
  const [payAmount, setPayAmount] = useState('0.00')
  const [receiveAmount, setReceiveAmount] = useState('0.00')
  const [exchangeRate, setExchangeRate] = useState(1.0)
  const [fee, setFee] = useState(0)
  const [fixedFee, setFixedFee] = useState(0) // 固定费用
  const [feeRate, setFeeRate] = useState(0) // 收费比例（百分比）
  const [purposeType, setPurposeType] = useState('FAMILY_SUPPORT')
  const [purposeDesc, setPurposeDesc] = useState('')
  const [memo, setMemo] = useState('')
  const [payPassword, setPayPassword] = useState('')
  const [googleCode, setGoogleCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(null)
  const [recipientList, setRecipientList] = useState<PayeeItem[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [calculatingFee, setCalculatingFee] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; path: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const usdtBalance = 3895.5216

  const selectedRecipient = recipientList.find(r => r.id === selectedRecipientId)

  const steps = ['汇款金额', '收款人信息', '确认信息', '安全验证']

  // 加载收款人列表
  useEffect(() => {
    loadRecipients()
  }, [])

  const loadRecipients = async () => {
    setLoading(true)
    try {
      const res = await getPayeeList()
      const apiData = res.data?.data || res.data
      setRecipientList(apiData?.list || [])
    } catch (error) {
      console.error('加载收款人列表失败:', error)
      toast.error('加载收款人列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 计算手续费
  const calculateFee = useCallback(async () => {
    if (!payAmount || parseFloat(payAmount) <= 0) {
      setFee(0)
      setFixedFee(0)
      setFeeRate(0)
      setExchangeRate(1.0)
      setReceiveAmount('0.00')
      return
    }
    
    setCalculatingFee(true)
    try {
      console.log('计算手续费，参数:', { transferAmount: parseFloat(payAmount) })
      const res = await calculateTransferFee({
        transferAmount: parseFloat(payAmount)
      })
      console.log('计算手续费响应:', res)
      const apiData = res.data?.data || res.data
      
      // API返回: fixedFee(固定费用), ratioFee(比例费), totalFee(总费用), totalAmount(总金额)
      const totalFeeAmount = apiData?.totalFee || 0
      const fixedFeeAmount = apiData?.fixedFee || 0
      const ratioFeeAmount = apiData?.ratioFee || 0
      const totalAmount = apiData?.totalAmount || parseFloat(payAmount)
      
      setFee(totalFeeAmount)
      setFixedFee(fixedFeeAmount)
      // ratioFee是比例费用的金额，如果需要显示百分比，需要计算
      // 收费比例(%) = (比例费用 / 汇款金额) * 100
      const ratioFeePercent = payAmount && parseFloat(payAmount) > 0 
        ? (ratioFeeAmount / parseFloat(payAmount)) * 100 
        : 0
      setFeeRate(ratioFeePercent)
      
      // 计算汇率：如果API返回了totalAmount，可以用它来计算汇率
      // 否则使用固定汇率 1:1
      const apiExchangeRate = apiData?.exchangeRate || 1.0
      setExchangeRate(apiExchangeRate)
      
      // 根据汇率计算收款金额
      const receiveAmt = (parseFloat(payAmount) * apiExchangeRate).toFixed(2)
      setReceiveAmount(receiveAmt)
      
      console.log('手续费计算结果:', { 
        totalFee: totalFeeAmount,
        fixedFee: fixedFeeAmount,
        ratioFee: ratioFeeAmount,
        ratioFeePercent: ratioFeePercent,
        exchangeRate: apiExchangeRate, 
        receiveAmount: receiveAmt 
      })
    } catch (error: any) {
      console.error('计算手续费失败:', error)
      const errorMessage = error?.response?.data?.message || error?.message || '计算手续费失败'
      toast.error(errorMessage)
      // 失败时使用默认值
      setFee(0)
      setFixedFee(0)
      setFeeRate(0)
      setExchangeRate(1.0)
    } finally {
      setCalculatingFee(false)
    }
  }, [payAmount])

  // 当金额变化时自动计算手续费
  useEffect(() => {
    if (payAmount && parseFloat(payAmount) > 0) {
      // 防抖：延迟500ms后计算
      const timer = setTimeout(() => {
        calculateFee()
      }, 500)
      
      return () => clearTimeout(timer)
    } else {
      setFee(0)
      setReceiveAmount('0.00')
    }
  }, [payAmount, calculateFee])


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileUpload 被调用', event.target.files)
    const file = event.target.files?.[0]
    if (!file) {
      console.log('没有选择文件')
      return
    }

    console.log('选择的文件:', { name: file.name, type: file.type, size: file.size })

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('文件大小不能超过 5MB')
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
      console.log('文件类型不匹配:', file.type, '允许的类型:', allowedTypes)
      toast.error('不支持的文件格式')
      return
    }

    setUploading(true)
    try {
      console.log('开始上传文件')
      const res = await uploadSingleFile(file)
      console.log('上传响应:', res)
      const apiData = res.data?.data || res.data
      setUploadedFile({
        name: apiData.name || file.name,
        path: apiData.path || apiData.fullPath
      })
      toast.success('文件上传成功')
    } catch (error: any) {
      console.error('文件上传失败:', error)
      const errorMessage = error?.response?.data?.message || error?.message || '文件上传失败'
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
      toast.error('请选择收款人')
      return
    }
    if (!payAmount || parseFloat(payAmount) <= 0) {
      toast.error('请输入汇款金额')
      return
    }
    if (!payPassword) {
      toast.error('请输入支付密码')
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
        payPassword,
        googleCode: googleCode || undefined
      })
      
      const apiData = res.data?.data || res.data
      toast.success('汇款申请提交成功')
      
      // 跳转到汇款记录页面
      router.push(`/remittance/records`)
    } catch (error: any) {
      console.error('提交失败:', error)
      const errorMessage = error?.response?.data?.message || error?.message || '提交失败'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // 步骤切换加载状态
  const [stepLoading, setStepLoading] = useState(false)

  const handleStepChange = async (direction: 'next' | 'back') => {
    setStepLoading(true)
    
    // 模拟加载效果
    await new Promise(resolve => setTimeout(resolve, 300))
    
    if (direction === 'next') {
      // 每次进入安全验证步骤前，清空支付密码与谷歌验证码
      if (activeStep === 2) {
        setPayPassword('')
        setGoogleCode('')
        setShowPassword(false)
      }

      // 在进入确认步骤前，确保手续费已计算
      if (activeStep === 1 && payAmount && parseFloat(payAmount) > 0 && !calculatingFee) {
        calculateFee()
      }

      setActiveStep(prev => prev + 1)
    } else {
      // 从安全验证步骤返回时，清空支付密码与谷歌验证码
      if (activeStep === 3) {
        setPayPassword('')
        setGoogleCode('')
        setShowPassword(false)
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
        bgcolor: mode === 'dark' ? 'background.default' : '#f8fafc'
      }}
    >
      {/* 现代感网格背景 */}
      <Box 
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: mode === 'dark' 
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
        <Grid size={{ xs: 12 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant='h4' sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              发起全球汇款
            </Typography>
            <Typography color='text.secondary'>
              安全、快捷地向全球各地发送资金
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
                  title='汇款金额' 
                  subheader='设置汇款金额和币种' 
                  titleTypographyProps={{ sx: { fontWeight: 700 } }}
                  avatar={<i className='ri-money-dollar-circle-line text-primary text-xl' />}
                />
                <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
                <CardContent className='flex flex-col gap-8 py-8'>
                  <Box>
                    <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 600 }}>您支付</Typography>
                    <Grid container spacing={4}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size='small'>
                          <Select value={payCurrency} onChange={(e) => setPayCurrency(e.target.value)} sx={{ borderRadius: '12px' }}>
                            <MenuItem value='USDT'>USDT - {usdtBalance.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</MenuItem>
                            <MenuItem value='USD'>USD</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 8 }}>
                        <TextField
                          fullWidth
                          size='small'
                          placeholder='0.00'
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          type='number'
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
                    <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 600 }}>对方收到</Typography>
                    <Grid container spacing={4}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size='small'>
                          <Select value={receiveCurrency} onChange={(e) => setReceiveCurrency(e.target.value)} sx={{ borderRadius: '12px' }}>
                            <MenuItem value='USD'>USD--美元</MenuItem>
                            <MenuItem value='EUR'>EUR - 欧元</MenuItem>
                            <MenuItem value='HKD'>HKD - 港币</MenuItem>
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
                      <Typography variant='body2' color='text.secondary'>汇率</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {calculatingFee ? (
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
                        <Typography variant='body2' color='text.secondary'>手续费</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {calculatingFee ? (
                            <CircularProgress size={16} />
                          ) : (
                            <Typography variant='body2' sx={{ fontWeight: 700, color: 'warning.main' }}>
                              {fee.toFixed(4)} {payCurrency}
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
                  title='收款人账户' 
                  titleTypographyProps={{ sx: { fontWeight: 700, fontSize: '1.125rem' } }}
                  avatar={<i className='ri-user-received-line text-primary text-xl' />}
                />
                <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
                <CardContent sx={{ p: 6 }}>
                  {/* 收款人选择下拉 */}
                  <FormControl fullWidth sx={{ mb: 4 }}>
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
                        <Typography color='text.secondary'>请选择收款人</Typography>
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
                              label={selectedRecipient.remitType === 2 ? '个人账户' : '公司账户'} 
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
                            {selectedRecipient.swiftCode ? 'SWIFT汇款' : '本地汇款'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* 银行信息和地址信息并排 */}
                      <Grid container spacing={4}>
                        {/* 银行信息 */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <i className='ri-bank-line text-textSecondary text-base' />
                            <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.secondary' }}>银行信息</Typography>
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
                            <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.secondary' }}>地址信息</Typography>
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
                        <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>汇款目的</Typography>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {selectedRecipient.purpose}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* 交易材料 */}
              <Card sx={{ mt: 6, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <CardHeader 
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant='h6' sx={{ fontWeight: 700 }}>交易材料</Typography>
                      <Typography variant='body2' color='text.secondary'>(可选)</Typography>
                      <Tooltip title='上传交易相关的证明材料'>
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
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: '12px',
                      p: 10,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      bgcolor: 'background.paper',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.lightOpacity'
                      }
                    }}
                  >
                    <i className='ri-arrow-up-line text-5xl text-primary mb-4' />
                    <Typography variant='body1' sx={{ fontWeight: 500, mb: 3, color: 'text.primary' }}>
                      Click or drag file to this area to upload
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.875rem' }}>
                      Please upload a file in{' '}
                      <Typography component='span' sx={{ color: 'primary.main', fontWeight: 600 }}>
                        zip, pdf, doc, docx, png, jpg
                      </Typography>
                      {' '}format that does not exceed{' '}
                      <Typography component='span' sx={{ color: 'primary.main', fontWeight: 600 }}>
                        5MB
                      </Typography>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* 备注信息 */}
              <Card sx={{ mt: 6, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <CardHeader 
                  title={
                    <Box>
                      <Typography variant='h6' sx={{ fontWeight: 700 }}>备注信息</Typography>
                      <Typography variant='body2' color='text.secondary'>(可选)</Typography>
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
                      placeholder='请输入汇款备注,如用途说明等'
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
                  title='手续费明细'
                  titleTypographyProps={{ sx: { fontWeight: 700 } }}
                  avatar={<i className='ri-file-list-3-line text-primary text-xl' />}
                />
                <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
                <CardContent className='flex flex-col gap-4 py-6'>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>固定费用</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {calculatingFee ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Typography variant='body2' sx={{ fontWeight: 700 }}>
                          {fixedFee > 0 ? `${fixedFee.toFixed(4)} ${payCurrency}` : '0.00 ' + payCurrency}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>收费比例</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {calculatingFee ? (
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
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>总手续费</Typography>
                        <Typography variant='body2' sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {fee.toFixed(4)} {payCurrency}
                        </Typography>
                      </Box>
                    </>
                  )}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant='caption' color='text.secondary'>
                      • 汇款手续费:基础服务费用
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      • 电报费:银行间通讯费用
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      • 费用标准透明,无隐藏收费
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* 预计到账时间 */}
              <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', mb: 4 }}>
                <CardHeader
                  title='预计到账时间'
                  titleTypographyProps={{ sx: { fontWeight: 700 } }}
                  avatar={<i className='ri-time-line text-primary text-xl' />}
                />
                <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
                <CardContent className='py-6'>
                  <Typography variant='h6' sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                    1-3个工作日
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    具体时间取决于收款银行处理速度
                  </Typography>
                </CardContent>
              </Card>

              {/* 费用总览 */}
              <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <CardHeader
                  title='费用总览'
                  titleTypographyProps={{ sx: { fontWeight: 700 } }}
                  avatar={<i className='ri-calculator-line text-primary text-xl' />}
                />
                <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
                <CardContent className='flex flex-col gap-4 py-6'>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>汇款金额</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>
                      {payAmount || '0.00'} {payCurrency}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>手续费</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {calculatingFee ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Typography variant='body2' sx={{ fontWeight: 700 }}>
                          {fee > 0 ? `${fee.toFixed(4)} ${payCurrency}` : '0.00 ' + payCurrency}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>您需支付总额</Typography>
                    <Typography variant='h6' sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {payAmount ? (parseFloat(payAmount) + fee).toFixed(4) : '0.00'} {payCurrency}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>对方实际收到</Typography>
                    <Typography variant='h6' sx={{ fontWeight: 800, color: 'success.main' }}>
                      {receiveAmount || '0.00'} USD
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* 步骤2: 交易材料和备注 */}
        {activeStep === 1 && (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <CardHeader 
                title='交易材料 (可选)' 
                titleTypographyProps={{ sx: { fontWeight: 700 } }}
                avatar={<i className='ri-file-upload-line text-primary text-xl' />}
              />
              <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
              <CardContent 
                className='py-10'
                onClick={(e) => {
                  console.log('CardContent 被点击', e.target)
                }}
              >
                {!uploadedFile ? (
                  <>
                    <input
                      ref={fileInputRef}
                      type='file'
                      id='file-upload'
                      accept='application/zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,image/jpg'
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                      disabled={uploading}
                      onClick={(e) => {
                        console.log('input 被点击', e)
                        e.stopPropagation()
                      }}
                    />
                    <Box
                      component='div'
                      onClick={(e) => {
                        console.log('=== 点击上传区域 ===')
                        console.log('事件对象:', e)
                        console.log('目标元素:', e.target)
                        console.log('当前元素:', e.currentTarget)
                        console.log('uploading:', uploading)
                        console.log('fileInputRef.current:', fileInputRef.current)
                        console.log('hasRef:', !!fileInputRef.current)
                        
                        e.preventDefault()
                        e.stopPropagation()
                        
                        if (uploading) {
                          console.log('正在上传中，阻止点击')
                          return
                        }
                        
                        if (!fileInputRef.current) {
                          console.error('fileInputRef.current 不存在！')
                          return
                        }
                        
                        console.log('准备触发文件选择器')
                        try {
                          fileInputRef.current.click()
                          console.log('文件选择器已触发')
                        } catch (error) {
                          console.error('触发文件选择器失败:', error)
                        }
                      }}
                      onMouseDown={(e) => {
                        console.log('鼠标按下', e.target)
                      }}
                      onMouseUp={(e) => {
                        console.log('鼠标抬起', e.target)
                      }}
                      sx={{
                        border: '2px dashed',
                        borderColor: uploading ? 'action.disabled' : 'divider',
                        borderRadius: 3,
                        p: 10,
                        textAlign: 'center',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        display: 'block',
                        userSelect: 'none',
                        position: 'relative',
                        zIndex: 10,
                        pointerEvents: uploading ? 'none' : 'auto',
                        '&:hover': {
                          borderColor: uploading ? 'action.disabled' : 'primary.main',
                          bgcolor: uploading ? 'transparent' : 'primary.lightOpacity'
                        }
                      }}
                    >
                      {uploading ? (
                        <>
                          <CircularProgress size={48} sx={{ mb: 2 }} />
                          <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>上传中...</Typography>
                        </>
                      ) : (
                        <>
                          <i className='ri-cloud-upload-line text-5xl text-primary mb-4' />
                          <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>点击或拖拽文件到此处上传</Typography>
                          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                            支持格式: ZIP, PDF, DOC, PNG, JPG (最大 5MB)
                          </Typography>
                          <Typography variant='caption' color='text.disabled'>
                            上传交易相关的证明材料可以加快审核速度
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
                      borderRadius: 3,
                      p: 6,
                      bgcolor: 'success.lightOpacity',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: 'success.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <i className='ri-file-text-line text-2xl text-white' />
                      </Box>
                      <Box>
                        <Typography variant='body1' sx={{ fontWeight: 600 }}>
                          {uploadedFile.name}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          上传成功
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

                <Box sx={{ mt: 8 }}>
                  <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>备注信息 (可选)</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder='请输入汇款备注，如用途说明等'
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 步骤3: 确认提交 */}
        {activeStep === 2 && (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <CardContent className='py-16 text-center'>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'success.lightOpacity', color: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 6 }}>
                  <i className='ri-check-line text-4xl' />
                </Box>
                <Typography variant='h5' sx={{ fontWeight: 700, mb: 2 }}>确认汇款信息</Typography>
                <Typography color='text.secondary' sx={{ mb: 8 }}>
                  {selectedRecipient 
                    ? '请确认您的汇款金额和收款人信息准确无误'
                    : '请确认您的汇款金额准确无误'}
                </Typography>
                
                <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: 'left', p: 6, bgcolor: 'action.hover', borderRadius: '12px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Typography variant='body2' color='text.secondary'>汇款金额</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>{payAmount || '0.00'} {payCurrency}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Typography variant='body2' color='text.secondary'>汇率</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>1 {payCurrency} = {exchangeRate.toFixed(4)} {receiveCurrency}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Typography variant='body2' color='text.secondary'>收款金额</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: 'success.main' }}>{receiveAmount || '0.00'} {receiveCurrency}</Typography>
                  </Box>
                  {selectedRecipient && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                      <Typography variant='body2' color='text.secondary'>收款人</Typography>
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>{selectedRecipient.accountName}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='body2' color='text.secondary'>手续费</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>
                      {calculatingFee ? <CircularProgress size={16} /> : `${fee.toFixed(4)} ${payCurrency}`}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 步骤4: 安全验证 */}
        {activeStep === 3 && (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ py: 8, px: 6 }}>
                <Box sx={{ maxWidth: 500, mx: 'auto' }}>
                  <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'warning.lightOpacity', color: 'warning.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                      <i className='ri-shield-keyhole-line text-4xl' />
                    </Box>
                    <Typography variant='h5' sx={{ fontWeight: 700, mb: 2 }}>安全验证</Typography>
                    <Typography color='text.secondary'>为了保护您的资金安全，请输入支付密码完成验证</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {/* 支付密码 */}
                    <TextField
                      fullWidth
                      label='支付密码'
                      type={showPassword ? 'text' : 'password'}
                      value={payPassword}
                      onChange={(e) => setPayPassword(e.target.value)}
                      placeholder='请输入支付密码'
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
                    />

                    {/* Google验证码 */}
                    <TextField
                      fullWidth
                      label='Google验证码'
                      value={googleCode}
                      onChange={(e) => setGoogleCode(e.target.value)}
                      placeholder='请输入6位Google验证码（如已绑定）'
                      inputProps={{ maxLength: 6 }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />

                    <Alert severity='info' sx={{ borderRadius: '8px' }}>
                      请确保支付密码输入正确，如已绑定Google验证器，请同时输入验证码
                    </Alert>
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
              返回
            </Button>
            <Button 
              variant='contained' 
              onClick={activeStep === steps.length - 1 ? handleSubmit : () => handleStepChange('next')} 
              disabled={submitting || stepLoading}
              sx={{ borderRadius: '8px', px: 10, fontWeight: 700 }}
              startIcon={(submitting || stepLoading) ? <CircularProgress size={20} color='inherit' /> : null}
            >
              {activeStep === steps.length - 1 ? (submitting ? '提交中...' : '确认提交') : (stepLoading ? '加载中...' : '下一步')}
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
            <Typography variant='body2' sx={{ fontWeight: 500 }}>加载中...</Typography>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default CreateRemittance
