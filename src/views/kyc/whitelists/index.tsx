'use client'

// React Imports
import { useState, useCallback, useRef, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import { getWhitelists } from '@server/whitelists'

// Component Imports
import WhitelistCards from './WhitelistCards'
import WhitelistTable from './WhitelistTable'

export default function WhitelistsPage() {
  // States
  const [data, setData] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({})
  const [total, setTotal] = useState(0)
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
      const res = await getWhitelists(params)
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
  useEffect(() => {
    requestgetFatAccounts({ status: 0, pageNum: 1, pageSize: 10 })
  }, [requestgetFatAccounts])
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <WhitelistCards data={stats} loading={loading} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <WhitelistTable
          tableData={data}
          total={total}
          loading={loading}
          requestgetFatAccounts={requestgetFatAccounts}
        />
      </Grid>
    </Grid>
  )
}
