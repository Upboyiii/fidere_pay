'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// Third-party Imports
import { Search, Plus, Trash2 } from 'lucide-react'
import TabFilters, { type SearchData } from '@/components/table/tableFilters'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
interface SearchFiltersProps {
  /** 搜索参数 */
  params: {
    postName?: string
    postCode?: string
    status?: string
  }
  /** 搜索变化回调 */
  onSearchChange?: (data: any) => void
  /** 新增岗位回调 */
  onAddPost?: () => void
  /** 删除岗位回调 */
  onDeletePost?: () => void
  /** 是否有选中的行 */
  hasSelected?: boolean
}

/**
 * 搜索筛选栏组件
 * @param params - 搜索参数
 * @param onSearchChange - 搜索变化回调
 * @param onAddPost - 新增岗位回调
 * @param onDeletePost - 删除岗位回调
 * @param hasSelected - 是否有选中的行
 */
const SearchFilters = ({ params, onSearchChange, onAddPost, onDeletePost, hasSelected }: SearchFiltersProps) => {
  const t = useTranslate()
  /**
   * 搜索数据配置
   */
  const searchData: SearchData[] = useMemo(
    () => [
      {
        type: 'input',
        name: 'postName',
        placeholder: t('admin.postNamePlaceholder')
      },
      {
        type: 'input',
        name: 'postCode',
        placeholder: t('admin.postCodePlaceholder')
      },
      {
        type: 'select',
        name: 'status',
        label: t('admin.status'),
        placeholder: t('admin.selectStatus'),
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
        <Button variant='contained' color='primary' startIcon={<Plus size={16} />} onClick={onAddPost}>
          {t('admin.addPostButton')}
        </Button>
      </CardContent>
    </>
  )
}

export default SearchFilters
