'use client'
// MUI Imports
import TableFilter, { SearchData } from '@/components/table/tableFilters'
import { useTranslate } from '@/contexts/DictionaryContext'
type TableFiltersProps = {
  params: any
  onSearchChange: (data: any) => void
}

const TableFilters = ({ params, onSearchChange }: TableFiltersProps) => {
  const t = useTranslate()
  const searchData: SearchData[] = [
    {
      name: 'keyword',
      type: 'input',
      label: t('kycDashboard.searchPlaceholder'), // 搜索客户名称、审核类型...
      placeholder: t('kycDashboard.searchPlaceholder') // 搜索客户名称、审核类型...
    },
    {
      name: 'status',
      type: 'select',
      label: t('kycDashboard.reviewStatus'), // 审核状态
      placeholder: t('kycDashboard.selectReviewStatus'), // 选择地址审核状态
      options: [
        { label: t('kycDashboard.allStatus'), value: '' }, // 全部状态
        { label: t('kycDashboard.pending'), value: 'pending' }, // 待审核
        { label: t('kycDashboard.reviewing'), value: 'in_review' } // 审核中
      ]
    }
  ]

  return (
    <>
      <TableFilter params={params} onSearchChange={onSearchChange} searchData={searchData} CardContentSx={{ px: 2 }} />
    </>
  )
}

export default TableFilters
