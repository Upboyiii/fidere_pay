'use client'

// React Imports
import { useEffect, useState, useRef } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

// Component Imports
import TrustStatsCards from './components/TrustStatsCards'
import TrustTable from './components/TrustTable'
import TableFilters from './components/TableFilters'
import { TableInstance } from '@/components/table'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// API Imports
import { getTrustList, type TrustListItem } from '@server/trust'

/**
 * 信托管理主页面组件
 * 管理客户信托记录、受益人审核和信托文件
 */
const Trust = () => {
  const t = useTranslate()

  // 状态管理
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useState({
    keyword: ''
  })
  const [stats, setStats] = useState({
    totalTrustRecords: 0,
    beneficiariesPendingReview: 0,
    documentsPendingSignature: 0,
    totalBeneficiaries: 0
  })
  const [tableData, setTableData] = useState<TrustListItem[]>([])
  const [total, setTotal] = useState(0)
  const tableRef = useRef<TableInstance | null>(null)

  // 初始化数据加载
  useEffect(() => {
    loadTableData({ pageNum: 1, pageSize: 10, keyword: searchParams.keyword })
  }, [])

  /**
   * 加载表格数据
   * @param params - 查询参数
   */
  const loadTableData = async (params: { pageNum: number; pageSize: number; keyword: string }) => {
    try {
      setLoading(true)
      const res = await getTrustList({
        pageNum: params.pageNum,
        pageSize: params.pageSize,
        keyword: params.keyword || undefined
      })

      const responseData = res.data && typeof res.data === 'object' && 'data' in res.data ? res.data.data : res.data

      if (responseData && typeof responseData === 'object') {
        setTableData(('list' in responseData ? responseData.list : []) as TrustListItem[])
        setTotal('total' in responseData ? (responseData.total ?? 0) : 0)

        if ('stat' in responseData && responseData.stat) {
          const { stat } = responseData
          setStats({
            totalTrustRecords: stat.trustTotal ?? 0,
            beneficiariesPendingReview: stat.pendingBeneficiary ?? 0,
            documentsPendingSignature: stat.pendingSign ?? 0,
            totalBeneficiaries: stat.beneficiaryTotal ?? 0
          })
        }
      }
    } catch (error) {
      console.error('加载表格数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理搜索变化
   * @param data - 搜索参数
   */
  const handleSearchChange = (data: any) => {
    setSearchParams(data)
    tableRef?.current?.resetPage?.()
    loadTableData({
      ...data,
      pageNum: 1,
      pageSize: tableRef?.current?.getState()?.pagination?.pageSize ?? 10
    })
  }

  /**
   * 处理分页变化
   * @param params - 分页参数
   */
  const handlePageChange = (params: { pageNum: number; pageSize: number }) => {
    loadTableData({
      ...params,
      ...searchParams
    })
  }

  return (
    <Grid container spacing={6}>
      {/* 统计卡片 */}
      <Grid size={{ xs: 12 }}>
        <TrustStatsCards stats={stats} loading={loading} />
      </Grid>

      {/* 表格卡片 */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title={t('kycDashboard.trustRecordList')} subheader={t('kycDashboard.trustRecordListSubtitle')} />
          <TableFilters onSearchChange={handleSearchChange} params={searchParams} />
          <Box sx={{ p: 4, pt: 0 }}>
            <Divider sx={{ px: 2 }} />
            <Box sx={{ pt: 4 }}>
              <TrustTable
                data={tableData}
                loading={loading}
                total={total}
                onPageChange={handlePageChange}
                tableRef={tableRef}
              />
            </Box>
          </Box>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Trust
