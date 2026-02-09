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
import { getUserTransferList, getTransferDetail, downloadTransferPdf, type TransferDetailItem } from '@server/otc-api'
import { toast } from 'react-toastify'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Utils Imports
import { TokenManager } from '@/utils/tokenManager'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// 获取 API 基础地址（用于文件下载）
const getApiBaseUrl = () => {
  // 优先使用环境变量（用于直接访问后端）
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL
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
  const t = useTranslate()
  
  // 根据当前语言设置日期格式化的 locale
  const getDateLocale = () => {
    if (currentLang === 'en') return 'en-US'
    if (currentLang === 'zh-Hant') return 'zh-TW'
    return 'zh-CN'
  }
  
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
  const loadRecords = async (customFilters?: typeof filters, customPage?: number) => {
    setLoading(true)
    try {
      const currentFilters = customFilters || filters
      const currentPage = customPage !== undefined ? customPage : page

      // 转换日期为时间戳（秒级）
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

      const res = await getUserTransferList({
        pageNum: currentPage + 1,
        pageSize: rowsPerPage,
        status: currentFilters.status !== '-1' ? Number(currentFilters.status) : undefined,
        applyNo: currentFilters.applyNo || undefined,
        startTime: startTime ? String(startTime) : undefined,
        endTime: endTime ? String(endTime) : undefined
      })
      
      const responseData = res.data as any
      setRecords(responseData?.list || responseData?.data?.list || [])
      setTotal(responseData?.total || responseData?.data?.total || 0)
    } catch (error) {
      console.error('加载汇款记录失败:', error)
      toast.error(t('remittance.loadRecordsFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage])

  const getStatusLabel = (status: number) => {
    const statusMap: Record<number, string> = {
      0: t('remittance.pending'),
      1: t('remittance.processing'),
      2: t('remittance.paymentSuccess'),
      3: t('remittance.rejected'),
      4: t('remittance.failed')
    }
    return statusMap[status] || t('common.unknown')
  }

  const getStatusColor = (status: number) => {
    if (status === 2) return 'success' // 付款成功
    if (status === 1) return 'warning' // 处理中
    if (status === 3 || status === 4) return 'error' // 已驳回/失败
    return 'info' // 待确认
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
      toast.error(t('remittance.getDetailFailed'))
      // 如果接口失败，使用列表中的数据作为兜底
      setSelectedRecord(record)
    } finally {
      setDetailLoading(false)
    }
  }

  const getRemitTypeLabel = (type: number) => {
    // 根据 JSON 数据，remitType: 2 表示 SWIFT
    return type === 2 ? 'SWIFT' : type === 1 ? t('remittance.localRemittance') : 'SWIFT'
  }

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '-'
    const ms = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp
    return new Date(ms).toLocaleString(getDateLocale(), {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // 下载转账记录PDF
  const handleDownloadPdf = async (applyNo: string) => {
    try {
      // 获取 token
      const tokens = TokenManager.getTokens()
      const accessToken = tokens?.accessToken || null
      
      // 使用 API 路径（通过 Next.js rewrites 代理），GET 请求参数通过查询字符串传递
      const downloadUrl = `/_api/v1/biz/user/transfer/download-pdf?applyNo=${encodeURIComponent(applyNo)}`
      
      // 使用 fetch 下载文件
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': accessToken ? `Bearer ${accessToken}` : '',
          'Accept': 'application/pdf'
        }
      })
      
      if (!response.ok) {
        // 尝试解析错误信息
        try {
          const errorData = await response.json()
          throw new Error(errorData?.message || errorData?.msg || '下载失败')
        } catch {
          throw new Error('下载失败')
        }
      }
      
      // 检查响应类型
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        // 如果返回的是 JSON（可能是错误信息），解析并抛出错误
        const errorData = await response.json()
        throw new Error(errorData?.message || errorData?.msg || '下载失败')
      }
      
      // 获取文件 blob
      const blob = await response.blob()
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${t('remittance.transferRecord')}_${applyNo}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success(t('remittance.downloadSuccess'))
    } catch (error) {
      console.error('下载失败:', error)
      toast.error(error instanceof Error ? error.message : t('remittance.downloadFailed'))
    }
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
                {t('remittance.remittanceRecords')}
              </Typography>
              <Typography color='text.secondary'>
                {t('remittance.viewAllRemittancesDesc')}
              </Typography>
            </Box>
            <Button 
              variant='contained' 
              startIcon={<i className='ri-add-line' />} 
              onClick={() => router.push(getLocalizedPath('/remittance/create', currentLang))}
              sx={{ borderRadius: '8px', px: 6 }}
            >
              {t('remittance.createNewRemittance')}
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
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>{t('remittance.transactionId')}</Typography>
                    <TextField
                      fullWidth
                      size='small'
                      placeholder={t('remittance.enterTransactionId')}
                      value={filters.applyNo}
                      onChange={(e) => setFilters({ ...filters, applyNo: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>{t('remittance.orderStatus')}</Typography>
                    <FormControl fullWidth size='small'>
                      <Select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        displayEmpty
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value='-1'>{t('remittance.allOrders')}</MenuItem>
                        <MenuItem value='0'>{t('remittance.pending')}</MenuItem>
                        <MenuItem value='1'>{t('remittance.processing')}</MenuItem>
                        <MenuItem value='2'>{t('remittance.paymentSuccess')}</MenuItem>
                        <MenuItem value='3'>{t('remittance.rejected')}</MenuItem>
                        <MenuItem value='4'>{t('remittance.failed')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>{t('remittance.orderTime')}</Typography>
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
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>{t('remittance.orderTime')}</Typography>
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
                    const resetFilters = { applyNo: '', status: '-1', startDate: '', endDate: '' }
                    setFilters(resetFilters)
                    setPage(0)
                    loadRecords(resetFilters, 0)
                  }}
                  sx={{ color: 'text.secondary' }}
                >
                  {t('common.reset')}
                </Button>
                <Button 
                  variant='contained' 
                  size='small' 
                  startIcon={<i className='ri-search-line' />} 
                  onClick={() => loadRecords()}
                  disabled={loading}
                  sx={{ borderRadius: '8px', px: 6 }}
                >
                  {t('common.search')}
                </Button>
                {/* <Button variant='text' size='small' onClick={() => setShowFilters(false)} startIcon={<i className='ri-arrow-up-line' />}>
                  收起
                </Button> */}
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
                {t('remittance.allRemittanceOrders')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton size='small' onClick={() => loadRecords()} disabled={loading}>
                  {loading ? <CircularProgress size={20} /> : <i className='ri-refresh-line' />}
                </IconButton>
                {/* <IconButton size='small'><i className='ri-fullscreen-line' /></IconButton> */}
                {/* <IconButton size='small'><i className='ri-settings-3-line' /></IconButton> */}
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
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('remittance.payeeName')}</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('remittance.deductionAmount')}</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('remittance.receiveAmount')}</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('remittance.remittanceMethod')}</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('common.status')}</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('common.createTime')}</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('remittance.transactionId')}</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '40px', textAlign: 'center' }}>
                        <CircularProgress />
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        {t('remittance.noRemittanceRecords')}
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => {
                      // 获取收款人信息，优先使用 payeeName，如果为空则使用 payeeAccountName
                      const payeeName = (record as any).payeeName || (record as any).payeeAccountName || `收款人 #${record.payeeId}`
                      const payeeAccountNo = (record as any).payeeAccountNo || '-'
                      const payeeSwiftCode = (record as any).payeeSwiftCode || ''
                      
                      return (
                        <tr key={record.id} className='hover:bg-actionHover transition-colors' style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                          <td style={{ padding: '16px 24px' }}>
                            <Box>
                              <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                                {t('remittance.payee')}: {payeeName}
                              </Typography>
                              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                                {t('remittance.bankAccount')}: {payeeAccountNo}
                              </Typography>
                              {payeeSwiftCode && (
                                <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                  {t('remittance.swiftCode')}: {payeeSwiftCode}
                                </Typography>
                              )}
                            </Box>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <Typography variant='body2' sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.primary' }}>
                              {(record.transferAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 8 })} {record.currencyCode}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <Typography variant='body2' sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
                              {(record.receiveAmount || (record.transferAmount ?? 0) * (record.exchangeRate ?? 1)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 8 })} {record.receiveCurrencyCode}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <Typography variant='body2' sx={{ color: 'text.primary' }}>
                              {getRemitTypeLabel(record.remitType)}
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
                            <Typography variant='body2' sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                              {formatTimestamp(record.createTime || (record as any).createdAt)}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                              {record.applyNo}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <Button 
                              size='small' 
                              variant='text' 
                              sx={{ fontWeight: 600 }}
                              onClick={() => handleViewDetail(record)}
                            >
                              {t('remittance.detail')}
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </Box>
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='caption' color='text.disabled'>
                {t('remittance.totalRecords', { count: total })}
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
                {t('remittance.orderDetail')}
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
                    {t('remittance.paymentAmount')}
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
                    {t('remittance.exchangeRate')}<br />{selectedRecord.exchangeRate.toFixed(4)}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, textAlign: 'right' }}>
                  <Typography variant='caption' sx={{ display: 'block', mb: 1.5, fontSize: '12px', color: '#8c8c8c' }}>
                    {t('remittance.arrivalAmount')}
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
                {t('remittance.payeeInfo')}
              </Typography>
              <Box sx={{ mb: 4, bgcolor: 'background.paper', borderRadius: '8px', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.secondary' }}>{t('remittance.payeeNameLabel')}：</Typography>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.primary', fontWeight: 600 }}>{selectedRecord.payeeInfo?.accountName || '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5 }}>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.secondary' }}>{t('remittance.payeeId')}：</Typography>
                  <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.primary', fontFamily: 'monospace' }}>{selectedRecord.payeeId}</Typography>
                </Box>
              </Box>

              {/* 审核信息 (仅审核后显示) */}
              {!!(selectedRecord.auditRemark || (selectedRecord.auditTime ?? 0) > 0 || (selectedRecord.completeTime ?? 0) > 0) && (
                <>
                  <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2.5, fontSize: '14px', color: 'text.primary' }}>
                    {t('remittance.auditInfo')}
                  </Typography>
                  <Box sx={{ mb: 4, bgcolor: 'background.paper', borderRadius: '8px', overflow: 'hidden' }}>
                    {selectedRecord.auditRemark && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.secondary' }}>{t('remittance.auditRemark')}：</Typography>
                        <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.primary', maxWidth: '60%', textAlign: 'right' }}>{selectedRecord.auditRemark}</Typography>
                      </Box>
                    )}
                    {(selectedRecord.auditTime ?? 0) > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: (selectedRecord.completeTime ?? 0) > 0 ? '1px solid' : 'none', borderColor: 'divider' }}>
                        <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.secondary' }}>{t('remittance.auditTime')}：</Typography>
                        <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.primary' }}>{formatTimestamp(selectedRecord.auditTime)}</Typography>
                      </Box>
                    )}
                    {(selectedRecord.completeTime ?? 0) > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5 }}>
                        <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.secondary' }}>{t('remittance.completeTime')}：</Typography>
                        <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.primary' }}>{formatTimestamp(selectedRecord.completeTime)}</Typography>
                      </Box>
                    )}
                  </Box>
                </>
              )}

              {/* 交易材料 */}
              <Box sx={{ mb: 4 }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2.5, fontSize: '14px', color: '#000' }}>
                  {t('remittance.transactionMaterials')}
                </Typography>
                <Box sx={{ bgcolor: '#fff', borderRadius: '8px', p: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: '#262626' }}>{t('remittance.transactionVoucher')}</Typography>
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
                      {t('remittance.downloadMaterial')}
                    </Button>
                  </Box>
                </Box>
                {!selectedRecord.transactionMaterial && (
                  <Typography variant='caption' sx={{ fontSize: '12px', color: '#8c8c8c', display: 'block', pl: 1 }}>
                    {t('remittance.noMaterial')}
                  </Typography>
                )}
              </Box>

              {/* 回执单 */}
              <Box>
                <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2.5, fontSize: '14px', color: 'text.primary' }}>
                  {t('remittance.receipt')}
                </Typography>
                <Box sx={{ bgcolor: 'background.paper', borderRadius: '8px', p: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.primary' }}>{t('remittance.remittanceReceipt')}</Typography>
                    <Button
                      variant='contained'
                      size='small'
                      startIcon={<i className='ri-download-line' />}
                      disabled={selectedRecord.status !== 2}
                      onClick={() => {
                        if (selectedRecord.status === 2) {
                          handleDownloadPdf(selectedRecord.applyNo)
                        } else {
                          toast.info(t('remittance.onlyCompletedCanDownload'))
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
                      {t('remittance.downloadReceipt')}
                    </Button>
                  </Box>
                </Box>
                {!selectedRecord.receiptUrl && (
                  <Typography variant='caption' sx={{ fontSize: '12px', color: 'text.disabled', display: 'block', pl: 1 }}>
                    {t('remittance.receiptWillGenerate')}
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
                {t('common.cancel')}
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
                {t('remittance.confirm')}
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
