'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
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
import { 
  getUserTransactionList, 
  getCurrencyList,
  initCurrency,
  type UserTransactionListItem, 
  type CurrencyListItem 
} from '@server/otc-api'
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const TransactionHistory = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    transactionId: '',
    transactionType: '',
    currency: '',
    startDate: '',
    endDate: ''
  })
  const [showFilters, setShowFilters] = useState(true)
  const [transactions, setTransactions] = useState<UserTransactionListItem[]>([])
  const [total, setTotal] = useState(0)
  const [currencyList, setCurrencyList] = useState<CurrencyListItem[]>([])

  // 初始化币种并加载币种列表（与我的资产页面一致）
  useEffect(() => {
    const loadCurrencyList = async () => {
      try {
        // 先初始化默认币种
        await initCurrency()
        // 再获取币种列表
        const res = await getCurrencyList()
        const responseData = res.data as any
        const list = responseData?.list || responseData?.data?.list || []
        setCurrencyList(list)
      } catch (error) {
        console.error('加载币种列表失败:', error)
      }
    }
    loadCurrencyList()
  }, [])

  // 加载交易记录
  const loadTransactions = async () => {
    setLoading(true)
    try {
      const res = await getUserTransactionList({
        pageNum: page + 1,
        pageSize: rowsPerPage,
        currencyCode: filters.currency || undefined,
        bizType: filters.transactionType ? Number(filters.transactionType) : undefined,
        direction: undefined, // 不筛选方向，显示所有
        startTime: filters.startDate ? new Date(filters.startDate).getTime() : undefined,
        endTime: filters.endDate ? new Date(filters.endDate).getTime() + 86400000 - 1 : undefined
      })
      
      setTransactions(res.data?.list || [])
      setTotal(res.data?.total || 0)
    } catch (error) {
      console.error('加载交易记录失败:', error)
      toast.error('加载交易记录失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [page, rowsPerPage])

  const getStatusColor = (bizType: number) => {
    // 根据业务类型判断状态，这里简化处理
    return 'success'
  }

  const getTypeLabel = (bizType: number) => {
    const typeMap: Record<number, string> = {
      1: '充值',
      2: '提现',
      3: '转账',
      4: '汇款',
      5: '其他'
    }
    return typeMap[bizType] || '其他'
  }

  return (
    <Box 
      sx={{ 
        p: 6, 
        position: 'relative', 
        minHeight: '100%',
        bgcolor: mode === 'dark' ? 'background.default' : '#f8fafc'
      }}
    >
      {/* 现代感网格背景 */}
      <Box 
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: mode === 'dark' 
            ? `
              linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `
            : `
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
                交易流水
              </Typography>
              <Typography color='text.secondary'>
                查看所有交易记录和流水明细
              </Typography>
            </Box>
            <Button
              variant='contained'
              startIcon={<i className='ri-download-line' />}
              sx={{ borderRadius: '8px', px: 6 }}
            >
              导出记录
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
                <Grid container spacing={4} alignItems='flex-end'>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>交易ID</Typography>
                    <TextField
                      fullWidth
                      size='small'
                      placeholder='请输入交易ID'
                      value={filters.transactionId}
                      onChange={(e) => setFilters({ ...filters, transactionId: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>交易类型</Typography>
                    <FormControl fullWidth size='small'>
                      <Select
                        value={filters.transactionType}
                        onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })}
                        displayEmpty
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value=''>请选择</MenuItem>
                        <MenuItem value='1'>充值</MenuItem>
                        <MenuItem value='2'>提现</MenuItem>
                        <MenuItem value='3'>转账</MenuItem>
                        <MenuItem value='4'>汇款</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>币种</Typography>
                    <FormControl fullWidth size='small'>
                      <Select
                        value={filters.currency}
                        onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
                        displayEmpty
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value=''>请选择币种</MenuItem>
                        {currencyList.map((currency, index) => (
                          <MenuItem key={`${currency.currencyCode}-${(currency as any).chain || index}`} value={currency.currencyCode}>
                            {currency.currencyCode}{(currency as any).chain ? `(${(currency as any).chain})` : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>开始日期</Typography>
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
                  onClick={() => setFilters({ transactionId: '', transactionType: '', currency: '', startDate: '', endDate: '' })}
                  sx={{ color: 'text.secondary' }}
                >
                  重置
                </Button>
                <Button 
                  variant='contained' 
                  size='small' 
                  startIcon={<i className='ri-search-line' />} 
                  sx={{ borderRadius: '8px', px: 6 }}
                  onClick={loadTransactions}
                  disabled={loading}
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

        {/* 交易列表 */}
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
                交易记录
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton size='small' onClick={loadTransactions} disabled={loading}>
                  {loading ? <CircularProgress size={20} /> : <i className='ri-refresh-line' />}
                </IconButton>
                <IconButton size='small'><i className='ri-fullscreen-line' /></IconButton>
                <IconButton size='small'><i className='ri-settings-3-line' /></IconButton>
              </Box>
            </Box>
            <div className='overflow-x-auto'>
              <table className={tableStyles.table} style={{ border: 'none' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fcfdfe' }}>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>交易ID</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>交易类型</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>币种</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>金额</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>状态</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>创建时间</th>
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
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        暂无交易记录
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className='hover:bg-actionHover transition-colors' style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 500 }}>
                            {tx.id}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Typography
                            variant='body2'
                            sx={{
                              color: tx.direction === 1 ? 'primary.main' : 'warning.main',
                              fontWeight: 600
                            }}
                          >
                            {getTypeLabel(tx.bizType)}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Typography variant='body2'>{tx.currencyCode}</Typography>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Typography
                            variant='body2'
                            sx={{
                              fontWeight: 700,
                              color: tx.direction === 1 ? '#4caf50' : '#ff5252'
                            }}
                          >
                            {tx.direction === 1 ? '+' : '-'}{tx.amount}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Chip 
                            label='成功' 
                            size='small' 
                            color='success' 
                            sx={{ borderRadius: '6px', fontWeight: 600 }}
                          />
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Typography variant='body2' color='text.secondary'>
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '-'}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Button 
                            size='small' 
                            variant='text' 
                            sx={{ fontWeight: 600 }}
                            onClick={() => {}}
                          >
                            详情
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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

export default TransactionHistory
