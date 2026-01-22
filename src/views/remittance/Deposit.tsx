'use client'

// React Imports
import { useState, useEffect } from 'react'

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
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

// Type Imports
import type { Mode } from '@core/types'

const Deposit = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const [depositAddress, setDepositAddress] = useState('TWpmR5onKmngm3ag2Hg4tWibDz388S8KP9')
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(depositAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleBack = () => {
    router.push('/assets/my-assets')
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
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Button
              variant='text'
              startIcon={<i className='ri-arrow-left-line' />}
              onClick={handleBack}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { 
                  bgcolor: 'action.hover',
                  color: 'text.primary'
                }
              }}
            >
              返回
            </Button>
            <Box sx={{ flex: 1 }}>
              <Typography variant='h4' sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                USDT 充值
              </Typography>
              <Typography color='text.secondary' sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                Tron (TRC20)
                <Chip label='仅支持 TRC20 网络' color='success' size='small' sx={{ borderRadius: '6px', fontWeight: 600 }} />
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            sx={{ 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.05)',
              height: '100%'
            }}
          >
            <CardHeader 
              title='扫码充值' 
              titleTypographyProps={{ sx: { fontWeight: 700 } }}
              avatar={<i className='ri-qr-code-line text-primary text-xl' />}
            />
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
            <CardContent className='flex flex-col items-center gap-6 py-10'>
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
                  bgcolor: 'white',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                  p: 2
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#fcfdfe',
                    borderRadius: 2
                  }}
                >
                  <i className='ri-qr-code-line text-6xl text-textDisabled' />
                  <Typography variant='caption' color='text.disabled' sx={{ mt: 2 }}>
                    QR Code Placeholder
                  </Typography>
                </Box>
              </Box>
              <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', maxWidth: 280 }}>
                使用支持 TRC20 的钱包扫描上方二维码进行充值
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            sx={{ 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.05)',
              height: '100%'
            }}
          >
            <CardHeader 
              title='充值地址' 
              titleTypographyProps={{ sx: { fontWeight: 700 } }}
              avatar={<i className='ri-wallet-3-line text-primary text-xl' />}
            />
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
            <CardContent className='flex flex-col gap-6'>
              <Box>
                <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>您的专属充值地址</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={depositAddress}
                    readOnly
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        borderRadius: '8px',
                        bgcolor: '#fcfdfe'
                      }
                    }}
                  />
                  <Button
                    variant='contained'
                    onClick={handleCopyAddress}
                    sx={{ minWidth: 100, borderRadius: '8px' }}
                  >
                    {copied ? '已复制' : '复制地址'}
                  </Button>
                </Box>
              </Box>

              <Alert 
                severity='info' 
                icon={<i className='ri-information-line' />}
                sx={{ borderRadius: '12px', bgcolor: 'primary.lightOpacity', color: 'primary.main', border: '1px solid', borderColor: 'primary.main' }}
              >
                <Typography variant='body2' sx={{ fontWeight: 700, mb: 1 }}>
                  安全提示
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.875rem' }}>
                  <li>此地址永久有效，可重复充值</li>
                  <li>仅支持 TRC20 网络的 USDT</li>
                  <li>转错网络或币种将导致资产丢失</li>
                </ul>
              </Alert>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 4, bgcolor: 'success.lightOpacity', borderRadius: '8px' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main', boxShadow: '0 0 0 4px rgba(76, 175, 80, 0.1)' }} />
                <Typography variant='body2' sx={{ fontWeight: 600, color: 'success.main' }}>
                  当前网络状态: 正常 (Tron TRC20)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 充值步骤 */}
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
                {[
                  { icon: 'ri-number-1', title: '复制地址', desc: '复制上方您的专属地址或扫描二维码' },
                  { icon: 'ri-number-2', title: '发起转账', desc: '在您的钱包或交易所选择 TRC20 网络进行转账' },
                  { icon: 'ri-number-3', title: '区块链确认', desc: '等待 Tron 网络确认转账信息' },
                  { icon: 'ri-number-4', title: '自动入账', desc: '确认后资金将自动增加到您的账户余额' }
                ].map((step, index) => (
                  <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box sx={{ display: 'flex', gap: 4 }}>
                      <Box 
                        sx={{ 
                          width: 40, height: 40, borderRadius: '10px', 
                          bgcolor: 'primary.lightOpacity', color: 'primary.main',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <i className={`${step.icon} text-xl`} />
                      </Box>
                      <Box>
                        <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1 }}>{step.title}</Typography>
                        <Typography variant='caption' color='text.secondary'>{step.desc}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 常见问题 */}
        <Grid size={{ xs: 12 }}>
          <Alert 
            severity='error' 
            icon={<i className='ri-error-warning-line' />}
            sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'error.main' }}
          >
            <Typography variant='body2' sx={{ fontWeight: 700 }}>
              重要提醒：请勿向此地址充值任何非 USDT 资产，否则资产将无法找回。充值前请仔细核对 TRC20 网络。
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Deposit
