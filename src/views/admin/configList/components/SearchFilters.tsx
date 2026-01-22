'use client'

// React Imports
import { useMemo } from 'react'

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
    configName?: string
    configKey?: string
    configType?: string
    startDate?: Date | null
    endDate?: Date | null
  }
  /** 搜索变化回调 */
  onSearchChange?: (data: any) => void
  /** 重置回调 */
  onReset?: () => void
  /** 新增参数回调 */
  onAddConfig?: () => void
}

/**
 * 搜索筛选栏组件
 * @param params - 搜索参数
 * @param onSearchChange - 搜索变化回调
 * @param onReset - 重置回调
 * @param onAddConfig - 新增参数回调
 */
const SearchFilters = ({ params, onSearchChange, onReset, onAddConfig }: SearchFiltersProps) => {
  const t = useTranslate()
  /**
   * 搜索数据配置
   */
  const searchData: SearchData[] = useMemo(
    () => [
      {
        type: 'input',
        name: 'configName',
        placeholder: t('admin.configNamePlaceholder')
      },
      {
        type: 'input',
        name: 'configKey',
        placeholder: t('admin.configKeyPlaceholder')
      },
      {
        type: 'select',
        name: 'configType',
        label: t('admin.systemBuiltIn'),
        placeholder: t('admin.systemBuiltInPlaceholder'),
        options: [
          { label: t('admin.all'), value: '' },
          { label: t('admin.yes'), value: '1' },
          { label: t('admin.no'), value: '0' }
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
          <Button variant='contained' color='primary' startIcon={<Plus size={16} />} onClick={onAddConfig}>
            {t('admin.addConfigButton')}
          </Button>
        </Box>
      </CardContent>
    </>
  )
}

export default SearchFilters
