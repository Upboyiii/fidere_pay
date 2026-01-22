'use client'

// React Imports
import { useState } from 'react'

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

// Type Imports
import type { Mode } from '@core/types'

const CreateRemittance = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const [payCurrency, setPayCurrency] = useState('USDT')
  const [receiveCurrency, setReceiveCurrency] = useState('USD')
  const [payAmount, setPayAmount] = useState('0.00')
  const [receiveAmount, setReceiveAmount] = useState('0.00')
  const [remarks, setRemarks] = useState('')
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('')
  const usdtBalance = 3895.5216

  // 模拟收款人列表
  const recipientList = [
    {
      id: '1',
      name: 'LI LIAN',
      account: '088828777833',
      bankName: 'The Hongkong and Shanghai Banking Corporation Limited',
      swift: 'HSBCHKHHHKH',
      country: 'HK',
      city: 'guangzhou',
      province: 'guangdong',
      accountType: 'personal',
      remittanceMethod: 'swift',
      purpose: 'FAMILY_SUPPORT',
      currency: 'USD'
    },
    {
      id: '2',
      name: 'UOB Kay Hian (Hong Kong) Ltd',
      account: '600360200274',
      bankName: 'HSBC',
      swift: 'HSBCHKHH',
      country: 'HK',
      city: 'Hong Kong',
      province: 'Hong Kong',
      accountType: 'company',
      remittanceMethod: 'swift',
      purpose: 'TRADE',
      currency: 'USD'
    }
  ]

  const selectedRecipient = recipientList.find(r => r.id === selectedRecipientId)

  const steps = ['汇款金额', '收款人信息', '确认信息']

  const handleNext = () => {
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  return (
    <Box 
      sx={{ 
        p: 6, 
        position: 'relative', 
        minHeight: '100%',
        backgroundColor: '#f8fafc' 
      }}
    >
      {/* 现代感网格背景 */}
      <Box 
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `
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

                  <Box sx={{ p: 4, bgcolor: 'action.hover', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>汇率</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>1 USDT = 1 USD</Typography>
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
                      value={selectedRecipientId}
                      onChange={(e) => setSelectedRecipientId(e.target.value)}
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
                            {recipient.name} - {recipient.account} - {recipient.country} - {recipient.currency}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* 只有选择了收款人才显示详细信息 */}
                  {selectedRecipient && (
                    <Box sx={{ 
                      p: 5, 
                      border: '1px solid', 
                      borderColor: 'primary.main', 
                      borderRadius: '16px', 
                      bgcolor: 'primary.lightOpacity',
                      transition: 'all 0.3s ease'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 4 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: '1.25rem', fontWeight: 700 }}>
                          {selectedRecipient.name[0]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant='h6' sx={{ fontWeight: 700 }}>{selectedRecipient.name}</Typography>
                            <Chip 
                              label={selectedRecipient.accountType === 'personal' ? '个人账户' : '公司账户'} 
                              size='small' 
                              sx={{ 
                                bgcolor: 'primary.main', 
                                color: 'white', 
                                fontWeight: 600,
                                height: 24,
                                fontSize: '0.75rem'
                              }} 
                            />
                          </Box>
                          <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            {selectedRecipient.remittanceMethod === 'swift' ? 'SWIFT汇款' : '本地汇款'}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 4, borderColor: 'rgba(var(--mui-palette-primary-mainChannel), 0.15)' }} />

                      {/* 银行信息 */}
                      <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                          <i className='ri-bank-line text-primary' />
                          <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>银行信息</Typography>
                        </Box>
                        <Grid container spacing={3}>
                          <Grid size={{ xs: 12 }}>
                            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>银行名称</Typography>
                            <Typography variant='body2' sx={{ fontWeight: 600 }}>{selectedRecipient.bankName}</Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>银行账号</Typography>
                            <Typography variant='body2' sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                              {selectedRecipient.account}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>SWIFT代码</Typography>
                            <Typography variant='body2' sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                              {selectedRecipient.swift}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>

                      <Divider sx={{ my: 4, borderColor: 'rgba(var(--mui-palette-primary-mainChannel), 0.15)' }} />

                      {/* 地址信息 */}
                      <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                          <i className='ri-global-line text-primary' />
                          <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>地址信息</Typography>
                        </Box>
                        <Grid container spacing={3}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>国家/地区</Typography>
                            <Typography variant='body2' sx={{ fontWeight: 600 }}>{selectedRecipient.country}</Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>城市/省份</Typography>
                            <Typography variant='body2' sx={{ fontWeight: 600 }}>
                              {selectedRecipient.city}, {selectedRecipient.province}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>

                      <Divider sx={{ my: 4, borderColor: 'rgba(var(--mui-palette-primary-mainChannel), 0.15)' }} />

                      {/* 汇款目的 */}
                      <Box>
                        <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>汇款目的</Typography>
                        <Typography variant='body2' sx={{ fontWeight: 600, color: 'primary.main' }}>
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
                      value={remarks}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value.length <= 200) {
                          setRemarks(value)
                        }
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                      }}
                    />
                    <Box sx={{ position: 'absolute', bottom: 12, right: 16 }}>
                      <Typography variant='caption' color='text.secondary'>
                        {remarks.length}/200
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
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>20 USDT</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>收费比例</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>0.25 %</Typography>
                  </Box>
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
                      {payAmount || '0.00'} USDT
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>手续费</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>
                      20.00 USDT
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>您需支付总额</Typography>
                    <Typography variant='h6' sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {payAmount ? (parseFloat(payAmount) + 20).toFixed(2) : '0.00'} USDT
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
              <CardContent className='py-10'>
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 3,
                    p: 10,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'primary.lightOpacity'
                    }
                  }}
                >
                  <i className='ri-cloud-upload-line text-5xl text-primary mb-4' />
                  <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>点击或拖拽文件到此处上传</Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                    支持格式: ZIP, PDF, DOC, PNG, JPG (最大 5MB)
                  </Typography>
                  <Typography variant='caption' color='text.disabled'>
                    上传交易相关的证明材料可以加快审核速度
                  </Typography>
                </Box>

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
                <Typography color='text.secondary' sx={{ mb: 8 }}>请确认您的汇款金额和收款人信息准确无误</Typography>
                
                <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: 'left', p: 6, bgcolor: 'action.hover', borderRadius: '12px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Typography variant='body2' color='text.secondary'>汇款金额</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>{payAmount || '0.00'} {payCurrency}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Typography variant='body2' color='text.secondary'>收款人</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>{selectedRecipient?.name || '-'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='body2' color='text.secondary'>手续费</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>20 USDT</Typography>
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
              onClick={handleBack} 
              disabled={activeStep === 0}
              sx={{ borderRadius: '8px', px: 8 }}
            >
              返回
            </Button>
            <Button 
              variant='contained' 
              onClick={handleNext} 
              disabled={activeStep === steps.length - 1}
              sx={{ borderRadius: '8px', px: 10, fontWeight: 700 }}
            >
              {activeStep === steps.length - 1 ? '确认提交' : '下一步'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default CreateRemittance
