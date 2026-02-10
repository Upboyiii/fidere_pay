'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

// Next Imports
import { useRouter, useParams, usePathname } from 'next/navigation'

// Util Imports
import { getLocalizedPath, getCurrentLangFromPath } from '@/utils/routeUtils'

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
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { getPayeeList, type PayeeItem } from '@server/otc-api'
import { toast } from 'react-toastify'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const RecipientList = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  
  // 使用 useMemo 确保 currentLang 随着 pathname 的变化而更新
  const currentLang = useMemo(() => {
    // 从路径中提取语言，确保获取当前页面的语言
    if (pathname) {
      const langMatch = pathname.match(/^\/([a-z]{2}(-[A-Z][a-zA-Z]*)?)/)
      if (langMatch && langMatch[1]) {
        return langMatch[1]
      }
    }
    // 如果路径中没有语言，则使用 params
    return (params?.lang as string) || undefined
  }, [pathname, params?.lang])
  
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
  const [filters, setFilters] = useState({
    remittanceMethod: '',
    accountType: '',
    searchKey: ''
  })
  const [showFilters, setShowFilters] = useState(true)
  const [recipients, setRecipients] = useState<PayeeItem[]>([])
  const [total, setTotal] = useState(0)

  // 加载收款人列表
  const loadRecipients = async (targetPage?: number, targetFilters?: typeof filters) => {
    setLoading(true)
    try {
      const currentPage = targetPage !== undefined ? targetPage : page
      const currentFilters = targetFilters !== undefined ? targetFilters : filters
      const res = await getPayeeList({
        pageNum: currentPage + 1,
        pageSize: rowsPerPage,
        remitType: currentFilters.remittanceMethod ? Number(currentFilters.remittanceMethod) : undefined,
        accountType: currentFilters.accountType ? Number(currentFilters.accountType) : undefined,
        status: 1, // 只显示启用的
        searchKey: currentFilters.searchKey || undefined
      })
      const responseData = res.data as any
      setRecipients(responseData?.list || [])
      setTotal(responseData?.total || 0)
    } catch (error) {
      console.error('加载收款人列表失败:', error)
      toast.error(t('remittance.loadRecipientsFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecipients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage])

  const handleCopyAccount = (account: string) => {
    navigator.clipboard.writeText(account)
    toast.success(t('remittance.copied'))
  }

  const getRemitTypeLabel = (remitType: number) => {
    return remitType === 1 ? t('remittance.swiftRemittance') : t('remittance.localRemittance')
  }

  const getAccountTypeLabel = (accountType: number) => {
    return accountType === 1 ? t('remittance.companyAccount') : t('remittance.personalAccount')
  }

  const getRecipientName = (recipient: PayeeItem) => {
    if (recipient.accountType === 1) {
      return recipient.companyName || recipient.accountName
    } else {
      return `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() || recipient.accountName
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
                {t('remittance.recipientList')}
              </Typography>
              <Typography color='text.secondary'>
                {t('remittance.manageRecipientsDesc')}
              </Typography>
            </Box>
            <Button 
              variant='contained' 
              startIcon={<i className='ri-add-line' />} 
              onClick={() => {
                // 实时获取当前语言，避免闭包问题
                const realTimeLang = getCurrentLangFromPath()
                const targetPath = getLocalizedPath('/remittance/recipients/new', realTimeLang)
                router.push(targetPath)
              }}
              sx={{ borderRadius: '8px', px: 6 }}
            >
              {t('remittance.addNewRecipient')}
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
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>{t('remittance.remittanceMethod')}</Typography>
                    <FormControl fullWidth size='small'>
                      <Select
                        value={filters.remittanceMethod}
                        onChange={(e) => setFilters({ ...filters, remittanceMethod: e.target.value })}
                        displayEmpty
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value=''>{t('remittance.allOrders')}</MenuItem>
                        <MenuItem value='1'>{t('remittance.swiftRemittance')}</MenuItem>
                        <MenuItem value='2'>{t('remittance.localRemittance')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>{t('remittance.accountType')}</Typography>
                    <FormControl fullWidth size='small'>
                      <Select
                        value={filters.accountType}
                        onChange={(e) => setFilters({ ...filters, accountType: e.target.value })}
                        displayEmpty
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value=''>{t('remittance.allOrders')}</MenuItem>
                        <MenuItem value='2'>{t('remittance.personalAccount')}</MenuItem>
                        <MenuItem value='1'>{t('remittance.companyAccount')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>{t('remittance.searchKeyword')}</Typography>
                    <TextField
                      fullWidth
                      size='small'
                      placeholder={t('remittance.searchKeywordPlaceholder')}
                      value={filters.searchKey}
                      onChange={(e) => setFilters({ ...filters, searchKey: e.target.value })}
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
                    const resetFilters = { remittanceMethod: '', accountType: '', searchKey: '' }
                    setFilters(resetFilters)
                    setPage(0)
                    loadRecipients(0, resetFilters)
                  }}
                  sx={{ color: 'text.secondary' }}
                  disabled={loading}
                >
                  {t('common.reset')}
                </Button>
                <Button 
                  variant='contained' 
                  size='small' 
                  startIcon={<i className='ri-search-line' />} 
                  sx={{ borderRadius: '8px', px: 6 }}
                  onClick={() => {
                    setPage(0)
                    loadRecipients(0)
                  }}
                  disabled={loading}
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

        {/* 收款人列表 */}
        <Grid size={{ xs: 12 }}>
          <Card 
            sx={{ 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 6, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <Typography variant='h6' sx={{ fontWeight: 700 }}>
                  {t('remittance.allRecipients')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <IconButton size='small' onClick={() => loadRecipients()} disabled={loading}>
                    {loading ? <CircularProgress size={20} /> : <i className='ri-refresh-line' />}
                  </IconButton>
                  {/* <IconButton size='small'><i className='ri-fullscreen-line' /></IconButton> */}
                  {/* <IconButton size='small'><i className='ri-settings-3-line' /></IconButton> */}
                </Box>
              </Box>
              <div className='overflow-x-auto'>
              <table className={tableStyles.table} style={{ border: 'none' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fcfdfe' }}>
                    <th style={{ padding: '16px 24px' }}><Checkbox size='small' /></th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('remittance.remittanceMethod')}</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('remittance.accountType')}</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('remittance.recipientName')}</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('remittance.bankInfo')}</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('common.createTime')}</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center' }}>
                        <CircularProgress />
                      </td>
                    </tr>
                  ) : recipients.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        {t('remittance.noRecipients')}
                      </td>
                    </tr>
                  ) : (
                    recipients.map((recipient) => (
                      <tr key={recipient.id} className='hover:bg-actionHover transition-colors' style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                        <td style={{ padding: '16px 24px' }}><Checkbox size='small' /></td>
                        <td style={{ padding: '16px 24px' }}>
                          <Chip 
                            label={getRemitTypeLabel(recipient.remitType)} 
                            size='small' 
                            sx={{ bgcolor: 'primary.lightOpacity', color: 'primary.main', fontWeight: 600, borderRadius: '6px' }} 
                          />
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Chip
                            label={getAccountTypeLabel(recipient.accountType)}
                            size='small'
                            variant='outlined'
                            sx={{ fontWeight: 600, borderRadius: '6px' }}
                          />
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {getRecipientName(recipient)}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant='body2' sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                                {recipient.accountNo}
                              </Typography>
                              <IconButton 
                                size='small' 
                                onClick={() => handleCopyAccount(recipient.accountNo)}
                                sx={{ p: 0.5 }}
                              >
                                <i className='ri-file-copy-line text-sm' />
                              </IconButton>
                            </Box>
                            <Typography variant='caption' color='text.secondary'>
                              {recipient.bankName}
                            </Typography>
                          </Box>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Typography variant='body2' color='text.secondary'>
                            {(() => {
                              const timeValue = (recipient as any).createTime || recipient.createdAt
                              if (!timeValue) return '-'
                              const timestamp = typeof timeValue === 'string' ? parseInt(timeValue) : timeValue
                              const date = timestamp.toString().length === 10 ? new Date(timestamp * 1000) : new Date(timestamp)
                              return date.toLocaleString(getDateLocale(), {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })
                            })()}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Button
                            size='small'
                            variant='text'
                            component={Link}
                            href={getLocalizedPath(`/remittance/recipients/${recipient.id}/edit`, currentLang)}
                            sx={{ fontWeight: 600 }}
                          >
                            {t('remittance.edit')}
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
                  {t('remittance.totalRecipients', { count: total })}
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </Card>
    </Box>
  )
}

export default RecipientList
