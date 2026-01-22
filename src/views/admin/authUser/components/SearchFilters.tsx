'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'

// Third-party Imports
import { Search, RotateCcw, Plus, Trash2 } from 'lucide-react'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import TabFilters, { type SearchData } from '@/components/table/tableFilters'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
interface SearchFiltersProps {
  /** 搜索参数 */
  params: {
    keyword?: string
    mobile?: string
    status?: string
    startDate?: Date | null
    endDate?: Date | null
  }
  /** 搜索变化回调 */
  onSearchChange?: (data: any) => void
  /** 重置回调 */
  onReset?: () => void
  /** 新增用户回调 */
  onAddUser?: () => void
  /** 删除用户回调 */
  onDeleteUser?: () => void
}

/**
 * 搜索筛选栏组件
 * @param params - 搜索参数
 * @param onSearchChange - 搜索变化回调
 * @param onReset - 重置回调
 * @param onAddUser - 新增用户回调
 * @param onDeleteUser - 删除用户回调
 */
const SearchFilters = ({ params, onSearchChange, onAddUser }: SearchFiltersProps) => {
  const t = useTranslate()
  /**
   * 搜索数据配置
   */
  const searchData: SearchData[] = useMemo(
    () => [
      {
        type: 'input',
        name: 'keyWords',
        placeholder: t('admin.userNameOrNicknamePlaceholder')
      },
      {
        type: 'input',
        name: 'mobile',
        placeholder: t('admin.mobilePlaceholder')
      },
      {
        type: 'select',
        name: 'status',
        label: t('admin.status'),
        placeholder: t('admin.userStatusPlaceholder'),
        options: [
          { label: t('admin.all'), value: '' },
          { label: t('admin.enabled'), value: '1' },
          { label: t('admin.disabled'), value: '0' }
        ]
      }
    ],
    [t]
  )

  return (
    <>
      <TabFilters params={params} onSearchChange={onSearchChange} searchData={searchData} />
      <CardContent className='flex items-center gap-4 flex-wrap'>
        {/* <Grid container spacing={2} className='flex-1'>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AppReactDatepicker
              selected={params.startDate || null}
              onChange={(date: Date | null) => {
                onSearchChange?.({ ...params, startDate: date })
              }}
              dateFormat='yyyy-MM-dd'
              placeholderText='请选择开始日期'
              customInput={<TextField fullWidth label='开始日期' placeholder='请选择开始日期' />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AppReactDatepicker
              selected={params.endDate || null}
              onChange={(date: Date | null) => {
                onSearchChange?.({ ...params, endDate: date })
              }}
              dateFormat='yyyy-MM-dd'
              placeholderText='请选择结束日期'
              minDate={params.startDate || undefined}
              customInput={<TextField fullWidth label='结束日期' placeholder='请选择结束日期' />}
            />
          </Grid>
        </Grid> */}
        {/* <Box className='flex items-center gap-2 flex-wrap'>
          <Button
            variant='contained'
            color='primary'
            startIcon={<Search size={16} />}
            onClick={() => onSearchChange?.(params)}
          >
            查询
          </Button>
          <Button variant='outlined' color='secondary' startIcon={<RotateCcw size={16} />} onClick={onReset}>
            重置
          </Button>
          <Button variant='contained' color='success' startIcon={<Plus size={16} />} onClick={onAddUser}>
            新增用户
          </Button>
        </Box> */}
        <Button variant='contained' startIcon={<Plus size={16} />} onClick={onAddUser}>
          {t('admin.addUserButton')}
        </Button>
      </CardContent>
    </>
  )
}

export default SearchFilters
