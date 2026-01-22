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
    roleName?: string
    status?: string
  }
  /** 搜索变化回调 */
  onSearchChange?: (data: any) => void
  /** 新增角色回调 */
  onAddRole?: () => void
}

/**
 * 搜索筛选栏组件
 * @param params - 搜索参数
 * @param onSearchChange - 搜索变化回调
 * @param onAddRole - 新增角色回调
 */
const SearchFilters = ({ params, onSearchChange, onAddRole }: SearchFiltersProps) => {
  const t = useTranslate()
  /**
   * 搜索数据配置
   */
  const searchData: SearchData[] = useMemo(
    () => [
      {
        type: 'input',
        name: 'roleName',
        placeholder: t('admin.roleNamePlaceholder')
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
        <Button variant='contained' color='primary' startIcon={<Plus size={16} />} onClick={onAddRole}>
          {t('admin.addRoleButton')}
        </Button>
      </CardContent>
    </>
  )
}

export default SearchFilters
