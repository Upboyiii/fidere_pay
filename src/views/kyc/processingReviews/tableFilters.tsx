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
      label: t('processingReviews.searchCustomerName'), // 搜索客户名称
      placeholder: t('processingReviews.searchCustomerName') // 搜索客户名称
    },
    {
      name: 'status',
      type: 'select',
      label: t('processingReviews.reviewStatus'), // 审核状态
      placeholder: t('processingReviews.selectReviewStatus'), // 选择地址审核状态
      options: [
        { label: t('processingReviews.allStatus'), value: '' }, // 全部状态
        { label: t('processingReviews.pending'), value: 'pending' }, // 待审核
        { label: t('processingReviews.reviewing'), value: 'in_review' }, // 审核中
        { label: t('processingReviews.approved'), value: 'approved' }, // 审核通过
        { label: t('processingReviews.rejected'), value: 'rejected' } // 审核未通过
      ]
    }
  ]

  return (
    <>
      <TableFilter params={params} onSearchChange={onSearchChange} searchData={searchData} CardContentSx={{ px: 0 }} />
    </>
  )
}

export default TableFilters
