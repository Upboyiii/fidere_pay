'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useRouter, useParams, useSearchParams } from 'next/navigation'

// Util Imports
import { getLocalizedPath } from '@/utils/routeUtils'

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

const Deposit = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const currentLang = (params?.lang as string) || undefined
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
      toast.error('获取充值地址失败')
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
          estimatedTime: '1-30分钟'
        })
      }
    } catch (error) {
      console.error('获取充值详情失败:', error)
      // 使用默认值
      setRechargeDetail({
        minAmount: 0,
        fee: 0,
        estimatedTime: '1-30分钟'
      })
    }
  }

  useEffect(() => {
    loadDepositAddress()
    loadRechargeDetail()
  }, [searchParams])

  const handleCopyAddress = () => {
    if (!depositAddress) {
      toast.warning('地址加载中，请稍候')
      return
    }
    navigator.clipboard.writeText(depositAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('地址已复制')
  }

  const handleBack = () => {
    router.push(getLocalizedPath('/assets/my-assets', currentLang))
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
              USDT 充值
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
                      扫码充值
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
                        仅支持 TRC20 网络
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* 右侧：充值地址 */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Box>
                      <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 2 }}>
                        充值地址
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          fullWidth
                          size='small'
                          value={loading ? '加载中...' : depositAddress || ''}
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
                          {copied ? '已复制' : '复制地址'}
                        </Button>
                      </Box>
                    </Box>

                    {/* 安全提示 */}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <i className='ri-information-line text-primary' />
                        <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                          安全提示
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Typography variant='body2' color='text.secondary'>
                          • 此地址永久有效, 可重复充值
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          • 仅支持 TRC20 网络的 USDT
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          • 转错网络或币种将导致资产丢失
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
                        当前网络: {network}
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
                      最低充值额
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
                      手续费
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
                      预计到账
                    </Typography>
                  </Box>
                  <Typography variant='h5' sx={{ fontWeight: 700, mt: 3 }}>
                    {rechargeDetail?.estimatedTime ?? '1-30分钟'}
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
                        风险提醒
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
                          请务必确认网络类型为TRC20,否则充值将丢失且无法找回!
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
                        充值步骤
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Typography variant='body1' color='text.secondary' sx={{ lineHeight: 1.7 }}>
                          1. 复制地址或扫描二维码
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
                            2. 在钱包中选择 TRC20
                          </Typography>
                        </Box>
                        <Typography variant='body1' color='text.secondary' sx={{ lineHeight: 1.7 }}>
                          3. 粘贴地址并发送 USDT
                        </Typography>
                        <Typography variant='body1' color='text.secondary' sx={{ lineHeight: 1.7 }}>
                          4. 等待区块链确认到账
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
                        地址安全
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
                          此充值地址专属于您,永久有效且不会更改。建议保存到地址簿方便使用。
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
