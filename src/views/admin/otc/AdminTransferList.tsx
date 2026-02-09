'use client'

// React Imports
import { useState, useEffect, useRef, useCallback } from 'react'

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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { getAdminTransferList, auditTransfer, completeTransfer, type AdminTransferListItem, type TransferDetailItem } from '@server/otc-api'
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

const AdminTransferList = ({ mode }: { mode: Mode }) => {
  const t = useTranslate()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [data, setData] = useState<AdminTransferListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [statistics, setStatistics] = useState({
    totalTransfer: 0,
    totalReceive: 0,
    totalFee: 0
  })
  const [auditDialogOpen, setAuditDialogOpen] = useState(false)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<AdminTransferListItem | null>(null)
  const [auditForm, setAuditForm] = useState({
    status: '1',
    auditRemark: ''
  })
  const [completeForm, setCompleteForm] = useState({
    receiptUrl: ''
  })
  const [filters, setFilters] = useState({
    userId: '',
    userName: '',
    status: '-1',
    applyNo: '',
    startTime: '',
    endTime: ''
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<TransferDetailItem | null>(null)

  const loadData = async (targetFilters?: typeof filters, targetPage?: number) => {
    setLoading(true)
    try {
      const currentFilters = targetFilters !== undefined ? targetFilters : filters
      const currentPage = targetPage !== undefined ? targetPage : page
      
      // 处理时间范围：开始时间为当天的 00:00:00，结束时间为当天的 23:59:59（包含整天的数据），转换为10位时间戳（秒级）
      let startTime: number | undefined
      let endTime: number | undefined
      
      if (currentFilters.startTime) {
        // 解析日期字符串 "YYYY-MM-DD"，使用本地时区创建日期对象
        const [year, month, day] = currentFilters.startTime.split('-').map(Number)
        const startDate = new Date(year, month - 1, day, 0, 0, 0, 0) // 月份从0开始，所以减1，开始时间为 00:00:00
        startTime = Math.floor(startDate.getTime() / 1000) // 转换为10位时间戳（秒级）
      }
      
      if (currentFilters.endTime) {
        // 解析日期字符串 "YYYY-MM-DD"，使用本地时区创建日期对象
        const [year, month, day] = currentFilters.endTime.split('-').map(Number)
        const endDate = new Date(year, month - 1, day, 23, 59, 59, 999) // 月份从0开始，所以减1，结束时间为 23:59:59.999
        endTime = Math.floor(endDate.getTime() / 1000) // 转换为10位时间戳（秒级）
      }
      
      const res = await getAdminTransferList({
        pageNum: currentPage + 1,
        pageSize: rowsPerPage,
        userId: currentFilters.userId ? Number(currentFilters.userId) : undefined,
        userName: currentFilters.userName || undefined,
        status: currentFilters.status !== '-1' ? Number(currentFilters.status) : undefined,
        applyNo: currentFilters.applyNo || undefined,
        startTime,
        endTime
      })
      const list = res.data?.list || []
      setData(list)
      setTotal(res.data?.total || 0)
      
      // 计算统计数据
      const totalTransfer = list.reduce((sum, item) => sum + item.transferAmount, 0)
      const totalReceive = list.reduce((sum, item) => sum + item.receiveAmount, 0)
      const totalFee = list.reduce((sum, item) => sum + item.feeAmount, 0)
      setStatistics({ totalTransfer, totalReceive, totalFee })
    } catch (error) {
      console.error('加载数据失败:', error)
      toast.error(t('adminOtc.loadDataFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 搜索防抖
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    loadData()
  }, [page, rowsPerPage])

  // 过滤条件变化时使用防抖搜索
  const handleSearch = useCallback(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
    searchTimerRef.current = setTimeout(() => {
      setPage(0) // 搜索时重置到第一页
      loadData()
    }, 500)
  }, [])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [])

  const handleAudit = async () => {
    if (!currentItem) return
    try {
      await auditTransfer({
        applyNo: currentItem.applyNo,
        status: Number(auditForm.status),
        auditRemark: auditForm.auditRemark
      })
      toast.success(t('adminOtc.auditSuccess'))
      setAuditDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('审核失败:', error)
      toast.error(t('adminOtc.auditFailed'))
    }
  }

  // const handleComplete = async () => {
  //   if (!currentItem) return
  //   try {
  //     await completeTransfer({
  //       applyNo: currentItem.applyNo,
  //       receiptUrl: completeForm.receiptUrl
  //     })
  //     toast.success('完成成功')
  //     setCompleteDialogOpen(false)
  //     loadData()
  //   } catch (error) {
  //     console.error('完成失败:', error)
  //     toast.error('完成失败')
  //   }
  // }

  // 统计待处理数量
  const pendingCount = data.filter(item => item.status === 0).length
  const processingCount = data.filter(item => item.status === 1).length

  // 查看详情
  const handleViewDetail = (item: AdminTransferListItem) => {
    setSelectedRecord(item as unknown as TransferDetailItem)
    setDrawerOpen(true)
  }

  const getStatusLabel = (status: number) => {
    const statusMap: Record<number, string> = {
      0: t('adminOtc.pendingAuditStatus'),
      1: t('adminOtc.processingStatus'),
      2: t('adminOtc.completed'),
      3: t('adminOtc.rejected'),
      4: t('adminOtc.failed')
    }
    return statusMap[status] || t('adminOtc.unknown')
  }

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '-'
    const ms = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp
    return new Date(ms).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <Grid container spacing={6}>
      {/* 统计卡片 - 简洁风格 */}
      {/* <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ 
                width: 44, height: 44, borderRadius: '12px', 
                bgcolor: 'primary.lighter', color: 'primary.main',
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <i className='ri-send-plane-line' style={{ fontSize: 22 }} />
              </Box>
            </Box>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>{t('adminOtc.transferTotal')}</Typography>
            <Typography variant='h5' sx={{ fontWeight: 700, color: 'text.primary' }}>
              {statistics.totalTransfer.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ 
                width: 44, height: 44, borderRadius: '12px', 
                bgcolor: 'success.lighter', color: 'success.main',
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <i className='ri-download-2-line' style={{ fontSize: 22 }} />
              </Box>
            </Box>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>{t('adminOtc.receiveTotal')}</Typography>
            <Typography variant='h5' sx={{ fontWeight: 700, color: 'success.main' }}>
              {statistics.totalReceive.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ 
                width: 44, height: 44, borderRadius: '12px', 
                bgcolor: 'warning.lighter', color: 'warning.main',
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <i className='ri-percent-line' style={{ fontSize: 22 }} />
              </Box>
            </Box>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>{t('adminOtc.feeTotal')}</Typography>
            <Typography variant='h5' sx={{ fontWeight: 700, color: 'warning.main' }}>
              {statistics.totalFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ 
                width: 44, height: 44, borderRadius: '12px', 
                bgcolor: 'info.lighter', color: 'info.main',
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <i className='ri-time-line' style={{ fontSize: 22 }} />
              </Box>
            </Box>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>{t('adminOtc.pending')}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography variant='h5' sx={{ fontWeight: 700, color: 'warning.main' }}>
                {pendingCount}
              </Typography>
              <Typography variant='body2' color='text.secondary'>{t('adminOtc.pendingAudit')}</Typography>
              <Typography variant='h6' sx={{ fontWeight: 600, color: 'info.main', ml: 1 }}>
                {processingCount}
              </Typography>
              <Typography variant='body2' color='text.secondary'>{t('adminOtc.processing')}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid> */}

      <Grid size={12}>
        <Card sx={{ width: '100%', borderRadius: '16px' }}>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5' sx={{ fontWeight: 600 }}>{t('adminOtc.transferApplicationList')}</Typography>
              <Chip label={t('adminOtc.totalRecords', { count: total })} size='small' variant='outlined' />
            </Box>
            <Box className='flex items-center gap-4 mb-6 flex-wrap'>
              <TextField
                label={t('adminOtc.username')}
                value={filters.userName}
                onChange={e => setFilters({ ...filters, userName: e.target.value })}
                size='small'
                sx={{ minWidth: 150 }}
              />
              <TextField
                label={t('adminOtc.applyNo')}
                value={filters.applyNo}
                onChange={e => setFilters({ ...filters, applyNo: e.target.value })}
                size='small'
                sx={{ minWidth: 220 }}
                placeholder={t('adminOtc.applyNoPlaceholder')}
              />
              <FormControl size='small' sx={{ minWidth: 150 }}>
                <InputLabel id='transfer-status-label'>{t('adminOtc.status')}</InputLabel>
                <Select
                  labelId='transfer-status-label'
                  value={filters.status}
                  onChange={e => setFilters({ ...filters, status: e.target.value })}
                  label={t('adminOtc.status')}
                >
                  <MenuItem value='-1'>{t('adminOtc.all')}</MenuItem>
                  <MenuItem value='0'>{t('adminOtc.pendingAuditStatus')}</MenuItem>
                  <MenuItem value='1'>{t('adminOtc.processingStatus')}</MenuItem>
                  <MenuItem value='2'>{t('adminOtc.completed')}</MenuItem>
                  <MenuItem value='3'>{t('adminOtc.rejected')}</MenuItem>
                  <MenuItem value='4'>{t('adminOtc.failed')}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={t('adminOtc.startTime')}
                type='date'
                value={filters.startTime}
                onChange={e => setFilters({ ...filters, startTime: e.target.value })}
                size='small'
                sx={{ minWidth: 200 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label={t('adminOtc.endTime')}
                type='date'
                value={filters.endTime}
                onChange={e => setFilters({ ...filters, endTime: e.target.value })}
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
                {t('adminOtc.search')}
              </Button>
              <Button 
                variant='outlined' 
                onClick={() => {
                  const resetFilters = {
                    userId: '',
                    userName: '',
                    status: '-1',
                    applyNo: '',
                    startTime: '',
                    endTime: ''
                  }
                  setFilters(resetFilters)
                  setPage(0)
                  loadData(resetFilters, 0)
                }}
                disabled={loading}
              >
                {t('adminOtc.reset')}
              </Button>
            </Box>
            <Box
              sx={{
                overflowX: 'auto',
                overflowY: 'visible',
                '&::-webkit-scrollbar': {
                  height: '10px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                  borderRadius: '5px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#c1c1c1',
                  borderRadius: '5px',
                  '&:hover': {
                    backgroundColor: '#a8a8a8',
                  },
                },
              }}
            >
              <table className={tableStyles.table} style={{ width: '100%', minWidth: '1200px' }}>
                <thead>
                  <tr>
                    <th>{t('adminOtc.applyNo')}</th>
                    <th>{t('adminOtc.username')}</th>
                    {/* <th>收款人</th> */}
                    {/* <th>转账币种</th> */}
                    {/* <th>转账金额</th> */}
                    <th>{t('adminOtc.currency')}</th>
                    <th>{t('adminOtc.amount')}</th>
                    {/* <th>汇率</th> */}
                    <th>{t('adminOtc.fee')}</th>
                    <th>{t('adminOtc.accountType')}</th>
                    <th>{t('adminOtc.status')}</th>
                    <th>{t('adminOtc.createTime')}</th>
                    <th>{t('adminOtc.auditCompleteTime')}</th>
                    <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>{t('common.actions') || '操作'}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} className='text-center'>
                        {t('adminOtc.loading')}
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={10} className='text-center'>
                        {t('adminOtc.noData')}
                      </td>
                    </tr>
                  ) : (
                    data.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                          <Tooltip title={t('common.clickToCopy') || '点击复制'} arrow>
                            <span 
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                navigator.clipboard.writeText(item.applyNo)
                                toast.success(t('adminOtc.copiedToClipboard'))
                              }}
                            >
                              {item.applyNo}
                            </span>
                          </Tooltip>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{item.userName}</span>
                        </td>
                        {/* <td>
                          <span style={{ fontWeight: 600 }}>{item.payeeName}</span>
                        </td> */}
                        {/* <td>
                          <Chip label={item.currencyCode} size='small' variant='outlined' />
                        </td> */}
                        {/* <td style={{ fontWeight: 700, color: '#ff5252' }}>
                          {item.transferAmount}
                        </td> */}
                        <td>
                          <Chip label={item.receiveCurrencyCode} size='small' variant='outlined' color='success' />
                        </td>
                        <td style={{ fontWeight: 700, color: '#4caf50' }}>
                          {item.receiveAmount}
                        </td>
                        {/* <td style={{ fontSize: '0.9rem', color: 'var(--mui-palette-text-secondary)' }}>
                          {item.exchangeRate}
                        </td> */}
                        <td style={{ color: 'var(--mui-palette-warning-main)' }}>
                          {item.feeAmount}
                        </td>
                        <td>
                          <Chip 
                            label={item.remitType === 1 ? t('adminOtc.personal') : item.remitType === 2 ? t('adminOtc.company') : String(item.remitType)}
                            size='small'
                            color={item.remitType === 1 ? 'info' : 'default'}
                          />
                        </td>
                        <td>
                          <Chip
                            label={
                              item.status === 0
                                ? t('adminOtc.pendingAuditStatus')
                                : item.status === 1
                                  ? t('adminOtc.processingStatus')
                                  : item.status === 2
                                    ? t('adminOtc.completed')
                                    : item.status === 3
                                      ? t('adminOtc.rejected')
                                      : t('adminOtc.failed')
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
                        <td style={{ fontSize: '0.85rem' }}>
                          {item.createTime ? new Date(item.createTime * 1000).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          }) : '-'}
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--mui-palette-text-secondary)', verticalAlign: 'middle' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {item.auditTime ? (
                              <Box>
                                <Typography component='span' variant='caption' sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{t('adminOtc.audit')}：</Typography>
                                <Typography component='span' variant='caption' sx={{ fontSize: '0.75rem', ml: 0.5 }}>{formatTimestamp(item.auditTime)}</Typography>
                              </Box>
                            ) : null}
                            {item.completeTime ? (
                              <Box>
                                <Typography component='span' variant='caption' sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{t('adminOtc.complete')}：</Typography>
                                <Typography component='span' variant='caption' sx={{ fontSize: '0.75rem', ml: 0.5 }}>{formatTimestamp(item.completeTime)}</Typography>
                              </Box>
                            ) : null}
                            {!item.auditTime && !item.completeTime && <Typography variant='caption'>-</Typography>}
                          </Box>
                        </td>
                        <td style={{ verticalAlign: 'middle' }}>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Button
                              size='small'
                              variant='text'
                              sx={{ fontWeight: 600 }}
                              onClick={() => handleViewDetail(item)}
                            >
                              {t('adminOtc.details')}
                            </Button>
                            {item.status === 0 && (
                              <Button
                                size='small'
                                variant='contained'
                                onClick={() => {
                                  setCurrentItem(item)
                                  setAuditForm({ status: '1', auditRemark: '' })
                                  setAuditDialogOpen(true)
                                }}
                              >
                                {t('adminOtc.audit')}
                              </Button>
                            )}
                            {/* {item.status === 1 && (
                              <Button
                                size='small'
                                variant='contained'
                                color='success'
                                onClick={() => {
                                  setCurrentItem(item)
                                  setCompleteForm({ receiptUrl: '' })
                                  setCompleteDialogOpen(true)
                                }}
                              >
                                完成
                              </Button>
                            )} */}
                          </Box>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Box>
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

      <Dialog open={auditDialogOpen} onClose={() => setAuditDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{t('adminOtc.auditTransfer')}</DialogTitle>
        <DialogContent>
          <Box className='flex flex-col gap-4 mt-4'>
            <FormControl fullWidth>
              <InputLabel id='audit-status-label'>{t('adminOtc.auditStatus')}</InputLabel>
              <Select
                labelId='audit-status-label'
                value={auditForm.status}
                onChange={e => setAuditForm({ ...auditForm, status: e.target.value })}
                label={t('adminOtc.auditStatus')}
              >
                <MenuItem value='1'>{t('common.pass') || '通过'}</MenuItem>
                <MenuItem value='3'>{t('adminOtc.rejected')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={t('adminOtc.auditRemark')}
              value={auditForm.auditRemark}
              onChange={e => setAuditForm({ ...auditForm, auditRemark: e.target.value })}
              multiline
              rows={3}
              placeholder={t('adminOtc.enterAuditRemark')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuditDialogOpen(false)}>{t('adminOtc.cancel')}</Button>
          <Button variant='contained' onClick={handleAudit}>
            {t('common.submit') || '提交'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* <Dialog open={completeDialogOpen} onClose={() => setCompleteDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>完成转账</DialogTitle>
        <DialogContent>
          <Box className='flex flex-col gap-4 mt-4'>
            <TextField
              label='汇款回执单路径'
              value={completeForm.receiptUrl}
              onChange={e => setCompleteForm({ ...completeForm, receiptUrl: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)}>取消</Button>
          <Button variant='contained' onClick={handleComplete}>
            提交
          </Button>
        </DialogActions>
      </Dialog> */}

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
                转账详情
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

          {/* 内容 */}
          {selectedRecord && (
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
                      {t('adminOtc.transferAmount')}
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
                      {t('adminOtc.exchangeRate')}<br />{selectedRecord.exchangeRate?.toFixed(4) || '-'}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1, textAlign: 'right' }}>
                    <Typography variant='caption' sx={{ display: 'block', mb: 1.5, fontSize: '12px', color: '#8c8c8c' }}>
                      {t('adminOtc.receiveAmount')}
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#52c41a', fontFamily: 'monospace' }}>
                      {selectedRecord.receiveCurrencyCode} {(selectedRecord.receiveAmount || (selectedRecord.transferAmount * (selectedRecord.exchangeRate || 0))).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Box>

                {/* 基本信息 */}
                <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2.5, fontSize: '14px', color: '#000' }}>
                  {t('adminOtc.basicInfo')}
                </Typography>
                <Box sx={{ mb: 4, bgcolor: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2.5, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: '#595959' }}>{t('adminOtc.transactionId')}：</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '12px', color: '#262626' }}>
                        {selectedRecord.applyNo}
                      </Typography>
                      <IconButton 
                        size='small' 
                        sx={{ width: 24, height: 24, p: 0 }}
                        onClick={() => {
                          navigator.clipboard.writeText(selectedRecord.applyNo)
                          toast.success(t('adminOtc.copied'))
                        }}
                      >
                        <i className='ri-file-copy-line' style={{ fontSize: '14px', color: '#8c8c8c' }} />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: '#595959' }}>{t('adminOtc.applicant')}：</Typography>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: '#262626' }}>{selectedRecord.userName || '-'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: '#595959' }}>{t('adminOtc.recipient')}：</Typography>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: '#262626' }}>{selectedRecord.payeeName || '-'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: '#595959' }}>{t('adminOtc.accountType')}：</Typography>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: '#262626' }}>
                      {selectedRecord.remitType === 1 ? t('adminOtc.personal') : selectedRecord.remitType === 2 ? t('adminOtc.company') : String(selectedRecord.remitType || '-')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: '#595959' }}>{t('adminOtc.fee')}：</Typography>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: '#262626' }}>{selectedRecord.feeAmount || 0} {selectedRecord.currencyCode}</Typography>
                  </Box>
                  {selectedRecord.memo && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #f0f0f0' }}>
                      <Typography variant='body2' sx={{ fontSize: '14px', color: '#595959' }}>{t('adminOtc.transactionMemo')}：</Typography>
                      <Typography variant='body2' sx={{ fontSize: '14px', color: '#262626', maxWidth: '60%', textAlign: 'right' }}>{selectedRecord.memo}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5 }}>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: '#595959' }}>{t('adminOtc.createTime')}：</Typography>
                    <Typography variant='body2' sx={{ fontSize: '14px', color: '#262626' }}>
                      {selectedRecord.createTime 
                        ? new Date(selectedRecord.createTime * 1000).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })
                        : '-'}
                    </Typography>
                  </Box>
                </Box>

                {/* 审核信息 (仅审核后显示) */}
                {!!(selectedRecord.auditRemark || (selectedRecord.auditTime ?? 0) > 0 || (selectedRecord.completeTime ?? 0) > 0) && (
                  <>
                    <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2.5, fontSize: '14px', color: 'text.primary' }}>
                      {t('adminOtc.auditInfo')}
                    </Typography>
                    <Box sx={{ mb: 4, bgcolor: 'background.paper', borderRadius: '8px', overflow: 'hidden' }}>
                      {selectedRecord.auditRemark && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                          <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.secondary' }}>{t('adminOtc.auditRemarkLabel')}</Typography>
                          <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.primary', maxWidth: '60%', textAlign: 'right' }}>{selectedRecord.auditRemark}</Typography>
                        </Box>
                      )}
                      {(selectedRecord.auditTime ?? 0) > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: (selectedRecord.completeTime ?? 0) > 0 ? '1px solid' : 'none', borderColor: 'divider' }}>
                          <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.secondary' }}>{t('adminOtc.auditTime')}</Typography>
                          <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.primary' }}>{formatTimestamp(selectedRecord.auditTime)}</Typography>
                        </Box>
                      )}
                      {(selectedRecord.completeTime ?? 0) > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2.5 }}>
                          <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.secondary' }}>{t('adminOtc.completeTime')}</Typography>
                          <Typography variant='body2' sx={{ fontSize: '14px', color: 'text.primary' }}>{formatTimestamp(selectedRecord.completeTime)}</Typography>
                        </Box>
                      )}
                    </Box>
                  </>
                )}
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
                  {t('common.close') || '关闭'}
                </Button>
                {selectedRecord.status === 0 && (
                  <Button
                    variant='contained'
                    onClick={() => {
                      setDrawerOpen(false)
                      setCurrentItem(selectedRecord as unknown as AdminTransferListItem)
                      setAuditForm({ status: '1', auditRemark: '' })
                      setAuditDialogOpen(true)
                    }}
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
                    {t('adminOtc.audit')}
                  </Button>
                )}
                {/* {selectedRecord.status === 1 && (
                  <Button
                    variant='contained'
                    color='success'
                    onClick={() => {
                      setDrawerOpen(false)
                      setCurrentItem(selectedRecord as unknown as AdminTransferListItem)
                      setCompleteForm({ receiptUrl: '' })
                      setCompleteDialogOpen(true)
                    }}
                    sx={{ 
                      flex: 1,
                      borderRadius: '6px',
                      py: 1.5,
                      fontSize: '14px',
                      fontWeight: 500,
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: 'none'
                      }
                    }}
                  >
                    完成
                  </Button>
                )} */}
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </Grid>
  )
}

export default AdminTransferList
