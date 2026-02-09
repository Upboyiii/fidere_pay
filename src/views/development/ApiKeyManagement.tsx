'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import { useParams, usePathname } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import {
  getApiKeyList,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  setApiKeyStatus,
  regenerateApiSecret,
  type ApiKeyItem
} from '@server/otc-api'
import { toast } from 'react-toastify'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`api-key-tabpanel-${index}`}
      aria-labelledby={`api-key-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

const ApiKeyManagement = ({ mode }: { mode: Mode }) => {
  const t = useTranslate()
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
  
  // 根据当前语言设置日期格式化的 locale
  const getDateLocale = () => {
    if (currentLang === 'en') return 'en-US'
    if (currentLang === 'zh-Hant') return 'zh-TW'
    return 'zh-CN'
  }
  
  const [data, setData] = useState<ApiKeyItem[]>([])
  const [loading, setLoading] = useState(false)

  // 复制文本到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        toast.success(t('development.copied'))
      } else {
        // 降级方案：使用传统的复制方法
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        try {
          document.execCommand('copy')
          toast.success(t('development.copied'))
        } catch (err) {
          toast.error(t('development.copyFailed'))
        }
        document.body.removeChild(textArea)
      }
    } catch (error) {
      console.error('复制失败:', error)
      toast.error(t('development.copyFailed'))
    }
  }
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [regenerateSecretDialogOpen, setRegenerateSecretDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ApiKeyItem | null>(null)
  const [selectedItem, setSelectedItem] = useState<ApiKeyItem | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [showSecret, setShowSecret] = useState(false)
  const [formData, setFormData] = useState({
    apiName: '',
    ipWhitelist: '',
    callbackUrl: '',
    remark: ''
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getApiKeyList()
      const apiData = res.data?.data || res.data
      setData(apiData?.list || [])
    } catch (error) {
      console.error('加载数据失败:', error)
      toast.error(t('development.loadDataFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = async () => {
    if (!formData.apiName) {
      toast.error(t('development.enterApiName'))
      return
    }
    try {
      await createApiKey(formData)
      toast.success(t('development.createSuccess'))
      setCreateDialogOpen(false)
      setFormData({ apiName: '', ipWhitelist: '', callbackUrl: '', remark: '' })
      loadData()
    } catch (error: any) {
      console.error('创建失败:', error)
      const errorMessage = error?.response?.data?.message || error?.message || t('development.createFailed')
      toast.error(errorMessage)
    }
  }

  const handleViewDetail = (item: ApiKeyItem) => {
    setSelectedItem(item)
    setShowSecret(false)
    setTabValue(0)
    setDetailDialogOpen(true)
  }

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    try {
      await setApiKeyStatus({
        id,
        status: currentStatus === 1 ? 0 : 1
      })
      toast.success(t('development.statusUpdateSuccess'))
      loadData()
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem({ ...selectedItem, status: currentStatus === 1 ? 0 : 1 })
      }
    } catch (error: any) {
      console.error('状态更新失败:', error)
      const errorMessage = error?.response?.data?.message || error?.message || t('development.statusUpdateFailed')
      toast.error(errorMessage)
    }
  }

  const handleRegenerateSecretClick = () => {
    if (!selectedItem) return
    setRegenerateSecretDialogOpen(true)
  }

  const handleRegenerateSecretConfirm = async () => {
    if (!selectedItem) return
    try {
      const res = await regenerateApiSecret({ id: selectedItem.id })
      // API 返回结构：{ code: 0, message: "OK", data: { apiSecret: string } }
      // clientRequest 返回：{ data: { code: 0, message: "OK", data: { apiSecret: string } } }
      const responseData = res.data?.data || res.data
      const newSecret = responseData?.apiSecret
      
      if (!newSecret) {
        toast.error(t('development.getNewSecretFailed'))
        return
      }
      
      toast.success(t('development.regenerateSuccess'))
      setShowSecret(true)
      setRegenerateSecretDialogOpen(false)
      
      // 更新本地数据
      const updatedItem = { ...selectedItem, apiSecret: newSecret }
      const newData = data.map(item =>
        item.id === selectedItem.id ? updatedItem : item
      )
      setData(newData)
      setSelectedItem(updatedItem)
      
      // 刷新列表数据以确保同步
      loadData()
    } catch (error: any) {
      console.error('重新生成失败:', error)
      const errorMessage = error?.response?.data?.message || error?.message || t('development.regenerateFailed')
      toast.error(errorMessage)
    }
  }

  const handleUpdateCallback = async () => {
    if (!selectedItem) return
    try {
      await updateApiKey({
        id: selectedItem.id,
        callbackUrl: selectedItem.callbackUrl
      })
      toast.success(t('development.updateSuccess'))
      loadData()
    } catch (error: any) {
      console.error('保存失败:', error)
      const errorMessage = error?.response?.data?.message || error?.message || t('development.updateFailed')
      toast.error(errorMessage)
    }
  }

  const handleDeleteClick = (item: ApiKeyItem, e: React.MouseEvent) => {
    e.stopPropagation() // 阻止事件冒泡，避免触发卡片点击
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    try {
      await deleteApiKey({ id: itemToDelete.id })
      toast.success(t('development.deleteSuccess'))
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      // 如果删除的是当前查看的详情，关闭详情对话框
      if (selectedItem && selectedItem.id === itemToDelete.id) {
        setDetailDialogOpen(false)
        setSelectedItem(null)
      }
      loadData()
    } catch (error: any) {
      console.error('删除失败:', error)
      const errorMessage = error?.response?.data?.message || error?.message || t('development.deleteFailed')
      toast.error(errorMessage)
    }
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant='h4' sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              {t('development.title')}
            </Typography>
            <Typography color='text.secondary'>
              {t('development.description')}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              {t('development.apiKeyList')}
            </Typography>
            <Button
              variant='contained'
              color='primary'
              onClick={() => setCreateDialogOpen(true)}
              startIcon={<i className='ri-add-line' />}
            >
              {t('development.createApiKey')}
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : data.length === 0 ? (
            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ py: 8, textAlign: 'center' }}>
                <i className='ri-key-line text-6xl text-textDisabled mb-4' />
                <Typography variant='h6' color='text.secondary' sx={{ mb: 2 }}>
                  {t('development.noApiKey')}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
                  {t('development.noApiKeyDesc')}
                </Typography>
                <Button variant='contained' onClick={() => setCreateDialogOpen(true)}>
                  {t('development.createApiKey')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={4}>
              {data.map(item => (
                <Grid key={item.id} size={{ xs: 12, md: 6, lg: 4 }}>
                  <Card
                    sx={{
                      borderRadius: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        transform: 'translateY(-4px)'
                      }
                    }}
                    onClick={() => handleViewDetail(item)}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            bgcolor: 'primary.lightOpacity',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <i className='ri-key-line text-primary' style={{ fontSize: '24px' }} />
                        </Box>
                        <Chip
                          label={item.status === 1 ? t('development.enabled') : t('development.disabled')}
                          color={item.status === 1 ? 'success' : 'default'}
                          size='small'
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>

                      <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
                        {item.apiName}
                      </Typography>

                      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                        Client ID
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: 'action.hover',
                          p: 1.5,
                          borderRadius: '8px',
                          mb: 2,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          wordBreak: 'break-all'
                        }}
                      >
                        {item.apiKey}
                      </Box>

                      {item.remark && (
                        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                          {item.remark}
                        </Typography>
                      )}

                      {/* 创建时间 */}
                      {(item as any).createTime || item.createdAt ? (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                            {t('development.createTime')}:
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {(() => {
                              const timestamp = (item as any).createTime || item.createdAt
                              // 处理 10 位时间戳（秒）转换为 13 位（毫秒）
                              const timestampMs = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp
                              return new Date(timestampMs).toLocaleString(getDateLocale(), {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            })()}
                          </Typography>
                        </Box>
                      ) : null}

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={(e) => handleDeleteClick(item, e)}
                          sx={{
                            '&:hover': {
                              bgcolor: 'error.lightOpacity'
                            }
                          }}
                        >
                          <i className='ri-delete-bin-line' />
                        </IconButton>
                        <IconButton size='small' onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetail(item)
                        }}>
                          <i className='ri-arrow-right-line' />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* 创建 API Key 对话框 */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2 }}>
          {t('development.createApiKeyTitle')}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label={t('development.apiName')}
              value={formData.apiName}
              onChange={e => setFormData({ ...formData, apiName: e.target.value })}
              placeholder={t('development.apiNamePlaceholder')}
              required
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label={t('development.ipWhitelist')}
              value={formData.ipWhitelist}
              onChange={e => setFormData({ ...formData, ipWhitelist: e.target.value })}
              placeholder={t('development.ipWhitelistPlaceholder')}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label={t('development.callbackUrl')}
              value={formData.callbackUrl}
              onChange={e => setFormData({ ...formData, callbackUrl: e.target.value })}
              placeholder={t('development.callbackUrlPlaceholder')}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label={t('development.remark')}
              value={formData.remark}
              onChange={e => setFormData({ ...formData, remark: e.target.value })}
              placeholder={t('development.remarkPlaceholder')}
              multiline
              rows={3}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ borderRadius: '8px' }}>
            {t('development.cancel')}
          </Button>
          <Button variant='contained' color='primary' onClick={handleCreate} sx={{ borderRadius: '8px' }}>
            {t('development.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* API Key 详情对话框 */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        {selectedItem && (
          <>
            <DialogTitle sx={{ fontWeight: 700, pb: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant='h6' sx={{ fontWeight: 700 }}>
                  {selectedItem.apiName}
                </Typography>
                <IconButton onClick={() => setDetailDialogOpen(false)}>
                  <i className='ri-close-line' />
                </IconButton>
              </Box>
            </DialogTitle>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label={t('development.apiConfig')} icon={<i className='ri-key-line' />} iconPosition='start' />
                {/* <Tab label='通知推送' icon={<i className='ri-notification-line' />} iconPosition='start' /> */}
              </Tabs>
            </Box>

            <DialogContent sx={{ p: 4 }}>
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant='body2' color='text.secondary'>
                    {t('development.apiConfigDesc')}
                  </Typography>

                  {/* Client ID */}
                  <Box>
                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                      Client ID:
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'action.hover',
                        p: 2,
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Typography
                        sx={{
                          flex: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          wordBreak: 'break-all'
                        }}
                      >
                        {selectedItem.apiKey}
                      </Typography>
                      <IconButton
                        size='small'
                        onClick={() => copyToClipboard(selectedItem.apiKey)}
                      >
                        <i className='ri-file-copy-line' />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Client Secret */}
                  <Box>
                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                      Client Secret:
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'action.hover',
                        p: 2,
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Typography
                        sx={{
                          flex: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          wordBreak: 'break-all'
                        }}
                      >
                        {showSecret ? selectedItem.apiSecret : '••••••••••••••••••••'}
                      </Typography>
                      <IconButton
                        size='small'
                        onClick={() => setShowSecret(!showSecret)}
                        sx={{ mr: 1 }}
                      >
                        <i className={showSecret ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                      {showSecret && (
                        <IconButton
                          size='small'
                          onClick={() => copyToClipboard(selectedItem.apiSecret)}
                        >
                          <i className='ri-file-copy-line' />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  {/* 状态 */}
                  <Box>
                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                      {t('development.status')}:
                    </Typography>
                    <Chip
                      label={selectedItem.status === 1 ? t('development.enabled') : t('development.disabled')}
                      color={selectedItem.status === 1 ? 'success' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  {/* 创建时间 */}
                  <Box>
                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                      {t('development.createTime')}:
                    </Typography>
                    <Typography variant='body2'>
                      {(() => {
                        const timestamp = (selectedItem as any).createTime || selectedItem.createdAt
                        // 处理 10 位时间戳（秒）转换为 13 位（毫秒）
                        const timestampMs = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp
                        return new Date(timestampMs).toLocaleString(getDateLocale(), {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                      })()}
                    </Typography>
                  </Box>

                  {/* 备注 */}
                  {selectedItem.remark && (
                    <Box>
                      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                        {t('development.remark')}:
                      </Typography>
                      <Typography variant='body2'>{selectedItem.remark}</Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* 操作按钮 */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant={selectedItem.status === 1 ? 'outlined' : 'contained'}
                      color={selectedItem.status === 1 ? 'error' : 'primary'}
                      onClick={() => handleToggleStatus(selectedItem.id, selectedItem.status)}
                      sx={{ borderRadius: '8px', flex: 1, minWidth: '120px' }}
                    >
                      {selectedItem.status === 1 ? t('development.disabled') : t('development.enabled')}
                    </Button>
                    <Button
                      variant='contained'
                      color='primary'
                      onClick={handleRegenerateSecretClick}
                      sx={{ borderRadius: '8px', flex: 1, minWidth: '120px' }}
                    >
                      {t('development.regenerateSecret')}
                    </Button>
                  </Box>
                </Box>
              </TabPanel>

              {/* 通知推送 Tab - 已注释 */}
              {/* <TabPanel value={tabValue} index={1}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    Webhook通知订阅
                  </Typography>

                  <Typography variant='body2' color='text.secondary'>
                    设置Webhook地址以接收系统推送的通知消息
                  </Typography>

                  <TextField
                    label='通知地址'
                    value={selectedItem.callbackUrl || ''}
                    onChange={e => setSelectedItem({ ...selectedItem, callbackUrl: e.target.value })}
                    placeholder='请输入 Webhook地址'
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant='outlined'
                      onClick={() => setSelectedItem({ ...selectedItem, callbackUrl: selectedItem.callbackUrl })}
                      sx={{ borderRadius: '8px' }}
                    >
                      取消
                    </Button>
                    <Button
                      variant='contained'
                      color='primary'
                      onClick={handleUpdateCallback}
                      sx={{ borderRadius: '8px' }}
                    >
                      保存
                    </Button>
                  </Box>
                </Box>
              </TabPanel> */}
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setItemToDelete(null)
        }}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: 'error.lightOpacity',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className='ri-error-warning-line text-error' style={{ fontSize: '24px' }} />
            </Box>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              {t('development.confirmDelete')}
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 4 }}>
          <Typography variant='body1' sx={{ mb: 2 }}>
            {t('development.confirmDeleteMessage', { name: itemToDelete?.apiName || '' })}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {t('development.confirmDeleteDesc')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false)
              setItemToDelete(null)
            }}
            sx={{ borderRadius: '8px' }}
          >
            {t('development.cancel')}
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleDeleteConfirm}
            sx={{ borderRadius: '8px' }}
            startIcon={<i className='ri-delete-bin-line' />}
          >
            {t('development.confirmDeleteButton')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 重置密钥确认对话框 */}
      <Dialog
        open={regenerateSecretDialogOpen}
        onClose={() => setRegenerateSecretDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: 'warning.lightOpacity',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className='ri-refresh-line text-warning' style={{ fontSize: '24px' }} />
            </Box>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              {t('development.regenerateSecretTitle')}
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 4 }}>
          <Typography variant='body1' sx={{ mb: 2 }}>
            {t('development.regenerateSecretMessage', { name: selectedItem?.apiName || '' })}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {t('development.regenerateSecretDesc')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setRegenerateSecretDialogOpen(false)}
            sx={{ borderRadius: '8px' }}
          >
            {t('development.cancel')}
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={handleRegenerateSecretConfirm}
            sx={{ borderRadius: '8px' }}
            startIcon={<i className='ri-refresh-line' />}
          >
            {t('development.confirmRegenerate')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ApiKeyManagement