import TabFilters, { SearchData } from '@components/table/tableFilters'
import { useTranslate } from '@/contexts/DictionaryContext'

type TableFiltersProps = {
  onSearchChange?: (data: any) => void
  params: any
}

const TableFilters = ({ onSearchChange, params }: TableFiltersProps) => {
  const t = useTranslate()
  const searchData: SearchData[] = [
    {
      name: 'keyword',
      type: 'input',
      label: t('userManagement.searchPlaceholder'), // 搜索用户名、ID或客户编号...
      placeholder: t('userManagement.searchPlaceholder') // 搜索用户名、ID或客户编号...
    },
    {
      name: 'status',
      type: 'select',
      label: t('userManagement.accountStatus'), // 账户状态
      placeholder: t('userManagement.selectAccountStatus'), // 选择账户状态
      options: [
        { label: t('userManagement.allStatus'), value: '' }, // 全部状态
        { label: t('userManagement.enabled'), value: '1' }, // 启用
        { label: t('userManagement.disabled'), value: '3' } // 禁用
      ]
    }
  ] as const

  return <TabFilters params={params} onSearchChange={onSearchChange} searchData={searchData as unknown as any[]} />
}

export default TableFilters
