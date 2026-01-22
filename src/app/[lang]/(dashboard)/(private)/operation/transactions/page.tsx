'use client'

import React, { useState, useEffect, useCallback } from 'react'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { 
  getOtcOverview, 
  type OtcOverviewResponse,
  getOtcTransactionList,
  type OtcTransactionItem,
  type OtcTransactionListResponse
} from '@server/operationDashboard'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Pagination,
  Tooltip,
  Card,
  CardHeader,
  CardContent,
  Grid2 as Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material'

// 使用 Remix Icons 替代 MUI Icons
const TrendingUpIcon = () => <i className="ri-trending-up-line" />
const TrendingDownIcon = () => <i className="ri-trending-down-line" />

// 交易数据映射类型（页面显示格式）
interface TransactionDisplayItem {
  id: number
  user: { email: string; name: string }
  transactionId: string
  type: string
  sourceAssetType: string
  sourceAssetKey: string
  sourcePrice: number
  sourceAmount: number
  targetAssetType: string
  targetAssetKey: string
  targetPrice: number
  targetAmount: number
  quoteStartTime: string
  quoteEndTime: string
  transactionTime: string
  status: string
  statusLabel: string
  note: string
}

// 将接口返回的数据转换为页面显示格式
const mapTransactionItem = (item: OtcTransactionItem): TransactionDisplayItem => {
  return {
    id: item.id,
    user: {
      email: item.userEmail || '',
      name: item.userName || '',
    },
    transactionId: item.tradeRefId || '',
    type: item.tradeType || '',
    sourceAssetType: item.sourceCoinType || '',
    sourceAssetKey: item.sourceCoinKey || '',
    sourcePrice: parseFloat(item.sourceQuotePrice || '0'),
    sourceAmount: parseFloat(item.sourceAmount || '0'),
    targetAssetType: item.destinationCoinType || '',
    targetAssetKey: item.destinationCoinKey || '',
    targetPrice: parseFloat(item.destinationQuotePrice || '0'),
    targetAmount: parseFloat(item.destinationAmount || '0'),
    quoteStartTime: item.quoteBeginTime || '',
    quoteEndTime: item.quoteEndTime || '',
    transactionTime: item.tradeTime || '',
    status: item.tradeStatus || '',
    statusLabel: item.tradeStatusLabel || '',
    note: item.note || '',
  }
}

// 默认统计数据（用于初始化）
const defaultStatistics = {
  latestTime: '',
  totalCount: 0,
  cryptoCount: 0,
  fiatCount: 0,
  successCount: 0,
  buyCount: 0,
  sellCount: 0,
  currencyDistribution: [] as Array<{ key: string; amount: number }>,
}

const getStatisticsTimeRange = (filters: { startTime?: string; endTime?: string }) => {
  if (filters.startTime && filters.endTime) {
    const startDate = filters.startTime.split('T')[0]
    const endDate = filters.endTime.split('T')[0]
    return `统计时间：${startDate} 至 ${endDate}`
  } else if (filters.startTime) {
    const startDate = filters.startTime.split('T')[0]
    return `统计时间：${startDate} 至今`
  } else if (filters.endTime) {
    const endDate = filters.endTime.split('T')[0]
    return `统计时间：截至 ${endDate}`
  } else {
    return '统计时间：当日'
  }
}

export default function TransactionsPage() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [filters, setFilters] = useState({
    email: '',
    startTime: '',
    endTime: '',
    tradeType: '',
    status: '',
  })
  const [page, setPage] = useState(1)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'info',
  })
  const [statistics, setStatistics] = useState(defaultStatistics)
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<TransactionDisplayItem[]>([])
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [listLoading, setListLoading] = useState(false)
  const rowsPerPage = 10

  // 构建统计时间参数
  const buildStatTime = (startTime?: string, endTime?: string): string => {
    if (startTime && endTime) {
      // 提取日期部分（去掉时间部分）
      const startDate = startTime.split('T')[0]
      const endDate = endTime.split('T')[0]
      return `${startDate} 至 ${endDate}`
    } else if (startTime) {
      const startDate = startTime.split('T')[0]
      return `${startDate} 至今`
    } else if (endTime) {
      const endDate = endTime.split('T')[0]
      return `截至 ${endDate}`
    } else {
      return '当日'
    }
  }

  // 加载统计数据
  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true)
      const statTime = buildStatTime(filters.startTime, filters.endTime)
      const response = await getOtcOverview({ statTime })
      
      // 处理响应数据
      const data = response.data as OtcOverviewResponse
      
      // 转换币种分布数据格式（从 currency 改为 key）
      const currencyDistribution = (data.currencyDistribution || []).map(item => ({
        key: item.currency,
        amount: item.amount
      }))
      
      setStatistics({
        latestTime: data.statTime || '',
        totalCount: data.totalTransactions?.amount || 0,
        cryptoCount: 0, // 接口未返回，保持0
        fiatCount: 0, // 接口未返回，保持0
        successCount: data.successTransactions?.amount || 0,
        buyCount: data.buyTransactions?.amount || 0,
        sellCount: data.sellTransactions?.amount || 0,
        currencyDistribution,
      })
    } catch (error) {
      console.error('加载统计数据失败:', error)
      setSnackbar({ 
        open: true, 
        message: '加载统计数据失败，请刷新重试', 
        severity: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }, [filters.startTime, filters.endTime])

  // 加载交易列表
  const loadTransactionList = useCallback(async () => {
    try {
      setListLoading(true)
      
      // 构建请求参数
      const params: {
        pageNum?: number
        pageSize?: number
        userEmail?: string
        startTime?: string
        endTime?: string
        tradeType?: string
      } = {
        pageNum: page,
        pageSize: rowsPerPage,
      }
       
      // 添加筛选条件
      if (filters.email) {
        params.userEmail = filters.email
      }
      
      // 日期格式转换：从 YYYY-MM-DDTHH:mm:ss 转换为 YYYY-MM-DD
      if (filters.startTime) {
        params.startTime = filters.startTime.split('T')[0]
      }
      if (filters.endTime) {
        params.endTime = filters.endTime.split('T')[0]
      }
      
      if (filters.tradeType) {
        params.tradeType = filters.tradeType
      }
      
      const response = await getOtcTransactionList(params)
      const data = response.data as OtcTransactionListResponse
      
      // 转换数据格式
      const mappedList = (data?.list || []).map(mapTransactionItem)
      setTransactions(mappedList)
      setTotalTransactions(data?.total || 0)
    } catch (error) {
      console.error('加载交易列表失败:', error)
      setSnackbar({
        open: true,
        message: '加载交易列表失败，请刷新重试',
        severity: 'error',
      })
    } finally {
      setListLoading(false)
    }
  }, [page, filters.email, filters.startTime, filters.endTime, filters.tradeType])

  // 初始加载和筛选条件变化时重新加载统计数据
  useEffect(() => {
    loadStatistics()
  }, [loadStatistics])

  // 初始加载和筛选条件、分页变化时重新加载交易列表
  useEffect(() => {
    loadTransactionList()
  }, [loadTransactionList])

  const handleToggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
    }
    return num.toString()
  }

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return ''
    
    // 检测是否是时间戳（纯数字字符串）
    if (/^\d+$/.test(dateStr)) {
      const timestamp = parseInt(dateStr, 10)
      
      // 判断是秒级还是毫秒级时间戳
      // 大于 10000000000 的是毫秒级，否则是秒级
      const date = timestamp > 10000000000 
        ? new Date(timestamp) 
        : new Date(timestamp * 1000)
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return dateStr
      }
      
      // 格式化为 YYYY-MM-DD HH:mm:ss
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
    
    // 如果已经是日期字符串，直接返回
    return dateStr
  }

  // 将字符串日期转换为 Date 对象（用于 AppReactDatepicker）
  const parseDateTimeString = (dateTimeStr: string): Date | null => {
    if (!dateTimeStr) return null
    // 支持两种格式：2025-11-11T17:43 或 2025-11-11 17:43:00
    const dateStr = dateTimeStr.includes('T') ? dateTimeStr : dateTimeStr.replace(' ', 'T')
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date
  }

  // 将 Date 对象转换为字符串格式（用于 API）
  // isStartTime: true 表示开始时间（00:00:00），false 表示结束时间（23:59:59）
  const formatDateToString = (date: Date | null, isStartTime: boolean = true): string => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    if (isStartTime) {
      // 开始时间：00:00:00
      return `${year}-${month}-${day}T00:00:00`
    } else {
      // 结束时间：23:59:59
      return `${year}-${month}-${day}T23:59:59`
    }
  }

  const handleReset = () => {
    setFilters({
      email: '',
      startTime: '',
      endTime: '',
      tradeType: '',
      status: '',
    })
    setPage(1)
  }

  const handleSearch = () => {
    // 重置到第一页
    setPage(1)
    // 重新加载统计数据
    loadStatistics()
    // 交易列表会在 useEffect 中自动重新加载
  }

  const handleExport = () => {
    // TODO: 实现导出逻辑
    setSnackbar({ open: true, message: '导出功能待实现', severity: 'info' })
  }

  // 分页数据（已由接口处理，直接使用）
  const paginatedData = transactions

  return (
    <div className='flex flex-col gap-6'>
      {/* 筛选器 */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardHeader title='筛选条件' />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label='用户Email'
                placeholder='输入用户Email'
                value={filters.email}
                onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-search-line' />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppReactDatepicker
                selected={parseDateTimeString(filters.startTime)}
                onChange={(date: Date | null) => {
                  setFilters({ 
                    ...filters, 
                    startTime: formatDateToString(date, true) 
                  })
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="选择开始日期"
                isClearable
                customInput={
                  <TextField
                    fullWidth
                    label="开始日期"
                    InputLabelProps={{ shrink: true }}
                  />
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppReactDatepicker
                selected={parseDateTimeString(filters.endTime)}
                onChange={(date: Date | null) => {
                  setFilters({ 
                    ...filters, 
                    endTime: formatDateToString(date, false) 
                  })
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="选择结束日期"
                isClearable
                minDate={parseDateTimeString(filters.startTime) || undefined}
                customInput={
                  <TextField
                    fullWidth
                    label="结束日期"
                    InputLabelProps={{ shrink: true }}
                  />
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>交易类型</InputLabel>
                <Select
                  value={filters.tradeType}
                  label='交易类型'
                  onChange={(e) => setFilters({ ...filters, tradeType: e.target.value })}
                >
                  <MenuItem value=''>全部</MenuItem>
                  <MenuItem value='buy'>买入</MenuItem>
                  <MenuItem value='sell'>卖出</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <div className='flex justify-between p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>
          <Button
            color='secondary'
            variant='outlined'
            startIcon={<i className='ri-download-line' />}
            onClick={handleExport}
            className='max-sm:is-full'
          >
            导出 Excel
          </Button>
          <div className='flex items-center gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
            <Button
              variant='outlined'
              startIcon={<i className='ri-restart-line' />}
              onClick={handleReset}
              className='max-sm:is-full'
            >
              重置
            </Button>
            <Button
              variant='contained'
              startIcon={<i className='ri-search-line' />}
              onClick={handleSearch}
              className='max-sm:is-full'
            >
              查询
            </Button>
          </div>
        </div>
      </Card>

      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardHeader 
          title='统计数据'
          subheader={getStatisticsTimeRange(filters)}
          action={
            loading && (
              <CircularProgress size={24} />
            )
          }
        />
        <CardContent>

        {/* 关键指标横向布局 */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {/* 总交易量 */}
          <Card sx={{ minWidth: 200, flex: 1, maxWidth: 240, boxShadow: 1 }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: '#e3f2fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <i className='ri-pulse-line' style={{ fontSize: 24, color: '#1976d2' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                    总交易量
                  </Typography>
                  <Typography variant='h5' sx={{ fontWeight: 600, color: '#212121', lineHeight: 1.2 }}>
                    {statistics.totalCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* 成功交易 */}
          <Card sx={{ minWidth: 200, flex: 1, maxWidth: 240, boxShadow: 1 }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: '#e8f5e9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <i className='ri-checkbox-circle-line' style={{ fontSize: 24, color: '#2e7d32' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                    成功交易
                  </Typography>
                  <Typography variant='h5' sx={{ fontWeight: 600, color: '#2e7d32', lineHeight: 1.2 }}>
                    {statistics.successCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* 买入交易 */}
          <Card sx={{ minWidth: 200, flex: 1, maxWidth: 240, boxShadow: 1 }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: '#e3f2fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <i className='ri-arrow-down-left-line' style={{ fontSize: 24, color: '#1976d2' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                    买入交易
                  </Typography>
                  <Typography variant='h5' sx={{ fontWeight: 600, color: '#212121', lineHeight: 1.2 }}>
                    {statistics.buyCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* 卖出交易 */}
          <Card sx={{ minWidth: 200, flex: 1, maxWidth: 240, boxShadow: 1 }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: '#fff3e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <i className='ri-arrow-up-right-line' style={{ fontSize: 24, color: '#ed6c02' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                    卖出交易
                  </Typography>
                  <Typography variant='h5' sx={{ fontWeight: 600, color: '#212121', lineHeight: 1.2 }}>
                    {statistics.sellCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* 币种分布单独一行 */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
            <i className='ri-line-chart-line' style={{ fontSize: 18, color: '#1976d2' }} />
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              兑换目标币种分布
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {statistics.currencyDistribution.map((item) => (
              <Card
                key={item.key}
                sx={{
                  minWidth: 140,
                  boxShadow: 1,
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ fontSize: '0.75rem', display: 'block', mb: 1 }}
                  >
                    {item.key}
                  </Typography>
                  <Typography variant='body1' sx={{ fontWeight: 600, fontFamily: 'monospace', color: '#212121' }}>
                    {formatNumber(item.amount)}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
        </CardContent>
      </Card>

      {/* 交易列表 */}
      <Card sx={{ boxShadow: 2 }}>
        <CardHeader
          title='交易列表'
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title='刷新'>
                <IconButton size='small'>
                  <i className='ri-refresh-line' />
                </IconButton>
              </Tooltip>
              <Tooltip title='导出'>
                <IconButton size='small' onClick={handleExport}>
                  <i className='ri-download-line' />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell width={50}></TableCell>
                <TableCell sx={{ fontWeight: 500 }}>编号</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>用户</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>交易编号</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>交易类型</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>来源资产</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>目标资产</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>交易时间</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>交易状态</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listLoading ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((transaction) => (
                <React.Fragment key={transaction.id}>
                  <TableRow
                    hover
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}
                    onClick={() => handleToggleRow(transaction.id)}
                  >
                    <TableCell>
                      <IconButton size='small'>
                        {expandedRow === transaction.id ? (
                          <i className='ri-arrow-down-s-line' />
                        ) : (
                          <i className='ri-arrow-right-s-line' />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{transaction.id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant='body2' sx={{ color: '#1976d2' }}>
                          {transaction.user.email}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {transaction.user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {transaction.transactionId}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type === 'buy' ? '买入' : '卖出'}
                        size="small"
                        icon={transaction.type === 'buy' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        sx={{
                          bgcolor: transaction.type === 'buy' ? '#e8f5e9' : '#ffebee',
                          color: transaction.type === 'buy' ? '#2e7d32' : '#d32f2f',
                          fontWeight: 500,
                          border: 'none',
                        }}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip
                          label={transaction.sourceAssetKey}
                          size='small'
                          variant='outlined'
                          sx={{ fontFamily: 'monospace', mb: 0.5 }}
                        />
                        <Typography
                          variant='body2'
                          sx={{
                            fontFamily: 'monospace',
                            color: '#d32f2f',
                            fontWeight: 500,
                          }}
                        >
                          -{formatNumber(transaction.sourceAmount)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip
                          label={transaction.targetAssetKey}
                          size='small'
                          variant='outlined'
                          sx={{ fontFamily: 'monospace', mb: 0.5 }}
                        />
                        <Typography
                          variant='body2'
                          sx={{
                            fontFamily: 'monospace',
                            color: '#2e7d32',
                            fontWeight: 500,
                          }}
                        >
                          +{formatNumber(transaction.targetAmount)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {formatDateTime(transaction.transactionTime)}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        let color: "success" | "error" | "warning" | "info" | "default" = "default"
                        // 使用接口返回的状态标签，如果没有则根据状态值判断
                        let label = transaction.statusLabel || '未知'
                        
                        // 根据状态值或状态标签判断颜色
                        const statusLower = (transaction.status || '').toLowerCase()
                        const labelLower = label.toLowerCase()
                        
                        if (statusLower === 'success' || statusLower === 'completed' || labelLower.includes('成功') || labelLower.includes('完成')) {
                          color = "success"
                        } else if (statusLower === 'pending' || statusLower === 'processing' || labelLower.includes('处理中') || labelLower.includes('待处理')) {
                          color = "warning"
                        } else if (statusLower === 'failed' || statusLower === 'error' || labelLower.includes('失败') || labelLower.includes('错误')) {
                          color = "error"
                        } else {
                          color = "default"
                        }
                        
                        return (
                          <Chip 
                            label={label} 
                            color={color} 
                            size="small" 
                            variant="tonal" 
                          />
                        )
                      })()}
                    </TableCell>
                  </TableRow>

                  {/* 展开详情 */}
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      sx={{ p: 0, borderBottom: expandedRow === transaction.id ? '1px solid #e0e0e0' : 'none' }}
                    >
                      <Collapse in={expandedRow === transaction.id} timeout='auto' unmountOnExit>
                        <Box sx={{ p: 3, bgcolor: '#fafafa' }}>
                          <Box
                            sx={{
                              mb: 3,
                              p: 2,
                              bgcolor: '#fff',
                              borderRadius: 2,
                              border: '1px solid #e0e0e0',
                            }}
                          >
                            <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 500 }}>
                              兑换概览
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Chip
                                  label={transaction.sourceAssetKey}
                                  sx={{
                                    mb: 1,
                                    bgcolor: '#ffebee',
                                    color: '#d32f2f',
                                    fontWeight: 500,
                                    fontFamily: 'monospace',
                                  }}
                                />
                                <Typography
                                  variant='h6'
                                  sx={{ fontFamily: 'monospace', color: '#d32f2f', fontWeight: 600 }}
                                >
                                  -{formatNumber(transaction.sourceAmount)}
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  {transaction.sourceAssetType}
                                </Typography>
                              </Box>
                              <Box>
                                <i className='ri-arrow-right-line' style={{ fontSize: 32, color: '#9e9e9e' }} />
                              </Box>
                              <Box sx={{ textAlign: 'center' }}>
                                <Chip
                                  label={transaction.targetAssetKey}
                                  sx={{
                                    mb: 1,
                                    bgcolor: '#e8f5e9',
                                    color: '#2e7d32',
                                    fontWeight: 500,
                                    fontFamily: 'monospace',
                                  }}
                                />
                                <Typography
                                  variant='h6'
                                  sx={{ fontFamily: 'monospace', color: '#2e7d32', fontWeight: 600 }}
                                >
                                  +{formatNumber(transaction.targetAmount)}
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  {transaction.targetAssetType}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
                            <Box>
                              <Typography variant='caption' color='text.secondary'>
                                来源资产类型：
                              </Typography>
                              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                {transaction.sourceAssetType}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant='caption' color='text.secondary'>
                                目标资产类型：
                              </Typography>
                              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                {transaction.targetAssetType}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant='caption' color='text.secondary'>
                                来源资产Key：
                              </Typography>
                              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                {transaction.sourceAssetKey}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant='caption' color='text.secondary'>
                                目标资产Key：
                              </Typography>
                              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                {transaction.targetAssetKey}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant='caption' color='text.secondary'>
                                来源资产行情：
                              </Typography>
                              <Typography variant='body2' sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                                {transaction.sourcePrice}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant='caption' color='text.secondary'>
                                目标资产行情：
                              </Typography>
                              <Typography variant='body2' sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                                {transaction.targetPrice}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant='caption' color='text.secondary'>
                                来源资产数量：
                              </Typography>
                              <Typography variant='body2' sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                                {transaction.sourceAmount}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant='caption' color='text.secondary'>
                                目标资产数量：
                              </Typography>
                              <Typography variant='body2' sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                                {transaction.targetAmount}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mt: 2 }}>
                            <Box>
                              <Typography variant='caption' color='text.secondary'>
                                报价开始时间：
                              </Typography>
                              <Typography variant='body2' sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                                {formatDateTime(transaction.quoteStartTime)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant='caption' color='text.secondary'>
                                报价结束时间：
                              </Typography>
                              <Typography variant='body2' sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                                {formatDateTime(transaction.quoteEndTime)}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ mt: 2 }}>
                            <Typography variant='caption' color='text.secondary'>
                              交易时间：
                            </Typography>
                            <Typography variant='body2' sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                              {formatDateTime(transaction.transactionTime)}
                            </Typography>
                          </Box>

                          <Box sx={{ mt: 2 }}>
                            <Typography variant='caption' color='text.secondary'>
                              交易备注：
                            </Typography>
                            <Typography variant='body2' sx={{ mt: 0.5 }}>
                              {transaction.note}
                            </Typography>
                          </Box>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: '1px solid #e0e0e0' }}>
          <Pagination
            count={Math.ceil(totalTransactions / rowsPerPage)}
            page={page}
            onChange={(e, p) => setPage(p)}
            color='primary'
            disabled={listLoading}
          />
        </Box>
      </Card>

      {/* Snackbar 提示 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

