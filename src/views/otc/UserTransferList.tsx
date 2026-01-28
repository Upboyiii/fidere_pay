'use client'

// React Imports
import { useState, useEffect } from 'react'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import Chip from '@mui/material/Chip'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { getUserTransferList, downloadTransferPdf, type TransferDetailItem } from '@server/otc-api'
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const UserTransferList = ({ mode }: { mode: Mode }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [data, setData] = useState<TransferDetailItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: '-1',
    applyNo: '',
    startTime: '',
    endTime: ''
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getUserTransferList({
        pageNum: page + 1,
        pageSize: rowsPerPage,
        status: filters.status !== '-1' ? Number(filters.status) : undefined,
        applyNo: filters.applyNo || undefined,
        startTime: filters.startTime ? new Date(filters.startTime).getTime() : undefined,
        endTime: filters.endTime ? new Date(filters.endTime).getTime() : undefined
      })
      setData(res.data?.list || [])
      setTotal(res.data?.total || 0)
    } catch (error) {
      console.error('加载数据失败:', error)
      toast.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, rowsPerPage])

  const handleDownloadPdf = async (applyNo: string) => {
    try {
      await downloadTransferPdf({ applyNo })
      toast.success('下载成功')
    } catch (error) {
      console.error('下载失败:', error)
      toast.error('下载失败')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid xs={12}>
        <Card>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5'>转账记录</Typography>
              <Button variant='contained' component={Link} href='/remittance/create'>
                创建转账
              </Button>
            </Box>
            <Box className='flex items-center gap-4 mb-4 flex-wrap'>
              <TextField
                label='状态'
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
                size='small'
                select
                SelectProps={{ native: true }}
              >
                <option value='-1'>全部</option>
                <option value='0'>待审核</option>
                <option value='1'>处理中</option>
                <option value='2'>已完成</option>
                <option value='3'>已驳回</option>
                <option value='4'>失败</option>
              </TextField>
              <TextField
                label='申请单号'
                value={filters.applyNo}
                onChange={e => setFilters({ ...filters, applyNo: e.target.value })}
                size='small'
              />
              <TextField
                label='开始时间'
                type='datetime-local'
                value={filters.startTime}
                onChange={e => setFilters({ ...filters, startTime: e.target.value })}
                size='small'
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label='结束时间'
                type='datetime-local'
                value={filters.endTime}
                onChange={e => setFilters({ ...filters, endTime: e.target.value })}
                size='small'
                InputLabelProps={{ shrink: true }}
              />
              <Button variant='contained' onClick={loadData}>
                查询
              </Button>
            </Box>
            <div className={tableStyles.tableWrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>申请单号</th>
                    <th>汇款币种</th>
                    <th>收款币种</th>
                    <th>转账金额</th>
                    <th>手续费</th>
                    <th>状态</th>
                    <th>创建时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className='text-center'>
                        加载中...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={8} className='text-center'>
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    data.map(item => (
                      <tr key={item.id}>
                        <td>{item.applyNo}</td>
                        <td>{item.currencyCode}</td>
                        <td>{item.receiveCurrencyCode}</td>
                        <td>{item.transferAmount}</td>
                        <td>{item.fee}</td>
                        <td>
                          <Chip
                            label={
                              item.status === 0
                                ? '待审核'
                                : item.status === 1
                                  ? '处理中'
                                  : item.status === 2
                                    ? '已完成'
                                    : item.status === 3
                                      ? '已驳回'
                                      : '失败'
                            }
                            color={
                              item.status === 2
                                ? 'success'
                                : item.status === 3 || item.status === 4
                                  ? 'error'
                                  : 'warning'
                            }
                            size='small'
                          />
                        </td>
                        <td>{new Date(item.createdAt).toLocaleString()}</td>
                        <td>
                          <Box className='flex gap-2'>
                            <Button size='small' component={Link} href={`/otc/transfers/${item.applyNo}`}>
                              详情
                            </Button>
                            {item.status === 2 && (
                              <Button size='small' onClick={() => handleDownloadPdf(item.applyNo)}>
                                下载PDF
                              </Button>
                            )}
                          </Box>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <TablePagination
              component='div'
              count={total}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={e => {
                setRowsPerPage(parseInt(e.target.value, 10))
                setPage(0)
              }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default UserTransferList
