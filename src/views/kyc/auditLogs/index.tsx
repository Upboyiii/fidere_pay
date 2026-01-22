'use client'

// React Imports
import { useState, useEffect, useRef } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import AuditLogTable from './AuditLogTable'

// Server Imports
import { getAuditLogsList } from '@server/auditLogs'
import TableComponent, { TableInstance } from '@components/table'

/**
 * 审计日志页面主组件
 */
export default function AuditLogsPage() {
  // States
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useState({
    operName: '',
    operUrl: '',
    requestMethod: ''
  })
  const tableRef = useRef<TableInstance>(null)

  /**
   * 处理搜索变化
   */
  const handleSearchChange = (data: any) => {
    setSearchParams(data)
    tableRef?.current?.resetPage?.()
    requestgetAuditLogsList({
      ...data,
      pageNum: 1,
      pageSize: tableRef?.current?.getState().pagination.pageSize || 10
    })
  }

  /**
   * 分页变化处理
   */
  const pageChange = (data: any) => {
    requestgetAuditLogsList({
      ...data,
      ...searchParams
    })
  }

  /**
   * 请求审计日志列表
   */
  const requestgetAuditLogsList = async (params: any) => {
    setLoading(true)
    try {
      const res = await getAuditLogsList(params)
      setData(res.data?.list ?? [])
      setTotal(res.data?.total ?? 0)
    } catch (error) {
      console.error(error)
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    requestgetAuditLogsList({ ...searchParams, pageNum: 1, pageSize: 10 })
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <AuditLogTable
          tableData={data}
          total={total}
          loading={loading}
          searchParams={searchParams}
          onSearchChange={handleSearchChange}
          tableRef={tableRef}
          requestgetAuditLogsList={requestgetAuditLogsList}
          pageChange={pageChange}
        />
      </Grid>
    </Grid>
  )
}
