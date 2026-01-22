'use client'

// Component Imports
import TabFilters, { SearchData } from '@components/table/tableFilters'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

interface TableFiltersProps {
  /** 搜索变化回调 */
  onSearchChange?: (data: any) => void
  /** 搜索参数 */
  params: any
}

/**
 * 信托表格搜索过滤器组件
 * @param onSearchChange - 搜索变化回调
 * @param params - 搜索参数
 */
const TableFilters = ({ onSearchChange, params }: TableFiltersProps) => {
  const t = useTranslate()
  const searchData: SearchData[] = [
    {
      name: 'keyword',
      type: 'input',
      label: t('kycDashboard.trustSearchPlaceholder'),
      placeholder: t('kycDashboard.trustSearchPlaceholder')
    }
  ] as const

  return <TabFilters params={params} onSearchChange={onSearchChange} searchData={searchData as unknown as any[]} />
}

export default TableFilters
