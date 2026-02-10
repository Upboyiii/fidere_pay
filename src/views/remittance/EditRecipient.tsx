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
import Autocomplete from '@mui/material/Autocomplete'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { addPayee, editPayee, getPayeeDetail, getCountryList, type PayeeItem, type CountryListItem } from '@server/otc-api'
import { toast } from 'react-toastify'

// Context Imports
import { useTranslate } from '@/contexts/DictionaryContext'

const EditRecipient = ({ mode }: { mode: Mode }) => {
  const t = useTranslate()
  const params = useParams()
  const router = useRouter()
  const recipientId = params?.id ? Number(params.id) : null
  const isEdit = !!recipientId
  
  // 获取当前语言，用于显示对应的国家名称字段
  const currentLang = (params?.lang as string) || 'zh-CN'
  const isEnglish = currentLang === 'en'
  
  // 获取国家项的中/英文名称（兼容 camelCase 和 snake_case）
  const getCountryNameCh = (c: CountryListItem) =>
    c.countryNameCh ?? (c as Record<string, unknown>).country_name_ch ?? ''
  const getCountryNameEn = (c: CountryListItem) =>
    c.countryName ?? (c as Record<string, unknown>).country_name ?? ''
  const getCountryAbbr = (c: CountryListItem) =>
    c.countryAbbr ?? (c as Record<string, unknown>).country_abbr ?? ''

  // 根据国家名称或代码查找国家（支持中英文名称、代码，兼容 "香港"/"中国香港" 等）
  const findCountry = (nameOrCode: string) => {
    if (!nameOrCode) return null
    const normalized = String(nameOrCode).trim()
    if (!normalized) return null
    const lower = normalized.toLowerCase()
    return (
      countries.find(c => {
        const nameCh = getCountryNameCh(c)
        const nameEn = getCountryNameEn(c)
        const abbr = getCountryAbbr(c)
        return (
          nameCh === normalized ||
          nameEn === normalized ||
          abbr === normalized ||
          (abbr && abbr.toLowerCase() === lower) ||
          (nameCh && nameCh.includes(normalized)) ||
          (nameEn && nameEn.toLowerCase().includes(lower))
        )
      }) ?? null
    )
  }

  // 根据语言返回对应的国家名称字段
  const getCountryDisplayName = (country: CountryListItem) => {
    const nameCh = getCountryNameCh(country)
    const nameEn = getCountryNameEn(country)
    return isEnglish ? (nameEn || nameCh) : (nameCh || nameEn)
  }
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [countries, setCountries] = useState<CountryListItem[]>([])
  const [countriesLoading, setCountriesLoading] = useState(false)

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

  // 加载国家列表（优先加载，确保编辑时能正确匹配国家）
  useEffect(() => {
    const loadCountries = async () => {
      setCountriesLoading(true)
      try {
        const res = await getCountryList()
        const data = res.data?.data || res.data
        const list = data?.list ?? data
        if (Array.isArray(list) && list.length > 0) {
          setCountries(list)
        }
      } catch (error) {
        console.error('获取国家列表失败:', error)
        toast.error('获取国家列表失败')
      } finally {
        setCountriesLoading(false)
      }
    }
    loadCountries()
  }, [])

  // 加载收款人详情（编辑模式，等国家列表加载完成后再加载以便正确匹配）
  useEffect(() => {
    if (isEdit && recipientId && !countriesLoading) {
      const loadDetail = async () => {
        setLoading(true)
        try {
          const res = await getPayeeDetail({ id: recipientId })
          // API 响应结构可能是 { code: 0, data: PayeeItem } 或 { data: { data: PayeeItem } }
          const data = res.data?.data ?? res.data
          if (data) {
            // 解析电话号码：联系电话输入框仅显示纯数字，国家代码在独立的下拉框中
            // 修复 "+1+111..." 重复拼接问题：后端可能存了 araeCode + phone，导致区号重复
            let phone = (data.phone || '').trim()
            let araeCode = data.araeCode || '+86'

            // 已知区号列表（与下拉选项一致），按长度降序匹配避免 "+1" 误匹配 "+86"
            const AREA_CODES = ['+852', '+86', '+65', '+44', '+1']
            if (phone && phone.startsWith('+')) {
              // 若后端有单独 araeCode，用其剥离 phone 中的前缀
              const codeToStrip = araeCode
              if (codeToStrip) {
                // 移除可能重复的区号："+1+111..." -> "111..."，"+111..." -> "111..."
                const escaped = codeToStrip.replace(/[+]/g, '\\+')
                phone = phone.replace(new RegExp(`^${escaped}\\s*\\+?\\s*`), '').trim()
              }
              if (!data.araeCode && phone.startsWith('+')) {
                // 无 araeCode 时，从号码提取（按长度降序匹配）
                for (const code of AREA_CODES) {
                  if (phone.startsWith(code)) {
                    araeCode = code
                    phone = phone.replace(new RegExp(`^${code.replace(/[+]/g, '\\+')}\\s*\\+?\\s*`), '').trim()
                    break
                  }
                }
              }
            }

            setFormData({
              accountType: data.accountType ?? 1,
              companyName: data.companyName ?? '',
              firstName: data.firstName ?? '',
              lastName: data.lastName ?? '',
              remitType: data.remitType ?? 1,
              country: data.country ?? data.countryName ?? data.country_name ?? '',
              countryCode:
                data.countryCode ??
                data.country_code ??
                data.countryAbbr ??
                data.country_abbr ??
                data.country ??
                '',
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
              bankCountry:
                data.bankCountry ??
                data.bankCountryName ??
                data.bank_country ??
                '',
              bankCountryCode:
                data.bankCountryCode ??
                data.bank_country_code ??
                data.bankCountryAbbr ??
                data.bank_country_abbr ??
                data.bankCountry ??
                '',
              bankState: data.bankState ?? '',
              bankCity: data.bankCity ?? '',
              bankAddress: data.bankAddress ?? '',
              purpose: data.purpose ?? '',
              purposeDesc: data.purposeDesc ?? '',
              remark: data.remark ?? ''
            })
          } else {
            console.warn('收款人详情数据为空:', res)
            toast.error(t('remittance.loadRecipientDetailFailed'))
          }
        } catch (error) {
          console.error('加载收款人详情失败:', error)
          toast.error(t('remittance.loadRecipientDetailFailed'))
        } finally {
          setLoading(false)
        }
      }
      loadDetail()
    }
  }, [isEdit, recipientId, countriesLoading])

  const handleBack = () => {
    router.back()
  }

  const validateForm = () => {
    if (!formData.country || !formData.countryCode) {
      toast.error(t('remittance.selectCountry'))
      return false
    }
    if (!formData.state) {
      toast.error(t('remittance.enterState'))
      return false
    }
    if (!formData.city) {
      toast.error(t('remittance.enterCity'))
      return false
    }
    if (!formData.address) {
      toast.error(t('remittance.enterAddress'))
      return false
    }
    // 验证公司英文名称（仅公司账户）
    if (formData.accountType === 1 && !formData.companyName?.trim()) {
      toast.error(t('remittance.enterCompanyName'))
      return false
    }
    if (!formData.accountName) {
      toast.error(t('remittance.enterAccountName'))
      return false
    }
    if (!formData.accountNo) {
      toast.error(t('remittance.enterAccountNo'))
      return false
    }
    if (!formData.bankName) {
      toast.error(t('remittance.enterBankName'))
      return false
    }
    if (!formData.bankCountry || !formData.bankCountryCode) {
      toast.error(t('remittance.selectBankCountry'))
      return false
    }
    if (formData.remitType === 1 && !formData.swiftCode) {
      toast.error(t('remittance.swiftCodeRequired'))
      return false
    }
    // 验证汇款用途
    if (!formData.purpose || formData.purpose.trim() === '') {
      toast.error(t('remittance.selectPurpose'))
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
      // 电话号码：araeCode 与 phone 分开传；phone 仅传本地号码（纯数字），避免后端拼接时出现 "+1+111..." 重复
      if (formData.phone) {
        let phoneToSend = formData.phone
        if (formData.araeCode) {
          // 若输入中误含区号前缀，先剥离
          const escaped = formData.araeCode.replace(/[+]/g, '\\+')
          phoneToSend = formData.phone.replace(new RegExp(`^${escaped}\\s*\\+?\\s*`), '').trim() || formData.phone
          submitData.phone = phoneToSend
          // araeCode 已单独传，phone 仅传本地号码，由后端按需拼接
        } else {
          submitData.phone = phoneToSend
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
        toast.success(t('remittance.updateSuccess'))
      } else {
        await addPayee(submitData)
        toast.success(t('remittance.addSuccess'))
      }
      
      router.push(getLocalizedPath('/remittance/recipients', params?.lang as string))
    } catch (error: any) {
      console.error('提交失败:', error)
      const errorMessage = error?.message || (isEdit ? t('remittance.updateFailed') : t('remittance.addFailed'))
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
                size='small'
                onClick={handleBack}
                sx={{
                  mt: 0.5,
                  color: 'text.secondary',
                  fontSize: '1.2rem',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    color: 'text.primary'
                  }
                }}
              >
                <i className='ri-arrow-left-line' style={{ fontSize: '1.2rem' }} />
              </IconButton>
              <Box sx={{ flex: 1 }}>
                <Typography variant='h4' sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                  {isEdit ? t('remittance.editRecipient') : t('remittance.addRecipient')}
                </Typography>
                <Typography color='text.secondary'>
                  {t('remittance.manageRecipientsDesc')}
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
                  {t('remittance.recipientInfo')}
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
                  {t('remittance.confirmInfo')}
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
                  {t('remittance.remittanceMethod')}
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
                    {t('remittance.swiftRemittance')}
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
                    {t('remittance.localRemittance')}
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
              title={t('remittance.recipientInfo')} 
              titleTypographyProps={{ sx: { fontWeight: 700, fontSize: '1.125rem' } }}
            />
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
            <CardContent sx={{ py: 6 }}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    {t('remittance.countryRegion')} <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Typography>
                  <Autocomplete
                    options={countries}
                    value={findCountry(formData.country) || findCountry(formData.countryCode) || null}
                    onChange={(event, newValue) => {
                      setFormData({ 
                        ...formData, 
                        country: isEnglish ? (newValue?.countryName || '') : (newValue?.countryNameCh || ''),
                        countryCode: newValue?.countryAbbr || ''
                      })
                    }}
                    getOptionLabel={(option) => getCountryDisplayName(option)}
                    loading={countriesLoading}
                    disabled={countriesLoading}
                    size='small'
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={t('remittance.selectCountryPlaceholder')}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {countriesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {getCountryDisplayName(option)}
                      </li>
                    )}
                    noOptionsText={t('remittance.noCountries')}
                    ListboxProps={{
                      style: {
                        maxHeight: '300px'
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    {t('remittance.stateProvince')} <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder={t('remittance.statePlaceholder')}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    {t('remittance.city')} <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder={t('remittance.cityPlaceholder')}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    {t('remittance.detailedAddress')} <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Typography>
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      fullWidth
                      size='small'
                      multiline
                      rows={3}
                      placeholder={t('remittance.addressPlaceholder')}
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
                        {t('remittance.addressCharCount', { count: formData.address.length })}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    {t('remittance.postalCode')}
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder={t('remittance.postalCodePlaceholder')}
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    {t('remittance.phone')}
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
                      placeholder={t('remittance.phonePlaceholder')}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    {t('remittance.email')}
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    type='email'
                    placeholder={t('remittance.emailPlaceholder')}
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
              title={t('remittance.bankInfo')} 
              titleTypographyProps={{ sx: { fontWeight: 700, fontSize: '1.125rem' } }}
            />
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
            <CardContent sx={{ py: 6 }}>
              <Grid container spacing={4}>
                {/* 账户类型 - 改为紧凑的横向布局 */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                    <Typography variant='body2' sx={{ fontWeight: 600, minWidth: 100, color: 'text.primary' }}>
                      {t('remittance.accountType')}
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
                        {t('remittance.companyAccount')}
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
                        {t('remittance.personalAccount')}
                      </ToggleButton>
                    </Box>
                  </Box>
                </Grid>

                {/* 公司英文名称（仅公司账户显示） */}
                {formData.accountType === 1 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                      {t('remittance.companyEnglishName')} <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                    </Typography>
                    <TextField
                      fullWidth
                      size='small'
                      placeholder={t('remittance.companyNamePlaceholder')}
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
                        {t('remittance.firstName')}
                      </Typography>
                      <TextField
                        fullWidth
                        size='small'
                        placeholder={t('remittance.firstNamePlaceholder')}
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                        {t('remittance.lastName')}
                      </Typography>
                      <TextField
                        fullWidth
                        size='small'
                        placeholder={t('remittance.lastNamePlaceholder')}
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
                    {t('remittance.accountName')} <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder={formData.accountType === 1 ? t('remittance.accountNamePlaceholderCompany') : t('remittance.accountNamePlaceholderPersonal')}
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                  <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                    {t('remittance.accountNameHint')}
                  </Typography>
                </Grid>

                {/* 银行账号/IBAN */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    {t('remittance.bankAccountIban')} <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder={t('remittance.accountNoPlaceholder')}
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
                        {t('remittance.swiftBic')} <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                      </Typography>
                      <Tooltip title={t('remittance.swiftCodeHint')}>
                        <IconButton size='small' sx={{ p: 0.5, color: 'text.secondary' }}>
                          <i className='ri-question-line text-sm' />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <TextField
                      fullWidth
                      size='small'
                      placeholder={t('remittance.swiftCodePlaceholder')}
                      value={formData.swiftCode}
                      onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: formData.remitType === 1 ? 6 : 12 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    {t('remittance.bankName')} <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder={t('remittance.bankNamePlaceholder')}
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>

                {/* 银行国家 */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    {t('remittance.bankCountry')} <Typography component='span' sx={{ color: 'error.main' }}>*</Typography>
                  </Typography>
                  <Autocomplete
                    options={countries}
                    value={findCountry(formData.bankCountry) || findCountry(formData.bankCountryCode) || null}
                    onChange={(event, newValue) => {
                      setFormData({ 
                        ...formData, 
                        bankCountry: isEnglish ? (newValue?.countryName || '') : (newValue?.countryNameCh || ''),
                        bankCountryCode: newValue?.countryAbbr || ''
                      })
                    }}
                    getOptionLabel={(option) => getCountryDisplayName(option)}
                    loading={countriesLoading}
                    disabled={countriesLoading}
                    size='small'
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={t('remittance.selectBankCountryPlaceholder')}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {countriesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {getCountryDisplayName(option)}
                      </li>
                    )}
                    noOptionsText={t('remittance.noCountries')}
                    ListboxProps={{
                      style: {
                        maxHeight: '300px'
                      }
                    }}
                  />
                </Grid>

                {/* 银行州/省 */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    {t('remittance.bankState')}
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder={t('remittance.bankStatePlaceholder')}
                    value={formData.bankState}
                    onChange={(e) => setFormData({ ...formData, bankState: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>

                {/* 银行城市 */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    {t('remittance.bankCity')}
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder={t('remittance.bankCityPlaceholder')}
                    value={formData.bankCity}
                    onChange={(e) => setFormData({ ...formData, bankCity: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>

                {/* 银行地址 */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    {t('remittance.bankAddress')}
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder={t('remittance.bankAddressPlaceholder')}
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
              title={t('remittance.remittancePurpose')} 
              titleTypographyProps={{ sx: { fontWeight: 700, fontSize: '1.125rem' } }}
            />
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
            <CardContent sx={{ py: 6 }}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    <Typography component='span' sx={{ color: 'error.main' }}>*</Typography> {t('remittance.remittancePurpose')}
                  </Typography>
                  <FormControl fullWidth size='small'>
                    <Select
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      displayEmpty
                      sx={{ borderRadius: '12px' }}
                    >
                      <MenuItem value=''>{t('remittance.selectPurposePlaceholder')}</MenuItem>
                      <MenuItem value='trade'>{t('remittance.trade')}</MenuItem>
                      <MenuItem value='service'>{t('remittance.service')}</MenuItem>
                      <MenuItem value='salary'>{t('remittance.salary')}</MenuItem>
                      <MenuItem value='other'>{t('remittance.other')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
                    {t('remittance.purposeDesc')}
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder={t('remittance.purposeDescPlaceholder')}
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
              title={t('remittance.remark')} 
              titleTypographyProps={{ sx: { fontWeight: 700, fontSize: '1.125rem' } }}
            />
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
            <CardContent sx={{ py: 6 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder={t('remittance.remarkPlaceholder')}
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
            severity='warning'
            sx={{ 
              borderRadius: '12px',
              bgcolor: 'warning.lightOpacity',
              border: '1px solid',
              borderColor: 'warning.main'
            }}
          >
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
              {t('remittance.importantNotice')}
            </Typography>
            <Typography variant='body2' component='div' sx={{ '& > *': { mb: 0.5 } }}>
              <Box>• {t('remittance.importantNotice1')}</Box>
              <Box>• {t('remittance.importantNotice2')}</Box>
              <Box>• {t('remittance.importantNotice3')}</Box>
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
              {t('remittance.back')}
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
              {submitting ? (isEdit ? t('remittance.updating') : t('remittance.adding')) : (isEdit ? t('remittance.save') : t('remittance.nextStep'))}
            </Button>
          </Box>
        </Grid>
      </Grid>
      )}
    </Box>
  )
}

export default EditRecipient