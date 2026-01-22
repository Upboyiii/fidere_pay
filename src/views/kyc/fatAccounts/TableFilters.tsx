import TabFilters, { SearchData } from '@components/table/tableFilters'
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
      label: t('fatAccounts.searchPlaceholder'), // 搜索账户ID、用户名、账号...
      placeholder: t('fatAccounts.searchPlaceholder') // 搜索账户ID、用户名、账号...
    }
  ] as const

  return (
    <>
      <TabFilters params={params} onSearchChange={onSearchChange} searchData={searchData} />
    </>
  )
}

export default TableFilters
