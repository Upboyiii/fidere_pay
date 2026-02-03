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
import Drawer from '@mui/material/Drawer'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { getUserTransferList, getTransferDetail, type TransferDetailItem } from '@server/otc-api'
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// 获取 API 基础地址（用于文件下载）
const getApiBaseUrl = () => {
  // 优先使用环境变量
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL
  }
  // 根据当前环境判断
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://192.168.5.111:9009'
  }
  return 'https://server.fidere.xyz'
}

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
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<TransferDetailItem | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

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

  const handleViewDetail = async (record: TransferDetailItem) => {
    setDrawerOpen(true)
    setDetailLoading(true)
    setSelectedRecord(null)
    try {
      const res = await getTransferDetail({ applyNo: record.applyNo })
      const detail = res.data?.data || res.data
      setSelectedRecord(detail as TransferDetailItem)
    } catch (error) {
      console.error('获取转账详情失败:', error)
      toast.error('获取转账详情失败')
      // 如果接口失败，使用列表中的数据作为兜底
      setSelectedRecord(record)
    } finally {
      setDetailLoading(false)
    }
  }

  const getRemitTypeLabel = (type: number) => {
    return type === 1 ? 'SWIFT汇款' : '本地汇款'
  }

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '-'
    const ms = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp
    return new Date(ms).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Box 
      sx={{ 
        p: 6, 
        position: 'relative', 
        minHeight: '100%',
        bgcolor: 'background.default' 
      }}
    >
      {/* 现代感网格背景 */}
      <Box 
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: (theme) => theme.palette.mode === 'dark' 
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

      {/* 页面卡片容器 */}
      <Card 
        sx={{ 
          position: 'relative', 
          zIndex: 1,
          borderRadius: '20px',
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 4px 24px rgba(0,0,0,0.4)' 
            : '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.08)' 
            : 'rgba(0,0,0,0.05)',
          p: 6,
          bgcolor: 'background.paper'
        }}
      >
        <Grid container spacing={6}>
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
                              {record.payeeName || `收款人 #${record.payeeId}`}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {record.currencyCode} → {record.receiveCurrencyCode}
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
                            {(record.receiveAmount || (record.transferAmount ?? 0) * (record.exchangeRate ?? 0)).toLocaleString()} {record.receiveCurrencyCode}
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
                            {formatTimestamp(record.createTime || record.createdAt)}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Button 
                            size='small' 
                            variant='text' 
                            sx={{ fontWeight: 600 }}
                            onClick={() => handleViewDetail(record)}
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
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        anchor='right'
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { 
            width: { xs: '100%', sm: 500 },
            borderTopLeftRadius: '0',
            borderBottomLeftRadius: '0'
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
          {/* 头部 */}
          <Box sx={{ px: 5, py: 4, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant='h6' sx={{ fontWeight: 600, fontSize: '18px' }}>
                汇款订单详情
              </Typography>
              <IconButton 
                onClick={() => setDrawerOpen(false)} 
                size='small'
                sx={{ 
                  width: 32,
                  height: 32,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <i className='ri-close-line' style={{ fontSize: '20px' }} />
              </IconButton>
            </Box>
          </Box>

          {/* 加载状态 */}
          {detailLoading && (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          )}

          {/* 内容 */}
          {!detailLoading && selectedRecord && (
            <>

            {/* 内容区域 */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 5, py: 4, bgcolor: '#fafafa' }}>
              {/* 状态和时间 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: selectedRecord.status === 2 ? '#52c41a' : 
                               selectedRecord.status === 1 ? '#faad14' : 
                               selectedRecord.status === 3 || selectedRecord.status === 4 ? '#ff4d4f' : 
                               '#d9d9d9'
                    }}
                  />
                  <Typography variant='body2' sx={{ fontWeight: 500, fontSize: '14px', color: '#000' }}>
                    {getStatusLabel(selectedRecord.status)}
                  </Typography>
                </Box>
                <Typography variant='caption' sx={{ fontSize: '12px', color: '#8c8c8c' }}>
                  {formatTimestamp(selectedRecord.createTime || selectedRecord.createdAt)}
                </Typography>
              </Box>

              {/* 金额显示区域 */}
              <Box
                sx={{
                  bgcolor: '#f5f5f5',
                  borderRadius: '8px',
                  p: 4,
                  mb: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #e8e8e8'
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant='caption' sx={{ display: 'block', mb: 1.5, fontSize: '12px', color: '#8c8c8c' }}>
                    支付金额
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#000', fontFamily: 'monospace' }}>
                    {selectedRecord.currencyCode} {selectedRecord.transferAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>

                <Box sx={{ px: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: '#1890ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1
                    }}
                  >
                    <i className='ri-arrow-right-line' style={{ color: 'white', fontSize: '24px' }} />
                  </Box>
                  <Typography variant='caption' sx={{ fontSize: '11px', color: '#8c8c8c', textAlign: 'center', lineHeight: 1.3 }}>
                    汇率<br />{selectedRecord.exchangeRate.toFixed(4)}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, textAlign: 'right' }}>
                  <Typography variant='caption' sx={{ display: 'block', mb: 1.5, fontSize: '12px', color: '#8c8c8c' }}>
                    到账金额
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#52c41a', fontFamily: 'monospace' }}>
                    {selectedRecord.receiveCurrencyCode} {(selectedRecord.receiveAmount || (selectedRecord.transferAmount * selectedRecord.exchangeRate)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>

              {/* 基本信息 */}
              <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2.5, fontSize: '14px', color: '#000' }}>
                基本信息
              </Typography>
              <Box sx={{ mb: 4, bgcolor: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2.5, borderBottom: '1px solid #f0f0f0' }}>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: '#595959' }}>交易ID：</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '12px', color: '#262626' }}>
                      {selectedRecord.applyNo}
                    </Typography>
                    <IconButton 
                      size='small' 
                      sx={{ width: 24, height: 24, p: 0 }}
                      onClick={() => {
                        navigator.clipboard.writeText(selectedRecord.applyNo)
                        toast.success('已复制')
                      }}
                    >
                      <i className='ri-file-copy-line' style={{ fontSize: '14px', color: '#8c8c8c' }} />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #f0f0f0' }}>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: '#595959' }}>汇款类型：</Typography>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: '#262626' }}>{getRemitTypeLabel(selectedRecord.remitType || 1)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #f0f0f0' }}>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: '#595959' }}>手续费：</Typography>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: '#262626' }}>{(selectedRecord.feeAmount || selectedRecord.fee || 0)} {selectedRecord.currencyCode}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #f0f0f0' }}>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: '#595959' }}>固定手续费：</Typography>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: '#8c8c8c' }}>{selectedRecord.fixedFee || 0} {selectedRecord.currencyCode}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #f0f0f0' }}>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: '#595959' }}>比例手续费：</Typography>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: '#8c8c8c' }}>{selectedRecord.ratioFee || 0} {selectedRecord.currencyCode}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #f0f0f0' }}>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: '#595959' }}>汇款目的：</Typography>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: '#262626' }}>{selectedRecord.purposeType || '-'}</Typography>
                </Box>
                {selectedRecord.purposeDesc && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: '#595959' }}>目的说明：</Typography>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: '#262626', maxWidth: '60%', textAlign: 'right' }}>{selectedRecord.purposeDesc}</Typography>
                  </Box>
                )}
                {selectedRecord.memo && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: '#595959' }}>交易备注：</Typography>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: '#262626', maxWidth: '60%', textAlign: 'right' }}>{selectedRecord.memo}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5 }}>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: '#595959' }}>更新时间：</Typography>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: '#262626' }}>{formatTimestamp(selectedRecord.updateTime || selectedRecord.updatedAt)}</Typography>
                </Box>
              </Box>

              {/* 收款人信息 */}
              <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2.5, fontSize: '14px', color: 'text.primary' }}>
                收款人信息
              </Typography>
              <Box sx={{ mb: 4, bgcolor: 'background.paper', borderRadius: '8px', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.secondary' }}>收款人姓名：</Typography>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.primary', fontWeight: 600 }}>{selectedRecord.payeeName || '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5 }}>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.secondary' }}>收款人ID：</Typography>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.primary', fontFamily: 'monospace' }}>{selectedRecord.payeeId}</Typography>
                </Box>
              </Box>

              {/* 审核信息 (仅审核后显示) */}
              {!!(selectedRecord.auditRemark || (selectedRecord.auditTime ?? 0) > 0 || (selectedRecord.completeTime ?? 0) > 0) && (
                <>
                  <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2.5, fontSize: '14px', color: 'text.primary' }}>
                    审核信息
                  </Typography>
                  <Box sx={{ mb: 4, bgcolor: 'background.paper', borderRadius: '8px', overflow: 'hidden' }}>
                    {selectedRecord.auditRemark && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.secondary' }}>审核备注：</Typography>
                        <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.primary', maxWidth: '60%', textAlign: 'right' }}>{selectedRecord.auditRemark}</Typography>
                      </Box>
                    )}
                    {(selectedRecord.auditTime ?? 0) > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: (selectedRecord.completeTime ?? 0) > 0 ? '1px solid' : 'none', borderColor: 'divider' }}>
                        <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.secondary' }}>审核时间：</Typography>
                        <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.primary' }}>{formatTimestamp(selectedRecord.auditTime)}</Typography>
                      </Box>
                    )}
                    {(selectedRecord.completeTime ?? 0) > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5 }}>
                        <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.secondary' }}>完成时间：</Typography>
                        <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.primary' }}>{formatTimestamp(selectedRecord.completeTime)}</Typography>
                      </Box>
                    )}
                  </Box>
                </>
              )}

              {/* 交易材料 */}
              <Box sx={{ mb: 4 }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2.5, fontSize: '14px', color: '#000' }}>
                  交易材料
                </Typography>
                <Box sx={{ bgcolor: '#fff', borderRadius: '8px', p: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: '#262626' }}>交易凭证</Typography>
                    <Button
                      variant='contained'
                      size='small'
                      startIcon={<i className='ri-download-line' />}
                      disabled={!selectedRecord.transactionMaterial}
                      onClick={() => {
                        if (selectedRecord.transactionMaterial) {
                          const baseUrl = getApiBaseUrl()
                          window.open(`${baseUrl}/${selectedRecord.transactionMaterial}`, '_blank')
                        }
                      }}
                      sx={{ 
                        bgcolor: '#1890ff',
                        color: '#fff',
                        borderRadius: '6px',
                        px: 3,
                        py: 1,
                        fontSize: '13px',
                        fontWeight: 500,
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#40a9ff',
                          boxShadow: 'none'
                        },
                        '&:disabled': {
                          bgcolor: '#f5f5f5',
                          color: '#bfbfbf'
                        }
                      }}
                    >
                      下载材料
                    </Button>
                  </Box>
                </Box>
                {!selectedRecord.transactionMaterial && (
                  <Typography variant='caption' sx={{ fontSize: '12px', color: '#8c8c8c', display: 'block', pl: 1 }}>
                    暂无材料
                  </Typography>
                )}
              </Box>

              {/* 回执单 */}
              <Box>
                <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2.5, fontSize: '14px', color: 'text.primary' }}>
                  回执单
                </Typography>
                <Box sx={{ bgcolor: 'background.paper', borderRadius: '8px', p: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.primary' }}>汇款回执单</Typography>
                    <Button
                      variant='contained'
                      size='small'
                      startIcon={<i className='ri-download-line' />}
                      disabled={!selectedRecord.receiptUrl}
                      onClick={() => {
                        if (selectedRecord.receiptUrl) {
                          const baseUrl = getApiBaseUrl()
                          window.open(`${baseUrl}/${selectedRecord.receiptUrl}`, '_blank')
                        } else {
                          toast.info('暂无回执单')
                        }
                      }}
                      sx={{ 
                        bgcolor: '#1890ff',
                        color: '#fff',
                        borderRadius: '6px',
                        px: 3,
                        py: 1,
                        fontSize: '13px',
                        fontWeight: 500,
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#40a9ff',
                          boxShadow: 'none'
                        },
                        '&:disabled': {
                          bgcolor: '#f5f5f5',
                          color: '#bfbfbf'
                        }
                      }}
                    >
                      下载回执单
                    </Button>
                  </Box>
                </Box>
                {!selectedRecord.receiptUrl && (
                  <Typography variant='caption' sx={{ fontSize: '12px', color: 'text.disabled', display: 'block', pl: 1 }}>
                    回执单将在汇款完成后生成
                  </Typography>
                )}
              </Box>
            </Box>

            {/* 底部按钮 */}
            <Box sx={{ px: 5, py: 4, borderTop: '1px solid #f0f0f0', bgcolor: '#fff', display: 'flex', gap: 2 }}>
              <Button
                variant='outlined'
                onClick={() => setDrawerOpen(false)}
                sx={{ 
                  flex: 1,
                  borderRadius: '6px',
                  py: 1.5,
                  fontSize: '14px',
                  fontWeight: 500,
                  textTransform: 'none',
                  borderColor: '#d9d9d9',
                  color: '#595959',
                  '&:hover': {
                    borderColor: '#40a9ff',
                    color: '#40a9ff',
                    bgcolor: 'transparent'
                  }
                }}
              >
                取消
              </Button>
              <Button
                variant='contained'
                onClick={() => setDrawerOpen(false)}
                sx={{ 
                  flex: 1,
                  borderRadius: '6px',
                  py: 1.5,
                  fontSize: '14px',
                  fontWeight: 500,
                  textTransform: 'none',
                  bgcolor: '#1890ff',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#40a9ff',
                    boxShadow: 'none'
                  }
                }}
              >
                确认
              </Button>
            </Box>
          </>
        )}
        </Box>
      </Drawer>
    </Box>
  )
}

export default RemittanceRecords
