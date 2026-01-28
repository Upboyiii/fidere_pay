'use client'

// React Imports
import { useState, useEffect } from 'react'

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
import { getAdminRechargeList, manualConfirmRecharge, type AdminRechargeListItem } from '@server/otc-api'
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const AdminRechargeList = ({ mode }: { mode: Mode }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [data, setData] = useState<AdminRechargeListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    userId: '',
    status: '-1',
    currencyCode: '',
    rechargeNo: '',
    startTime: '',
    endTime: ''
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getAdminRechargeList({
        pageNum: page + 1,
        pageSize: rowsPerPage,
        userId: filters.userId ? Number(filters.userId) : undefined,
        status: filters.status !== '-1' ? Number(filters.status) : undefined,
        currencyCode: filters.currencyCode || undefined,
        rechargeNo: filters.rechargeNo || undefined,
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

  const handleConfirm = async (rechargeNo: string) => {
    if (!confirm('确定要手动确认充值吗？')) return
    try {
      await manualConfirmRecharge({ rechargeNo })
      toast.success('确认成功')
      loadData()
    } catch (error) {
      console.error('确认失败:', error)
      toast.error('确认失败')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid xs={12}>
        <Card>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5'>充值记录列表</Typography>
            </Box>
            <Box className='flex items-center gap-4 mb-4 flex-wrap'>
              <TextField
                label='用户ID'
                value={filters.userId}
                onChange={e => setFilters({ ...filters, userId: e.target.value })}
                size='small'
              />
              <TextField
                label='状态'
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
                size='small'
                select
                SelectProps={{ native: true }}
              >
                <option value='-1'>全部</option>
                <option value='0'>待确认</option>
                <option value='1'>已到账</option>
                <option value='2'>失败</option>
                <option value='3'>已取消</option>
              </TextField>
              <TextField
                label='币种编码'
                value={filters.currencyCode}
                onChange={e => setFilters({ ...filters, currencyCode: e.target.value })}
                size='small'
              />
              <TextField
                label='充值单号'
                value={filters.rechargeNo}
                onChange={e => setFilters({ ...filters, rechargeNo: e.target.value })}
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
                    <th>充值单号</th>
                    <th>用户ID</th>
                    <th>币种</th>
                    <th>金额</th>
                    <th>状态</th>
                    <th>创建时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className='text-center'>
                        加载中...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className='text-center'>
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    data.map(item => (
                      <tr key={item.id}>
                        <td>{item.rechargeNo}</td>
                        <td>{item.userId}</td>
                        <td>{item.currencyCode}</td>
                        <td>{item.amount}</td>
                        <td>
                          <Chip
                            label={
                              item.status === 0
                                ? '待确认'
                                : item.status === 1
                                  ? '已到账'
                                  : item.status === 2
                                    ? '失败'
                                    : '已取消'
                            }
                            color={
                              item.status === 1 ? 'success' : item.status === 2 ? 'error' : 'warning'
                            }
                            size='small'
                          />
                        </td>
                        <td>{new Date(item.createdAt).toLocaleString()}</td>
                        <td>
                          {item.status === 0 && (
                            <Button size='small' onClick={() => handleConfirm(item.rechargeNo)}>
                              确认
                            </Button>
                          )}
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

export default AdminRechargeList
