'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useRouter, useParams } from 'next/navigation'

// Util Imports
import { getLocalizedPath } from '@/utils/routeUtils'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { getUserTransferList, type TransferDetailItem } from '@server/otc-api'
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const RemittanceRecords = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const params = useParams()
  const currentLang = (params?.lang as string) || undefined
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<TransferDetailItem[]>([])
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    applyNo: '',
    status: '-1',
    startDate: '',
    endDate: ''
  })
  const [showFilters, setShowFilters] = useState(true)

  // 加载汇款记录
  const loadRecords = async () => {
    setLoading(true)
    try {
      const res = await getUserTransferList({
        pageNum: page + 1,
        pageSize: rowsPerPage,
        status: filters.status !== '-1' ? Number(filters.status) : undefined,
        applyNo: filters.applyNo || undefined,
        startTime: filters.startDate ? new Date(filters.startDate).getTime() : undefined,
        endTime: filters.endDate ? new Date(filters.endDate + 'T23:59:59').getTime() : undefined
      })
      setRecords(res.data?.list || [])
      setTotal(res.data?.total || 0)
    } catch (error) {
      console.error('加载汇款记录失败:', error)
      toast.error('加载汇款记录失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, filters.status, filters.applyNo, filters.startDate, filters.endDate])

  const getStatusLabel = (status: number) => {
    const statusMap: Record<number, string> = {
      0: '待审核',
      1: '处理中',
      2: '已完成',
      3: '已驳回',
      4: '失败'
    }
    return statusMap[status] || '未知'
  }

  const getStatusColor = (status: number) => {
    if (status === 2) return 'success'
    if (status === 1) return 'warning'
    if (status === 3 || status === 4) return 'error'
    return 'default'
  }

  return (
    <Box 
      sx={{ 
        p: 6, 
        position: 'relative', 
        minHeight: '100%',
        backgroundColor: '#f8fafc' 
      }}
    >
      {/* 现代感网格背景 */}
      <Box 
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 90%)'
        }}
      />

      <Grid container spacing={6} sx={{ position: 'relative', zIndex: 1 }}>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant='h4' sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                汇款记录
              </Typography>
              <Typography color='text.secondary'>
                查看和追踪您的所有跨境汇款订单
              </Typography>
            </Box>
            <Button 
              variant='contained' 
              startIcon={<i className='ri-add-line' />} 
              onClick={() => router.push('/remittance/create')}
              sx={{ borderRadius: '8px', px: 6 }}
            >
              发起新汇款
            </Button>
          </Box>
        </Grid>

        {/* 筛选栏 */}
        {showFilters && (
          <Grid size={{ xs: 12 }}>
            <Card 
              sx={{ 
                borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <CardContent>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>申请单号</Typography>
                    <TextField
                      fullWidth
                      size='small'
                      placeholder='请输入申请单号'
                      value={filters.applyNo}
                      onChange={(e) => setFilters({ ...filters, applyNo: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>订单状态</Typography>
                    <FormControl fullWidth size='small'>
                      <Select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        displayEmpty
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value='-1'>全部</MenuItem>
                        <MenuItem value='0'>待审核</MenuItem>
                        <MenuItem value='1'>处理中</MenuItem>
                        <MenuItem value='2'>已完成</MenuItem>
                        <MenuItem value='3'>已驳回</MenuItem>
                        <MenuItem value='4'>失败</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>订单时间</Typography>
                    <TextField
                      fullWidth
                      size='small'
                      type='date'
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>结束日期</Typography>
                    <TextField
                      fullWidth
                      size='small'
                      type='date'
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
              <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, p: 4 }}>
                <Button 
                  variant='text' 
                  size='small'
                  onClick={() => {
                    setFilters({ applyNo: '', status: '-1', startDate: '', endDate: '' })
                    setPage(0)
                  }}
                  sx={{ color: 'text.secondary' }}
                >
                  重置
                </Button>
                <Button 
                  variant='contained' 
                  size='small' 
                  startIcon={<i className='ri-search-line' />} 
                  onClick={loadRecords}
                  disabled={loading}
                  sx={{ borderRadius: '8px', px: 6 }}
                >
                  查询
                </Button>
                <Button variant='text' size='small' onClick={() => setShowFilters(false)} startIcon={<i className='ri-arrow-up-line' />}>
                  收起
                </Button>
              </Box>
            </Card>
          </Grid>
        )}

        {/* 汇款记录列表 */}
        <Grid size={{ xs: 12 }}>
          <Card 
            sx={{ 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 6, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                所有汇款订单
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton size='small' onClick={loadRecords} disabled={loading}>
                  {loading ? <CircularProgress size={20} /> : <i className='ri-refresh-line' />}
                </IconButton>
                <IconButton size='small'><i className='ri-fullscreen-line' /></IconButton>
                <IconButton size='small'><i className='ri-settings-3-line' /></IconButton>
              </Box>
            </Box>
            <Box
              sx={{
                overflowX: 'auto',
                overflowY: 'visible',
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#a8a8a8',
                  },
                },
              }}
            >
              <table className={tableStyles.table} style={{ border: 'none', minWidth: '1000px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fcfdfe' }}>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>收款方信息</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>扣款金额</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>收款金额</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>状态</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>交易ID</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>申请时间</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center' }}>
                        <CircularProgress />
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        暂无汇款记录
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.id} className='hover:bg-actionHover transition-colors' style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <Box>
                            <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                              收款人ID: {record.payeeId}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              币种: {record.currencyCode} → {record.receiveCurrencyCode}
                            </Typography>
                          </Box>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Typography variant='body2' sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.primary' }}>
                            {(record.transferAmount ?? 0).toLocaleString()} {record.currencyCode}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Typography variant='body2' sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
                            {(((record.transferAmount ?? 0) * (record.exchangeRate ?? 0)) - (record.fee || 0)).toLocaleString()} {record.receiveCurrencyCode}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Chip 
                            label={getStatusLabel(record.status)} 
                            size='small' 
                            color={getStatusColor(record.status) as any} 
                            sx={{ fontWeight: 600, borderRadius: '6px' }}
                          />
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                            {record.applyNo}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Typography variant='body2' color='text.secondary'>
                            {record.createdAt 
                              ? new Date(record.createdAt.toString().length === 10 ? record.createdAt * 1000 : record.createdAt).toLocaleString('zh-CN', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })
                              : '-'}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Button 
                            size='small' 
                            variant='text' 
                            sx={{ fontWeight: 600 }}
                            onClick={() => router.push(getLocalizedPath(`/remittance/records/${record.applyNo}`, currentLang))}
                          >
                            详情
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Box>
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='caption' color='text.disabled'>
                共 {total} 条记录
              </Typography>
              <TablePagination
                component='div'
                count={total}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10))
                  setPage(0)
                }}
                rowsPerPageOptions={[10, 25, 50]}
                labelRowsPerPage=''
                sx={{ border: 'none' }}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default RemittanceRecords
