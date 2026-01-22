// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'

// Icon Imports
// 可选图标：Edit2 (现代编辑图标), SquarePen (方形笔), FileEdit (文件编辑), PenTool (画笔工具)
import { SquarePen, Check, X, Loader2 } from 'lucide-react'
import { getCountryList } from '@server/pages-api'
import React, { useEffect, useState, useMemo } from 'react'

import { getLabelByValue, getLabelByValues, getCountryName, getCareerName } from './tools'
import { getBasicInfoCategories, FieldConfig } from './basicInfoConfig'
import { useTranslate } from '@/contexts/DictionaryContext'

interface PersonalInfo {
  // 账号信息
  email?: string
  status?: number
  kyc_status?: number
  two_factor_enabled?: boolean
  first_name?: string
  middle_name?: string
  last_name?: string
  phone?: string
  accountType?: number
  aliasName?: string
  hasWallet?: boolean
  inviter?: { email?: string }

  // KYC信息（个人信息）
  dateOfBirth?: string
  placeOfBirth?: string
  gender?: string
  maritalStatus?: string
  citizenship?: string
  dualCitizenshipStatus?: string
  secondCitizenship?: string

  // KYC信息（财务与账户信息）
  purposeForOpenAccount?: string | number | number[]
  sourceOfWealth?: string | number | number[]
  sourceOfFunds?: string | number | number[]
  anticipatedAssetClasses?: string | number | number[]

  // KYC信息（就业信息）
  careerStatus?: string | number
  employerName?: string
  industryType?: string | number
  careerPosition?: string | number
  currentOccupation?: string
  currentAnnualIncome?: string | number

  // KYC信息（地址信息）
  stateRegion?: string
  streetAddress?: string
  detailedAddress?: string
  postalCode?: string
  country?: string
  city?: string

  // KYC信息（第三方存缴）
  thirdPartiesInOut?: string | number
  additionalDetails?: string

  // KYC信息（税务信息）
  taxRegionInHongkong?: string | number
  taxRegion?: string
  taxNumber?: string
  taxRegionNotInHongkong?: string | number
  otherTaxRegion?: string
  otherTaxNumberStyle?: string | number
  otherTaxNumber?: string
  noTinReason?: string | number
  noTinReasonDetail?: string

  // 验证与系统信息
  sumsub_verify_status?: string | number
  inspection_id?: string
  correlation_id?: string
  review_answer?: string
  client_authorization_status?: string | number
  signature?: string
  nameLabel?: string
}

interface BasicInfoTabProps {
  /** 个人信息数据 */
  personalInfo: PersonalInfo
  /** 职业列表 */
  careerList: any
  /** 是否可编辑，默认为false */
  editable?: boolean
  /** 保存回调 */
  onSave?: (data: any) => Promise<string>
}

const BasicInfoTab = ({ personalInfo, careerList, editable = false, onSave }: BasicInfoTabProps) => {
  const t = useTranslate()
  const [countryList, setCountryList] = useState<any[]>([])
  /** 正在编辑的字段标识，格式：${categoryTitle}-${field.value} */
  const [editingField, setEditingField] = useState<string | null>(null)
  /** 编辑中的临时值 */
  const [editingValue, setEditingValue] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    requestCountryList()
  }, [])

  /**
   * 请求国家列表
   */
  const requestCountryList = async () => {
    try {
      const res = await getCountryList()
      setCountryList(res.data?.list ?? [])
    } catch (error) {
      console.error('获取国家列表失败', error)
    }
  }

  /**
   * 获取字段显示值
   * @param field 字段配置
   * @param value 字段值
   */
  const getFieldDisplayValue = (field: FieldConfig, value: any): string => {
    // 使用自定义渲染函数
    if (field.renderValue) {
      return (
        field.renderValue(value, personalInfo, {
          getCountryName,
          getCareerName,
          getLabelByValue,
          getLabelByValues,
          countryList,
          careerList
        }) || '-'
      )
    }

    // 处理空值
    if (value === undefined || value === null || value === '' || value === 0) {
      return '-'
    }

    // 处理布尔值
    if (typeof value === 'boolean') {
      return value ? t('userManagement.yes') : t('userManagement.no') // 是 否
    }

    // 处理select类型
    if (field.type === 'select' && field.data) {
      if (field.data === 'Country') {
        return getCountryName(String(value), countryList) || '-'
      }
      if (field.data === 'careerStatus') {
        return getCareerName(String(value), careerList?.careerStatus) || '-'
      }
      if (field.data === 'businessNature') {
        return getCareerName(String(value), careerList?.businessNature) || '-'
      }
      if (field.data === 'position') {
        return getCareerName(String(value), careerList?.position) || '-'
      }
      if (Array.isArray(field.data)) {
        if (field.multiple) {
          return getLabelByValues(value, field.data) || '-'
        }
        return getLabelByValue(value, field.data) || '-'
      }
    }

    return String(value)
  }

  /**
   * 获取字段选项数据
   * @param field 字段配置
   */
  const getFieldOptions = (field: FieldConfig) => {
    if (field.data === 'Country') {
      return countryList.map(country => ({
        value: String(country.id),
        label: country.country_name
      }))
    }
    if (field.data === 'careerStatus') {
      return Object.keys(careerList?.careerStatus || {}).map(key => ({
        value: String(key),
        label: careerList.careerStatus[key]
      }))
    }
    if (field.data === 'businessNature') {
      return Object.keys(careerList?.businessNature || {}).map(key => ({
        value: String(key),
        label: careerList.businessNature[key]
      }))
    }
    if (field.data === 'position') {
      return Object.keys(careerList?.position || {}).map(key => ({
        value: String(key),
        label: careerList.position[key]
      }))
    }
    if (Array.isArray(field.data)) {
      return field.data.map(opt => ({
        ...opt,
        value: String(opt.value)
      }))
    }
    return []
  }

  /**
   * 处理开始编辑字段
   * @param categoryTitle 分类标题
   * @param field 字段配置
   */
  const handleStartEdit = (categoryTitle: string, field: FieldConfig) => {
    const fieldId = `${categoryTitle}-${field.value}`
    const currentValue = personalInfo[field.value as keyof PersonalInfo]
    setEditingField(fieldId)
    setEditingValue(currentValue !== undefined ? currentValue : '')
  }

  /**
   * 处理取消编辑
   */
  const handleCancelEdit = () => {
    setEditingField(null)
    setEditingValue(null)
  }

  /**
   * 处理保存编辑
   * @param field 字段配置
   */
  const handleSaveEdit = async (field: FieldConfig) => {
    if (onSave) {
      try {
        setLoading(true)
        const res = await onSave({ key: field?.key, value: editingValue })
        // 成功时关闭编辑状态
        if (res === 'success') {
          setEditingField(null)
          setEditingValue(null)
        }
        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    } else {
      setEditingField(null)
      setEditingValue(null)
    }
  }

  /**
   * 渲染字段
   * @param categoryTitle 分类标题
   * @param field 字段配置
   */
  const renderField = (categoryTitle: string, field: FieldConfig) => {
    // 检查条件显示
    if (field.condition && !field.condition(personalInfo)) {
      return null
    }

    // display 类型字段不可编辑，但需要显示
    const fieldId = `${categoryTitle}-${field.value}`
    const isEditing = editingField === fieldId
    const value = personalInfo[field.value as keyof PersonalInfo]
    const displayValue = getFieldDisplayValue(field, value)
    const size = field.size || { xs: 12, sm: 6, md: 3 }
    const isMonoFont =
      field.key === 'inspection_id' ||
      field.key === 'correlation_id' ||
      field.key === 'tax_number' ||
      field.key === 'other_tax_number'

    return (
      <Grid key={field.value} size={size}>
        <div
          className='p-4 rounded-lg border'
          style={{
            backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
            borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
          }}
        >
          <div className='flex items-start gap-2'>
            <div className='flex-1'>
              {/* 标题行：包含标题和编辑图标 */}
              <div className='flex items-center justify-between gap-2 mbe-2'>
                <Typography
                  variant='subtitle2'
                  color='text.secondary'
                  className={`flex items-center gap-1 ${editable && field.type == 'display' && 'leading-[28px]'}`}
                >
                  {field.label}
                </Typography>
                {editable && field.type !== 'display' && (
                  <div className='flex items-center gap-1'>
                    {isEditing ? (
                      <>
                        <IconButton
                          size='small'
                          onClick={() => handleSaveEdit(field)}
                          className='text-success hover:bg-success/10'
                          disabled={loading}
                        >
                          {loading ? <Loader2 size={14} className='animate-spin' /> : <Check size={14} />}
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={handleCancelEdit}
                          disabled={loading}
                          className='text-error hover:bg-error/10'
                        >
                          <X size={14} />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton
                        size='small'
                        onClick={() => handleStartEdit(categoryTitle, field)}
                        className='text-primary hover:bg-primary/10'
                        disabled={loading}
                      >
                        <SquarePen size={14} />
                      </IconButton>
                    )}
                  </div>
                )}
              </div>
              {/* 值区域：显示值或编辑组件 */}
              {isEditing ? (
                // 编辑模式：显示输入组件
                <div>
                  {field.type === 'input' || field.type === 'textarea' ? (
                    <TextField
                      fullWidth
                      size='small'
                      value={editingValue || ''}
                      onChange={e => setEditingValue(e.target.value)}
                      multiline={field.type === 'textarea'}
                      rows={field.type === 'textarea' ? 3 : 1}
                      autoFocus
                    />
                  ) : field.type === 'date' ? (
                    <TextField
                      fullWidth
                      size='small'
                      type='date'
                      value={editingValue || ''}
                      onChange={e => setEditingValue(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      autoFocus
                    />
                  ) : field.type === 'select' ? (
                    <Autocomplete
                      fullWidth
                      size='small'
                      multiple={field.multiple}
                      options={getFieldOptions(field)}
                      getOptionLabel={option => option.label || ''}
                      isOptionEqualToValue={(option, value) => String(option.value) === String(value.value)}
                      value={
                        field.multiple
                          ? (() => {
                              const options = getFieldOptions(field)
                              const values = Array.isArray(editingValue)
                                ? editingValue.map(v => String(v))
                                : editingValue
                                  ? String(editingValue)
                                      .split(',')
                                      .map(v => v.trim())
                                  : []
                              return options.filter(opt => values.includes(String(opt.value)))
                            })()
                          : (() => {
                              const options = getFieldOptions(field)
                              const value = editingValue || ''
                              return options.find(opt => String(opt.value) === String(value)) || null
                            })()
                      }
                      onChange={(event, newValue) => {
                        if (field.multiple) {
                          const values = Array.isArray(newValue) ? newValue.map(opt => opt.value) : []
                          setEditingValue(values)
                        } else {
                          const singleValue = newValue as { value: string; label: any } | null
                          setEditingValue(singleValue ? singleValue.value : '')
                        }
                      }}
                      renderInput={params => <TextField {...params} autoFocus />}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const { key, ...tagProps } = getTagProps({ index })
                          return <Chip key={key} label={option.label} size='small' {...tagProps} />
                        })
                      }
                      renderOption={(props, option) => {
                        const { key, ...otherProps } = props
                        return (
                          <li key={key} {...otherProps}>
                            {option.label}
                          </li>
                        )
                      }}
                      filterOptions={(options, { inputValue }) =>
                        options.filter(option => option.label.toLowerCase().includes(inputValue.toLowerCase()))
                      }
                      noOptionsText={t('userManagement.noMatchingOptions')} // 无匹配选项
                      sx={{
                        '& .MuiAutocomplete-clearIndicator': {
                          padding: '2px !important',
                          '& svg': {
                            fontSize: '14px !important',
                            width: '16px',
                            height: '16px'
                          }
                        }
                      }}
                    />
                  ) : (
                    <Typography variant='body2' className={isMonoFont ? 'font-mono' : ''}>
                      {displayValue}
                    </Typography>
                  )}
                </div>
              ) : (
                // 显示模式：显示值
                <Typography variant='body2' className={isMonoFont ? 'font-mono' : ''}>
                  {displayValue}
                </Typography>
              )}
            </div>
          </div>
        </div>
      </Grid>
    )
  }

  const basicInfoCategories = useMemo(() => getBasicInfoCategories(t), [t])

  return (
    <Grid container spacing={4}>
      {basicInfoCategories.map(category => {
        const IconComponent = category.icon
        return (
          <Grid key={category.title} size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <div className='flex items-center gap-2 mbe-6'>
                  <IconComponent size={20} className='text-primary' />
                  <Typography variant='h6' className='font-semibold'>
                    {category.title}
                  </Typography>
                </div>
                <Grid container spacing={3}>
                  {category.fields.map(field => renderField(category.title, field))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  )
}

export default BasicInfoTab
