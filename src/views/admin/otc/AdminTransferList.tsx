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

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { getAdminTransferList, auditTransfer, completeTransfer, type AdminTransferListItem } from '@server/otc-api'
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const AdminTransferList = ({ mode }: { mode: Mode }) => {
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

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getAdminTransferList({
        pageNum: page + 1,
        pageSize: rowsPerPage,
        userId: filters.userId ? Number(filters.userId) : undefined,
        userName: filters.userName || undefined,
        status: filters.status !== '-1' ? Number(filters.status) : undefined,
        applyNo: filters.applyNo || undefined,
        startTime: filters.startTime ? new Date(filters.startTime).getTime() : undefined,
        endTime: filters.endTime ? new Date(filters.endTime).getTime() : undefined
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
      toast.error('加载数据失败')
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
      toast.success('审核成功')
      setAuditDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('审核失败:', error)
      toast.error('审核失败')
    }
  }

  const handleComplete = async () => {
    if (!currentItem) return
    try {
      await completeTransfer({
        applyNo: currentItem.applyNo,
        receiptUrl: completeForm.receiptUrl
      })
      toast.success('完成成功')
      setCompleteDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('完成失败:', error)
      toast.error('完成失败')
    }
  }

  // 统计待处理数量
  const pendingCount = data.filter(item => item.status === 0).length
  const processingCount = data.filter(item => item.status === 1).length

  return (
    <Grid container spacing={6}>
      {/* 统计卡片 - 简洁风格 */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>转账总额</Typography>
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
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>接收总额</Typography>
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
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>手续费总额</Typography>
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
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>待处理</Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography variant='h5' sx={{ fontWeight: 700, color: 'warning.main' }}>
                {pendingCount}
              </Typography>
              <Typography variant='body2' color='text.secondary'>待审核</Typography>
              <Typography variant='h6' sx={{ fontWeight: 600, color: 'info.main', ml: 1 }}>
                {processingCount}
              </Typography>
              <Typography variant='body2' color='text.secondary'>处理中</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={12}>
        <Card sx={{ width: '100%', borderRadius: '16px' }}>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5' sx={{ fontWeight: 600 }}>转账申请列表</Typography>
              <Chip label={`共 ${total} 条`} size='small' variant='outlined' />
            </Box>
            <Box className='flex items-center gap-4 mb-6 flex-wrap'>
              <TextField
                label='用户名'
                value={filters.userName}
                onChange={e => setFilters({ ...filters, userName: e.target.value })}
                size='small'
                sx={{ minWidth: 150 }}
              />
              <TextField
                label='申请单号'
                value={filters.applyNo}
                onChange={e => setFilters({ ...filters, applyNo: e.target.value })}
                size='small'
                sx={{ minWidth: 220 }}
                placeholder='如: TR202602021751400000440001'
              />
              <FormControl size='small' sx={{ minWidth: 150 }}>
                <InputLabel id='transfer-status-label'>状态</InputLabel>
                <Select
                  labelId='transfer-status-label'
                  value={filters.status}
                  onChange={e => setFilters({ ...filters, status: e.target.value })}
                  label='状态'
                >
                  <MenuItem value='-1'>全部</MenuItem>
                  <MenuItem value='0'>待审核</MenuItem>
                  <MenuItem value='1'>处理中</MenuItem>
                  <MenuItem value='2'>已完成</MenuItem>
                  <MenuItem value='3'>已驳回</MenuItem>
                  <MenuItem value='4'>失败</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label='开始时间'
                type='datetime-local'
                value={filters.startTime}
                onChange={e => setFilters({ ...filters, startTime: e.target.value })}
                size='small'
                sx={{ minWidth: 200 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label='结束时间'
                type='datetime-local'
                value={filters.endTime}
                onChange={e => setFilters({ ...filters, endTime: e.target.value })}
                size='small'
                sx={{ minWidth: 200 }}
                InputLabelProps={{ shrink: true }}
              />
              <Button variant='contained' onClick={loadData}>
                查询
              </Button>
              <Button 
                variant='outlined' 
                onClick={() => {
                  setFilters({
                    userId: '',
                    userName: '',
                    status: '-1',
                    applyNo: '',
                    startTime: '',
                    endTime: ''
                  })
                  setPage(0)
                }}
              >
                重置
              </Button>
            </Box>
            <div className={tableStyles.tableWrapper} style={{ overflowX: 'auto' }}>
              <table className={tableStyles.table} style={{ width: '100%', minWidth: '1600px' }}>
                <thead>
                  <tr>
                    <th>申请单号</th>
                    <th>申请人</th>
                    <th>收款人</th>
                    <th>转账币种</th>
                    <th>转账金额</th>
                    <th>接收币种</th>
                    <th>接收金额</th>
                    <th>汇率</th>
                    <th>手续费</th>
                    <th>汇款类型</th>
                    <th>状态</th>
                    <th>创建时间</th>
                    <th>审核时间</th>
                    <th>完成时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={15} className='text-center'>
                        加载中...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={15} className='text-center'>
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    data.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                          <Tooltip title='点击复制' arrow>
                            <span 
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                navigator.clipboard.writeText(item.applyNo)
                                toast.success('已复制到剪贴板')
                              }}
                            >
                              {item.applyNo}
                            </span>
                          </Tooltip>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{item.userName}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{item.payeeName}</span>
                        </td>
                        <td>
                          <Chip label={item.currencyCode} size='small' variant='outlined' />
                        </td>
                        <td style={{ fontWeight: 700, color: '#ff5252' }}>
                          {item.transferAmount}
                        </td>
                        <td>
                          <Chip label={item.receiveCurrencyCode} size='small' variant='outlined' color='success' />
                        </td>
                        <td style={{ fontWeight: 700, color: '#4caf50' }}>
                          {item.receiveAmount}
                        </td>
                        <td style={{ fontSize: '0.9rem', color: 'var(--mui-palette-text-secondary)' }}>
                          {item.exchangeRate}
                        </td>
                        <td style={{ color: 'var(--mui-palette-warning-main)' }}>
                          {item.feeAmount}
                        </td>
                        <td>
                          <Chip 
                            label={item.remitType === 1 ? '个人' : item.remitType === 2 ? '企业' : String(item.remitType)}
                            size='small'
                            color={item.remitType === 1 ? 'info' : 'default'}
                          />
                        </td>
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
                        <td style={{ fontSize: '0.85rem', color: 'var(--mui-palette-text-secondary)' }}>
                          {item.auditTime ? new Date(item.auditTime * 1000).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--mui-palette-text-secondary)' }}>
                          {item.completeTime ? new Date(item.completeTime * 1000).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </td>
                        <td>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                                审核
                              </Button>
                            )}
                            {item.status === 1 && (
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

      <Dialog open={auditDialogOpen} onClose={() => setAuditDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>审核转账申请</DialogTitle>
        <DialogContent>
          <Box className='flex flex-col gap-4 mt-4'>
            <FormControl fullWidth>
              <InputLabel id='audit-status-label'>审核状态</InputLabel>
              <Select
                labelId='audit-status-label'
                value={auditForm.status}
                onChange={e => setAuditForm({ ...auditForm, status: e.target.value })}
                label='审核状态'
              >
                <MenuItem value='1'>通过</MenuItem>
                <MenuItem value='3'>驳回</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label='审核备注'
              value={auditForm.auditRemark}
              onChange={e => setAuditForm({ ...auditForm, auditRemark: e.target.value })}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuditDialogOpen(false)}>取消</Button>
          <Button variant='contained' onClick={handleAudit}>
            提交
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={completeDialogOpen} onClose={() => setCompleteDialogOpen(false)} maxWidth='sm' fullWidth>
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
      </Dialog>
    </Grid>
  )
}

export default AdminTransferList
