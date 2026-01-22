'use client'

// React Imports
import { useState, useEffect, useCallback, useRef } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import { getFatAccounts } from '@server/fatAccounts'
// Component Imports
import FatAccountCards from './FatAccountCards'
import FiatAccountTable from './FiatAccountTable'

export default function FiatAccountsPage() {
  // States
  const [data, setData] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({})
  const [total, setTotal] = useState(0)

  // 使用 ref 追踪请求状态，避免依赖 loading 导致函数引用变化
  const isLoadingRef = useRef(false)

  // 使用 useCallback 稳定函数引用，避免子组件不必要的重新渲染
  const requestgetFatAccounts = useCallback(async (params?: any) => {
    // 防止重复请求：如果正在加载中，则跳过
    if (isLoadingRef.current) {
      return
    }
    try {
      isLoadingRef.current = true
      setLoading(true)
      const res = await getFatAccounts(params)
      setStats(res.data.stats)
      setData(res.data?.list ?? [])
      setTotal(res.data?.total ?? 0)
    } catch (error) {
      console.warn('请求失败:', error)
    } finally {
      isLoadingRef.current = false
      setLoading(false)
    }
  }, [])

  // 初始化数据请求
  useEffect(() => {
    requestgetFatAccounts({ status: 0, pageNum: 1, pageSize: 10 })
  }, [requestgetFatAccounts])
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <FatAccountCards data={stats} loading={loading} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FiatAccountTable
          stats={stats}
          tableData={data}
          total={total}
          loading={loading}
          requestgetFatAccounts={requestgetFatAccounts}
        />
      </Grid>
    </Grid>
  )
}
