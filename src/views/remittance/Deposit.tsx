'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation'

// Util Imports
import { getLocalizedPath, getCurrentLangFromPath } from '@/utils/routeUtils'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { getDepositAddress, getRechargeDetail } from '@server/otc-api'
import { toast } from 'react-toastify'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

const Deposit = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
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
  const [depositAddress, setDepositAddress] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rechargeDetail, setRechargeDetail] = useState<any>(null)
  const [network, setNetwork] = useState('Tron (TRC20)')

  // 获取充值地址
  const loadDepositAddress = async () => {
    setLoading(true)
    try {
      const res = await getDepositAddress({
        currencyCode: 'USDT',
        chain: 'TRC20'
      })
      setDepositAddress(res.data?.address || '')
      if (res.data?.chain) {
        setNetwork(res.data.chain === 'TRC20' ? 'Tron (TRC20)' : res.data.chain)
      }
    } catch (error) {
      console.error('获取充值地址失败:', error)
      toast.error(t('assets.getDepositAddressFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 获取充值详情
  const loadRechargeDetail = async () => {
    try {
      // 如果有 rechargeNo 参数，调用详情接口
      const rechargeNo = searchParams?.get('rechargeNo')
      if (rechargeNo) {
        const res = await getRechargeDetail({ rechargeNo })
        setRechargeDetail(res.data?.data || res.data)
      } else {
        // 如果没有 rechargeNo，使用默认值
        setRechargeDetail({
          minAmount: 0,
          fee: 0,
          estimatedTime: t('assets.estimatedTime')
        })
      }
    } catch (error) {
      console.error('获取充值详情失败:', error)
      // 使用默认值
      setRechargeDetail({
        minAmount: 0,
        fee: 0,
        estimatedTime: t('assets.estimatedTime')
      })
    }
  }

  useEffect(() => {
    loadDepositAddress()
    loadRechargeDetail()
  }, [searchParams])

  const handleCopyAddress = () => {
    if (!depositAddress) {
      toast.warning(t('assets.addressLoading'))
      return
    }
    navigator.clipboard.writeText(depositAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success(t('assets.addressCopied'))
  }

  const handleBack = () => {
    // 实时获取当前语言，避免闭包问题
    const realTimeLang = getCurrentLangFromPath()
    router.push(getLocalizedPath('/assets/my-assets', realTimeLang))
  }

  // 生成二维码（简单实现，实际应该使用二维码库）
  const generateQRCode = () => {
    if (!depositAddress) return null
    // 这里应该使用二维码库生成二维码，暂时返回占位符
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(depositAddress)}`
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
        {/* 标题栏 */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={handleBack}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover',
                  color: 'text.primary'
                }
              }}
            >
              <i className='ri-arrow-left-line' />
            </IconButton>
            <Typography variant='h4' sx={{ fontWeight: 700, color: 'text.primary' }}>
              {t('assets.depositTitle')}
            </Typography>
            <Chip 
              label={network} 
              color='primary' 
              sx={{ 
                borderRadius: '6px', 
                fontWeight: 600,
                height: 32,
                fontSize: '0.875rem'
              }} 
            />
          </Box>
        </Grid>

        {/* 充值地址区域 */}
        <Grid size={{ xs: 12 }}>
          <Card 
            sx={{ 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <CardContent sx={{ p: 6 }}>
              <Grid container spacing={6}>
                {/* 左侧：二维码 */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    {loading ? (
                      <Box sx={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress />
                      </Box>
                    ) : depositAddress ? (
                      <Box
                        component='img'
                        src={generateQRCode() || ''}
                        alt='QR Code'
                        sx={{
                          width: 200,
                          height: 200,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 3,
                          bgcolor: 'white',
                          p: 2
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 200,
                          height: 200,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#fcfdfe'
                        }}
                      >
                        <CircularProgress />
                      </Box>
                    )}
                    <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                      {t('assets.scanToDeposit')}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      px: 3, 
                      py: 1.5, 
                      bgcolor: 'success.lightOpacity', 
                      borderRadius: '8px',
                      width: '100%',
                      maxWidth: 300,
                      justifyContent: 'center'
                    }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                      <Typography variant='caption' sx={{ fontWeight: 600, color: 'success.main' }}>
                        {t('assets.onlyTRC20Supported')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* 右侧：充值地址 */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Box>
                      <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 2 }}>
                        {t('assets.depositAddress')}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          fullWidth
                          size='small'
                          value={loading ? t('assets.loading') : depositAddress || ''}
                          readOnly
                          disabled={loading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontFamily: 'monospace',
                              fontSize: '0.875rem',
                              borderRadius: '12px',
                              bgcolor: '#fcfdfe'
                            }
                          }}
                          InputProps={{
                            endAdornment: loading ? <CircularProgress size={20} /> : null
                          }}
                        />
                        <Button
                          variant='contained'
                          onClick={handleCopyAddress}
                          disabled={!depositAddress || loading}
                          startIcon={<i className={copied ? 'ri-check-line' : 'ri-file-copy-line'} />}
                          sx={{ 
                            minWidth: 120, 
                            borderRadius: '12px',
                            fontWeight: 600
                          }}
                        >
                          {copied ? t('assets.copied') : t('assets.copyAddress')}
                        </Button>
                      </Box>
                    </Box>

                    {/* 安全提示 */}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <i className='ri-information-line text-primary' />
                        <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                          {t('assets.securityTips')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Typography variant='body2' color='text.secondary'>
                          {t('assets.securityTip1')}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {t('assets.securityTip2')}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {t('assets.securityTip3')}
                        </Typography>
                      </Box>
                    </Box>

                    {/* 当前网络 */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5, 
                      px: 3, 
                      py: 2, 
                      bgcolor: 'success.lightOpacity', 
                      borderRadius: '8px'
                    }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                      <Typography variant='body2' sx={{ fontWeight: 600, color: 'success.main' }}>
                        {t('assets.currentNetwork')}: {network}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 信息卡片：最低充值额、手续费、预计到账 */}
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ 
                borderRadius: '16px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)', 
                border: '1px solid rgba(0,0,0,0.05)',
                height: '100%',
                minHeight: 160,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ p: 5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      bgcolor: 'primary.lightOpacity', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <i className='ri-information-line text-primary text-lg' />
                    </Box>
                    <Typography variant='subtitle1' sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      {t('assets.minDepositAmount')}
                    </Typography>
                  </Box>
                  <Typography variant='h5' sx={{ fontWeight: 700, mt: 3 }}>
                    {rechargeDetail?.minAmount ?? 0} USDT
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ 
                borderRadius: '16px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)', 
                border: '1px solid rgba(0,0,0,0.05)',
                height: '100%',
                minHeight: 160,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ p: 5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      bgcolor: 'warning.lightOpacity', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <i className='ri-money-dollar-circle-line text-warning text-lg' />
                    </Box>
                    <Typography variant='subtitle1' sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      {t('assets.fee')}
                    </Typography>
                  </Box>
                  <Typography variant='h5' sx={{ fontWeight: 700, mt: 3 }}>
                    {rechargeDetail?.fee ?? 0}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ 
                borderRadius: '16px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)', 
                border: '1px solid rgba(0,0,0,0.05)',
                height: '100%',
                minHeight: 160,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ p: 5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      bgcolor: 'success.lightOpacity', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <i className='ri-time-line text-success text-lg' />
                    </Box>
                    <Typography variant='subtitle1' sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      {t('assets.estimatedArrival')}
                    </Typography>
                  </Box>
                  <Typography variant='h5' sx={{ fontWeight: 700, mt: 3 }}>
                    {rechargeDetail?.estimatedTime ?? t('assets.estimatedTime')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* 底部三个面板 */}
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={4}>
            {/* 风险提醒 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ 
                borderRadius: '16px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)', 
                border: '1px solid rgba(0,0,0,0.05)',
                height: '100%',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ p: 5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      bgcolor: 'error.lightOpacity', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className='ri-error-warning-line text-error text-lg' />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 2 }}>
                        {t('assets.riskWarning')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        {/* <Box sx={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: '50%', 
                          bgcolor: 'error.main', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          mt: 0.25,
                          flexShrink: 0
                        }}>
                          <i className='ri-close-line text-white' style={{ fontSize: '12px' }} />
                        </Box> */}
                        <Typography variant='body1' color='text.secondary' sx={{ lineHeight: 1.7 }}>
                          {t('assets.riskWarningText')}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* 充值步骤 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ 
                borderRadius: '16px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)', 
                border: '1px solid rgba(0,0,0,0.05)',
                height: '100%',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ p: 5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      bgcolor: 'primary.lightOpacity', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className='ri-file-copy-line text-primary text-lg' />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 2 }}>
                        {t('assets.depositSteps')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Typography variant='body1' color='text.secondary' sx={{ lineHeight: 1.7 }}>
                          {t('assets.depositStep1')}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          {/* <Box sx={{ 
                            width: 20, 
                            height: 20, 
                            borderRadius: '50%', 
                            bgcolor: 'primary.main', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mt: 0.25,
                            flexShrink: 0
                          }}>
                            <i className='ri-information-line text-white' style={{ fontSize: '12px' }} />
                          </Box> */}
                          <Typography variant='body1' color='text.secondary' sx={{ lineHeight: 1.7 }}>
                            {t('assets.depositStep2')}
                          </Typography>
                        </Box>
                        <Typography variant='body1' color='text.secondary' sx={{ lineHeight: 1.7 }}>
                          {t('assets.depositStep3')}
                        </Typography>
                        <Typography variant='body1' color='text.secondary' sx={{ lineHeight: 1.7 }}>
                          {t('assets.depositStep4')}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* 地址安全 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ 
                borderRadius: '16px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)', 
                border: '1px solid rgba(0,0,0,0.05)',
                height: '100%',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ p: 5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      bgcolor: 'success.lightOpacity', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className='ri-lock-line text-success text-lg' />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 2 }}>
                        {t('assets.addressSecurity')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        {/* <Box sx={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: '50%', 
                          bgcolor: 'success.main', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          mt: 0.25,
                          flexShrink: 0
                        }}>
                          <i className='ri-check-line text-white' style={{ fontSize: '12px' }} />
                        </Box> */}
                        <Typography variant='body1' color='text.secondary' sx={{ lineHeight: 1.7 }}>
                          {t('assets.addressSecurityText')}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Deposit
