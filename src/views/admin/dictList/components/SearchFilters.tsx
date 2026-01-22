'use client'

// React Imports
import { useMemo, memo } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// Third-party Imports
import { Plus } from 'lucide-react'
import TabFilters, { type SearchData } from '@/components/table/tableFilters'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
interface SearchFiltersProps {
  /** 搜索参数 */
  params: {
    dictType?: string
    dictLabel?: string
    status?: string
    typeId?: string | number
  }
  /** 搜索变化回调 */
  onSearchChange?: (data: any) => void
  /** 重置回调 */
  onReset?: () => void
  /** 新增字典回调 */
  onAddDict?: () => void
}

/**
 * 搜索筛选栏组件
 * @param params - 搜索参数
 * @param onSearchChange - 搜索变化回调
 * @param onReset - 重置回调
 * @param onAddDict - 新增字典回调
 * @param onDeleteDict - 删除字典回调
 * @param hasSelected - 是否有选中的行
 */
const SearchFilters = memo(({ params, onSearchChange, onReset, onAddDict }: SearchFiltersProps) => {
  const t = useTranslate()
  /**
   * 搜索数据配置
   */
  const searchData: SearchData[] = useMemo(
    () => [
      {
        type: 'input',
        name: 'dictType',
        placeholder: t('admin.dictTypePlaceholder')
      },
      {
        type: 'input',
        name: 'dictLabel',
        placeholder: t('admin.dictLabelPlaceholder')
      },
      {
        type: 'select',
        name: 'status',
        label: t('admin.status'),
        placeholder: t('admin.dictStatusPlaceholder'),
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
      <CardContent>
        <Box className='flex items-center gap-2 flex-wrap'>
          <Button variant='contained' color='primary' startIcon={<Plus size={16} />} onClick={onAddDict}>
            {t('admin.addDictButton')}
          </Button>
        </Box>
      </CardContent>
    </>
  )
})

SearchFilters.displayName = 'SearchFilters'

export default SearchFilters
