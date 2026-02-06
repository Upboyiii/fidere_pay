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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

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
    startDate: '',
    endDate: ''
  })

  const loadData = async (customFilters?: typeof filters, customPage?: number) => {
    setLoading(true)
    try {
      const currentFilters = customFilters || filters
      const currentPage = customPage !== undefined ? customPage : page
      
      // 转换日期为秒级时间戳
      // 开始时间：当天的 00:00:00
      // 结束时间：当天的 23:59:59（包含整天的数据）
      let startTime: number | undefined
      let endTime: number | undefined
      if (currentFilters.startDate) {
        const [year, month, day] = currentFilters.startDate.split('-').map(Number)
        const startDate = new Date(year, month - 1, day, 0, 0, 0, 0)
        startTime = Math.floor(startDate.getTime() / 1000)
      }
      if (currentFilters.endDate) {
        const [year, month, day] = currentFilters.endDate.split('-').map(Number)
        const endDate = new Date(year, month - 1, day, 23, 59, 59, 999)
        endTime = Math.floor(endDate.getTime() / 1000)
      }

      const res = await getAdminRechargeList({
        pageNum: currentPage + 1,
        pageSize: rowsPerPage,
        userId: currentFilters.userId ? Number(currentFilters.userId) : undefined,
        status: currentFilters.status !== '-1' ? Number(currentFilters.status) : undefined,
        currencyCode: currentFilters.currencyCode || undefined,
        rechargeNo: currentFilters.rechargeNo || undefined,
        startTime,
        endTime
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
      <Grid size={12}>
        <Card sx={{ width: '100%' }}>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5'>充值记录列表</Typography>
            </Box>
            <Box className='flex items-center gap-4 mb-6 flex-wrap'>
              <FormControl size='small' sx={{ minWidth: 150 }}>
                <InputLabel id='recharge-status-label'>状态</InputLabel>
                <Select
                  labelId='recharge-status-label'
                  value={filters.status}
                  onChange={e => setFilters({ ...filters, status: e.target.value })}
                  label='状态'
                >
                  <MenuItem value='-1'>全部</MenuItem>
                  <MenuItem value='0'>待确认</MenuItem>
                  <MenuItem value='1'>已到账</MenuItem>
                  <MenuItem value='2'>失败</MenuItem>
                  <MenuItem value='3'>已取消</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label='币种编码'
                value={filters.currencyCode}
                onChange={e => setFilters({ ...filters, currencyCode: e.target.value })}
                size='small'
                sx={{ minWidth: 120 }}
              />
              <TextField
                label='充值单号'
                value={filters.rechargeNo}
                onChange={e => setFilters({ ...filters, rechargeNo: e.target.value })}
                size='small'
                sx={{ minWidth: 180 }}
              />
              <TextField
                label='开始日期'
                type='date'
                value={filters.startDate}
                onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                size='small'
                sx={{ minWidth: 200 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label='结束日期'
                type='date'
                value={filters.endDate}
                onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                size='small'
                sx={{ minWidth: 200 }}
                InputLabelProps={{ shrink: true }}
              />
              <Button 
                variant='contained' 
                onClick={() => {
                  setPage(0)
                  loadData(undefined, 0)
                }}
                disabled={loading}
              >
                查询
              </Button>
              <Button 
                variant='outlined' 
                onClick={() => {
                  const resetFilters = {
                    userId: '',
                    status: '-1',
                    currencyCode: '',
                    rechargeNo: '',
                    startDate: '',
                    endDate: ''
                  }
                  setFilters(resetFilters)
                  setPage(0)
                  loadData(resetFilters, 0)
                }}
              >
                重置
              </Button>
            </Box>
            <div className={tableStyles.tableWrapper} style={{ overflowX: 'auto' }}>
              <table className={tableStyles.table} style={{ width: '100%', minWidth: '1200px' }}>
                <thead>
                  <tr>
                    <th>充值单号</th>
                    <th>用户名</th>
                    <th>币种</th>
                    <th>金额</th>
                    <th>充值地址</th>
                    <th>交易哈希</th>
                    <th>状态</th>
                    <th>创建时间</th>
                    {/* <th>操作</th> */}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className='text-center'>
                        加载中...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={9} className='text-center'>
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    data.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{item.rechargeNo}</td>
                        <td>{(item as any).userName || '-'}</td>
                        <td>{item.currencyCode}</td>
                        <td>{item.amount}</td>
                        <td>
                          {(() => {
                            const address = (item as any).rechargeAddress
                            if (!address) return '-'
                            return (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tooltip title={address} arrow>
                                  <Typography 
                                    variant='body2' 
                                    sx={{ 
                                      fontSize: '0.85rem', 
                                      fontFamily: 'monospace', 
                                      maxWidth: '200px', 
                                      overflow: 'hidden', 
                                      textOverflow: 'ellipsis', 
                                      whiteSpace: 'nowrap' 
                                    }}
                                  >
                                    {address}
                                  </Typography>
                                </Tooltip>
                                <IconButton 
                                  size='small' 
                                  onClick={() => {
                                    navigator.clipboard.writeText(address)
                                    toast.success('已复制到剪贴板')
                                  }}
                                  sx={{ p: 0.5 }}
                                >
                                  <i className='ri-file-copy-line' style={{ fontSize: '14px' }} />
                                </IconButton>
                              </Box>
                            )
                          })()}
                        </td>
                        <td>
                          {(() => {
                            const txHash = (item as any).txHash
                            if (!txHash) return '-'
                            return (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tooltip title={txHash} arrow>
                                  <Typography 
                                    variant='body2' 
                                    sx={{ 
                                      fontSize: '0.85rem', 
                                      fontFamily: 'monospace', 
                                      maxWidth: '200px', 
                                      overflow: 'hidden', 
                                      textOverflow: 'ellipsis', 
                                      whiteSpace: 'nowrap' 
                                    }}
                                  >
                                    {txHash}
                                  </Typography>
                                </Tooltip>
                                <IconButton 
                                  size='small' 
                                  onClick={() => {
                                    navigator.clipboard.writeText(txHash)
                                    toast.success('已复制到剪贴板')
                                  }}
                                  sx={{ p: 0.5 }}
                                >
                                  <i className='ri-file-copy-line' style={{ fontSize: '14px' }} />
                                </IconButton>
                              </Box>
                            )
                          })()}
                        </td>
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
                        <td>
                          {(() => {
                            const timestamp = item.createTime || item.createdAt
                            if (!timestamp) return '-'
                            // 处理时间戳：如果是10位（秒级），转换为毫秒；如果是13位（毫秒级），直接使用
                            const ms = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp
                            return new Date(ms).toLocaleString('zh-CN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })
                          })()}
                        </td>
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
