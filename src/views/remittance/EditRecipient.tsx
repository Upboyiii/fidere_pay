'use client'

// React Imports
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

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
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

// Type Imports
import type { Mode } from '@core/types'

const EditRecipient = ({ mode }: { mode: Mode }) => {
  const params = useParams()
  const router = useRouter()
  const recipientId = params?.id as string

  const [remittanceMethod, setRemittanceMethod] = useState('swift')
  const [accountType, setAccountType] = useState('company')
  const [currency, setCurrency] = useState('USD')
  const [remittancePurpose, setRemittancePurpose] = useState('')
  const [purposeDescription, setPurposeDescription] = useState('')
  const [remarks, setRemarks] = useState('')
  const [country, setCountry] = useState('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [phoneCode, setPhoneCode] = useState('+1')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')

  const handleBack = () => {
    router.back()
  }

  const handleSubmit = () => {
    // 处理提交逻辑
    console.log('提交收款人信息')
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
          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant='h4' sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                {recipientId ? '编辑收款人' : '新增收款人'}
              </Typography>
              <Typography color='text.secondary'>
                管理您的全球收款账户，确保资金安全到账
              </Typography>
            </Box>
            
            {/* 简洁的步骤指示器 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  1
                </Box>
                <Typography variant='body2' sx={{ fontWeight: 600, color: 'primary.main' }}>
                  收款人信息
                </Typography>
              </Box>
              <Box sx={{ width: 40, height: 1, bgcolor: 'divider', mx: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: 'action.disabledBackground',
                    color: 'text.disabled',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  2
                </Box>
                <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.disabled' }}>
                  确认信息
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* 基本设置 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', height: '100%' }}>
            <CardHeader 
              title='基本设置' 
              titleTypographyProps={{ sx: { fontWeight: 700, fontSize: '1.125rem' } }}
            />
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
            <CardContent sx={{ py: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Box>
                  <Typography variant='subtitle2' sx={{ mb: 3, fontWeight: 600 }}>汇款方式</Typography>
                  <ToggleButtonGroup
                    value={remittanceMethod}
                    exclusive
                    onChange={(_, value) => value && setRemittanceMethod(value)}
                    fullWidth
                    sx={{
                      '& .MuiToggleButton-root': {
                        borderRadius: '8px',
                        border: '1px solid rgba(0,0,0,0.12)',
                        px: 4,
                        py: 2,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          borderColor: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.dark'
                          }
                        },
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }
                    }}
                  >
                    <ToggleButton value='swift'>SWIFT汇款</ToggleButton>
                    <ToggleButton value='local'>本地汇款</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Box>
                  <Typography variant='subtitle2' sx={{ mb: 3, fontWeight: 600 }}>币种</Typography>
                  <FormControl fullWidth size='small'>
                    <Select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      sx={{ borderRadius: '12px' }}
                    >
                      <MenuItem value='USD'>USD - 美元</MenuItem>
                      <MenuItem value='EUR'>EUR - 欧元</MenuItem>
                      <MenuItem value='HKD'>HKD - 港币</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 收款人信息 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', height: '100%' }}>
            <CardHeader 
              title='收款人信息' 
              titleTypographyProps={{ sx: { fontWeight: 700, fontSize: '1.125rem' } }}
            />
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
            <CardContent sx={{ py: 6 }}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    国家/地区 <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Typography>
                  <FormControl fullWidth size='small'>
                    <Select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      displayEmpty
                      sx={{ borderRadius: '12px' }}
                    >
                      <MenuItem value=''>请选择国家/地区</MenuItem>
                      <MenuItem value='HK'>香港</MenuItem>
                      <MenuItem value='US'>美国</MenuItem>
                      <MenuItem value='SG'>新加坡</MenuItem>
                      <MenuItem value='GB'>英国</MenuItem>
                      <MenuItem value='CN'>中国</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    州/省 <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder='州/省'
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    城市 <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder='城市'
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    详细地址 <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Typography>
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      fullWidth
                      size='small'
                      multiline
                      rows={3}
                      placeholder='请输入详细地址'
                      value={address}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value.length <= 120) {
                          setAddress(value)
                        }
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <Box sx={{ position: 'absolute', bottom: 8, right: 12 }}>
                      <Typography variant='caption' color='text.secondary'>
                        {address.length}/120
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    邮政编码
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder='邮编'
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    联系电话
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size='small' sx={{ width: 100 }}>
                      <Select
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value)}
                        sx={{ borderRadius: '12px' }}
                      >
                        <MenuItem value='+1'>+1</MenuItem>
                        <MenuItem value='+86'>+86</MenuItem>
                        <MenuItem value='+852'>+852</MenuItem>
                        <MenuItem value='+65'>+65</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      size='small'
                      placeholder='请输入电话号码'
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    邮箱地址
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    type='email'
                    placeholder='请输入邮箱地址'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 银行信息卡片 */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <CardHeader 
              title='银行信息' 
              titleTypographyProps={{ sx: { fontWeight: 700, fontSize: '1.125rem' } }}
            />
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
            <CardContent sx={{ py: 6 }}>
              <Grid container spacing={4}>
                {/* 账户类型 */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant='subtitle2' sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>账户类型</Typography>
                  <ToggleButtonGroup
                    value={accountType}
                    exclusive
                    onChange={(_, value) => value && setAccountType(value)}
                    fullWidth
                    sx={{
                      '& .MuiToggleButton-root': {
                        borderRadius: '12px',
                        border: '1px solid rgba(0,0,0,0.12)',
                        px: 6,
                        py: 3,
                        fontWeight: 600,
                        textTransform: 'none',
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          borderColor: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.dark'
                          }
                        },
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }
                    }}
                  >
                    <ToggleButton value='company'>公司账户</ToggleButton>
                    <ToggleButton value='personal'>个人账户</ToggleButton>
                  </ToggleButtonGroup>
                </Grid>

                {/* 公司英文名称（仅公司账户显示） */}
                {accountType === 'company' && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                      公司英文名称 <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                    </Typography>
                    <TextField
                      fullWidth
                      size='small'
                      placeholder='请输入公司英文全称'
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                )}

                {/* 账户名称 */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    账户名称 <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder={accountType === 'company' ? '请输入公司全称' : '请输入账户名称'}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                  <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                    请与银行账户开户名称保持完全一致
                  </Typography>
                </Grid>

                {/* 银行账号/IBAN */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    银行账号/IBAN <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder='请输入银行账号或IBAN号码'
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>

                {/* SWIFT/BIC 和 银行名称 */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                      SWIFT/BIC <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                    </Typography>
                    <Tooltip title='SWIFT代码是银行国际识别码'>
                      <IconButton size='small' sx={{ p: 0.5, color: 'text.secondary' }}>
                        <i className='ri-question-line text-sm' />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder='请输入SWIFT/BIC'
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    银行名称 <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder='请输入银行全称 (英文)'
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>

                {/* 银行国家 */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    银行国家 <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Typography>
                  <FormControl fullWidth size='small'>
                    <Select
                      displayEmpty
                      sx={{ borderRadius: '12px' }}
                    >
                      <MenuItem value=''>请选择国家</MenuItem>
                      <MenuItem value='HK'>香港</MenuItem>
                      <MenuItem value='US'>美国</MenuItem>
                      <MenuItem value='SG'>新加坡</MenuItem>
                      <MenuItem value='GB'>英国</MenuItem>
                      <MenuItem value='CN'>中国</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* 银行州/省 */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    银行州/省
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder='州/省'
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>

                {/* 银行城市 */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    银行城市
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder='城市'
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>

                {/* 银行地址 */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    银行地址
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder='银行分行详细地址 (选填)'
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 汇款用途和备注卡片 */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <CardHeader 
              title='汇款用途' 
              titleTypographyProps={{ sx: { fontWeight: 700, fontSize: '1.125rem' } }}
            />
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
            <CardContent sx={{ py: 6 }}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    <Typography component='span' sx={{ color: 'error.main' }}>*</Typography> 汇款用途
                  </Typography>
                  <FormControl fullWidth size='small'>
                    <Select
                      value={remittancePurpose}
                      onChange={(e) => setRemittancePurpose(e.target.value)}
                      displayEmpty
                      sx={{ borderRadius: '12px' }}
                    >
                      <MenuItem value=''>请选择汇款用途</MenuItem>
                      <MenuItem value='trade'>贸易付款</MenuItem>
                      <MenuItem value='service'>服务费</MenuItem>
                      <MenuItem value='salary'>工资</MenuItem>
                      <MenuItem value='other'>其他</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    用途补充说明
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder='补充说明 (选填)'
                    value={purposeDescription}
                    onChange={(e) => setPurposeDescription(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 备注信息卡片 */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <CardHeader 
              title='备注信息' 
              titleTypographyProps={{ sx: { fontWeight: 700, fontSize: '1.125rem' } }}
            />
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
            <CardContent sx={{ py: 6 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder='请输入备注信息 (选填)'
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* 重要提示 */}
        <Grid size={{ xs: 12 }}>
          <Alert 
            severity='info' 
            icon={<i className='ri-information-line' />}
            sx={{ 
              borderRadius: '12px',
              bgcolor: 'info.lightOpacity',
              border: '1px solid',
              borderColor: 'info.main',
              '& .MuiAlert-icon': {
                color: 'info.main'
              }
            }}
          >
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
              重要提示
            </Typography>
            <Typography variant='body2' component='div' sx={{ '& > *': { mb: 0.5 } }}>
              <Box>• 请确保所有信息准确无误，特别是账户名称和银行账号</Box>
              <Box>• SWIFT代码和路由码请向收款银行确认</Box>
              <Box>• 不同国家的银行可能需要不同的路由码类型</Box>
            </Typography>
          </Alert>
        </Grid>

        {/* 操作按钮 */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
            <Button 
              variant='outlined' 
              onClick={handleBack}
              sx={{ 
                borderRadius: '12px', 
                px: 8,
                py: 2,
                borderColor: 'rgba(0,0,0,0.12)',
                color: 'text.primary',
                fontWeight: 600,
                '&:hover': {
                  borderColor: 'rgba(0,0,0,0.3)',
                  bgcolor: 'action.hover'
                }
              }}
            >
              返回
            </Button>
            <Button 
              variant='contained' 
              onClick={handleSubmit}
              sx={{ 
                borderRadius: '12px', 
                px: 10,
                py: 2,
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(var(--mui-palette-primary-mainChannel), 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(var(--mui-palette-primary-mainChannel), 0.4)'
                }
              }}
            >
              下一步
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default EditRecipient
