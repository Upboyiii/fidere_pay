'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { Controller, Control } from 'react-hook-form'
import { Search, X } from 'lucide-react'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// API Imports
import { getDictTypeSelect } from '@server/admin'

// Type Imports
interface DictTypeSelectProps {
  /** react-hook-form control */
  control: Control<any>
  /** 字段名称 */
  name?: string
  /** 是否必填 */
  required?: boolean
  /** 错误信息 */
  error?: string
}

/**
 * 字典类型选择组件
 * @param control - react-hook-form control
 * @param name - 字段名称
 * @param required - 是否必填
 * @param error - 错误信息
 */
const DictTypeSelect = ({ control, name = 'dictType', required, error }: DictTypeSelectProps) => {
  const t = useTranslate()
  const [options, setOptions] = useState<Array<{ label: string; value: string }>>([])
  const [selectOpen, setSelectOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  /**
   * 加载字典类型选项
   */
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const res = await getDictTypeSelect({})
        const list = res.data?.list || res.data || []
        setOptions(
          list.map((item: any) => ({
            label: item.dictName || item.dictType || '',
            value: item.dictType || ''
          }))
        )
      } catch (error) {
        console.error('加载字典类型失败:', error)
      }
    }
    loadOptions()
  }, [])

  /**
   * 过滤选项
   */
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <Controller
      name={name}
      control={control}
      rules={required ? { required: t('admin.selectDictType') } : {}}
      render={({ field, fieldState }) => {
        const value = field.value ?? ''
        const selectedOption = options.find(opt => opt.value === value)

        return (
          <FormControl fullWidth required={required} error={!!(error || fieldState.error)}>
            <InputLabel>{t('admin.dictType')}</InputLabel>
            <Select
              open={selectOpen}
              onOpen={() => setSelectOpen(true)}
              onClose={() => {
                setSelectOpen(false)
                setSearchValue('')
              }}
              label={t('admin.dictType')}
              value={value}
              onChange={e => {
                field.onChange(e.target.value)
              }}
              onBlur={field.onBlur}
              name={field.name}
              renderValue={selected => {
                const displayValue = selectedOption?.label || (selected as string) || ''
                return (
                  <Box className='flex items-center justify-between w-full'>
                    <Typography className='flex-1'>{displayValue || t('admin.selectDictType')}</Typography>
                    {displayValue && (
                      <IconButton
                        size='small'
                        onClick={e => {
                          e.stopPropagation()
                          field.onChange('')
                        }}
                        onMouseDown={e => e.stopPropagation()}
                        sx={{ padding: 0.5, marginLeft: 1 }}
                      >
                        <X size={14} />
                      </IconButton>
                    )}
                  </Box>
                )
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 400,
                    width: 300
                  }
                }
              }}
            >
              <Box className='p-2' sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TextField
                  fullWidth
                  size='small'
                  placeholder={t('admin.searchDictType')}
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Search size={16} />
                        </InputAdornment>
                      )
                    }
                  }}
                  onClick={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
                />
              </Box>
              {filteredOptions.length === 0 ? (
                <MenuItem disabled>{t('admin.noData')}</MenuItem>
              ) : (
                filteredOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))
              )}
            </Select>
            {(fieldState.error || error) && (
              <Box sx={{ mt: 0.5, fontSize: '0.75rem', color: 'error.main' }}>
                {fieldState.error?.message || error}
              </Box>
            )}
          </FormControl>
        )
      }}
    />
  )
}

export default DictTypeSelect

