'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

// Util Imports
import { getLocalizedPath } from '@/utils/routeUtils'

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
import CircularProgress from '@mui/material/CircularProgress'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { addPayee, editPayee, getPayeeDetail, type PayeeItem } from '@server/otc-api'
import { toast } from 'react-toastify'

const EditRecipient = ({ mode }: { mode: Mode }) => {
  const params = useParams()
  const router = useRouter()
  const recipientId = params?.id ? Number(params.id) : null
  const isEdit = !!recipientId
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 表单数据
  const [formData, setFormData] = useState({
    accountType: 1, // 1-公司 2-个人
    companyName: '',
    firstName: '',
    lastName: '',
    remitType: 1, // 1-SWIFT 2-本地
    country: '',
    countryCode: '',
    state: '',
    city: '',
    address: '',
    postalCode: '',
    araeCode: '+86',
    phone: '',
    email: '',
    accountName: '',
    accountNo: '',
    swiftCode: '',
    bankName: '',
    bankCountry: '',
    bankCountryCode: '',
    bankState: '',
    bankCity: '',
    bankAddress: '',
    purpose: '',
    purposeDesc: '',
    remark: ''
  })

  // 加载收款人详情（编辑模式）
  useEffect(() => {
    if (isEdit && recipientId) {
      const loadDetail = async () => {
        setLoading(true)
        try {
          const res = await getPayeeDetail({ id: recipientId })
          // API 响应结构：{ code: 0, message: "", data: PayeeItem }
          // clientRequest 返回：{ data: { code: 0, message: "", data: PayeeItem } }
          // 所以需要 res.data.data 来获取实际的 PayeeItem
          const data = res.data?.data || res.data
          if (data) {
            console.log('加载的收款人详情数据:', data)
            
            // 解析电话号码（如果有区号）
            let phone = data.phone || ''
            let araeCode = data.araeCode || '+86' // 默认使用 +86
            
            // 如果电话号码包含区号但没有单独存储，尝试分离
            if (phone && !data.araeCode) {
              if (phone.startsWith('+')) {
                // 如果电话号码以+开头但没有单独的区号，尝试提取
                const match = phone.match(/^(\+\d{1,4})(.+)$/)
                if (match) {
                  araeCode = match[1]
                  phone = match[2]
                }
              }
            } else if (phone && araeCode && !phone.startsWith('+')) {
              // 如果区号和号码是分开的，确保号码不包含区号
              phone = phone.replace(/^\+\d{1,4}/, '')
            }

            setFormData({
              accountType: data.accountType ?? 1,
              companyName: data.companyName ?? '',
              firstName: data.firstName ?? '',
              lastName: data.lastName ?? '',
              remitType: data.remitType ?? 1,
              country: data.country ?? '',
              countryCode: data.countryCode ?? data.country ?? '',
              state: data.state ?? '',
              city: data.city ?? '',
              address: data.address ?? '',
              postalCode: data.postalCode ?? '',
              araeCode: araeCode,
              phone: phone,
              email: data.email ?? '',
              accountName: data.accountName ?? '',
              accountNo: data.accountNo ?? '',
              swiftCode: data.swiftCode ?? '',
              bankName: data.bankName ?? '',
              bankCountry: data.bankCountry ?? '',
              bankCountryCode: data.bankCountryCode ?? data.bankCountry ?? '',
              bankState: data.bankState ?? '',
              bankCity: data.bankCity ?? '',
              bankAddress: data.bankAddress ?? '',
              purpose: data.purpose ?? '',
              purposeDesc: data.purposeDesc ?? '',
              remark: data.remark ?? ''
            })
          } else {
            console.warn('收款人详情数据为空:', res)
            toast.error('未找到收款人详情数据')
          }
        } catch (error) {
          console.error('加载收款人详情失败:', error)
          toast.error('加载收款人详情失败')
        } finally {
          setLoading(false)
        }
      }
      loadDetail()
    }
  }, [isEdit, recipientId])

  const handleBack = () => {
    router.back()
  }

  const validateForm = () => {
    if (!formData.country || !formData.countryCode) {
      toast.error('请选择国家/地区')
      return false
    }
    if (!formData.state) {
      toast.error('请输入州/省')
      return false
    }
    if (!formData.city) {
      toast.error('请输入城市')
      return false
    }
    if (!formData.address) {
      toast.error('请输入详细地址')
      return false
    }
    if (!formData.accountName) {
      toast.error('请输入账户名称')
      return false
    }
    if (!formData.accountNo) {
      toast.error('请输入银行账号')
      return false
    }
    if (!formData.bankName) {
      toast.error('请输入银行名称')
      return false
    }
    if (!formData.bankCountry || !formData.bankCountryCode) {
      toast.error('请选择银行所在国家')
      return false
    }
    if (formData.remitType === 1 && !formData.swiftCode) {
      toast.error('SWIFT汇款需要填写SWIFT/BIC编码')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setSubmitting(true)
    try {
      // 构建提交数据
      const submitData: any = {
        accountType: formData.accountType,
        remitType: formData.remitType,
        country: formData.country,
        countryCode: formData.countryCode || formData.country, // 如果没有单独的国家代码，使用国家名称
        state: formData.state,
        city: formData.city,
        address: formData.address,
        accountName: formData.accountName,
        accountNo: formData.accountNo,
        bankName: formData.bankName,
        bankCountry: formData.bankCountry,
        bankCountryCode: formData.bankCountryCode || formData.bankCountry
      }

      // 可选字段
      if (formData.postalCode) submitData.postalCode = formData.postalCode
      if (formData.araeCode) submitData.araeCode = formData.araeCode
      // 电话号码：如果有区号和号码，合并；否则只传号码
      if (formData.phone) {
        if (formData.araeCode) {
          submitData.phone = `${formData.araeCode}${formData.phone}`
        } else {
          submitData.phone = formData.phone
        }
      }
      if (formData.email) submitData.email = formData.email
      if (formData.swiftCode) submitData.swiftCode = formData.swiftCode
      if (formData.bankState) submitData.bankState = formData.bankState
      if (formData.bankCity) submitData.bankCity = formData.bankCity
      if (formData.bankAddress) submitData.bankAddress = formData.bankAddress
      if (formData.purpose) submitData.purpose = formData.purpose
      if (formData.purposeDesc) submitData.purposeDesc = formData.purposeDesc
      if (formData.remark) submitData.remark = formData.remark

      // 根据账户类型添加相应字段
      if (formData.accountType === 1) {
        // 公司账户
        if (formData.companyName) submitData.companyName = formData.companyName
      } else {
        // 个人账户
        if (formData.firstName) submitData.firstName = formData.firstName
        if (formData.lastName) submitData.lastName = formData.lastName
      }

      if (isEdit && recipientId) {
        await editPayee({
          id: recipientId,
          ...submitData
        })
        toast.success('更新成功')
      } else {
        await addPayee(submitData)
        toast.success('添加成功')
      }
      
      router.push(getLocalizedPath('/remittance/recipients', params?.lang as string))
    } catch (error: any) {
      console.error('提交失败:', error)
      const errorMessage = error?.message || (isEdit ? '更新失败' : '添加失败')
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={6} sx={{ position: 'relative', zIndex: 1 }}>
          <Grid size={{ xs: 12 }}>
          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <IconButton
                onClick={handleBack}
                sx={{
                  mt: 0.5,
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    color: 'text.primary'
                  }
                }}
              >
                <i className='ri-arrow-left-line' />
              </IconButton>
              <Box sx={{ flex: 1 }}>
                <Typography variant='h4' sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                  {isEdit ? '编辑收款人' : '新增收款人'}
                </Typography>
                <Typography color='text.secondary'>
                  管理您的全球收款账户，确保资金安全到账
                </Typography>
              </Box>
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

        {/* 基本设置 - 移到收款人信息上方，缩小面积 */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ py: 4, px: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 600, minWidth: 100, color: 'text.primary' }}>
                  汇款方式
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <ToggleButton
                    value={1}
                    selected={formData.remitType === 1}
                    onClick={() => setFormData({ ...formData, remitType: 1 })}
                    sx={{
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.12)',
                      px: 4,
                      py: 1.5,
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
                    }}
                  >
                    SWIFT汇款
                  </ToggleButton>
                  <ToggleButton
                    value={2}
                    selected={formData.remitType === 2}
                    onClick={() => setFormData({ ...formData, remitType: 2 })}
                    sx={{
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.12)',
                      px: 4,
                      py: 1.5,
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
                    }}
                  >
                    本地汇款
                  </ToggleButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 收款人信息 */}
        <Grid size={{ xs: 12 }}>
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
                      value={formData.country}
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData({ 
                          ...formData, 
                          country: value,
                          countryCode: value // 简化处理，实际应该根据国家名称获取国家代码
                        })
                      }}
                      displayEmpty
                      sx={{ borderRadius: '12px' }}
                    >
                      <MenuItem value=''>请选择国家/地区</MenuItem>
                      <MenuItem value='香港'>香港</MenuItem>
                      <MenuItem value='美国'>美国</MenuItem>
                      <MenuItem value='新加坡'>新加坡</MenuItem>
                      <MenuItem value='英国'>英国</MenuItem>
                      <MenuItem value='中国'>中国</MenuItem>
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
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                      value={formData.address}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value.length <= 120) {
                          setFormData({ ...formData, address: value })
                        }
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <Box sx={{ position: 'absolute', bottom: 8, right: 12 }}>
                      <Typography variant='caption' color='text.secondary'>
                        {formData.address.length}/120
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
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
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
                        value={formData.araeCode}
                        onChange={(e) => setFormData({ ...formData, araeCode: e.target.value })}
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
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                {/* 账户类型 - 改为紧凑的横向布局 */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                    <Typography variant='body2' sx={{ fontWeight: 600, minWidth: 100, color: 'text.primary' }}>
                      账户类型
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <ToggleButton
                        value={1}
                        selected={formData.accountType === 1}
                        onClick={() => setFormData({ ...formData, accountType: 1 })}
                        sx={{
                          borderRadius: '8px',
                          border: '1px solid rgba(0,0,0,0.12)',
                          px: 4,
                          py: 1.5,
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
                        }}
                      >
                        公司账户
                      </ToggleButton>
                      <ToggleButton
                        value={2}
                        selected={formData.accountType === 2}
                        onClick={() => setFormData({ ...formData, accountType: 2 })}
                        sx={{
                          borderRadius: '8px',
                          border: '1px solid rgba(0,0,0,0.12)',
                          px: 4,
                          py: 1.5,
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
                        }}
                      >
                        个人账户
                      </ToggleButton>
                    </Box>
                  </Box>
                </Grid>

                {/* 公司英文名称（仅公司账户显示） */}
                {formData.accountType === 1 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                      公司英文名称 <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                    </Typography>
                    <TextField
                      fullWidth
                      size='small'
                      placeholder='请输入公司英文全称'
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                )}

                {/* 个人账户：名和姓 */}
                {formData.accountType === 2 && (
                  <>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                        名
                      </Typography>
                      <TextField
                        fullWidth
                        size='small'
                        placeholder='名'
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                        姓
                      </Typography>
                      <TextField
                        fullWidth
                        size='small'
                        placeholder='姓'
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Grid>
                  </>
                )}

                {/* 账户名称 */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    账户名称 <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder={formData.accountType === 1 ? '请输入公司全称' : '请输入账户名称'}
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
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
                    value={formData.accountNo}
                    onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>

                {/* SWIFT/BIC 和 银行名称 */}
                {formData.remitType === 1 && (
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
                      value={formData.swiftCode}
                      onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: formData.remitType === 1 ? 6 : 12 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    银行名称 <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder='请输入银行全称 (英文)'
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
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
                      value={formData.bankCountry}
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData({ 
                          ...formData, 
                          bankCountry: value,
                          bankCountryCode: value // 简化处理
                        })
                      }}
                      displayEmpty
                      sx={{ borderRadius: '12px' }}
                    >
                      <MenuItem value=''>请选择国家</MenuItem>
                      <MenuItem value='香港'>香港</MenuItem>
                      <MenuItem value='美国'>美国</MenuItem>
                      <MenuItem value='新加坡'>新加坡</MenuItem>
                      <MenuItem value='英国'>英国</MenuItem>
                      <MenuItem value='中国'>中国</MenuItem>
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
                    value={formData.bankState}
                    onChange={(e) => setFormData({ ...formData, bankState: e.target.value })}
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
                    value={formData.bankCity}
                    onChange={(e) => setFormData({ ...formData, bankCity: e.target.value })}
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
                    value={formData.bankAddress}
                    onChange={(e) => setFormData({ ...formData, bankAddress: e.target.value })}
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
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
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
                    value={formData.purposeDesc}
                    onChange={(e) => setFormData({ ...formData, purposeDesc: e.target.value })}
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
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
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
              disabled={loading || submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
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
              {submitting ? (isEdit ? '更新中...' : '添加中...') : (isEdit ? '保存' : '下一步')}
            </Button>
          </Box>
        </Grid>
      </Grid>
      )}
    </Box>
  )
}

export default EditRecipient
