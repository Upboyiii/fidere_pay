'use client'
import { SelectChangeEvent } from '@mui/material/Select'
// MUI Imports
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid2'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { Controller, useForm } from 'react-hook-form'
import { ChangeEvent, useCallback, useMemo } from 'react'
import type { SxProps } from '@mui/system'
import InputAdornment from '@mui/material/InputAdornment'
import { Search } from 'lucide-react'

/** 搜索数据类型 */
export type SearchData = {
  /** 类型 */
  type: 'input' | 'select'
  /** 名称 */
  name: string
  /** 标签 */
  label?: string
  /** 选项 */
  options?: {
    /** 标签 */
    label: string
    value: string
  }[]
  /** 占位符 */
  placeholder?: string
  /** 变化回调 */
  onChange?: (value: string, ...args: any) => void
}

interface TabFiltersProps {
  /** 搜索变化回调 */
  onSearchChange?: (data: any) => void
  /** 搜索参数 */
  params: any
  /** 搜索数据 */
  searchData: SearchData[]
  CardContentSx?: SxProps
}

export default function TabFilters(props: TabFiltersProps) {
  const { params, onSearchChange, searchData, CardContentSx = {} } = props
  // 确保所有字段都有默认值，避免从 uncontrolled 变为 controlled 的警告
  const defaultValues = useMemo(() => {
    const values: any = { ...params }
    searchData.forEach(item => {
      if (values[item.name] === undefined || values[item.name] === null) {
        values[item.name] = ''
      }
    })
    return values
  }, [params, searchData])
  const { control, getValues } = useForm<any>({ defaultValues })
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSearchChange?.(getValues?.())
    }
  }
  if (!searchData?.length) return null
  const renderItem = useCallback((item: SearchData) => {
    const objs = {
      input: () => {
        return (
          <FormControl fullWidth>
            <Controller
              name={item.name}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    field.onChange(e.target.value)
                    item.onChange?.(e.target.value, getValues?.())
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Search size={16} />
                        </InputAdornment>
                      )
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={item.placeholder}
                  className='max-sm:is-full'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '56px'
                    }
                  }}
                />
              )}
            />
          </FormControl>
        )
      },
      select: () => {
        return (
          <FormControl fullWidth>
            {item?.label && <InputLabel id={`${item?.name}-select`}>{item?.label}</InputLabel>}
            <Controller
              name={item.name}
              control={control}
              render={({ field }) => (
                <Select
                  fullWidth
                  id={`${item?.name}-select`}
                  {...field}
                  onChange={(e: SelectChangeEvent) => {
                    field.onChange(e.target.value)
                    typeof item.onChange === 'function'
                      ? item.onChange?.(e.target.value, getValues?.())
                      : onSearchChange?.(getValues?.())
                  }}
                  label={item?.label}
                  labelId={`${item?.name}-select`}
                  renderValue={value => {
                    if (!value || value === '') {
                      return <span style={{ color: '#9e9e9e' }}>{item?.placeholder || ''}</span>
                    }
                    const selectedOption = item?.options?.find(opt => opt.value === value)
                    return selectedOption?.label || value
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '56px'
                    }
                  }}
                >
                  {item?.options?.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        )
      }
    }
    return objs?.[item?.type]?.()
  }, [])

  return (
    <CardContent sx={{ p: 4, ...CardContentSx }}>
      <Grid container spacing={5}>
        {searchData?.map((item, index) => (
          <Grid size={{ xs: 12, sm: 4 }} key={item?.name || index}>
            {renderItem(item)}
          </Grid>
        ))}
      </Grid>
    </CardContent>
  )
}
