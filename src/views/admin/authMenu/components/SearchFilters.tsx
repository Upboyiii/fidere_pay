'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'

// Third-party Imports
import { Plus } from 'lucide-react'
import TabFilters, { type SearchData } from '@/components/table/tableFilters'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
interface SearchFiltersProps {
  /** 搜索参数 */
  params: {
    title?: string
    component?: string
  }
  /** 搜索变化回调 */
  onSearchChange?: (data: any) => void
  /** 新增菜单回调 */
  onAddMenu?: () => void
}

/**
 * 搜索筛选栏组件
 * @param params - 搜索参数
 * @param onSearchChange - 搜索变化回调
 * @param onAddMenu - 新增菜单回调
 */
const SearchFilters = ({ params, onSearchChange, onAddMenu }: SearchFiltersProps) => {
  const t = useTranslate()
  /**
   * 搜索数据配置
   */
  const searchData: SearchData[] = useMemo(
    () => [
      {
        type: 'input',
        name: 'title',
        placeholder: t('admin.searchMenuNamePlaceholder')
      }
      // {
      //   type: 'input',
      //   name: 'component',
      //   placeholder: '请输入组件路径'
      // }
    ],
    [t]
  )

  return (
    <>
      <TabFilters params={params} onSearchChange={onSearchChange} searchData={searchData} />
      <CardContent className='flex items-center gap-4 flex-wrap'>
        <Button variant='contained' color='primary' startIcon={<Plus size={16} />} onClick={onAddMenu}>
          {t('admin.addMenuButton')}
        </Button>
      </CardContent>
    </>
  )
}

export default SearchFilters
