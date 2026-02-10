'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'

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

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Util Imports
import { getDateLocaleFromLang } from '@/utils/routeUtils'

const ApiKeyList = ({ mode }: { mode: Mode }) => {
  const params = useParams()
  const dateLocale = getDateLocaleFromLang(params?.lang as string)
  const [data, setData] = useState<ApiKeyItem[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ApiKeyItem | null>(null)
  const [formData, setFormData] = useState({
    apiName: '',
    ipWhitelist: '',
    callbackUrl: '',
    remark: ''
  })
  const [showSecret, setShowSecret] = useState<Record<number, boolean>>({})

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getApiKeyList()
      setData(res.data?.list || [])
    } catch (error) {
      console.error('加载数据失败:', error)
      toast.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenDialog = (item?: ApiKeyItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        apiName: item.apiName,
        ipWhitelist: item.ipWhitelist || '',
        callbackUrl: item.callbackUrl || '',
        remark: item.remark || ''
      })
    } else {
      setEditingItem(null)
      setFormData({
        apiName: '',
        ipWhitelist: '',
        callbackUrl: '',
        remark: ''
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingItem) {
        await updateApiKey({
          id: editingItem.id,
          ...formData
        })
        toast.success('更新成功')
      } else {
        await createApiKey(formData)
        toast.success('创建成功')
      }
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('保存失败:', error)
      toast.error('保存失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除吗？')) return
    try {
      await deleteApiKey({ id })
      toast.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    try {
      await setApiKeyStatus({
        id,
        status: currentStatus === 1 ? 0 : 1
      })
      toast.success('状态更新成功')
      loadData()
    } catch (error) {
      console.error('状态更新失败:', error)
      toast.error('状态更新失败')
    }
  }

  const handleRegenerateSecret = async (id: number) => {
    if (!confirm('确定要重新生成Secret吗？旧的Secret将失效。')) return
    try {
      const res = await regenerateApiSecret({ id })
      toast.success('重新生成成功，请保存新的Secret')
      setShowSecret({ ...showSecret, [id]: true })
      loadData()
    } catch (error) {
      console.error('重新生成失败:', error)
      toast.error('重新生成失败')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid xs={12}>
        <Card>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5'>API Key管理</Typography>
              <Button variant='contained' onClick={() => handleOpenDialog()}>
                创建API Key
              </Button>
            </Box>
            <div className={tableStyles.tableWrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>API名称</th>
                    <th>API Key</th>
                    <th>IP白名单</th>
                    <th>回调地址</th>
                    <th>状态</th>
                    <th>创建时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className='text-center'>
                        加载中...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className='text-center'>
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    data.map(item => (
                      <tr key={item.id}>
                        <td>{item.apiName}</td>
                        <td>
                          <Box className='flex items-center gap-2'>
                            <code className='text-sm'>{item.apiKey}</code>
                            <IconButton
                              size='small'
                              onClick={() => {
                                navigator.clipboard.writeText(item.apiKey)
                                toast.success('已复制')
                              }}
                            >
                              📋
                            </IconButton>
                          </Box>
                        </td>
                        <td>{item.ipWhitelist || '-'}</td>
                        <td>{item.callbackUrl || '-'}</td>
                        <td>
                          <Chip
                            label={item.status === 1 ? '启用' : '禁用'}
                            color={item.status === 1 ? 'success' : 'default'}
                            size='small'
                            onClick={() => handleToggleStatus(item.id, item.status)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td>{new Date(item.createdAt).toLocaleString(dateLocale, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                        <td>
                          <Box className='flex gap-2'>
                            <Button size='small' onClick={() => handleOpenDialog(item)}>
                              编辑
                            </Button>
                            <Button size='small' onClick={() => handleRegenerateSecret(item.id)}>
                              重新生成Secret
                            </Button>
                            <Button size='small' color='error' onClick={() => handleDelete(item.id)}>
                              删除
                            </Button>
                          </Box>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{editingItem ? '编辑API Key' : '创建API Key'}</DialogTitle>
        <DialogContent>
          <Box className='flex flex-col gap-4 mt-4'>
            <TextField
              label='API名称'
              value={formData.apiName}
              onChange={e => setFormData({ ...formData, apiName: e.target.value })}
              required
            />
            <TextField
              label='IP白名单(逗号分隔)'
              value={formData.ipWhitelist}
              onChange={e => setFormData({ ...formData, ipWhitelist: e.target.value })}
              placeholder='192.168.1.1,192.168.1.2'
            />
            <TextField
              label='回调地址'
              value={formData.callbackUrl}
              onChange={e => setFormData({ ...formData, callbackUrl: e.target.value })}
              placeholder='https://example.com/callback'
            />
            <TextField
              label='备注'
              value={formData.remark}
              onChange={e => setFormData({ ...formData, remark: e.target.value })}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant='contained' onClick={handleSave}>
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default ApiKeyList
